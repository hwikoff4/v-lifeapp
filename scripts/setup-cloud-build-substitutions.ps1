# Script to fetch Supabase values and set them as Cloud Build substitutions
# Run this once to configure your Cloud Build trigger

Write-Host "🔧 Setting up Cloud Build substitutions..." -ForegroundColor Cyan

# Get project ref
$ProjectRefFile = "supabase\.temp\project-ref"
if (Test-Path $ProjectRefFile) {
    $ProjectRef = (Get-Content $ProjectRefFile).Trim()
    Write-Host "✓ Found Supabase project ref: $ProjectRef" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Supabase project not linked. Run: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Red
    exit 1
}

# Get Supabase URL
$SupabaseUrl = "https://$ProjectRef.supabase.co"
Write-Host "✓ Supabase URL: $SupabaseUrl" -ForegroundColor Green

# Get anon key
Write-Host "📥 Fetching Supabase API keys..." -ForegroundColor Yellow
$ApiKeysOutput = supabase projects api-keys --project-ref $ProjectRef 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to get API keys. Make sure you're logged in: supabase login" -ForegroundColor Red
    exit 1
}

$AnonKey = ($ApiKeysOutput | Select-String -Pattern "^\s+anon\s+\|\s+(.+)$").Matches.Groups[1].Value.Trim()
if (-not $AnonKey) {
    Write-Host "❌ Error: Could not parse anon key" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Retrieved Supabase anon key" -ForegroundColor Green

Write-Host "`n📋 Copy these values to your Cloud Build trigger substitutions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "_NEXT_PUBLIC_SUPABASE_URL = $SupabaseUrl" -ForegroundColor White
Write-Host "_NEXT_PUBLIC_SUPABASE_ANON_KEY = $AnonKey" -ForegroundColor White
Write-Host "_NEXT_PUBLIC_APP_URL = (leave empty for first deploy, set after)" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Go to: Cloud Build > Triggers > Edit your trigger > Substitution variables" -ForegroundColor Cyan
