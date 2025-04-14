## Route Grouping in Hono

Organize routes by grouping related endpoints for better maintainability:

- Create separate Hono instances for groups of related routes
- Use `app.route(path, routeGroup)` to mount route groups to the main app
- Export route groups from separate files for modular organization
- Set base paths with `basePath(path)` to prefix all routes in a group

```typescript
// books.ts
import { Hono } from 'hono'

const books = new Hono()
books.get('/', (c) => c.json('List books'))
books.post('/', (c) => c.json('Create book', 201))
books.get('/:id', (c) => c.json(`Get book ${c.req.param('id')}`))

export default books

// Main app (index.ts)
import { Hono } from 'hono'
import books from './books'
import authors from './authors'

const app = new Hono()

// Mount route groups
app.route('/books', books)
app.route('/authors', authors)

// Group with base path
const api = new Hono().basePath('/api')
api.get('/docs', (c) => c.text('API Documentation'))
app.route('/', api) // Handles /api/docs
``` 