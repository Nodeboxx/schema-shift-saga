#!/bin/bash

# Script to create admin user and assign super_admin role
# Usage: ./scripts/create-admin.sh <email> <password>

set -e

EMAIL=${1:-"admin@example.com"}
PASSWORD=${2:-"admin123456"}

echo "Creating admin user: $EMAIL"

# Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    echo "Please set them in your .env file or environment"
    exit 1
fi

# Create user using Supabase Admin API
USER_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"full_name\": \"Super Admin\"
    }
  }")

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')

if [ "$USER_ID" = "null" ]; then
    echo "Error creating user. Response:"
    echo $USER_RESPONSE
    exit 1
fi

echo "User created with ID: $USER_ID"

# Assign super_admin role using the database
psql $DATABASE_URL -c "INSERT INTO public.user_roles (user_id, role) VALUES ('$USER_ID', 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;"

echo "Super admin role assigned successfully!"
echo "You can now login with:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
