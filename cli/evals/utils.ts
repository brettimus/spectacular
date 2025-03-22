import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");

export function getTestDataFile<T>(fileName: string, type = "json"): T {
  const rawDataFile = fs.readFileSync(path.join(DATA_DIR, fileName), "utf8");
  switch (type) {
    case "json":
      return JSON.parse(rawDataFile);
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}
