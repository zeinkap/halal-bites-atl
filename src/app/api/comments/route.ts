import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/uploadImage';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const RESTAURANTS_CACHE_KEY = 'restaurants:all';

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
    let content: string;
    let authorName: string;
    let restaurantId: string;
    let rating: number;
    let imageUrl: string | undefined;

    // Check if the request is JSON or form data
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // Handle JSON request
      const jsonData = await request.json();
      content = jsonData.content;
      authorName = jsonData.authorName;
      restaurantId = jsonData.restaurantId;
      rating = parseInt(jsonData.rating.toString()) || 5;
      imageUrl = jsonData.imageUrl;
    } else {
      // Handle form data request
      const formData = await request.formData();
      content = formData.get('content') as string;
      authorName = formData.get('authorName') as string;
      restaurantId = formData.get('restaurantId') as string;
      rating = parseInt(formData.get('rating') as string) || 5;
      const image = formData.get('image') as File | null;

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
    }

    if (!content || !authorName || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Clear the restaurants cache to update comment counts
    await redis.del(RESTAURANTS_CACHE_KEY);

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

    // Clear the restaurants cache to update comment counts
    await redis.del(RESTAURANTS_CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Error deleting comment' },
      { status: 500 }
    );
  }
} 