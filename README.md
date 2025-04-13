# Halal Bites ATL

A modern web application to discover halal restaurants and Muslim-owned cafes in Atlanta. Built with Next.js, Prisma, and PostgreSQL.

## Features

- 🍽️ Browse halal restaurants and cafes in the Atlanta area
- 🔍 Advanced search and filtering capabilities:
  - Search by restaurant name, cuisine, or location
  - Filter by cuisine type
  - Filter by price range ($, $$, $$$)
  - Sort by name or price
- ➕ Add new restaurants with details:
  - Name and location
  - Cuisine type (Middle Eastern, Indian Pakistani, Turkish, Persian, Mediterranean, Afghan, etc.)
  - Price range
  - Description and other details
- 💬 Community-driven reviews and ratings:
  - Add comments and share experiences
  - Rate restaurants (1-5 stars)
  - View other users' recommendations
  - Help others discover great halal restaurants
- 🏪 Detailed restaurant information:
  - Prayer room availability
  - Outdoor seating options
  - Zabiha certification status
  - High chair availability for families
- 📱 Responsive design:
  - Mobile-first approach
  - Clean, modern interface
  - Smooth animations and transitions
- ✨ User Experience:
  - Loading states with skeleton screens
  - Toast notifications for actions
  - Scroll to top button
  - Clear filters option
  - Smooth modal transitions

## Tech Stack

- **Frontend:**
  - Next.js 14 (React)
  - Tailwind CSS for styling
  - React Toastify for notifications
  - Heroicons for icons

- **Backend:**
  - Next.js API routes
  - Prisma ORM
  - PostgreSQL (Neon)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/zeinkap/halal-bites-atl.git
   cd halal-bites-atl
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your database URL:
     ```
     DATABASE_URL="your_development_database_url"
     ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Setup

The project uses two different environments:

- **Development**: Uses a separate database for testing and development
- **Production**: Uses the production database for live data

Make sure to set up both `.env` and `.env.production` files with the appropriate database URLs.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Database Schema

The application uses Prisma with PostgreSQL (Neon) as the database. Here's the schema structure:

### Restaurant Model
```prisma
model Restaurant {
  id                String      @id
  name              String
  cuisine           CuisineType
  address           String
  description       String
  priceRange        PriceRange
  website           String?
  imageUrl          String?
  hasPrayerRoom     Boolean     @default(false)
  hasOutdoorSeating Boolean     @default(false)
  isZabiha          Boolean     @default(true)
  hasHighChair      Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  comments          Comment[]
}

model Comment {
  id            String      @id @default(cuid())
  content       String
  rating        Int         @default(5)
  authorName    String
  restaurant    Restaurant  @relation(fields: [restaurantId], references: [id])
  restaurantId  String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([restaurantId])
}

enum CuisineType {
  MIDDLE_EASTERN
  INDIAN_PAKISTANI
  TURKISH
  PERSIAN
  MEDITERRANEAN
  AFGHAN
  CAFE
  OTHER
}

enum PriceRange {
  LOW    @map("$")
  MEDIUM @map("$$")
  HIGH   @map("$$$")
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
npx prisma migrate reset --force

# Seed the database with initial data
npx prisma db seed

# Open Prisma Studio to view/edit data
npx prisma studio
```

## Project Structure

- `/prisma` - Contains database schema and migrations
  - `schema.prisma` - Database schema definition
  - `seed.ts` - Database seeding script
- `/src/lib` - Contains utility functions
  - `prisma.ts` - Prisma client instance
- `/src/app/api` - API routes for data operations
  - `restaurants` - Restaurant-related API endpoints

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Prisma Documentation](https://www.prisma.io/docs) - Learn about Prisma ORM
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - Learn about TailwindCSS

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

For database deployment, we're using:
- [Neon](https://neon.tech/) - Serverless Postgres with separate dev/prod branches
