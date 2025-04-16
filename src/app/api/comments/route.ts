import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/uploadImage';

// Get comments for a restaurant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    );
  }
}

// Add a new comment
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Log the received form data
    console.log('Received form data:', {
      content: formData.get('content'),
      authorName: formData.get('authorName'),
      restaurantId: formData.get('restaurantId'),
      rating: formData.get('rating'),
      hasImage: formData.has('image'),
    });

    const content = formData.get('content') as string;
    const authorName = formData.get('authorName') as string;
    const restaurantId = formData.get('restaurantId') as string;
    const rating = parseInt(formData.get('rating') as string) || 5;
    const image = formData.get('image') as File | null;

    if (!content || !authorName || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (image) {
      try {
        console.log('Image details:', {
          type: image.type,
          size: image.size,
          name: image.name
        });
        
        const buffer = Buffer.from(await image.arrayBuffer());
        console.log('Successfully created buffer, size:', buffer.length);
        
        imageUrl = await uploadImage(buffer, image.type);
        console.log('Successfully uploaded image:', imageUrl);
      } catch (uploadError) {
        console.error('Error during image upload:', uploadError);
        throw uploadError;
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorName,
        restaurantId,
        rating,
        imageUrl,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    // Enhanced error logging
    console.error('Error in POST /api/comments:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json(
        { error: `Error adding comment: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error adding comment' },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Error deleting comment' },
      { status: 500 }
    );
  }
} 