import { execa } from 'execa';
import { NPX } from './bin-paths.js';

export async function setupShadcn(projectPath: string): Promise<void> {
  await execa(
    NPX,
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

  await execa(
    NPX,
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
