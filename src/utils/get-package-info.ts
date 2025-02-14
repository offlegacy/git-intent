import path from 'node:path';
import fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

export function getPackageInfo(): PackageJson & { version: string; description: string } {
  const packageJsonPath = path.join('package.json');

  return fs.readJSONSync(packageJsonPath);
}
