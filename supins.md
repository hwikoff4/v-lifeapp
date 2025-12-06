# Supabase Agent Playbook
IMPORTANT! The correct Supabase project is already linked! You can pull URL and Anon key from there if needed, run sqls, and deploy edge functions and secrets.

## Preconditions & Conventions
- Project already linked in the terminal. Verify:
  - `supabase --version`
  - `supabase status` **or** check `.supabase/config.json` for `project_ref` (if available)
- If not linked: `supabase link --project-ref YOUR_PROJECT_REF`
- Agent must always produce the exact shell commands it wants executed and a concise explanation of why the commands are required. By default, assume a human will run them (Cursor/IDE agent autonomy is limited for security).

## Repository Layout Conventions
- `supabase/migrations/` ← timestamped SQL migration files (preferred)
- `functions/<function-name>/` (Edge Function source, TypeScript by default)
- `sql/one-offs/` (ad-hoc SQL files, if needed)
- `scripts/` (helper scripts like deploy-all)
- Migration files are named using an ISO timestamp prefix for ordering: `yyyyMMddHHmmss_description.sql`
  - Example: `20251206113000_create_messages_table.sql`

## Agent Workflow: Database Schema Changes (Migrations)
Goal: Always create versioned SQL migrations and apply them via CLI so schema evolution is auditable and repeatable.

### Create a migration file (agent step)
- Create file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Example content:
  - `BEGIN; CREATE TABLE IF NOT EXISTS public.messages ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), chat_room_id uuid NOT NULL, sender_id uuid NOT NULL, content text NOT NULL, created_at timestamptz DEFAULT now() ); COMMIT;`

### Test locally (optional)
- If using local supabase CLI to run a local stack: `supabase start` (launches local Postgres + services)
- Apply migration locally using `psql` (if local DB URL available) or CLI:
  - `psql "$LOCAL_POSTGRES_URL" -f supabase/migrations/20251206113000_create_messages_table.sql`
  - OR (preferred if supported by your CLI): `supabase db push`
- Note: Use `psql` as a fallback if a specific CLI migrate command isn’t available.

### Deploy / push migration to remote
- Recommended generic command (verify with your CLI version):
  - `supabase login --token $SUPABASE_ACCESS_TOKEN` # if needed in CI
  - `supabase link --project-ref $PROJECT_REF` # only if not already linked
  - `supabase db push` # pushes local migrations to remote
- If your CLI supports an explicit migration command (`supabase migrations` or `supabase db migrate`), substitute accordingly. Always run `supabase <group> --help` to confirm.

### Post-deploy validations
- Run smoke checks:
  - Connect with `psql` or run a SELECT query:
    - `psql "$POSTGRES_URL" -c "SELECT COUNT(*) FROM public.messages;"`
  - Check dashboard schema.
- Reasoning: Versioned SQL files are portable, reviewable in PRs, and allow rollbacks by adding reverse migrations. The agent should always create a migration instead of changing schema via direct SQL on remote without a file.

## Agent Workflow: Running One-off SQL Files
When you need to run ad-hoc SQL (data migrations, fixes):

- Author an SQL file in `sql/one-offs/` with an explanatory name:
  - `sql/one-offs/20251206_fix_null_values.sql`
- Run it using `psql` or CLI:
  - If `psql` is available and `$POSTGRES_URL` is set:
    - `psql "$POSTGRES_URL" -f sql/one-offs/20251206_fix_null_values.sql`
  - Or a CLI-run approach (if supported):
    - `supabase db query < sql/one-offs/20251206_fix_null_values.sql`
- Always keep the SQL file and include a PR with the file so it's auditable.
- If the change needs to be permanent schema change, convert it into a migration file and push instead.
- Reasoning: One-off SQL should be auditable and reproducible. `psql` is a reliable fallback when CLI lacks a direct “query file” command.

## Agent Workflow: Edge Functions (Dev & Deploy)
Edge Functions live in `functions/<name>/`.

### Structure
- `functions/oauth-jobber-callback/index.ts`
- `functions/oauth-jobber-callback/package.json` (if needed)

### Local dev
- `supabase functions serve`
- Visit the printed local endpoint to test (or call via curl).

### Build & deploy
- Build step (if using TypeScript): run `tsc` or build script inside the function directory.
- Deploy:
  - `supabase functions deploy <function-name>`
- You can deploy all functions:
  - `supabase functions deploy --all`

### Secrets available to functions
- Use `supabase secrets set KEY="value"`
- In the function, access `process.env.KEY` (or `Deno.env.get` / appropriate runtime variable)
- Example: `supabase secrets set JOBBER_CLIENT_SECRET="s3cr3t"`
- To remove:
  - `supabase secrets remove JOBBER_CLIENT_SECRET`
- Reasoning: Use Edge Functions for any operation that requires the `service_role` key or secrets (token exchanges, third-party API calls). Keep the `service_role` key out of client code.

## Agent Workflow: Storage Buckets (Create/Update)
Prefer server-side (Edge Function or admin REST API) to create/manage buckets, because bucket creation is an admin action.

### Create bucket via Admin REST API (curl) using service role key (do not expose key publicly)
- Curl example:
  - `curl -X POST "https://<PROJECT_REF>.supabase.co/storage/v1/bucket"`
  - `-H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"`
  - `-H "Content-Type: application/json"`
  - `-d '{"name":"private-uploads","public":false}'`
- Replace `<PROJECT_REF>` with your project domain part or use `$SUPABASE_URL`
- Or perform bucket creation in an Edge Function using `supabase-js` with a `service_role` key (Edge Function must use `service_role` as a secret):
  - `const client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);`
  - `await client.storage.createBucket('private-uploads', { public: false });`
- ACL and RLS:
  - Use RLS and storage policies to ensure only certain users can access objects. Set policies in SQL migrations or via dashboard.
- Reasoning: The storage REST API and `supabase-js` admin calls require elevated privileges, so these calls must be run from a secure server context (Edge Functions or CI with `service_role` keys in secrets).

## Agent Workflow: Secrets and API Keys
- Add a secret for Edge Functions or runtime via CLI:
  - `supabase secrets set KEY="value"`
- List secrets:
  - `supabase secrets list`
- Remove secrets:
  - `supabase secrets remove KEY`
- Never print the secret values in logs, PRs, or agent outputs. If the agent needs to reference a key by name, it should use the key name only.
- For CI, add these secrets to GitHub Actions secrets and let CI inject them as environment variables.

### Rotating keys & emergency exposure
- If any secret is exposed, rotate it immediately in the dashboard and update the secrets via `supabase secrets set` or CI secrets.

## Local Dev & Testing Steps
- Start local services:
  - `supabase start`
- Stop local services:
  - `supabase stop`
- Serve functions locally:
  - `supabase functions serve`
- Test DB connection:
  - `psql "$LOCAL_POSTGRES_URL" -c "SELECT 1"`
- If login issues occur:
  - `supabase login --no-browser`
  - Or `supabase login --token "$SUPABASE_ACCESS_TOKEN"`
- Reasoning: Local dev stack helps validate migrations and functions before touching production.

## CI/CD Sample (GitHub Actions) — automatic deployment on push to main
Add `.github/workflows/deploy.yml`:

- `name: Deploy to Supabase`
- `on: push: branches: [ main ]`
- Jobs:
  - `deploy:`
    - `runs-on: ubuntu-latest`
    - Steps:
      - `uses: actions/checkout@v4`
      - `name: Setup Node`
        - `uses: actions/setup-node@v4`
        - `with: node-version: '18'`
      - `name: Install deps`
        - `run: npm ci`
      - `name: Install Supabase CLI`
        - `run: npm install -g supabase`
      - `name: Authenticate CLI`
        - `env: SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}`
        - `run: |`
          - `supabase login --token "$SUPABASE_ACCESS_TOKEN"`
          - `supabase link --project-ref "${{ secrets.SUPABASE_PROJECT_REF }}"`
      - `name: Run DB migrations`
        - `run: supabase db push`
      - `name: Deploy Edge Functions`
        - `run: supabase functions deploy --all`
      - `name: (Optional) Upload static frontend`
        - `run: |`
          - `npm run build` # deploy static build to static.app, Vercel, or other hosting as separate step

### Secrets to set in repo Settings → Secrets
- `SUPABASE_ACCESS_TOKEN` (a scoped token with deploy privileges; avoid using `service_role` here)
- `SUPABASE_PROJECT_REF`
- Reasoning: CI-only deployments avoid giving the client-side repo secrets and make deployments atomic on merges.

## Optional: File Watcher for Local Semi-automation
If you want quick local automation while developing, keep a watcher script but remember this still requires a human to start it.

- `scripts/deploy-all.sh`
  - `#!/usr/bin/env bash`
  - `set -e`
  - `supabase db push`
  - `supabase functions deploy --all`
  - `echo "Deployed DB migrations and functions."`
- `package.json`
  - `"scripts": { "deploy-all": "bash scripts/deploy-all.sh" }`
- Simple Node file watcher (quick prototype using `chokidar`)
  - `npm i -D chokidar-cli`
  - Add script: `"watch-deploy": "chokidar "supabase/migrations/,functions/" -c "npm run deploy-all""`
- Note: Use this only in a development environment; avoid running an automatic deploy script against production without human supervision.

## Agent Behavior Rules & Checklist (how the AI agent should operate)
- When making schema changes:
  - Create a timestamped `.sql` migration in `supabase/migrations`.
  - Add a short human-readable description header in the SQL file.
  - In the PR description, include the CLI commands required to apply the migration (e.g., `supabase db push`).
- When changing or adding Edge Functions:
  - Put function source under `functions/<name>/`.
  - Include instructions to run locally (`supabase functions serve`) and to deploy (`supabase functions deploy <name>`).
  - If the function needs secrets, call out the exact `supabase secrets set KEY="value"` commands (but never post the actual secret value in PR or chat).
- When creating buckets or interacting with storage:
  - Prefer Edge Function or admin REST API calls using service role keys (do not expose `service_role` key in code).
  - Provide the curl or `supabase-js` snippet that creates the bucket.
- When the agent needs secrets in production:
  - Request the human operator to add them to GitHub Actions secrets or run `supabase secrets set` locally; provide exact commands to run.
- For every change, the agent must:
  - Include exact shell commands for the human to run.
  - Note which environment variables must be set (e.g., `SUPABASE_ACCESS_TOKEN`, `POSTGRES_URL`).
  - Add or update a CI workflow that runs migrations and deploys functions on merge to main.
- If a CLI command fails, the agent should:
  - Output the fallback (`psql` or `curl`) and instruct the human how to inspect `supabase --help` for possible command variations.
  - Suggest verifying CLI version via `supabase --version` and upgrading `npm install -g supabase` if needed.

## Quick Cheat Sheet (copy/paste templates)

### Login (local or CI)
- `supabase login --no-browser`
- `supabase login --token $SUPABASE_ACCESS_TOKEN`

### Link (if needed)
- `supabase link --project-ref YOUR_PROJECT_REF`

### Apply migrations
- `supabase db push`

### Run a single SQL file (fallback)
- `psql "$POSTGRES_URL" -f sql/one-offs/name.sql`

### Serve functions locally
- `supabase functions serve`

### Deploy single function
- `supabase functions deploy oauth-jobber-callback`

### Deploy all functions
- `supabase functions deploy --all`

### Manage secrets
- `supabase secrets set KEY="value"`
- `supabase secrets list`
- `supabase secrets remove KEY`

### Create storage bucket (admin REST API via curl)
- `curl -X POST "https://<PROJECT_REF>.supabase.co/storage/v1/bucket"`
- `-H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"`
- `-H "Content-Type: application/json"`
- `-d '{"name":"bucket-name","public":false}'`