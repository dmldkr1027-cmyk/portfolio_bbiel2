import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const frontendRoot = process.cwd();
const repoRoot = path.resolve(frontendRoot, '..');
const frontendDist = path.join(frontendRoot, 'dist');
const backendDist = path.join(repoRoot, 'backend', 'dist');

async function copyDir(source, destination) {
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true, dereference: true });
}

async function main() {
  const standaloneSource = path.join(frontendDist, 'standalone');
  const staticSource = path.join(frontendDist, 'static');
  const backendStandalone = path.join(backendDist, 'standalone');

  await rm(backendDist, { recursive: true, force: true });
  await mkdir(backendDist, { recursive: true });

  await copyDir(standaloneSource, backendStandalone);
  await copyDir(staticSource, path.join(backendStandalone, 'dist', 'static'));

  console.log(`Copied standalone build to ${backendStandalone}`);
}

main().catch((error) => {
  console.error('Failed to publish build artifacts:', error);
  process.exit(1);
});