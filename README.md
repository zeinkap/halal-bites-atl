# Halal Bites ATL

A modern web application to discover halal restaurants and Muslim-owned cafes in Atlanta. Built with Next.js, Prisma, and PostgreSQL.

🌐 **Live Site**: [https://halalbitesatl.org](https://halalbitesatl.org)

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
  - Upload images with comments
  - View other users' recommendations
  - Help others discover great halal restaurants
- 🏪 Detailed restaurant information:
  - Prayer space availability
  - Outdoor seating options
  - Zabiha (hand-cut) certification status
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
  - Image upload preview
- 🚀 Performance Optimizations:
  - Redis caching for faster restaurant listings
  - Lazy-loaded modals and components
  - Infinite scrolling for restaurant list
  - Optimized image loading
- 🔄 Community Engagement:
  - Report incorrect restaurant information
  - Submit bug reports with screenshots
  - Automatic email notifications for reports
  - Image attachments for better context

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
  - Cloudinary for image storage
  - Redis (Upstash) for caching
  - Nodemailer for email notifications

## Testing

- **End-to-End Testing:**
  - Playwright for E2E testing
  - Test coverage for critical user flows:
    - Adding new restaurants
    - Handling duplicate restaurant submissions
    - Form validation
    - Toast notifications
    - Search functionality

### Running Tests

1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Run all tests:
   ```bash
   npm run test
   ```

3. Run tests with UI mode:
   ```bash
   npm run test:ui
   ```

4. Run tests in debug mode:
   ```bash
   npx playwright test --debug
   ```

### Test Structure

Tests are located in the `/tests` directory and follow these conventions:
- Each feature has its own test file (e.g., `add-restaurant.spec.ts`)
- Tests use data-testid attributes for reliable element selection
- Async operations use appropriate timeouts and waits
- Test data is cleaned up after each test run

### Writing Tests

When writing new tests:
1. Use data-testid attributes for element selection
2. Follow the existing patterns for handling async operations
3. Include proper cleanup in the test teardown
4. Add appropriate assertions and error checks

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
   - Add the following variables:
     ```
     # Database
     DATABASE_URL="your_development_database_url"

     # Cloudinary Configuration
     CLOUDINARY_CLOUD_NAME="your_cloud_name"
     CLOUDINARY_API_KEY="your_api_key"
     CLOUDINARY_API_SECRET="your_api_secret"
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

Make sure to set up both `.env` and `.env.production` files with the appropriate database URLs and Cloudinary credentials.

## Image Upload

The application uses Cloudinary for image storage and optimization. When users add comments, they can:
- Upload images up to 5MB in size
- Preview images before submission
- Images are automatically:
  - Optimized for quality and size
  - Resized to appropriate dimensions
  - Served through Cloudinary's global CDN
  - Converted to modern formats (WebP) when supported

## Database Schema

The application uses Prisma with PostgreSQL (Neon) as the database. Here's the schema structure:

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
  imageUrl          String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  comments          Comment[]
}

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

enum CuisineType {
  MIDDLE_EASTERN
  INDIAN_PAKISTANI
  TURKISH
  PERSIAN
  MEDITERRANEAN
  AFGHAN
  CAFE
  MEXICAN
  CHINESE
  THAI
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

The production site is live at [https://halalbitesatl.org](https://halalbitesatl.org)

For database deployment, we're using:
- [Neon](https://neon.tech/) - Serverless Postgres with separate dev/prod branches

## Seeding Prod Database

Easiest way is to run the seed command with the database URL directly via:
`DATABASE_URL="PASTE_HERE" npx ts-node scripts/seed.ts`

To verify data is actually in the Prod database, run this query:
`DATABASE_URL="PASTE_HERE" npx prisma studio`

Run these commands to migrate and seed prod database:
`npm run migrate-prod && npm run seed-prod`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Redis Caching

The application uses Upstash Redis for high-performance caching:

- **Restaurant List Caching:**
  - 5-minute cache duration
  - Automatic cache invalidation on updates
  - Significant performance improvement (5x faster responses)
  - Graceful fallback to database

### Setting up Redis:

1. Create an Upstash Redis database:
   - Visit [https://upstash.com/](https://upstash.com/)
   - Create a new database
   - Choose the region closest to your deployment

2. Add Redis credentials to `.env`:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token"
   ```

### Cache Implementation:

The caching system is implemented in the restaurant API routes:
```typescript
// GET restaurants with caching
const cachedData = await redis.get(RESTAURANTS_CACHE_KEY);
if (cachedData) {
  return NextResponse.json(cachedData);
}

// Cache miss - fetch from database
const restaurants = await prisma.restaurant.findMany();
await redis.set(RESTAURANTS_CACHE_KEY, restaurants, {
  ex: CACHE_TTL // 5 minutes
});

// Cache invalidation on updates
await redis.del(RESTAURANTS_CACHE_KEY);
```

## Community Features

### Report Restaurant Information

Users can report incorrect restaurant information:
- Report inaccurate details
- Provide specific corrections
- Automatic email notifications to administrators
- Track report status

### Bug Reports

The application includes a comprehensive bug reporting system:
- Submit detailed bug reports
- Attach screenshots for clarity
- Automatic email notifications
- Cloudinary integration for image storage

### Email Notifications

Both report types trigger email notifications:
- Restaurant reports sent to administrators
- Bug reports with attached images
- Formatted HTML emails for better readability
- Secure email sending via Gmail SMTP