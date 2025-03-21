import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/utils/puppeteer/scrape';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello World' });
}

export async function POST(req: NextRequest) {
    try {

    const { url } = await req.json();
  // Perform some evaluation with the data
  const result = await scrapeWebsite(url);
  return NextResponse.json({ result });
    } catch (error) {
        console.error("Error scraping website", error);
        return NextResponse.json({ error: 'Failed to scrape website' }, { status: 500 });
    }
}
