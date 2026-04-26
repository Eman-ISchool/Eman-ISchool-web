import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function getGitValue(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function readRequiredFile(file) {
  if (!existsSync(file)) {
    failures.push(`${file} is missing`);
    return '';
  }
  return readFileSync(file, 'utf8');
}

function listFiles(dir) {
  const entries = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      entries.push(...listFiles(fullPath));
    } else {
      entries.push(fullPath);
    }
  }
  return entries;
}

function requireText(file, text) {
  const source = readRequiredFile(file);
  if (!source.includes(text)) {
    failures.push(`${file} must contain: ${text}`);
  }
  return source;
}

const failures = [];
const gitSha = getGitValue(['rev-parse', '--short=12', 'HEAD']);
const gitBranch = getGitValue(['branch', '--show-current']);
const deploySha =
  process.env.COMMIT_REF ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.HEAD ||
  'unknown';
const deployBranch =
  process.env.BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD_BRANCH ||
  'unknown';

console.log(`[deploy-check] local git: ${gitBranch || 'detached'}@${gitSha}`);
console.log(`[deploy-check] platform ref: ${deployBranch}@${deploySha}`);

const resetPasswordDir = 'src/app/[locale]/auth/reset-password';
const resetPasswordPage = `${resetPasswordDir}/page.tsx`;
const resetPageSource = requireText(resetPasswordPage, "export const dynamic = 'force-dynamic';");

if (!resetPageSource.includes('<Suspense')) {
  failures.push(`${resetPasswordPage} must wrap the reset form in Suspense`);
}

for (const file of listFiles(resetPasswordDir)) {
  const source = readRequiredFile(file);
  if (source.includes('useSearchParams')) {
    failures.push(`${file} must not call useSearchParams during prerender`);
  }
}

for (const route of [
  'src/app/api/reels/[reelId]/bookmark/route.ts',
  'src/app/api/reels/generate-from-source/route.ts',
  'src/app/api/dashboard/teacher/route.ts',
  'src/app/api/enrollment/onboarding/route.ts',
]) {
  requireText(route, "export const dynamic = 'force-dynamic';");
}

for (const file of [
  'src/lib/content-segmenter.ts',
  'src/lib/storyboard-generator.ts',
  'src/lib/transcription-api.ts',
]) {
  const source = readRequiredFile(file);
  if (source.includes('const openai = new OpenAI')) {
    failures.push(`${file} must not construct the OpenAI client at module import time`);
  }
}

const reelPipelineSource = readRequiredFile('src/lib/reel-pipeline.ts');
if (reelPipelineSource.includes('process.env.NEXT_PUBLIC_SUPABASE_URL!')) {
  failures.push('src/lib/reel-pipeline.ts must not construct the Supabase client at module import time');
}

for (const file of [
  'scripts/migrate-add-class-to-reels.js',
  'scripts/run-migration.sh',
  'seed-database.mjs',
]) {
  const source = readRequiredFile(file);
  if (source.includes('sb_secret_')) {
    failures.push(`${file} must read the Supabase service role key from the environment`);
  }
}

requireText('netlify.toml', 'SECRETS_SCAN_OMIT_KEYS');
requireText('netlify.toml', 'SECRETS_SCAN_OMIT_PATHS');

if (failures.length > 0) {
  console.error('[deploy-check] This checkout does not contain the Netlify/Vercel build fixes.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[deploy-check] Source contains the Netlify/Vercel build fixes.');
