import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const frontendRoot = process.cwd();
const repoRoot = path.resolve(frontendRoot, '..');
const frontendDist = path.join(frontendRoot, 'dist');
const backendDist = path.join(repoRoot, 'backend', 'dist');

async function resolveStandaloneSource() {
  const preferredSource = path.join(frontendDist, 'standalone', 'frontend');
  const fallbackSource = path.join(frontendDist, 'standalone');

  try {
    await stat(path.join(preferredSource, 'server.js'));
    return preferredSource;
  } catch {
    return fallbackSource;
  }
}

async function main() {
  const standaloneSource = await resolveStandaloneSource();
  const staticSource = path.join(frontendDist, 'static');
  const backendStandalone = path.join(backendDist, 'standalone');

  await mkdir(backendDist, { recursive: true });
  await rm(backendStandalone, { recursive: true, force: true });
  await cp(standaloneSource, backendStandalone, { recursive: true, dereference: true });
  await cp(staticSource, path.join(backendStandalone, 'dist', 'static'), {
    recursive: true,
    dereference: true,
  });

  console.log(`Copied standalone build to ${backendStandalone}`);
}

main().catch((error) => {
  console.error('Failed to publish build artifacts:', error);
  process.exit(1);
});