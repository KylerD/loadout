import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { uploadthingTemplates } from '../templates/uploadthing.js';

export const uploadthingIntegration: Integration = {
  id: 'uploadthing',
  name: 'UploadThing',
  description: 'File uploads',
  packages: ['uploadthing', '@uploadthing/react'],
  envVars: [
    {
      key: 'UPLOADTHING_TOKEN',
      description: 'UploadThing token',
      example: '...',
    },
  ],
  setup: async (projectPath: string) => {
    // Create lib directory
    await fs.mkdir(path.join(projectPath, 'lib'), { recursive: true });

    // Create UploadThing client helpers
    await fs.writeFile(
      path.join(projectPath, 'lib/uploadthing.client.ts'),
      uploadthingTemplates.uploadthingClient
    );

    // Create file service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/file.service.ts'),
      uploadthingTemplates.fileService
    );

    // Create API routes
    await fs.mkdir(path.join(projectPath, 'app/api/uploadthing'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectPath, 'app/api/uploadthing/core.ts'),
      uploadthingTemplates.uploadthingCore
    );
    await fs.writeFile(
      path.join(projectPath, 'app/api/uploadthing/route.ts'),
      uploadthingTemplates.uploadthingRoute
    );

    // Create upload button component
    await fs.mkdir(path.join(projectPath, 'components'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'components/upload-button.tsx'),
      uploadthingTemplates.uploadButton
    );
  },
};
