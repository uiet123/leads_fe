import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Define the absolute path to the backend output directory
const BACKEND_OUTPUT_DIR = path.resolve(process.cwd(), '../leads_be/output');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  let filename = '';
  switch (type) {
    case 'no-website':
      filename = 'no-website-leads.csv';
      break;
    case 'website':
      filename = 'website-leads.csv';
      break;
    case 'email':
      filename = 'email-leads.csv';
      break;
    case 'prioritized':
      filename = 'prioritized-leads.csv';
      break;
    case 'all':
    default:
      filename = 'all-leads.csv';
      break;
  }

  const filePath = path.join(BACKEND_OUTPUT_DIR, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found. Please run the backend scraper first.' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    return NextResponse.json({ data: records });
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return NextResponse.json({ error: 'Failed to parse CSV data.' }, { status: 500 });
  }
}
