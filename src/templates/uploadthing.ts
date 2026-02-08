export const uploadthingTemplates = {
  // UploadThing client helpers
  uploadthingClient: `import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
`,

  // File service with constructor-based DI
  fileService: `import { UTApi } from 'uploadthing/server';

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
}

export class FileService {
  constructor(private utapi: UTApi) {}

  /**
   * Delete a file by its key
   */
  async deleteFile(key: string): Promise<void> {
    await this.utapi.deleteFiles(key);
  }

  /**
   * Delete multiple files by their keys
   */
  async deleteFiles(keys: string[]): Promise<void> {
    await this.utapi.deleteFiles(keys);
  }

  /**
   * Get file URLs from keys
   */
  async getFileUrls(keys: string[]): Promise<string[]> {
    const result = await this.utapi.getFileUrls(keys);
    return result.data.map((f) => f.url);
  }

  /**
   * Rename a file
   */
  async renameFile(key: string, newName: string): Promise<void> {
    await this.utapi.renameFiles({ fileKey: key, newName });
  }
}

// Export singleton instance
export const fileService = new FileService(new UTApi());
`,

  uploadthingCore: `import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

// Add your auth logic here
const auth = (req: Request) => ({ id: 'user-id' });

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('File URL:', file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  documentUploader: f({
    pdf: { maxFileSize: '16MB' },
    'application/msword': { maxFileSize: '16MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '16MB',
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
`,

  uploadthingRoute: `import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
`,

  uploadButton: `'use client';

import { UploadButton, UploadDropzone } from '@/lib/uploadthing.client';
import { useState } from 'react';

interface UploadedFile {
  url: string;
  name: string;
}

export function ImageUploadButton({
  onUpload,
}: {
  onUpload?: (files: UploadedFile[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <UploadButton
      endpoint="imageUploader"
      onUploadBegin={() => setIsUploading(true)}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        const files = res.map((f) => ({ url: f.ufsUrl, name: f.name }));
        onUpload?.(files);
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false);
        console.error('Upload error:', error.message);
      }}
    />
  );
}

export function ImageUploadDropzone({
  onUpload,
}: {
  onUpload?: (files: UploadedFile[]) => void;
}) {
  return (
    <UploadDropzone
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        const files = res.map((f) => ({ url: f.ufsUrl, name: f.name }));
        onUpload?.(files);
      }}
      onUploadError={(error: Error) => {
        console.error('Upload error:', error.message);
      }}
    />
  );
}
`,
};
