import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

export function getPackageInfo(): PackageJson & { version: string; description: string } {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  return fs.readJSONSync(packageJsonPath);
}
