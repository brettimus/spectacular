// Import a markdown file as raw text
import testMarkdown from "./test-content.md?raw";

console.log("First 100 characters of the imported markdown:");
console.log(testMarkdown.substring(0, 100));
console.log("\nTotal markdown length:", testMarkdown.length);
