import fs from "node:fs/promises";
import path from "node:path";

const KNOWLEDGE_BASE_DIR = path.resolve(
  path.join("src", "xstate-prototypes", "spectacular-knowledge"),
);

// Create the drizzle schema rules
// splitMarkdownByH2(
//   "drizzle-docs-2025-04-01_23-37-24-345.md",
//   "drizzle-schema-rules",
// );

splitMarkdownByH2("hono-rules-2025-04-02_23-55-02-673.md", "hono-rules");

async function splitMarkdownByH2(inputFileName, outputDirName) {
  try {
    // Define paths
    const inputFile = path.resolve(
      path.join(KNOWLEDGE_BASE_DIR, inputFileName),
    );
    const outputDir = path.resolve(
      path.join(KNOWLEDGE_BASE_DIR, outputDirName),
    );

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Read the input markdown file
    const content = await fs.readFile(inputFile, "utf8");

    // Split by H2 headers (## ...)
    // First, we split by lines to identify H2 headers
    const lines = content.split("\n");
    const sections = [];
    let currentSection = "";
    let currentTitle = "";

    for (const line of lines) {
      if (line.startsWith("## ")) {
        // If we already have content in the current section, add it to our sections array
        if (currentSection) {
          sections.push({
            title: currentTitle,
            content: currentSection.trim(),
          });
        }

        // Start a new section
        currentTitle = line.replace("## ", "").trim();
        currentSection = `${line}\n`;
      } else {
        // Add the line to the current section
        currentSection += `${line}\n`;
      }
    }

    // Add the last section
    if (currentSection) {
      sections.push({ title: currentTitle, content: currentSection.trim() });
    }

    // Process each section and save as a separate file
    for (const section of sections) {
      // Create a path-friendly filename
      const filename = `${section.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
        .replace(/^-|-$/g, "")}.md`;

      // HACK - In practice, this file is just the H1, so we skip it
      if (filename === ".md") {
        console.warn("Skipping bare '.md' file");
        continue;
      }

      // Write the section to a new file
      await fs.writeFile(
        path.join(outputDir, filename),
        section.content,
        "utf8",
      );

      console.log(`Created: ${filename}`);
    }

    console.log(`Successfully split markdown into ${sections.length} files.`);
  } catch (error) {
    console.error("Error splitting markdown:", error);
  }
}
