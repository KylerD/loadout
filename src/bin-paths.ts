import path from 'path';
import { execFileSync } from 'child_process';

const nodeBinDir = path.dirname(process.execPath);

export const NPX = path.join(nodeBinDir, 'npx');
export const NPM = path.join(nodeBinDir, 'npm');

/**
 * Resolve the user's login shell PATH on macOS/Linux.
 * MCP server processes aren't launched through login shells, so node version
 * managers (nvm, fnm, volta, mise, asdf) that configure PATH via shell
 * profiles won't be available. This uses the same technique as VS Code and
 * sindresorhus/shell-env to recover that PATH.
 *
 * Returns null on Windows (nvm-windows/volta modify system PATH directly)
 * or if resolution fails for any reason.
 */
function resolveLoginShellPath(): string | null {
  if (process.platform === 'win32') {
    return null;
  }

  const shell = process.env.SHELL;
  if (!shell) {
    return null;
  }

  const MARKER = '__LOADOUT_PATH_MARKER__';

  try {
    const stdout = execFileSync(
      shell,
      ['-ilc', `echo ${MARKER}; printenv PATH; echo ${MARKER}`],
      {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
      },
    );

    const markerStart = stdout.indexOf(MARKER);
    const markerEnd = stdout.lastIndexOf(MARKER);

    if (markerStart === -1 || markerEnd === -1 || markerStart === markerEnd) {
      return null;
    }

    const extracted = stdout
      .slice(markerStart + MARKER.length, markerEnd)
      .trim();

    return extracted || null;
  } catch {
    return null;
  }
}

/**
 * Merge PATH sources in priority order, deduplicating while preserving order
 * (first occurrence wins). Uses path.delimiter for cross-platform support.
 */
function buildMergedPath(
  shellPath: string | null,
  currentPath: string,
): string {
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (dir: string) => {
    if (dir && !seen.has(dir)) {
      seen.add(dir);
      result.push(dir);
    }
  };

  // Highest priority: the node bin directory for the current process
  add(nodeBinDir);

  // Login shell PATH (contains version-manager-resolved paths)
  if (shellPath) {
    for (const dir of shellPath.split(':')) {
      add(dir);
    }
  }

  // Existing process PATH as fallback
  for (const dir of currentPath.split(path.delimiter)) {
    add(dir);
  }

  return result.join(path.delimiter);
}

// Resolve once at module load and patch process.env.PATH
const shellPath = resolveLoginShellPath();
process.env.PATH = buildMergedPath(shellPath, process.env.PATH || '');
