import { cp, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const frontendRoot = process.cwd();
const repoRoot = path.resolve(frontendRoot, '..');
const frontendDist = path.join(frontendRoot, 'dist');
const backendDist = path.join(repoRoot, 'backend', 'dist');

async function copyEntry(source, destination) {
  const sourceStats = await stat(source);

  if (sourceStats.isDirectory()) {
    await mkdir(destination, { recursive: true });
    await cp(source, destination, { recursive: true, dereference: true });
    return;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { dereference: true });
}

async function main() {
  const standaloneSource = path.join(frontendDist, 'standalone');
  const staticSource = path.join(frontendDist, 'static');
  const backendStandalone = path.join(backendDist, 'standalone');

  await mkdir(backendDist, { recursive: true });

  await copyEntry(path.join(standaloneSource, 'server.js'), path.join(backendStandalone, 'server.js'));
  await copyEntry(path.join(standaloneSource, 'package.json'), path.join(backendStandalone, 'package.json'));
  await copyEntry(path.join(standaloneSource, 'public'), path.join(backendStandalone, 'public'));
  await copyEntry(staticSource, path.join(backendStandalone, 'dist', 'static'));

  console.log(`Copied standalone build to ${backendStandalone}`);
}

main().catch((error) => {
  console.error('Failed to publish build artifacts:', error);
  process.exit(1);
});