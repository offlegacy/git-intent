import path from 'node:path';
import fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

export function getPackageInfo(): { version: string; description: string } {
  const possiblePaths = [
    path.resolve(__dirname, '../../package.json'),
    path.resolve(__dirname, '../package.json'),
    path.resolve(process.cwd(), 'package.json'),
  ];

  for (const packageJsonPath of possiblePaths) {
    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJSONSync(packageJsonPath) as PackageJson;

        if (packageJson.name === 'git-intent') {
          return {
            version: packageJson.version || '0.0.0',
            description: packageJson.description || 'Git Intent CLI',
          };
        }
      }
    } catch (error) {}
  }

  return {
    version: '0.0.0',
    description: 'Git Intent CLI',
  };
}
