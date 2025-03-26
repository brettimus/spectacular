import fs from 'node:fs';
import path from 'node:path';

/**
 * Find directories in schema-generation folder that have schema error fix files
 */
export function findDirectoriesWithFixes(rootDir: string): string[] {
  const schemaGenDir = path.join(rootDir, 'data', 'schema-generation');
  
  // Ensure the directory exists
  if (!fs.existsSync(schemaGenDir)) {
    throw new Error(`Schema generation directory not found: ${schemaGenDir}`);
  }
  
  const subdirs = fs.readdirSync(schemaGenDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
    .map(dirent => dirent.name);
  
  // Filter for directories that have a schema fix file
  const dirsWithFixes = subdirs.filter(dir => {
    const dirPath = path.join(schemaGenDir, dir);
    const hasFixFile = fs.readdirSync(dirPath)
      .some(file => file.startsWith('schema-error-fix') && file.endsWith('.txt'));
    
    return hasFixFile;
  });
  
  // Return full paths to directories with fixes
  return dirsWithFixes.map(dir => path.join(schemaGenDir, dir));
} 