# Deploying to Google Cloud Run

Containerized Next.js app (standalone output) for Cloud Run.

## Prerequisites
- gcloud CLI authenticated to your project (`gcloud auth login && gcloud config set project <PROJECT_ID>`).
- Artifact Registry Docker repo (one-time):  
  `gcloud artifacts repositories create v-life --repository-format=docker --location=<REGION>`
- Supabase CLI linked (`supabase status`); keep schema/functions up-to-date:  
  `supabase db push` and `supabase functions deploy --all`
- Required env values for the build/deploy:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL` (public URL you will serve the app from)
  - Optional: `APP_ORIGIN` for Edge Function CORS (set in Supabase secrets), not in Cloud Run.

## Build & Push the image
```bash
REGION=us-central1
PROJECT_ID=$(gcloud config get-value project)
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/v-life/v-life:$(git rev-parse --short HEAD)

gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID" \
  --timeout=30m \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
```

## Deploy to Cloud Run
```bash
SERVICE=v-life
REGION=us-central1

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --set-env-vars NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
```

Notes:
- Cloud Run sets `PORT` automatically; the container listens on 8080.
- Keep sensitive AI/service-role keys in Supabase secrets for Edge Functions, not Cloud Run envs.

## Verify & monitor
- Open the service URL returned by `gcloud run deploy`.
- Logs: `gcloud run services logs read "$SERVICE" --region "$REGION" --limit=100`
- Service details: `gcloud run services describe "$SERVICE" --region "$REGION"`

## Local smoke test (optional)
```bash
docker build -t v-life:local \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_APP_URL="http://localhost:8080" \
  .

docker run --rm -p 8080:8080 \
  -e NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -e NEXT_PUBLIC_APP_URL="http://localhost:8080" \
  v-life:local
```

