import { execa } from 'execa';

export async function setupShadcn(projectPath: string): Promise<void> {
  // Initialize shadcn/ui with defaults
  await execa(
    'npx',
    [
      'shadcn@latest',
      'init',
      '-y',
      '--base-color', 'neutral',
    ],
    {
      cwd: projectPath,
      stdio: 'pipe',
    }
  );

  // Add commonly used components
  await execa(
    'npx',
    [
      'shadcn@latest',
      'add',
      'button',
      'input',
      'card',
      'form',
      'label',
      '-y',
    ],
    {
      cwd: projectPath,
      stdio: 'pipe',
    }
  );
}
