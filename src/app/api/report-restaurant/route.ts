import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Processing restaurant report submission...');
    const data = await request.json();
    const { restaurantId, restaurantName, reportDetails, email } = data;

    // Save the report to the database
    await prisma.report.create({
      data: {
        restaurantId,
        details: reportDetails,
        // status, createdAt, updatedAt use defaults
      },
    });

    console.log('Creating email transport...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('Sending email notification...');
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Restaurant Report: ${restaurantName}`,
      html: `
        <h2>Restaurant Report Submitted</h2>
        <p><strong>Restaurant:</strong> ${restaurantName}</p>
        <p><strong>Restaurant ID:</strong> ${restaurantId}</p>
        <p><strong>Report Details:</strong></p>
        <p>${reportDetails}</p>
        <p><strong>User Email:</strong> ${email ? email : 'Not provided'}</p>
      `,
    });

    console.log('Report submitted successfully');
    return NextResponse.json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting restaurant report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
} 