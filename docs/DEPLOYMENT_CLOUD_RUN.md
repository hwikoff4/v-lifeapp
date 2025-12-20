# Deploying to Google Cloud Run

Containerized Next.js app (standalone output) for Cloud Run.

## Quick Start: Deploy via Cloud Build UI

**The `cloudbuild.yaml` file is already configured with your Supabase values!**

1. **Go to Cloud Build in GCP Console**
2. **Click "Triggers"** → Create trigger (or edit existing)
3. **Connect your repository** (GitHub/GitLab/etc.)
4. **Set configuration:** Use `cloudbuild.yaml` from repository
5. **Click "Run"** or push to your branch

That's it! The build will automatically:
- Pull Supabase URL and anon key (already baked into `cloudbuild.yaml`)
- Build the Docker image with all env vars
- Push to Artifact Registry
- Deploy to Cloud Run

## Prerequisites
- gcloud CLI authenticated to your project (`gcloud auth login && gcloud config set project <PROJECT_ID>`).
- Artifact Registry Docker repo (one-time):  
  `gcloud artifacts repositories create v-life --repository-format=docker --location=<REGION>`
- Supabase CLI linked (`supabase link --project-ref YOUR_PROJECT_REF`); keep schema/functions up-to-date:  
  `supabase db push` and `supabase functions deploy --all`

## Alternative: Build & Push locally (optional)

The build script automatically pulls Supabase URL and anon key from your linked project:

**Windows (PowerShell):**
```powershell
.\scripts\build-cloud-run.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/build-cloud-run.sh
./scripts/build-cloud-run.sh
```

**Note:** On first use, make the bash script executable: `chmod +x scripts/build-cloud-run.sh`

**With custom region or app URL:**
```bash
# PowerShell
.\scripts\build-cloud-run.ps1 -Region us-west1 -AppUrl "https://your-app.run.app"

# Bash
./scripts/build-cloud-run.sh us-west1 "https://your-app.run.app"
```

The script will:
1. Read your Supabase project ref from `supabase/.temp/project-ref`
2. Fetch the anon key using `supabase projects api-keys`
3. Construct the Supabase URL (`https://<project-ref>.supabase.co`)
4. Build and push the Docker image with all values baked in

**Manual build (if you prefer):**
```bash
REGION=us-central1
PROJECT_ID=$(gcloud config get-value project)
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/v-life/v-life:$(git rev-parse --short HEAD)

# Get Supabase values
PROJECT_REF=$(cat supabase/.temp/project-ref | tr -d '\n\r ')
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY=$(supabase projects api-keys --project-ref "$PROJECT_REF" | grep -E "^\s+anon\s+\|" | awk -F'|' '{print $2}' | xargs)

gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID" \
  --timeout=30m \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  --build-arg NEXT_PUBLIC_APP_URL="https://your-app.run.app"
```

## Deploy to Cloud Run

After building, deploy the service:

```bash
SERVICE=v-life
REGION=us-central1

# Get the image name from the build script output, or construct it:
PROJECT_ID=$(gcloud config get-value project)
GIT_COMMIT=$(git rev-parse --short HEAD)
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/v-life/v-life:$GIT_COMMIT

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 5
```

**Note:** Since Supabase values are baked into the image, you don't need to set env vars at deploy time unless you want to override them. The container will use the values from the build.

**After first deploy:** Get your Cloud Run URL and rebuild with the correct `NEXT_PUBLIC_APP_URL`:
```bash
APP_URL=$(gcloud run services describe v-life --region $REGION --format 'value(status.url)')
# Then rebuild with: ./scripts/build-cloud-run.sh $REGION "$APP_URL"
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

