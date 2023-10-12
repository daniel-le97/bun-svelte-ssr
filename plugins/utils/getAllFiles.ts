import { promises as fsPromises } from "fs";
import * as path from 'path';

export default async (directories: string[]): Promise<{ [key: string]: string }> => {
    const fileMap: { [key: string]: string } = {};

    async function traverseDirectory(dir: string, baseDir: string) {
        const entries = await fsPromises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                await traverseDirectory(fullPath, baseDir);
            } else {
                fileMap[relativePath] = fullPath;
            }
        }
    }

    await Promise.all(directories.map(directory => traverseDirectory(directory, directory)));
    return fileMap;
};