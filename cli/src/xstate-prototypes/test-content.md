# Test Markdown File

This is a sample markdown file that we'll use to test the ability to import markdown files as raw text using Vite's `?raw` import syntax.

## Features

- Import .md files directly in TypeScript
- Access the raw text content
- Use in our CLI applications

## Sample Code

```typescript
import markdownContent from './file.md?raw';
console.log(markdownContent);
```

This functionality will be useful for our documentation and help text in the CLI. 