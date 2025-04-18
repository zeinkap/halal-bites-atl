import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all restaurants
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Base URL entries
  const routes = [
    {
      url: 'https://halalbitesatl.org',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://halalbitesatl.org/add-restaurant',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Add restaurant entries
  const restaurantEntries = restaurants.map((restaurant) => ({
    url: `https://halalbitesatl.org/restaurant/${restaurant.id}`,
    lastModified: restaurant.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...restaurantEntries];
} 