#!/bin/bash

echo "🚀 Deployment Script for Prescription App"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key"
    echo "VITE_SUPABASE_PROJECT_ID=your-project-id"
    echo ""
    exit 1
fi

echo ""
echo "Step 1: Database Setup"
echo "----------------------"

read -p "Enter your Supabase project reference: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo "❌ Failed to link Supabase project"
    exit 1
fi

echo "📤 Pushing database migrations..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    exit 1
fi

echo "✅ Database setup complete!"

echo ""
echo "Step 2: Seed Database (Optional)"
echo "--------------------------------"

read -p "Do you want to seed the database with initial data? (y/n): " SEED_DB

if [ "$SEED_DB" = "y" ] || [ "$SEED_DB" = "Y" ]; then
    echo "🌱 Seeding database..."
    npm run seed
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Seeding failed, but you can do this later through the app"
    else
        echo "✅ Database seeded successfully!"
    fi
fi

echo ""
echo "Step 3: Install Dependencies"
echo "----------------------------"

npm install

echo ""
echo "Step 4: Build Application"
echo "-------------------------"

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Run locally: npm run dev"
echo "2. Deploy to Vercel: vercel"
echo "3. Deploy to Netlify: netlify deploy"
echo "4. Or upload the 'dist' folder to your hosting provider"
echo ""
echo "📚 See SETUP.md for detailed deployment instructions"
