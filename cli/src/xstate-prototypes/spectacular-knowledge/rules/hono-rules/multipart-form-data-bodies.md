## Parsing Multipart Form Data in Hono

Hono provides the `parseBody()` method to handle form data submitted as `multipart/form-data` or `application/x-www-form-urlencoded`.

### Basic Usage

```typescript
app.post('/entry', async (c) => {
  const body = await c.req.parseBody()
  // Process the form data
})
```

### Handling Different File Upload Scenarios

- **Single file upload**:
  ```typescript
  const body = await c.req.parseBody()
  const data = body['foo'] // string | File
  ```
  If multiple files with the same name are uploaded, only the last one will be used.

- **Multiple files upload**:
  ```typescript
  const body = await c.req.parseBody()
  const files = body['foo[]'] // (string | File)[]
  ```
  Note: The `[]` postfix is required for handling multiple files.

- **Multiple files with same name**:
  ```typescript
  const body = await c.req.parseBody({ all: true })
  const files = body['foo'] // (string | File)[] if multiple, (string | File) if single
  ```
  The `all` option is disabled by default. When enabled, fields with multiple files become arrays.

### Advanced Features

- **Dot Notation Parsing**:
  When form fields use dot notation (e.g., `obj.key1`), you can get structured objects:
  ```typescript
  const body = await c.req.parseBody({ dot: true })
  // body is { obj: { key1: 'value1', key2: 'value2' } }
  ```

### Complete Example

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Basic form submission
app.post('/submit-form', async (c) => {
  const body = await c.req.parseBody()
  return c.json({ received: body })
})

// File upload handling
app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  
  // Single file
  const profile = body['profile'] // string | File
  
  // Multiple files
  const gallery = body['photos[]'] // (string | File)[]
  
  return c.text('Upload successful!')
})

// Structured data with dot notation
app.post('/user-data', async (c) => {
  const body = await c.req.parseBody({ dot: true })
  // If form had fields like user.name, user.email, etc.
  // body will contain { user: { name: '...', email: '...' } }
  
  return c.json(body)
})

// Multiple files with same name
app.post('/batch-upload', async (c) => {
  const body = await c.req.parseBody({ all: true })
  const documents = body['documents'] // (string | File)[] if multiple files uploaded
  
  return c.text(`Received ${Array.isArray(documents) ? documents.length : 1} document(s)`)
})