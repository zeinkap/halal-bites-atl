import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, address, email, phone } = data;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'zeinkap@gmail.com',
      subject: `Feature Restaurant Request: ${name}`,
      html: `
        <h2>Feature Restaurant Request</h2>
        <p><strong>Restaurant Name:</strong> ${name}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      `,
    });

    return NextResponse.json({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error submitting feature restaurant request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
} 