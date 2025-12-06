# Build script for Google Cloud Run that auto-pulls Supabase config
# Usage: .\scripts\build-cloud-run.ps1 [--region REGION] [--app-url APP_URL]

param(
    [string]$Region = "us-central1",
    [string]$AppUrl = ""
)

Write-Host "🚀 Building Docker image for Cloud Run..." -ForegroundColor Cyan

# Get project ref from Supabase config
$ProjectRefFile = "supabase\.temp\project-ref"
if (Test-Path $ProjectRefFile) {
    $ProjectRef = (Get-Content $ProjectRefFile).Trim()
    Write-Host "✓ Found Supabase project ref: $ProjectRef" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Supabase project not linked. Run: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Red
    exit 1
}

# Get Supabase URL and anon key
$SupabaseUrl = "https://$ProjectRef.supabase.co"
Write-Host "✓ Supabase URL: $SupabaseUrl" -ForegroundColor Green

# Get anon key from Supabase CLI
Write-Host "📥 Fetching Supabase API keys..." -ForegroundColor Yellow
$ApiKeysOutput = supabase projects api-keys --project-ref $ProjectRef 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to get API keys. Make sure you're logged in: supabase login" -ForegroundColor Red
    exit 1
}

# Parse anon key from output (format: "anon | <key>")
$AnonKey = ($ApiKeysOutput | Select-String -Pattern "^\s+anon\s+\|\s+(.+)$").Matches.Groups[1].Value.Trim()
if (-not $AnonKey) {
    Write-Host "❌ Error: Could not parse anon key from Supabase CLI output" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Retrieved Supabase anon key" -ForegroundColor Green

# Get App URL (required for build)
if (-not $AppUrl) {
    Write-Host "⚠️  NEXT_PUBLIC_APP_URL not provided. Using placeholder (update after first deploy)" -ForegroundColor Yellow
    $AppUrl = "https://v-life-$(Get-Random).run.app"
}

# Get GCP project ID
$GcpProjectId = gcloud config get-value project 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: gcloud not configured. Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Red
    exit 1
}
Write-Host "✓ GCP Project: $GcpProjectId" -ForegroundColor Green

# Get git commit short hash
$GitCommit = git rev-parse --short HEAD 2>&1
if ($LASTEXITCODE -ne 0) {
    $GitCommit = "latest"
    Write-Host "⚠️  Not in a git repo, using 'latest' tag" -ForegroundColor Yellow
}

# Build image name
$Image = "$Region-docker.pkg.dev/$GcpProjectId/v-life/v-life:$GitCommit"
Write-Host "📦 Image: $Image" -ForegroundColor Cyan

# Build and push
Write-Host "`n🔨 Building Docker image..." -ForegroundColor Cyan
gcloud builds submit `
    --tag "$Image" `
    --project "$GcpProjectId" `
    --timeout=30m `
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$SupabaseUrl" `
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$AnonKey" `
    --build-arg NEXT_PUBLIC_APP_URL="$AppUrl"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
    Write-Host "📦 Image: $Image" -ForegroundColor Cyan
    Write-Host "`n💡 Next step: Deploy to Cloud Run:" -ForegroundColor Yellow
    Write-Host "   gcloud run deploy v-life --image `"$Image`" --region $Region --platform managed --allow-unauthenticated --port 8080" -ForegroundColor White
} else {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}

