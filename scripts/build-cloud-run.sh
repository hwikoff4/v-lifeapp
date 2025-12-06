#!/usr/bin/env bash
# Build script for Google Cloud Run that auto-pulls Supabase config
# Usage: ./scripts/build-cloud-run.sh [--region REGION] [--app-url APP_URL]

set -e

REGION="${1:-us-central1}"
APP_URL="${2:-}"

echo "🚀 Building Docker image for Cloud Run..."

# Get project ref from Supabase config
PROJECT_REF_FILE="supabase/.temp/project-ref"
if [ -f "$PROJECT_REF_FILE" ]; then
    PROJECT_REF=$(cat "$PROJECT_REF_FILE" | tr -d '\n\r ')
    echo "✓ Found Supabase project ref: $PROJECT_REF"
else
    echo "❌ Error: Supabase project not linked. Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

# Get Supabase URL and anon key
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
echo "✓ Supabase URL: $SUPABASE_URL"

# Get anon key from Supabase CLI
echo "📥 Fetching Supabase API keys..."
API_KEYS_OUTPUT=$(supabase projects api-keys --project-ref "$PROJECT_REF" 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to get API keys. Make sure you're logged in: supabase login"
    exit 1
fi

# Parse anon key from output (format: "anon | <key>")
ANON_KEY=$(echo "$API_KEYS_OUTPUT" | grep -E "^\s+anon\s+\|" | awk -F'|' '{print $2}' | xargs)
if [ -z "$ANON_KEY" ]; then
    echo "❌ Error: Could not parse anon key from Supabase CLI output"
    exit 1
fi
echo "✓ Retrieved Supabase anon key"

# Get App URL (required for build)
if [ -z "$APP_URL" ]; then
    echo "⚠️  NEXT_PUBLIC_APP_URL not provided. Using placeholder (update after first deploy)"
    APP_URL="https://v-life-$(openssl rand -hex 4).run.app"
fi

# Get GCP project ID
GCP_PROJECT_ID=$(gcloud config get-value project 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Error: gcloud not configured. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo "✓ GCP Project: $GCP_PROJECT_ID"

# Get git commit short hash
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
if [ "$GIT_COMMIT" = "latest" ]; then
    echo "⚠️  Not in a git repo, using 'latest' tag"
fi

# Build image name
IMAGE="$REGION-docker.pkg.dev/$GCP_PROJECT_ID/v-life/v-life:$GIT_COMMIT"
echo "📦 Image: $IMAGE"

# Build and push
echo ""
echo "🔨 Building Docker image..."
gcloud builds submit \
    --tag "$IMAGE" \
    --project "$GCP_PROJECT_ID" \
    --timeout=30m \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
    --build-arg NEXT_PUBLIC_APP_URL="$APP_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📦 Image: $IMAGE"
    echo ""
    echo "💡 Next step: Deploy to Cloud Run:"
    echo "   gcloud run deploy v-life --image \"$IMAGE\" --region $REGION --platform managed --allow-unauthenticated --port 8080"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

