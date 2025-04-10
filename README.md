# Halal Restaurants ATL

A web application showcasing halal restaurants in Atlanta, built with Next.js and Prisma.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Reset database
npx prisma migrate reset --force
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses Prisma with SQLite as the database. Here's the main schema structure:

### Restaurant Model
```prisma
model Restaurant {
  id          String    @id
  name        String
  cuisine     String
  address     String
  description String
  rating      Float
  upvotes     Int       @default(0)
  downvotes   Int       @default(0)
  priceRange  String
  phoneNumber String?
  website     String?
  imageUrl    String?
  reviews     Review[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Review Model
```prisma
model Review {
  id           String     @id @default(cuid())
  text         String
  rating       Int
  userId       String
  userName     String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  restaurantId String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

## Prisma Commands

Here are some useful Prisma commands for managing the database:

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev

# Reset the database and run all migrations
npx prisma migrate reset

# Seed the database with initial data
npx prisma db seed

# Open Prisma Studio to view/edit data
npx prisma studio
```

## Project Structure

- `/prisma` - Contains database schema and migrations
  - `schema.prisma` - Database schema definition
  - `seed.ts` - Database seeding script
  - `seed-data.ts` - Initial restaurant data
- `/src/lib` - Contains utility functions
  - `prisma.ts` - Prisma client instance
- `/src/app/api` - API routes for data operations
  - `restaurants/[id]/reviews` - Review-related API endpoints

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Prisma Documentation](https://www.prisma.io/docs) - Learn about Prisma ORM
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - Learn about TailwindCSS

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

For database deployment, consider using:
- [Railway](https://railway.app/) - Easy PostgreSQL deployment
- [PlanetScale](https://planetscale.com/) - Serverless MySQL platform
- [Supabase](https://supabase.com/) - Open source PostgreSQL platform
