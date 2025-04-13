import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SEED_FILE_PATH = path.join(process.cwd(), 'prisma', 'seed.ts');

async function updateSeedFile(newRestaurant: any) {
  try {
    const content = await fs.readFile(SEED_FILE_PATH, 'utf-8');
    
    // Find the position before the main() function
    const insertPosition = content.lastIndexOf('main()');
    if (insertPosition === -1) throw new Error('Could not find insertion point');

    // Create the new upsert statement
    const newUpsert = `
  await prisma.restaurant.upsert({
    where: { id: '${newRestaurant.id}' },
    update: {},
    create: {
      id: '${newRestaurant.id}',
      name: '${newRestaurant.name.replace(/'/g, "\\'")}',
      cuisine: CuisineType.${newRestaurant.cuisine},
      address: '${newRestaurant.address.replace(/'/g, "\\'")}',
      description: '${(newRestaurant.description || '').replace(/'/g, "\\'")}',
      priceRange: PriceRange.${newRestaurant.priceRange},
      imageUrl: '${newRestaurant.imageUrl || 'https://placehold.co/800x600/orange/white?text=Restaurant+Image'}',
      hasPrayerRoom: ${newRestaurant.hasPrayerRoom || false},
      hasOutdoorSeating: ${newRestaurant.hasOutdoorSeating || false},
      isZabiha: ${newRestaurant.isZabiha ?? true},
      hasHighChair: ${newRestaurant.hasHighChair || false},
    },
  });
`;

    // Insert the new upsert before main()
    const updatedContent = content.slice(0, insertPosition) + newUpsert + content.slice(insertPosition);
    await fs.writeFile(SEED_FILE_PATH, updatedContent, 'utf-8');

    return true;
  } catch (error) {
    console.error('Error updating seed file:', error);
    return false;
  }
}

async function removeFromSeedFile(id: string) {
  try {
    const content = await fs.readFile(SEED_FILE_PATH, 'utf-8');
    
    // Find and remove the upsert block for this ID
    const regex = new RegExp(`\\s*await prisma\\.restaurant\\.upsert\\({[^}]*id: '${id}'[^}]*}\\);\\s*`, 'g');
    const updatedContent = content.replace(regex, '');
    
    await fs.writeFile(SEED_FILE_PATH, updatedContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error removing from seed file:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const restaurant = await request.json();
    const success = await updateSeedFile(restaurant);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update seed file' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }
    
    const success = await removeFromSeedFile(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update seed file' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 