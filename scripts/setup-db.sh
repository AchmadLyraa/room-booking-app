#!/bin/bash

echo "Setting up database..."
npx prisma db push
echo "Database schema created!"

echo "Seeding database..."
npx tsx prisma/seed.ts
echo "Database seeded successfully!"

echo "Setup complete! You can now start the application with: npm run dev"
echo ""
echo "Demo accounts:"
echo "Admin: admin@booking.com / admin123"
echo "PIC: pic1@booking.com / pic123"
