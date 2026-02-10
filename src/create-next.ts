import { execa } from 'execa';
import path from 'path';

export async function createNextApp(name: string): Promise<string> {
  await execa(
    'npx',
    [
      'create-next-app@latest',
      name,
      '--typescript',
      '--tailwind',
      '--eslint',
      '--app',
      '--import-alias', '@/*',
      '--yes',
    ],
    {
      stdio: 'pipe',
    }
  );

  return path.resolve(process.cwd(), name);
}
