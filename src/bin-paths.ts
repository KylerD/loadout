import path from 'path';

const nodeBinDir = path.dirname(process.execPath);

export const NPX = path.join(nodeBinDir, 'npx');
export const NPM = path.join(nodeBinDir, 'npm');

if (!process.env.PATH?.includes(nodeBinDir)) {
  process.env.PATH = `${nodeBinDir}:${process.env.PATH || ''}`;
}
