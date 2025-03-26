import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const SPECS_DIR = path.join(DATA_DIR, "spectacular-specs");

export function getTestDataFile<T>(fileName: string, type = "json"): T {
  const rawDataFile = fs.readFileSync(path.join(DATA_DIR, fileName), "utf8");
  switch (type) {
    case "json":
      return JSON.parse(rawDataFile);
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}

export function getSpectacularSpecFile(fileName: string): string {
  return fs.readFileSync(path.join(SPECS_DIR, fileName), "utf8").toString();
}

export type SpectacularSpecFile = {
  fileName: string;
  spec: string;
  fullPath: string;
};

export function getAllSpectacularSpecFiles(): SpectacularSpecFile[] {
  return (
    fs
      .readdirSync(SPECS_DIR)
      // Only include files that are files (not directories)
      .filter((file) => fs.statSync(path.join(SPECS_DIR, file)).isFile())
      // Ignore files that start with an underscore
      .filter((file) => !file.startsWith("_"))
      .map((file) => ({
        fileName: file,
        spec: getSpectacularSpecFile(file),
        fullPath: path.join(SPECS_DIR, file),
      }))
  );
}
