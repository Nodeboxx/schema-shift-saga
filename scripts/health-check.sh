#!/bin/bash
# Health check script for MedEx SaaS Platform

echo "========================================"
echo "MedEx SaaS - Health Check"
echo "========================================"
echo ""

# Check if running locally or in Docker
if [ -f "/.dockerenv" ]; then
    ENVIRONMENT="Docker"
    URL="http://localhost"
else
    ENVIRONMENT="Local/VM"
    URL="http://localhost:5173"
fi

echo "Environment: $ENVIRONMENT"
echo "Testing URL: $URL"
echo ""

# HTTP Check
echo "Testing HTTP endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ HTTP Status: $HTTP_CODE (OK)"
else
    echo "❌ HTTP Status: $HTTP_CODE (FAILED)"
    exit 1
fi

# Check if Supabase connection is configured
echo ""
echo "Checking environment variables..."

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "⚠️  VITE_SUPABASE_URL not set"
else
    echo "✅ VITE_SUPABASE_URL configured"
fi

if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    echo "⚠️  VITE_SUPABASE_PUBLISHABLE_KEY not set"
else
    echo "✅ VITE_SUPABASE_PUBLISHABLE_KEY configured"
fi

# Docker-specific checks
if [ "$ENVIRONMENT" == "Docker" ]; then
    echo ""
    echo "Docker container status:"
    docker ps --filter "name=medex" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""
echo "========================================"
echo "Health check complete!"
echo "========================================"
