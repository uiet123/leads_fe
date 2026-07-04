import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Lead } from '@/lib/dummy-data-generator';

const getMessageText = (lead: Lead) => {
  return `Hi! I recently designed a premium website for one of my clients and thought ${lead.business} would look amazing with a similar online presence.

Demo: https://winknwrap-house.vercel.app/

A dedicated website gives customers a more premium shopping experience than Instagram alone, builds trust, showcases your products beautifully, and makes ordering much easier.

I can create a similar premium website for just ₹1499.

Let me know if you'd like one for your brand. 😊`;
};

export async function POST(request: Request) {
  try {
    const { leads } = await request.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Email configuration missing. Please add EMAIL_USER and EMAIL_APP_PASSWORD to your .env.local file.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const results = [];
    
    // We send them sequentially to avoid overwhelming the SMTP server.
    for (const lead of leads) {
      if (!lead.primaryEmail || lead.primaryEmail === 'N/A') {
        results.push({ id: lead.id, status: 'failed', error: 'No email address' });
        continue;
      }

      const subject = `A modern website for ${lead.business}`;
      const text = getMessageText(lead);

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: lead.primaryEmail,
          subject: subject,
          text: text,
        });
        results.push({ id: lead.id, status: 'success' });
      } catch (err: any) {
        console.error(`Failed to send email to ${lead.primaryEmail}:`, err);
        results.push({ id: lead.id, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (err: any) {
    console.error('Bulk email error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
