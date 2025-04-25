# Database Documentation

## ID Format

The application uses CUID (Collision-resistant Unique IDentifiers) for all database records. This is implemented via Prisma's `@default(cuid())` attribute.

### Why CUIDs?

1. **Security**: Unlike sequential IDs, CUIDs don't expose information about your database size or record order
2. **Scalability**: CUIDs can be generated without database coordination, making them perfect for distributed systems
3. **Performance**: No need to query the database to generate new IDs
4. **Uniqueness**: Guaranteed uniqueness across different servers and databases
5. **URL-Safe**: CUIDs are URL-safe and can be used in routes without encoding

### Format Example

```typescript
// Old format (deprecated)
id: '1', '2', '3', ...

// New format (CUID)
id: 'clm2p3mf9j0001pgp6edund7yb'
```

### Migration Notes

- All new restaurants are automatically assigned CUIDs by Prisma
- Existing sequential IDs in the database have been preserved for backward compatibility
- The frontend code is ID-format agnostic and works with both formats
- The seed file uses restaurant names as unique identifiers for upserts

### Best Practices

1. **Never** assume sequential ordering of IDs
2. **Always** treat IDs as opaque strings
3. Use the restaurant's name as the unique identifier for upserts in the seed file
4. When adding new restaurants via the UI, let Prisma handle ID generation

## Database Schema

### Restaurant Model

```prisma
model Restaurant {
  id                String      @id @default(cuid())
  name              String      @unique
  cuisineType       CuisineType
  address           String      @unique
  description       String?
  priceRange        PriceRange
  hasPrayerRoom     Boolean     @default(false)
  hasOutdoorSeating Boolean     @default(false)
  isZabiha          Boolean     @default(false)
  hasHighChair      Boolean     @default(false)
  servesAlcohol     Boolean     @default(false)
  isFullyHalal      Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  comments          Comment[]
}
```

### Comment Model

```prisma
model Comment {
  id           String     @id @default(cuid())
  content      String
  rating       Int        @default(5)
  authorName   String
  restaurantId String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  imageUrl     String?
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId])
}
``` 