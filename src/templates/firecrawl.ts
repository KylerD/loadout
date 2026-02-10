export const firecrawlTemplates = {
  scrapeService: `import FirecrawlApp from '@mendable/firecrawl-js';
import { FIRECRAWL_API_KEY } from '@/lib/config';

export interface ScrapeResult {
  markdown?: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export interface CrawlResult {
  pages: ScrapeResult[];
  total: number;
}

export class ScrapeService {
  private client: FirecrawlApp;

  constructor(apiKey: string) {
    this.client = new FirecrawlApp({ apiKey });
  }

  async scrapeUrl(url: string): Promise<ScrapeResult> {
    const result = await this.client.scrapeUrl(url, {
      formats: ['markdown', 'html'],
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to scrape URL');
    }

    return {
      markdown: result.markdown,
      html: result.html,
      metadata: result.metadata,
    };
  }

  async crawlSite(url: string, options?: { limit?: number }): Promise<CrawlResult> {
    const result = await this.client.crawlUrl(url, {
      limit: options?.limit ?? 10,
      scrapeOptions: {
        formats: ['markdown'],
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to crawl site');
    }

    return {
      pages: result.data?.map((page) => ({
        markdown: page.markdown,
        metadata: page.metadata,
      })) ?? [],
      total: result.data?.length ?? 0,
    };
  }

  async extractData<T>(url: string, schema: Record<string, unknown>): Promise<T> {
    const result = await this.client.scrapeUrl(url, {
      formats: ['extract'],
      extract: { schema },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to extract data');
    }

    return result.extract as T;
  }
}

export const scrapeService = new ScrapeService(FIRECRAWL_API_KEY);
`,

  scrapeRoute: `import { NextResponse } from 'next/server';
import { scrapeService } from '@/services/scrape.service';
import { z } from 'zod';

const scrapeSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = scrapeSchema.parse(body);

    const result = await scrapeService.scrapeUrl(url);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape' },
      { status: 500 }
    );
  }
}
`,
};
