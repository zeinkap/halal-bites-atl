import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const stepsToReproduce = formData.get('stepsToReproduce') as string;
    const expectedBehavior = formData.get('expectedBehavior') as string;
    const actualBehavior = formData.get('actualBehavior') as string;
    const browser = formData.get('browser') as string;
    const device = formData.get('device') as string;
    const email = formData.get('email') as string;
    const screenshot = formData.get('screenshot') as File | null;

    let screenshotUrl = '';

    // Upload screenshot to Cloudinary if present
    if (screenshot) {
      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert buffer to base64
      const base64Image = `data:${screenshot.type};base64,${buffer.toString('base64')}`;
      
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: 'bug-reports',
        resource_type: 'auto',
      });
      
      screenshotUrl = uploadResult.secure_url;
    }

    // Format the email content
    const emailContent = `
      Bug Report Details:
      ------------------
      Title: ${title}
      Description: ${description}
      
      Steps to Reproduce:
      ${stepsToReproduce}
      
      Expected Behavior:
      ${expectedBehavior}
      
      Actual Behavior:
      ${actualBehavior}
      
      Technical Details:
      ----------------
      Browser: ${browser}
      Device: ${device}
      Reporter Email: ${email || 'Not provided'}
      ${screenshotUrl ? `\nScreenshot: ${screenshotUrl}` : ''}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'zeinkap@gmail.com',
      subject: `Bug Report: ${title}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    });

    return NextResponse.json({ message: 'Bug report submitted successfully' });
  } catch (error) {
    console.error('Error sending bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
} 