import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate required environment variables
const validateEnvVariables = () => {
  const required = {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Create a transporter using Gmail SMTP
const createTransporter = () => {
  validateEnvVariables();
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

interface CustomError extends Error {
  code?: string;
  statusCode?: number;
}

export async function POST(request: Request) {
  try {
    console.log('Starting bug report submission...');
    
    // Validate environment variables first
    validateEnvVariables();
    
    const formData = await request.formData();
    console.log('Form data received');
    
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

    console.log('Form fields extracted:', {
      title,
      hasDescription: !!description,
      hasSteps: !!stepsToReproduce,
      hasScreenshot: !!screenshot
    });

    let screenshotUrl = '';

    // Upload screenshot to Cloudinary if present
    if (screenshot) {
      try {
        console.log('Processing screenshot:', {
          type: screenshot.type,
          size: screenshot.size,
          name: screenshot.name
        });

        const bytes = await screenshot.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log('Screenshot converted to buffer, size:', buffer.length);
        
        // Convert buffer to base64
        const base64Image = `data:${screenshot.type};base64,${buffer.toString('base64')}`;
        
        console.log('Uploading to Cloudinary...');
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: 'bug-reports',
          resource_type: 'auto',
        });
        
        screenshotUrl = uploadResult.secure_url;
        console.log('Screenshot uploaded successfully:', screenshotUrl);
      } catch (error) {
        const customError = error as CustomError;
        console.error('Error uploading screenshot:', customError);
        throw new Error(`Screenshot upload failed: ${customError.message || 'Unknown error'}`);
      }
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

    const htmlContent = `
      <h2>Bug Report Details</h2>
      <hr>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      
      <h3>Steps to Reproduce:</h3>
      <p>${stepsToReproduce.split('\n').join('<br>')}</p>
      
      <h3>Expected Behavior:</h3>
      <p>${expectedBehavior}</p>
      
      <h3>Actual Behavior:</h3>
      <p>${actualBehavior}</p>
      
      <h3>Technical Details:</h3>
      <hr>
      <p><strong>Browser:</strong> ${browser}</p>
      <p><strong>Device:</strong> ${device}</p>
      <p><strong>Reporter Email:</strong> ${email || 'Not provided'}</p>
      ${screenshotUrl ? `
        <h3>Screenshot:</h3>
        <img src="${screenshotUrl}" alt="Bug Report Screenshot" style="max-width: 100%; margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;">
        <p><a href="${screenshotUrl}" target="_blank">View full image</a></p>
      ` : ''}
    `;

    console.log('Creating email transporter...');
    const transporter = createTransporter();
    
    console.log('Sending email...');
    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to the same email
      subject: `Bug Report: ${title}`,
      text: emailContent,
      html: htmlContent,
    });

    console.log('Email sent successfully');

    return NextResponse.json({ message: 'Bug report submitted successfully' });
  } catch (error) {
    const customError = error as CustomError;
    console.error('Detailed error in bug report submission:', {
      message: customError.message || 'Unknown error',
      stack: customError.stack,
      name: customError.name,
      code: customError.code,
      statusCode: customError.statusCode
    });
    
    // Return a more specific error message
    const errorMessage = customError.message?.includes('Missing required environment variables')
      ? 'Server configuration error. Please contact the administrator.'
      : `Failed to submit bug report: ${customError.message || 'Unknown error'}`;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 