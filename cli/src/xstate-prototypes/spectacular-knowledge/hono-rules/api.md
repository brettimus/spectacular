# Drizzle SQLite Rules

## Api

### Handling Multiple Methods, Paths and Path Parameters in Hono

In Hono, you can define routes that respond to multiple methods or paths. This is useful when you want to perform the same action for different HTTP methods or paths.

```ts
// Multiple Method
app.on(['PUT', 'DELETE'], '/post', (c) =>
  c.text('PUT or DELETE /post')
)

// Multiple Paths
app.on('GET', ['/hello', '/ja/hello', '/en/hello'], (c) =>
  c.text('Hello')
)
ts
// Path Parameter
app.get('/user/:name', async (c) => {
  const name = c.req.param('name')
  // ...
})
```

In the above example, `:name` is a path parameter. You can access its value using `c.req.param('name')`.

- When defining multiple methods or paths, make sure they are in an array.
- Path parameters are prefixed with a colon (`:`) and can be accessed using `c.req.param()`.

- [Hono Documentation](https://hono.boutell.com/)

- Creating CRUD (Create, Read, Update, Delete) operations where the same route is used with different HTTP methods.
- Creating localized routes (e.g., `/en/hello`, `/ja/hello`).
- Capturing user IDs or other data from the URL.

#### Code Snippet

```typescript

Additionally, Hono allows you to define path parameters. These are dynamic parts of the URL that can be captured and used in your route handler.

```

**Reasoning:** This rule is important as it demonstrates how to handle multiple methods and paths, and how to extract path parameters in Hono. Understanding this rule allows developers to create more flexible and dynamic routes in their web applications.

*Source: docs/api/routing.md*

### Using Path Parameters in Hono

In Hono, you can define path parameters in your routes. These parameters can then be accessed in your route handlers.

Here's an example of a route with a single path parameter:

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/user/:name', async (c) => {
  const name = c.req.param('name')
})
ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/posts/:id/comment/:comment_id', async (c) => {
  const { id, comment_id } = c.req.param()
})
```

In both examples, the parameters are defined in the route using the `:` prefix. They can then be accessed in the route handler using the `param` method on the request object (`c.req`).

- Path parameters are a powerful tool for creating dynamic routes, but they should be used judiciously to avoid creating overly complex routes.
- Always validate path parameters to ensure they are of the expected format and type.

- [Hono Documentation](https://hono.bevry.me/)

- Retrieving a specific resource by its ID
- Navigating nested resources (e.g., comments on a post)

#### Code Snippet

```typescript

And here's an example of a route with multiple path parameters:

```

**Reasoning:** This rule is important as it demonstrates how to use path parameters in Hono. Path parameters are a crucial part of building RESTful APIs, allowing developers to create more dynamic routes. Understanding how to extract these parameters from the request is key to handling different types of requests and responses.

*Source: docs/api/routing.md*

### Defining Routes with Dynamic and Optional Parameters in Hono

In Hono, you can define routes with dynamic parameters and optional parameters. Dynamic parameters are defined by prefixing the parameter name with a colon `:`. Optional parameters are defined by appending a question mark `?` to the parameter name.

Here is an example of a route with dynamic parameters:

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/posts/:id/comment/:comment_id', async (c) => {
  const { id, comment_id } = c.req.param()
  // ...
})
ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/api/animal/:type?', (c) => c.text('Animal!'))
```

In this example, `:type?` is an optional parameter. The route will match both `/api/animal` and `/api/animal/:type`.

- Dynamic and optional parameters can be accessed via the `req.param()` method in the route handler.
- Optional parameters make the route more flexible, but can also make it more ambiguous. Use them judiciously.

- [Hono Documentation](https://hono.beyondnlp.com/)

- Creating RESTful APIs with dynamic resource identifiers.
- Creating routes that can handle different levels of specificity.

#### Code Snippet

```typescript

In this example, `:id` and `:comment_id` are dynamic parameters. The actual values for these parameters are provided in the URL when the route is accessed.

Here is an example of a route with an optional parameter:

```

**Reasoning:** This rule is important because it demonstrates how to define routes with optional and dynamic parameters in Hono. Understanding this rule allows developers to create flexible and dynamic routes in their web applications.

*Source: docs/api/routing.md*

### Defining Dynamic Routes in Hono

In Hono, you can define dynamic routes with parameters and regular expressions. This allows you to create more flexible and powerful routing patterns.

Here are some examples:

```ts
import { Hono } from 'hono'
const app = new Hono()

// Define a route with parameters and regular expressions
app.get('/post/:date{[0-9]+}/:title{[a-z]+}', async (c) => {
  const { date, title } = c.req.param()
  // ...
})

// Define a route that includes slashes
app.get('/posts/:filename{.+\.png}', async (c) => {
  //...
})
```

In the first example, the route includes two parameters, `date` and `title`, which are constrained by regular expressions. The `date` parameter must be a number, and the `title` parameter must be a lowercase string.

In the second example, the route includes a parameter `filename` that can include slashes, as indicated by the regular expression `.+\.png`.

To extract the parameters from the request, you can use `c.req.param()`.

- The regular expressions in the route definitions are used to validate the parameters. If a parameter does not match the regular expression, the route will not match.

- [Hono Documentation](https://hono.bryntum.com/docs)

- Creating blog post URLs that include the post date and title
- Serving static files with dynamic paths

**Reasoning:** This rule is important as it demonstrates how to define dynamic routes with parameters and regular expressions in Hono. It shows how to extract parameters from the request and how to define routes that include slashes or are chained.

*Source: docs/api/routing.md*

### Defining Routes with Chained Methods and Including Slashes in Hono

In Hono, you can chain methods to define routes for different HTTP methods on the same endpoint. You can also include slashes in the route parameters.

Here's an example:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:filename{.+\.png}', async (c) => {
  //...
})
ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app
  .get('/endpoint', (c) => {
    return c.text('GET /endpoint')
  })
  .post((c) => {
    return c.text('POST /endpoint')
  })
```

In the above code, `app.get('/endpoint', (c) => {...})` and `app.post((c) => {...})` define GET and POST routes for the same endpoint.

- The `{.+\.png}` in the route parameter is a regular expression that matches any string that includes a `.png` extension.
- The `c` parameter in the route handler function is the context object, which provides methods and properties related to the HTTP request and response.

- [Hono API Documentation](https://hono.beyondco.de/docs/routing)

- Defining routes for different HTTP methods on the same endpoint.
- Including slashes in route parameters when necessary.

#### Code Snippet

```typescript

In the above code, `app.get('/posts/:filename{.+\.png}', async (c) => {...})` defines a GET route where the `:filename` parameter can include slashes.

Here's another example:

```

**Reasoning:** This rule is important as it demonstrates how to define routes in Hono framework using chained methods and how to include slashes in the route parameters. It also shows how to handle different HTTP methods for the same endpoint.

*Source: docs/api/routing.md*

### Grouping Routes in Hono

In Hono, you can group the routes with the Hono instance and add them to the main app with the route method. This helps in organizing your routes in a clean and maintainable way.

Here is a code snippet demonstrating this:

```ts
import { Hono } from 'hono'

const book = new Hono()

book.get('/', (c) => c.text('List Books')) // GET /book
book.get('/:id', (c) => {
  // GET /book/:id
  const id = c.req.pa
```

In this snippet, we are creating a new Hono instance and grouping the routes for 'book'. We then add these routes to the main app using the route method.

1. Import the Hono module.
2. Create a new Hono instance.
3. Define your routes using the get method on the Hono instance.
4. Add these routes to the main app using the route method.

- Grouping routes helps in maintaining a clean codebase and improves readability.

- [Hono Documentation](https://hono.bespokejs.com)

- When you have multiple routes related to a specific resource (like 'book' in this case), you can group them using a Hono instance.

**Reasoning:** This rule is important as it demonstrates how to group routes using the Hono instance and add them to the main application using the route method. This is a common practice in web development to organize routes in a clean and maintainable way.

*Source: docs/api/routing.md*

### Grouping Routes Without Changing Base in Hono

This code demonstrates how to group multiple instances in Hono without changing the base. It shows how to define different HTTP methods (GET and POST) for the same route ('/book') and how to use the 'route' method to add these routes to the Hono application.

```ts
import { Hono } from 'hono'

const book = new Hono()
book.get('/book', (c) => c.text('List Books'))
book.post('/book', (c) => c.text('Create Book'))

const app = new Hono()
app.route('/book', book)
```

1. A new Hono instance 'book' is created.
2. The 'get' and 'post' methods are used to define GET and POST routes for '/book'.
3. A new Hono application 'app' is created.
4. The 'route' method is used to add the 'book' routes to the 'app'.

- The 'route' method is used to add a group of routes to a Hono application.
- The base of the routes remains unchanged when they are added to the application.

- [Hono Documentation](https://hono.boutell.com/)

- Grouping related routes in a Hono application.
- Defining different HTTP methods for the same route.

**Reasoning:** This rule is important as it demonstrates how to group multiple instances in Hono without changing the base. It shows how to define different HTTP methods (GET and POST) for the same route ('/book') and how to use the 'route' method to add these routes to the Hono application. Understanding this pattern is crucial for organizing routes in a Hono application.

*Source: docs/api/routing.md*

### Defining Routes and Base Paths in Hono

In Hono, you can define routes and specify the base path for all routes. This is crucial for handling different HTTP methods for different routes and serving responses.

Here is a code snippet demonstrating this:

```ts
import { Hono } from 'hono'

const user = new Hono()
user.get('/', (c) => c.text('List Users')) // GET /user
user.post('/', (c) => c.text('Create User')) // POST /user

const app = new Hono()
app.route('/', book) // Handle /book
app.route('/', user) // Handle /user

const api = new Hono().basePath('/api')
api.get('/book', (c) => c.text('List Books')) // GET /api/book
```

In this snippet:

- `user.get('/', (c) => c.text('List Users'))` defines a GET route at `/user` that responds with 'List Users'.
- `user.post('/', (c) => c.text('Create User'))` defines a POST route at `/user` that responds with 'Create User'.
- `app.route('/', book)` and `app.route('/', user)` attach the `book` and `user` routes to the main `app`.
- `const api = new Hono().basePath('/api')` sets the base path for all routes to `/api`.

- The base path is prefixed to all routes. So, `api.get('/book', (c) => c.text('List Books'))` will handle GET requests at `/api/book`.

- [Hono Documentation](https://hono.bike/)

- Building APIs with different routes and methods.
- Grouping routes under a common base path.

**Reasoning:** This rule is important as it demonstrates how to define routes and specify base paths in Hono. It shows how to handle different HTTP methods (GET, POST) for different routes and how to set a base path for all routes. Understanding this is crucial for building applications with Hono as it forms the basis of how requests are handled and responses are served.

*Source: docs/api/routing.md*

### Defining Base Path and Routing with Hostname in Hono

This code demonstrates how to define the base path and routing with hostname in Hono.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const api = new Hono().basePath('/api')
api.get('/book', (c) => c.text('List Books')) // GET /api/book
ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/\/([^?]+).*$/, '$1'),
})

app.get('/www1.example.com/hello', (c) => c.text('hello'))
```

In the above code, the getPath option is used to customize the path extraction from the request. The get method is then used to define a route '/www1.example.com/hello' which responds with 'hello' when accessed.

- The basePath method sets the base path for all routes.
- The get method is used to define a route.
- The getPath option can be used to customize the path extraction from the request.

- [Hono Documentation](https://hono.bike/)

- Defining a base path for all routes in an application.
- Defining routes in an application.
- Customizing path extraction from the request.

#### Code Snippet

```typescript

In the above code, the basePath method is used to set '/api' as the base path for all routes. The get method is then used to define a route '/book' which responds with 'List Books' when accessed.

```

**Reasoning:** This rule is important as it demonstrates how to define the base path and routing with hostname in Hono. It shows how to use the basePath method to set a base path for all routes and how to use the get method to define a route. It also shows how to use the getPath option to customize the path extraction from the request.

*Source: docs/api/routing.md*

### Handling the 'host' Header Value in Hono

In Hono, you can handle the `host` header value by setting the `getPath()` function in the Hono constructor. This allows for dynamic routing based on the host header value.

Here is an example:

```ts
import { Hono } from 'hono'

const app = new Hono({
  getPath: (req) =>
    '/' +
    req.headers.get('host') +
    req.url.replace(/^https?:\/\/[^/]+(\/[^?]*).*/, '$1'),
})
```

In this example, the `getPath()` function is used to construct a path that includes the host header value and the original URL path. This can be useful in multi-tenant applications or when serving different content based on the domain.

- The `getPath()` function is called for every request, so it should be as efficient as possible.

- [Hono documentation](https://hono.bike/)

- Multi-tenant applications
- Serving different content based on the domain

**Reasoning:** This rule is important as it demonstrates how to handle the 'host' header value in Hono by setting the 'getPath()' function in the Hono constructor. This allows for dynamic routing based on the host header value, which can be useful in multi-tenant applications or when serving different content based on the domain.

*Source: docs/api/routing.md*

### Understanding Routing and Routing Priority in Hono

In Hono, routes are matched in the order they are registered. This means that if a request matches multiple routes, the first one registered will be used.

Here's an example:

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/book/a', (c) => c.text('a'))
app.get('/book/:slug', (c) => c.text('common'))
```

In this example, a GET request to '/book/a' will match the first route and return 'a', even though it could also match the second route.

This behavior is important to keep in mind when designing your application's routing. If you have overlapping routes, make sure to register the more specific ones first.

Also, you can change the routing by `User-Agent` header which can be useful for serving different content or layouts to different types of devices or browsers.

**Reasoning:** This rule is important as it demonstrates how routing works in Hono and how the order of registration affects the routing priority. It shows that the first matching route is selected, and subsequent routes are ignored. This is crucial for developers to understand to avoid unexpected behavior in their applications.

*Source: docs/api/routing.md*

### Understanding Hono Routing and Handler Execution Order

This code snippet demonstrates the routing mechanism in Hono and the importance of the order of route handlers.

```ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/book/a', (c) => c.text('a')) // a
app.get('/book/:slug', (c) => c.text('common')) // common
ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('*', (c) => c.text('common')) // common
app.get('/foo', (c) => c.text('foo')) // foo
```

In this example, regardless of the specific route, the response will be `common` because the wildcard handler is executed first.

Hono executes the handlers in the order they are defined. Once a handler is executed, the process will be stopped, and no further handlers will be executed.

The order of defining route handlers in Hono is crucial. If a wildcard handler is defined before a specific route handler, the specific route handler will never be executed.

- [Hono Documentation](https://hono.boutell.com/)

- Defining specific route handlers before wildcard handlers to handle specific routes differently.
- Using wildcard handlers to provide a default response for unspecified routes.

#### Code Snippet

```typescript

In this example, if a GET request is made to `/book/a`, the response will be `a`. If a GET request is made to `/book/b`, the response will be `common`.

```

**Reasoning:** This rule is important as it demonstrates the routing mechanism in Hono and how the order of route handlers matters. It shows that once a handler is executed, the process will be stopped, and no further handlers will be executed. This is crucial to understand to avoid unexpected behavior in the application.

*Source: docs/api/routing.md*

### Order of Middleware and Route Handlers in Hono

In Hono, the order in which middleware and route handlers are declared matters, as they will be executed in that order.

Here is an example:

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
const app = new Hono()
// ---cut---
app.use(logger())
app.get('/foo', (c) => c.text('foo'))
```

In this example, the `logger()` middleware is declared before the route handler for '/foo'. This means that the logger middleware will be executed before the route handler whenever a GET request is made to '/foo'.

When a request is made to the Hono application, it goes through the middleware and route handlers in the order they were declared. If a middleware does not call the `next()` function, the request-response cycle will end there and the following middleware or route handlers will not be executed.

- Always declare middleware that you want to execute before route handlers above the route handlers.

- [Hono Middleware](https://hono.bevry.me/docs/middleware)

- Logging requests before they reach the route handlers.
- Authenticating requests before they reach the route handlers.

**Reasoning:** This rule is important as it demonstrates the order of middleware and route handlers in Hono. Middleware functions are functions that have access to the request object, the response object, and the next function in the application’s request-response cycle. The next function is a function in the Hono application, when invoked, executes the middleware succeeding the current middleware. Middleware functions can perform the following tasks: execute any code, make changes to the request and the response objects, end the request-response cycle, call the next middleware in the stack. If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging. The order in which middleware and route handlers are declared matters, as they will be executed in that order.

*Source: docs/api/routing.md*

### Setting Up a Fallback Route in Hono

In Hono, you can create a fallback route that will be used when no other routes match the incoming request. This is done by defining a route with a wildcard '*' as the path.

Here is an example:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/bar', (c) => c.text('bar')) // bar
app.get('*', (c) => c.text('fallback')) // fallback
```

In this example, if a GET request is made to '/bar', the response will be 'bar'. If a GET request is made to any other path, the response will be 'fallback'.

When a request is made, Hono will try to match the request's path with the paths of the routes that have been defined. It starts from the top and goes down. If it finds a match, it will use that route. If it doesn't find a match, it will use the fallback route.

- The order of the routes is important. The fallback route should be defined last.

- [Hono documentation](https://hono.bevry.me/)

- Displaying a 404 page when the requested route does not exist.

**Reasoning:** This rule is important as it demonstrates how to set up a fallback route in Hono. A fallback route is a route that will be used when no other routes match the incoming request. This is useful for handling unknown routes or displaying a 404 page.

*Source: docs/api/routing.md*

### Correct Grouping and Ordering of Routes in Hono

This code snippet demonstrates the correct way to group and order routes in Hono.

```ts
three.get('/hi', (c) => c.text('hi'))
two.route('/three', three)
app.route('/two', two)

export default app
```

In this example, the `route()` function takes the stored routing from the second argument (such as `three` or `two`) and adds it to its own (`two` or `app`) routing. This results in the following route: `GET /two/three/hi ---> 'hi'`.

It's important to note that mistakes in grouping or ordering of routes can be hard to notice but can lead to unexpected behavior or errors. Therefore, it's crucial to pay attention to the order in which routes are defined and grouped.

- [Hono Documentation](https://hono.boutell.com/)

- Defining nested routes in a web application
- Grouping related routes under a common path

**Reasoning:** This rule is important as it demonstrates the correct ordering and grouping of routes in Hono. It shows how the `route()` function works by taking the stored routing from the second argument and adding it to its own routing. This is crucial for the correct functioning of the application, as incorrect ordering or grouping of routes can lead to unexpected behavior or errors.

*Source: docs/api/routing.md*

### Correct Order of Nested Routes in Hono

This code snippet demonstrates the correct order of defining nested routes in Hono.

```ts
three.get('/hi', (c) => c.text('hi'))
two.route('/three', three)
app.route('/two', two)

export default app
```

In this example, the route '/two/three/hi' will return a 200 response with the text 'hi'. However, if the routes are defined in the wrong order, it will return a 404 error.

In Hono, routes are defined using the `.route()` method. This method takes a path as its first argument and a Hono instance as its second. The second Hono instance will handle any requests that match the given path.

- The order in which routes are defined matters. If routes are not properly nested, it can lead to 404 errors.

- [Hono Documentation](https://hono.boutell.com/)

- Defining nested routes in a Hono application.

**Reasoning:** This rule is important as it demonstrates how routing works in Hono. It shows that the order in which routes are defined matters and can affect the response of the application. If routes are not properly nested, it can lead to 404 errors.

*Source: docs/api/routing.md*

### Importance of Route Definition Order in Hono

In Hono, the order in which routes are defined is crucial. The order of route definition determines the order in which the routes are matched and handled. If routes are defined in the wrong order, it could lead to unexpected 404 errors.

Here is an example:

```ts
three.get('/hi', (c) => c.text('hi'))
two.route('/three', three)
app.route('/two', two)

export default app
ts
three.get('/hi', (c) => c.text('hi'))
app.route('/two', two) // `two` does not have '/three' route defined yet
```

When a request is made, Hono matches the routes in the order they were defined. If a matching route is found, the corresponding handler is invoked. If no matching route is found, a 404 error is returned.

- Always define routes in the order they should be matched.
- Be careful when defining nested routes. The parent route should be defined before the child route.

- [Hono Documentation](https://hono.boutell.com/)

- Defining nested routes
- Handling 404 errors

#### Code Snippet

```typescript

In this example, the route '/two/three/hi' will return a 200 response. However, if the routes are defined in the wrong order, it will return a 404.

```

**Reasoning:** This rule is important because it demonstrates the significance of the order in which routes are defined in Hono. The order of route definition determines the order in which the routes are matched and handled. If routes are defined in the wrong order, it could lead to unexpected 404 errors.

*Source: docs/api/routing.md*

### Handling HTTP Requests and Sending Responses in Hono

This code snippet demonstrates how to handle HTTP GET requests and send responses using Hono. It shows how to extract headers from the request, and how to send a text response.

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/hello', (c) => {
  const userAgent = c.req.header('User-Agent')
  return c.text(`Hello, ${userAgent}`)
})
```

In this example, a GET request is made to the '/hello' endpoint. The `c.req.header('User-Agent')` is used to extract the 'User-Agent' header from the request. The `c.text()` method is then used to send a text response to the client.

When returning Text or HTML, it is recommended to use `c.text()` or `c.html()`. You can also set headers with `c.header()` and set HTTP status code with `c.status`. This can also be set in `c.text()`, `c.json()` and so on.

**Reasoning:** This rule is important as it demonstrates how to handle HTTP requests and send responses using Hono. It shows how to extract headers from the request, and how to send a text response. Understanding this is crucial for building web applications with Hono.

*Source: docs/api/context.md*

### Setting HTTP Headers, Status Code, and Response Body in Hono

This code snippet demonstrates how to set HTTP headers, status code, and response body in Hono.

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/welcome', (c) => {
  c.header('X-Message', 'Hello!')
  c.header('Content-Type', 'text/plain')

  // Set HTTP status code
  c.status(201)

  // Return the response body
  return c.body('Thank you for coming')
})
ts
app.get('/welcome', (c) => {
  return c.body('Thank you for coming', 201, {
    'X-Message': 'Hello!',
    'Content-Type': 'text/plain'
  })
})
```

In Hono, you can use the `header` method of the context object `c` to set HTTP headers. The `status` method is used to set the HTTP status code. The `body` method is used to set the response body.

- The `header` method takes two arguments: the name of the header and its value.
- The `status` method takes one argument: the HTTP status code.
- The `body` method can take up to three arguments: the response body, the status code, and an object containing headers.

- [Hono Documentation](https://hono.boutell.com/)

- Sending custom headers in the HTTP response.
- Setting a specific HTTP status code.
- Returning a response body.

#### Code Snippet

```typescript

Alternatively, you can also set the status code and headers while returning the response body as follows:

```

**Reasoning:** This rule is important as it demonstrates how to set HTTP headers, status code, and response body in Hono. Understanding this is crucial for creating HTTP responses in a Hono application.

*Source: docs/api/context.md*

### Defining a GET Route and Returning Custom Response in Hono

This code snippet demonstrates how to define a GET route in Hono and how to return a custom response with a specific status code and headers.

```javascript
const { Hono } = require('hono')
const app = new Hono()

app.get('/welcome', (c) => {
  return c.body('Thank you for coming', 201, {
    'X-Message': 'Hello!',
    'Content-Type': 'text/plain',
  })
})
```

In this example, a GET route '/welcome' is defined. When this route is hit, it returns a response with the body 'Thank you for coming', a status code of 201, and custom headers 'X-Message' and 'Content-Type'.

This shows the flexibility of Hono in handling HTTP responses, which is crucial for building web applications.

- The `c.body()` function is used to set the response body, status code, and headers.
- The status code and headers are optional. If not provided, Hono will use default values.

- [Hono Documentation](https://hono.boutell.com/)

- Returning custom responses in web applications.
- Setting custom headers for responses.

**Reasoning:** This rule is important as it demonstrates how to define a GET route in Hono and how to return a custom response with a specific status code and headers. It shows the flexibility of Hono in handling HTTP responses, which is crucial for building web applications.

*Source: docs/api/context.md*

### Handling Different Types of Responses in Hono

This code demonstrates how to handle different types of responses in Hono.

You can send a custom response by creating a new instance of the `Response` class and passing in the response message, status, and headers.

```ts
ew Response('Thank you for coming', {
  status: 201,
  headers: {
    'X-Message': 'Hello!',
    'Content-Type': 'text/plain',
  },
})
ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/say', (c) => {
  return c.text('Hello!')
})
ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/json', (c) => {
  return c.json({ message: 'Hello!' })
})
```

These methods are part of Hono's context object, which is passed to every route handler. They provide a convenient way to send different types of responses to the client.

#### Code Snippet

```typescript

### Text Response

You can render text as 'Content-Type:text/plain' by using the `text()` method.

```

**Reasoning:** This rule is important as it demonstrates how to handle different types of responses in Hono. It shows how to send a custom response, render text as 'Content-Type:text/plain', and render JSON as 'Content-Type:application/json'. Understanding these response types is crucial for building APIs that can handle different types of data and respond appropriately to client requests.

*Source: docs/api/context.md*

### Handling HTTP Responses in Hono

This rule demonstrates how to use Hono's built-in methods for handling different types of HTTP responses.

Render HTML as `Content-Type:text/html`.

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/', (c) => {
  return c.html('<h1>Hello! Hono!</h1>')
})
ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/notfound', (c) => {
  return c.notFound()
})
ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/redirect', (c) => {
  return c.redirect('/new-location')
})
```

These methods are part of Hono's context object, which is passed to each route handler. They provide a simple and intuitive way to handle common HTTP responses.

#### Code Snippet

```typescript

### notFound()

Return the `Not Found` Response.

```

**Reasoning:** These code snippets demonstrate how to use Hono's built-in methods for handling different types of HTTP responses. Understanding these methods is crucial for building web applications with Hono, as they allow developers to easily send HTML content, handle not found errors, and perform redirects.

*Source: docs/api/context.md*

### Handling Not Found and Redirection Responses in Hono

This code snippet demonstrates how to handle not found and redirection responses in Hono.

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/notfound', (c) => {
  return c.notFound()
})

app.get('/redirect', (c) => {
  return c.redirect('/')
})
```

In the above code:

1. The `notFound()` method is used to return a 'Not Found' response when the '/notfound' route is accessed.
2. The `redirect()` method is used to redirect the user to the root route ('/') when the '/redirect' route is accessed. By default, the status code for this redirection is `302`.

- The `notFound()` and `redirect()` methods are part of the context (`c`) object provided by Hono.
- The `redirect()` method can also accept a second argument specifying a different status code.

- [Hono Documentation](https://hono.bryntum.com/docs)

- Use the `notFound()` method to handle routes that do not exist in your application.
- Use the `redirect()` method to redirect users after certain actions, such as successful form submission or login.

**Reasoning:** This rule is important as it demonstrates how to handle not found and redirection responses in Hono. Understanding these methods is crucial for managing routing and user navigation within a Hono application.

*Source: docs/api/context.md*

### Using set() / get() and Response Headers in Hono Middleware

This code snippet demonstrates how to use middleware in Hono to set and append headers to the response object. It also shows how to use the 'set' function to add arbitrary key-value pairs to the context object.

```ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// Response object
app.use('/', async (c, next) => {
  await next()
  c.res.headers.append('X-Debug', 'Debug message')
})
```

In this code snippet, the middleware function is used to append a 'X-Debug' header with the value 'Debug message' to the response object. The 'set' function is used to add a 'message' key with the value 'Hono is cool!!' to the context object.

This allows passing specific values between middleware or from middleware to route handlers. It is a common practice in Hono to use middleware for such purposes.

- The 'set' function can be used to add arbitrary key-value pairs to the context object.
- The 'get' function can be used to retrieve the value of a key from the context object.
- The lifetime of these key-value pairs is the current request.

- [Hono Documentation](https://hono.bevry.me/)

- Passing specific values between middleware or from middleware to route handlers.
- Adding custom headers to the response object.

**Reasoning:** This rule is important as it demonstrates how to use middleware in Hono to set and append headers to the response object. It shows how to use the 'set' function to add arbitrary key-value pairs to the context object, which can be used to pass specific values between middleware or from middleware to route handlers.

*Source: docs/api/context.md*

### Using Generics in Hono for Type Safety

This code snippet demonstrates how to use generics in Hono to make the code type-safe. By passing the `Variables` to the constructor of `Hono`, we can ensure that the values of 'c.set' and 'c.get' are retained and correctly typed.

```ts
import { Hono } from 'hono'

type Variables = {
  message: string
}

const app = new Hono<{ Variables: Variables }>()
```

In this code, we define a type `Variables` with a property `message` of type `string`. We then pass this type as a generic to the constructor of `Hono`. This means that when we use 'c.set' and 'c.get', the values are correctly typed as `string`.

- Using generics in this way is a best practice in Hono framework usage as it reduces the risk of runtime errors due to incorrect types.

- [Hono Documentation](https://hono.bike/)

- Storing and retrieving variables in a Hono application
- Ensuring type safety in a Hono application

**Reasoning:** This rule is important as it demonstrates how to use generics in Hono to make the code type-safe. It shows how to pass variables to the constructor of Hono, which ensures that the values of 'c.set' and 'c.get' are retained and correctly typed. This is a best practice in Hono framework usage as it reduces the risk of runtime errors due to incorrect types.

*Source: docs/api/context.md*

### Type-Safety and Variable Management in Hono

This code demonstrates how to use the Hono framework to create type-safe applications and how to manage and access variables within the same request.

```ts twoslash
import { Hono } from 'hono'
// ---cut---
type Variables = {
  message: string
}

const app = new Hono<{ Variables: Variables }>()
ts twoslash
import type { Context } from 'hono'
declare const c: Context
// ---cut---
const result = c.var.client.oneMethod()
```

In the above code, `c.var` is used to access the value of a variable.

- The value of `c.set` / `c.get` are retained only within the same request. They cannot be shared or persisted across different requests.
- You can access the value of a variable with `c.var`.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Creating type-safe applications with Hono
- Managing and accessing variables within the same request

#### Code Snippet

```typescript

In the above code, a type `Variables` is defined and passed to the constructor of `Hono` to make it type-safe.

The value of `c.set` / `c.get` are retained only within the same request. They cannot be shared or persisted across different requests.

You can also access the value of a variable with `c.var`.

```

**Reasoning:** This rule is important as it demonstrates how to use the Hono framework to create type-safe applications and how to manage and access variables within the same request. It also highlights the limitation of `c.set` / `c.get` in that they cannot be shared or persisted across different requests.

*Source: docs/api/context.md*

### Accessing Variable Values and Creating Custom Middleware Methods in Hono

This code demonstrates how to access the value of a variable using 'c.var' and how to create a middleware that provides a custom method in Hono.

```ts twoslash
import type { Context } from 'hono'
declare const c: Context
// ---cut---
const result = c.var.client.oneMethod()
ts twoslash
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
// ---cut---
type Env = {
  Variables: {
    echo: (str: string) => string
  }
}

const app = new Hono()
```

In the first snippet, 'c.var' is used to access the value of a variable. In the second snippet, a custom method is created in the middleware by defining a new type 'Env' and initializing a new Hono application.

- 'c.var' is a powerful feature in Hono that allows for efficient variable management.
- Custom methods in middleware can be created to extend the functionality of your Hono application.

- [Hono Documentation](https://hono.bryntum.com/docs/)

- Accessing variable values in Hono applications
- Extending middleware functionality by creating custom methods

#### Code Snippet

```typescript

To create a middleware that provides a custom method, you can follow the example below:

```

**Reasoning:** This rule is important as it demonstrates how to access the value of a variable using 'c.var' in Hono and how to create a middleware that provides a custom method. Understanding this rule allows developers to effectively utilize Hono's capabilities to manage variables and create custom methods in middleware.

*Source: docs/api/context.md*

### Using Middleware in Multiple Handlers and Ensuring Type Safety in Hono

This code snippet demonstrates how to use a middleware in multiple handlers using the Hono web framework. It also shows how to ensure type safety by passing the 'Env' as Generics to the constructor of 'Hono'.

```ts
const echoMiddleware = createMiddleware<Env>(async (c, next) => {
  c.set('echo', (str) => str)
  await next()
})

app.get('/echo', echoMiddleware, (c) => {
  return c.text(c.var.echo('Hello!'))
})
```

If you want to use the middleware in multiple handlers, you can use `app.use()`. Then, you have to pass the `Env` as Generics to the constructor of `Hono` to make it type-safe.

1. The `echoMiddleware` is created using `createMiddleware` function of Hono. It sets a function 'echo' in the context 'c' that returns the input string.
2. The middleware is then used in a GET handler for the route '/echo'. The handler uses the 'echo' function set in the context by the middleware to return a text response.
3. If you want to use the middleware in multiple handlers, you can use `app.use(echoMiddleware)`.
4. To ensure type safety, you can pass the `Env` as Generics to the constructor of `Hono`.

- Middleware in Hono can be used in multiple handlers, which promotes reusability.
- Type safety can be ensured by passing the 'Env' as Generics to the constructor of 'Hono'.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Using middleware for common functionality across multiple routes.
- Ensuring type safety in middleware.

**Reasoning:** This rule is important as it demonstrates how to use middleware in multiple handlers using Hono web framework. It also shows how to make the middleware type-safe by passing the 'Env' as Generics to the constructor of 'Hono'. This is a common pattern in Hono framework usage and is a best practice for ensuring type safety and reusability of middleware.

*Source: docs/api/context.md*

### Using Middleware and Environment Variables in Hono

In Hono, you can use the 'use' method to add middleware to your application. Middleware are functions that have access to the request object, the response object, and the next function in the application’s request-response cycle. The next function is a function in the Hono stack that, when invoked, executes the middleware succeeding the current middleware.

You can also define a GET request handler using the 'get' method. The handler takes a callback function which receives a context object 'c'. This object contains the request and response objects, among other things.

Environment variables can be accessed in Hono using 'c.var'.

Here is an example:

```javascript
const app = new Hono<Env>()

app.use(echoMiddleware)

app.get('/echo', (c) => {
  return c.text(c.var.echo('Hello!'))
})
```

In this code, 'echoMiddleware' is a middleware function that is added to the application. The '/echo' endpoint returns the result of the 'echo' function defined in the environment variables with 'Hello!' as the argument.

**Reasoning:** This rule is important as it demonstrates how to use the Hono framework to create a simple server with a custom middleware and an endpoint. It shows how to use the 'use' method to add middleware to the application and the 'get' method to define a GET request handler. The rule also demonstrates how to access environment variables in Hono using 'c.var'.

*Source: docs/api/context.md*

### Creating Custom HTML Layouts in Hono

The following code snippet demonstrates how to use the `setRenderer` and `render` methods in Hono to create a custom HTML layout for responses.

```javascript
app.use(async (c, next) => {
  c.setRenderer((content) => {
    return c.html(
      <html>
        <body>
          <p>{content}</p>
        </body>
      </html>
    )
  })
  await next()
})
javascript
app.get('/', (c) => {
  return c.render('Hello!')
})
html
<html>
  <body>
    <p>Hello!</p>
  </body>
</html>
```

The `setRenderer` method is used to define a custom renderer for responses. This renderer is a function that takes a content parameter and returns an HTML string. The `render` method is then used to create responses using this custom layout.

- The `setRenderer` method should be called in a middleware function to ensure that it is set before any routes are processed.
- The `render` method should be used in route handlers to create responses using the custom layout.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Creating custom HTML layouts for responses in a web application.

#### Code Snippet

```typescript

Then, you can utilize `c.render()` to create responses within this layout.

```

**Reasoning:** This rule is important as it demonstrates how to use the `setRenderer` and `render` methods in Hono to create a custom HTML layout for responses. This is a common use case when building web applications with Hono, as it allows developers to easily customize the structure and appearance of their responses.

*Source: docs/api/context.md*

### Creating Responses with `c.render()` and Ensuring Type Safety in Hono

In Hono, you can use the `c.render()` function to create responses within a layout. Here is an example:

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => {
  return c.render('Hello!')
})
html
<html>
  <body>
    <p>Hello!</p>
  </body>
</html>
ts
declare m
```

The `c.render()` function takes a string argument and wraps it in a basic HTML layout. This is useful for creating dynamic responses in your Hono application.

- The `c.render()` function only supports string arguments.
- To ensure type safety, you can define types using the `declare` keyword.

- [Hono Documentation](https://hono.bespokejs.com)

- Creating dynamic responses in a Hono application.
- Ensuring type safety by defining types.

#### Code Snippet

```typescript

The output of this code will be:

```

**Reasoning:** This rule is important as it demonstrates how to use the `c.render()` function in Hono to create responses within a layout. It also shows how to ensure type safety by defining types. This is a fundamental aspect of building applications with the Hono framework, as it allows developers to create dynamic responses and maintain type safety.

*Source: docs/api/context.md*

### Defining Routes and Rendering Responses in Hono with Type Safety

This code snippet demonstrates how to define a route in Hono and render a response. It also shows how to ensure type safety by defining types for the arguments in the ContextRenderer interface.

```javascript
const app = new Hono()
app.get('/', (c) => {
  return c.render('Hello!')
})
typescript
declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      head: { title: string }
    ): Response | Promise<Response>
  }
}
```

This ensures that the 'content' argument can be a string or a Promise that resolves to a string, and the 'head' argument is an object with a 'title' property of type string. The function can return a Response object or a Promise that resolves to a Response object.

- The 'render' method of the context object is used to send a response to the client.
- Type definitions help in maintaining the integrity of the code and avoiding potential runtime errors.

- [Hono Documentation](https://hono.bike/)

- Defining routes and rendering responses in a Hono application.
- Ensuring type safety in a TypeScript project.

#### Code Snippet

```typescript

In the above code, a new Hono application is created and a GET route for the root URL ('/') is defined. The callback function takes a context object 'c' and uses its 'render' method to send a response.

To ensure type safety, types can be defined for the arguments in the ContextRenderer interface as shown below:

```

**Reasoning:** This rule is important as it demonstrates how to define a route in Hono and render a response. It also shows how to ensure type safety by defining types for the arguments in the ContextRenderer interface. This is crucial in maintaining the integrity of the code and avoiding potential runtime errors.

*Source: docs/api/context.md*

### Defining and Using a Custom Context Renderer in Hono

In Hono, you can define a custom context renderer to render the response of a route handler in a custom way. This is useful when you want to modify the response of a route handler without changing the handler itself.

Here is how you can define a custom context renderer:

```ts
declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      head: { title: string }
    ): Response | Promise<Response>
  }
}
ts
app.use('/pages/*', async (c, next) => {
  c.setRenderer((content, head) => {
    return c.html(
      <html>
        <head>
          <title>{head.title}</title>
        </head>
        <body>
```

The `setRenderer` method sets the context renderer for the current route handler. The context renderer is a function that takes the content and head as arguments and returns a response.

- The context renderer is only used for the current route handler. If you want to use it for all route handlers, you need to set it in a middleware.

- [Hono documentation](https://hono.bouzuya.net/)

- Customizing the response of a route handler
- Adding common headers or footers to the response

#### Code Snippet

```typescript

And here is how you can use it in a route handler:

```

**Reasoning:** This rule is important as it demonstrates how to define and use a custom context renderer in Hono. Context renderers are used to render the response of a route handler in a custom way. This is useful when you want to modify the response of a route handler without changing the handler itself.

*Source: docs/api/context.md*

### Rendering HTML Content with a Title in Hono

This code snippet demonstrates how to use the 'render' method in Hono to return HTML content with a specific title. This is a common use case when building web applications with Hono, as it allows developers to dynamically generate and serve HTML content.

```javascript
app.get('/pages/my-favorite', (c) => {
  return c.render(<p>Ramen and Sushi</p>, {
    title: 'My favorite',
  })
})

app.get('/pages/my-hobbies', (c) => {
  return c.render(<p>Watching baseball</p>, {
    title: 'My hobbies',
  })
})
```

In this example, two routes are defined: '/pages/my-favorite' and '/pages/my-hobbies'. When these routes are accessed, the 'render' method is called with two arguments: the HTML content to be displayed and an object with a 'title' property. The 'title' property is used to set the title of the HTML page.

It's important to note that the 'render' method expects the HTML content to be a valid JSX element. This means that you need to have a JSX transpiler (like Babel) in your project.

Common use cases for this pattern include serving dynamic HTML content based on user input or server-side data.

**Reasoning:** This rule is important as it demonstrates how to use the 'render' method in Hono to return HTML content with a specific title. This is a common use case when building web applications with Hono, as it allows developers to dynamically generate and serve HTML content.

*Source: docs/api/context.md*

### Using Bindings in Hono

In Hono, bindings are a way to access environment variables, secrets, KV namespaces, databases, and buckets that are bound to a worker. Regardless of type, bindings are always available as global variables and can be accessed via the context `c.env.BINDING_KEY`.

Here is an example of how to use bindings in Hono:

```ts
import { Hono } from 'hono'
type KVNamespace = any

// Type definition to make type inference
type Bindings = {
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// FetchEvent object (only set when using Service Worker syntax)
app.get('/foo', async (c) => {
  c.event.waitUntil(c.env.MY_KV.put(key, data))
  // ...
})
```

In this code snippet, `MY_KV` is a binding of type `KVNamespace`. It is accessed via `c.env.MY_KV` in the handler for the GET request to '/foo'.

This pattern is important for managing and accessing resources in a Cloudflare Workers environment.

**Reasoning:** This rule is important as it demonstrates how to use bindings in Hono. Bindings are a way to access environment variables, secrets, KV namespaces, databases, and buckets that are bound to a worker. This is crucial for managing and accessing resources in a Cloudflare Workers environment.

*Source: docs/api/context.md*

### Error Handling in Hono Middleware

In Hono, if a handler throws an error, the error object is placed in `c.error`. This can be accessed in your middleware for error handling and debugging.

Here is a code snippet demonstrating this:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.use(async (c, next) => {
  await next()
  if (c.error) {
    // do something...
  }
})
```

1. Import the Hono framework and initialize a new Hono application.
2. Use the `app.use` method to add a middleware to the application.
3. In the middleware, call `await next()` to wait for the next middleware or route handler to finish.
4. If there is an error in the handler, it will be placed in `c.error`. You can then handle the error as needed.

- Always check for `c.error` in your middleware to handle any errors that may occur in your handlers.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Error logging: You can log the error to a logging service or to the console for debugging purposes.
- Error response: You can send a response to the client with an error message and status code.

**Reasoning:** This rule is important as it demonstrates how to handle errors in Hono middleware. It shows that if a handler throws an error, the error object is placed in `c.error` and can be accessed in your middleware. This is crucial for error handling and debugging in your Hono application.

*Source: docs/api/context.md*

### Using Middleware and Extending ContextVariableMap in Hono

This code demonstrates how to use middleware in Hono and how to extend the `ContextVariableMap` to add type definitions to variables when a specific middleware is used.

```ts
import { Hono } from 'hono'
const app = new Hono()
app.use(async (c, next) => {
  await next()
  if (c.error) {
    // do something...
  }
})
ts
declare module 'hono' {
  interface ContextVariableMap {
    result: string
  }
}
ts
import { createMiddleware } from 'hono/factory'
```

In the first snippet, a middleware is created that waits for the next middleware to finish before checking if there was an error. If there was an error, it performs a certain action.

In the second snippet, the `ContextVariableMap` is extended to include a new variable `result` of type string. This allows you to add type definitions to variables when a specific middleware is used.

- Middleware in Hono is used to handle requests and responses. It's a way to add functionality to your application.
- Extending `ContextVariableMap` allows you to ensure type safety within your middleware.

- [Hono Documentation](https://hono.bike/docs)

- Error handling in middleware
- Adding type definitions to variables in middleware

#### Code Snippet

```typescript

To extend `ContextVariableMap`, you can do the following:

```

**Reasoning:** This rule is important as it demonstrates how to use middleware in Hono and how to extend the ContextVariableMap to add type definitions to variables when a specific middleware is used. This is crucial for enhancing the functionality of your application and for ensuring type safety within your middleware.

*Source: docs/api/context.md*

### Extending ContextVariableMap and Using Custom Variables in Middleware

This code demonstrates how to extend the 'ContextVariableMap' interface in Hono to add custom variables, and how to use these custom variables in middleware.

```ts
declare module 'hono' {
  interface ContextVariableMap {
    result: string
  }
}
ts twoslash
import { createMiddleware } from 'hono/factory'
// ---cut---
const mw = createMiddleware(async (c, next) => {
  c.set('result', 'some values') // result is a string
  await next()
})
```

1. The 'ContextVariableMap' interface is extended to include a new variable 'result'.
2. This new variable is then used in a middleware function created using 'createMiddleware'.

- The new variable can be of any type, not just string.

- Hono documentation: [Extending ContextVariableMap](https://hono.bryntum.com/docs/classes/contextvariablemap.html)

- Adding custom data to the context that can be used across multiple middleware functions.

#### Code Snippet

```typescript

You can then utilize this in your middleware:

```

**Reasoning:** This rule is important as it demonstrates how to extend the 'ContextVariableMap' interface in Hono to add custom variables, and how to use these custom variables in middleware. This is a common pattern in Hono and allows for greater flexibility and customization in middleware functions.

*Source: docs/api/context.md*

### Setting and Retrieving Variables in Hono Middleware

This code demonstrates how to use middleware in Hono to set and retrieve variables. It also shows how Hono's type inference works when setting and retrieving variables in the context object.

```ts
import { createMiddleware } from 'hono/factory'

const mw = createMiddleware(async (c, next) => {
  c.set('result', 'some values')
  await next()
})
ts
import { Hono } from 'hono'

const app = new Hono<{ Variables: { result: string } }>()

app.get('/', (c) => {
  const val = c.get('result')
  return
})
```

The `createMiddleware` function is used to create a middleware that sets a variable in the context object. The `c.set` function is used to set the variable. The `next` function is called to pass control to the next middleware.

In the handler, the `c.get` function is used to retrieve the variable. The type of the variable is inferred from the type of the `Variables` property in the `Hono` instance.

- The `c.set` and `c.get` functions are used to set and retrieve variables in the context object.
- The type of the variable is inferred from the type of the `Variables` property in the `Hono` instance.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Storing and retrieving data in middleware that needs to be accessed in handlers.

#### Code Snippet

```typescript

In a handler, the variable is inferred as the proper type:

```

**Reasoning:** This rule is important as it demonstrates how to use middleware in Hono to set and retrieve variables. It shows how Hono's type inference works when setting and retrieving variables in the context object, ensuring type safety.

*Source: docs/api/context.md*

### Handling Authentication and Throwing Custom HTTP Exceptions in Hono

This code snippet demonstrates how to handle authentication and throw custom HTTP exceptions in Hono.

```javascript
app.post('/auth', async (c, next) => {
  // authentication
  if (authorized === false) {
    throw new HTTPException(401, { message: 'Custom error message' })
  }
  await next()
})
```

In this code:

1. An asynchronous function is defined for the '/auth' route.
2. If the user is not authorized, an HTTPException is thrown with a status code of 401 and a custom error message.
3. If the user is authorized, the next middleware function in the stack is called.

- The HTTPException class is part of the 'hono/http-exception' module.
- The status code and error message can be customized to fit the specific needs of your application.

- [Hono Documentation](https://hono.bike/docs/)

- This pattern is commonly used in routes that require authentication.

**Reasoning:** This rule is important as it demonstrates how to handle authentication and throw custom HTTP exceptions in Hono. It shows how to use the HTTPException class to throw an error with a custom message and status code when authentication fails. This is a common pattern in web development to provide meaningful error messages to the client.

*Source: docs/api/exception.md*

### Handling HTTP Exceptions in Hono

In Hono, you can handle the thrown HTTPException with `app.onError`.

```ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
import { HTTPException } from 'hono/http-exception'

// ...

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // handle the exception
  }
})
```

The `app.onError` method is used to register a function that will be called whenever an error is thrown in your application. This function takes two arguments: the error that was thrown and the current context.

In this case, we're checking if the error is an instance of `HTTPException`. If it is, we can handle it in a specific way.

- Make sure to import the `HTTPException` class from 'hono/http-exception'.
- The `app.onError` method should be called after all your routes and middleware have been registered.

- [Hono documentation](https://hono.bayfront.cloud/)

- Returning a custom error response to the user.
- Logging the error for debugging purposes.

**Reasoning:** This rule is important as it demonstrates how to handle HTTP exceptions in the Hono framework. Proper exception handling is crucial in any application to ensure that it can recover gracefully from errors and provide useful feedback to the user.

*Source: docs/api/exception.md*

### Extracting Parameters from Request URL in Hono

In Hono, you can extract parameters from the request URL using the `param()` method. This is useful when dealing with dynamic routes where the URL parameters can change based on the request.

Here's a code snippet demonstrating this:

```ts
import { Hono } from 'hono'
const app = new Hono()

// Extracting a single parameter
app.get('/entry/:id', async (c) => {
  const id = c.req.param('id')
})

// Extracting multiple parameters at once
app.get('/entry/:id/comment/:commentId', async (c) => {
  const { id, commentId } = c.req.param()
})
```

In the first route, we're extracting a single parameter 'id' from the request URL. In the second route, we're extracting multiple parameters 'id' and 'commentId' at once using destructuring.

- The `param()` method returns the value of the named route parameter.
- When called without any arguments, it returns an object containing all the route parameters.

- [Hono Documentation](https://hono.boutell.com/)

- Retrieving blog post based on post ID
- Fetching user profile based on user ID

**Reasoning:** This rule is important as it demonstrates how to extract parameters from the request URL in Hono. Understanding this rule is crucial for handling dynamic routes where the URL parameters can change based on the request.

*Source: docs/api/request.md*

### Handling Multiple Query Parameters in Hono

In Hono, you can handle multiple query parameters using the `queries()` method. This method returns an array of values for a given query parameter. Here's how you can use it:

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/search', async (c) => {
  // tags will be string[]
  const tags = c.req.queries('tags')
  // ...
})
```

In the above code, `tags` will be an array of strings containing the values of the 'tags' query parameter.

- The `queries()` method returns an array of strings. If the query parameter is not present in the request, it returns an empty array.

- [Hono Documentation](https://hono.bevry.me/)

- Filtering results based on multiple tags in a search API endpoint.

**Reasoning:** This rule is important as it demonstrates how to handle multiple query parameters in Hono. It shows how to extract multiple query parameters from a request using the queries() method. This is crucial in building APIs where endpoints often need to handle multiple query parameters.

*Source: docs/api/request.md*

### Extracting Query Parameters in Hono

This code snippet demonstrates how to extract query parameters from a request in Hono.

```ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/search', async (c) => {
  // tags will be string[]
  const tags = c.req.queries('tags')
  // ...
})
```

In this example, the `queries` method is used to retrieve the 'tags' query parameter from the request. The returned value will be an array of strings.

The `queries` method is a part of the request (`req`) object in Hono. It is used to retrieve the value of a specified query parameter. The parameter name is passed as an argument to the `queries` method.

- The `queries` method returns an array of strings. If the query parameter is not present in the request, it will return an empty array.

- [Hono Documentation](https://hono.bike/docs/)

- Filtering data based on query parameters
- Manipulating data based on query parameters

**Reasoning:** This rule is important as it demonstrates how to extract query parameters from a request in Hono. Understanding how to retrieve query parameters is crucial for handling client requests and manipulating data based on these parameters.

*Source: docs/api/request.md*

### Retrieving Header Values in Hono

In Hono, when you call the `header()` method with no arguments, all keys in the returned record are lowercase. Therefore, if you want to get the value of a header with an uppercase name, you need to call the `header()` method with the specific header name as an argument.

Here is an example of how to do it correctly:

```ts
// ✅ Will work
const foo = c.req.header('X-Foo')
ts
// ❌ Will not work
const headerRecord = c.req.header()
const foo = headerRecord['X-Foo']
```

- Always remember to use the specific header name as an argument when calling the `header()` method if the header name contains uppercase letters.

- Hono Documentation

- Retrieving specific header values from a request in Hono.

#### Code Snippet

```typescript

And here is an example of what will not work:

```

**Reasoning:** This rule is important because it demonstrates how to correctly retrieve header values from a request in Hono. It shows that when calling the header() method with no arguments, all keys in the returned record are lowercase. Therefore, to get the value of a header with an uppercase name, it is necessary to call the header() method with the specific header name as an argument.

*Source: docs/api/request.md*

### Accessing Headers and Parsing Request Bodies in Hono

In Hono, headers should be accessed directly using the header name as a parameter in the `c.req.header()` function. Trying to access it as a property of the returned object will not work.

```ts
// ❌ Will not work
const headerRecord = c.req.header()
const foo = headerRecord['X-Foo']

// ✅ Will work
const foo = c.req.header('X-Foo')
ts
c.req.parseBody()
```

This function supports the following types of request bodies: `multipart/form-data` and `application/x-www-form-urlencoded`.

- Always use the header name as a parameter when accessing headers.
- Use `parseBody()` to parse request bodies of the supported types.

- Hono Documentation

- Accessing request headers
- Parsing request bodies

#### Code Snippet

```typescript

To parse request bodies of type `multipart/form-data` or `application/x-www-form-urlencoded`, use the `parseBody()` function.

```

**Reasoning:** This rule is important as it demonstrates the correct way to access headers and parse request bodies in Hono. It shows that headers should be accessed directly using the header name as a parameter in the `c.req.header()` function, rather than trying to access it as a property of the returned object. It also shows how to parse request bodies of type `multipart/form-data` or `application/x-www-form-urlencoded` using the `parseBody()` function.

*Source: docs/api/request.md*

### Handling POST Requests with `parseBody()` in Hono

In Hono, you can use the `parseBody()` function to parse the body of a POST request. This function supports various behaviors, including handling single file uploads.

Here's an example of how to use it:

```ts
import { Hono } from 'hono'
const app = new Hono()
app.post('/entry', async (c) => {
  const body = await c.req.parseBody()
  // ...
})
ts
import { Context } from 'hono'
declare const c: Context
const body = await c.req.parseBody()
const data = body['foo']
```

In this case, `body['foo']` will be of type `(string | File)`, depending on whether the uploaded file was a string or a file.

- `parseBody()` is an asynchronous function, so you need to use `await` when calling it.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Parsing the body of a POST request to handle form submissions or file uploads.

#### Code Snippet

```typescript

In this code snippet, `parseBody()` is used to parse the body of the request. The parsed body is then stored in the `body` variable.

You can access the parsed data like this:

```

**Reasoning:** This rule is important because it demonstrates how to use the `parseBody()` function in Hono to handle POST requests. This is a common task in web development, and understanding how to do it properly in Hono is crucial for building robust applications.

*Source: docs/api/request.md*

### Handling Multiple File Uploads in Hono

This code snippet demonstrates how to handle multiple file uploads in Hono.

```ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody()
body['foo[]']
ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody({ all: true })
body['foo']
```

The 'all' option is disabled by default. When enabled, it allows for handling multiple files with the same name.

- The '[]' postfix is required for handling multiple files.
- The 'all' option is disabled by default and needs to be enabled for handling multiple files with the same name.

- Hono Documentation

- Uploading multiple files in a single request
- Handling files with the same name in a single request

#### Code Snippet

```typescript

In this example, `body['foo[]']` is always `(string | File)[]`. The '[]' postfix is required when dealing with multiple files.

For handling multiple files with the same name, the 'all' option is used.

```

**Reasoning:** This rule is important as it demonstrates how to handle multiple file uploads in Hono. It shows how to parse the request body to access the uploaded files and the importance of using the '[]' postfix for multiple files and the 'all' option for files with the same name.

*Source: docs/api/request.md*

### Handling Multiple Files and Structuring Return Values in Hono

This code demonstrates how to handle multiple files with the same name and how to structure the return value based on the dot notation in Hono.

```ts
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody({ all: true })
body['foo']
ts
data.append('obj.key1', 'value1')
data.append('obj.key2', 'value2')
```

You can get the structured value by setting the `dot` option `true`.

- The `all` option allows you to parse all files, not just the first one with a specific name.
- The `dot` option allows you to structure the return value based on the dot notation, which can be useful for handling complex data structures.

- [Hono Documentation](https://hono.bike/)

- Parsing form data with multiple files of the same name.
- Structuring return values based on the dot notation for complex data structures.

#### Code Snippet

```typescript

By default, the `all` option is disabled. If `body['foo']` is multiple files, it will be parsed to `(string | File)[]`. If `body['foo']` is a single file, it will be parsed to `(string | File)`.

If you set the `dot` option `true`, the return value is structured based on the dot notation. For example, if you receive the following data:

```

**Reasoning:** This rule is important as it demonstrates how to handle multiple files with the same name and how to structure the return value based on the dot notation in Hono. Understanding these features allows developers to effectively parse and structure data in their applications.

*Source: docs/api/request.md*

### Parsing Structured FormData in Hono

This code snippet demonstrates how to parse structured data from a FormData object in Hono.

```ts twoslash
const data = new FormData()
data.append('obj.key1', 'value1')
data.append('obj.key2', 'value2')
ts twoslash
import { Context } from 'hono'
declare const c: Context
// ---cut---
const body = await c.req.parseBody({ dot: true })
// body is `{ obj: { key1: 'value1', key2: 'value2' } }`
```

The `parseBody` method of the `req` object in Hono's Context is used to parse the FormData. By setting the `dot` option to true, the keys in the FormData object that are structured based on the dot notation are parsed into a nested object.

- The 'dot' option should be set to true if you want to parse structured data from FormData.

- Hono Documentation

- Parsing structured data from FormData in web applications.

#### Code Snippet

```typescript

You can get the structured value by setting the `dot` option `true`:

```

**Reasoning:** This rule is important because it demonstrates how to parse structured data from a FormData object in Hono. By setting the 'dot' option to true, the structured data can be extracted in a nested object format, which can be easier to work with in many scenarios.

*Source: docs/api/request.md*

### Parsing Request Body in Hono

This code snippet demonstrates how to parse the request body in Hono. This is commonly done when handling POST requests, where the body often contains the data that the client wants to send to the server.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.json()
  // ...
})
```

In this example, the `json()` method is used to parse the body as JSON. This is a common data format for APIs.

The `json()` method is called on the `req` object, which represents the request. This method returns a promise that resolves with the parsed body.

- The `json()` method can only parse JSON-formatted data. If the data is not in this format, an error will be thrown.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Parsing the body of a POST request to get the data sent by the client.

**Reasoning:** This rule is important as it demonstrates how to parse the request body in Hono. Parsing the request body is a common task in web development, especially when dealing with POST requests. The rule shows how to parse the body as JSON, which is a common data format for APIs.

*Source: docs/api/request.md*

### Parsing Request Bodies in Hono

This rule demonstrates how to parse different types of request bodies in Hono. The code snippets show how to parse JSON, text, and arrayBuffer types of request bodies.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.json()
  // ...
})
ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.text()
  // ...
})
```

In each of the code snippets, a POST request is being made to the '/entry' endpoint. The request body is then parsed using the appropriate method depending on the content type of the request body.

It's crucial to use the correct parsing method for the content type of the request body. Using the wrong method could lead to errors or incorrect data processing.

- Hono Documentation: [Request Parsing](https://hono.bike/docs/request-parsing/)

Parsing request bodies is a common task in server-side programming. It's typically done when a client sends data to the server via a POST or PUT request.

#### Code Snippet

```typescript

#### Text

```

**Reasoning:** This rule is important as it demonstrates how to parse different types of request bodies in Hono. It shows how to parse JSON, text, and arrayBuffer types of request bodies. Understanding how to correctly parse request bodies is crucial for handling client requests and processing data in server-side applications.

*Source: docs/api/request.md*

### Parsing Request Body as ArrayBuffer in Hono

This code snippet demonstrates how to parse the request body as an `ArrayBuffer` in Hono.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.post('/entry', async (c) => {
  const body = await c.req.arrayBuffer()
  // ...
})
```

In the given code, `app.post` is used to handle POST requests to the '/entry' endpoint. Inside the callback function, `c.req.arrayBuffer()` is used to parse the request body as an `ArrayBuffer`.

- The `arrayBuffer()` method returns a promise that resolves with an `ArrayBuffer` representing the request's body.
- This method is useful when you need to handle binary data.

- [Hono Documentation](https://hono.bryntum.com/docs/)

- Receiving binary data like images or files from the client.

**Reasoning:** This rule is important as it demonstrates how to parse the request body as an `ArrayBuffer` in Hono. Understanding how to correctly parse the request body is crucial for handling client requests and processing data in the server.

*Source: docs/api/request.md*

### Handling and Validating Incoming Data in Hono

In Hono, you can handle and validate incoming data from different sources using the 'valid' method. This method takes a string argument that specifies the source of the data.

Here is a code snippet that demonstrates this:

```ts
c.app.post('/posts', async (c) => {
  const { title, body } = c.req.valid('form')
  // ...
})
```

In this example, the 'valid' method is used to validate data coming from a form. The validated data is then destructured into 'title' and 'body'.

The 'valid' method can handle data from the following sources:

- `form`
- `json`
- `query`
- `header`
- `cookie`
- `param`

It's important to validate incoming data to ensure that it is as expected and to prevent potential issues related to data integrity and security.

References:

- Hono documentation: [link]

Common use cases:

- Validating form data before processing it
- Checking the validity of incoming JSON data
- Ensuring that query parameters meet certain criteria

**Reasoning:** This rule is important as it demonstrates how to handle and validate different types of incoming data in Hono. It shows how to use the 'valid' method to validate incoming data from different sources such as form, json, query, header, cookie, and param. This is crucial in ensuring that the data being processed by the application is as expected and helps prevent potential issues related to data integrity and security.

*Source: docs/api/request.md*

### Using 'valid' and 'routePath' methods in Hono

This code demonstrates how to use the 'valid' method to get validated data from different targets and the 'routePath' method to retrieve the registered path within the handler.

```ts
app.post('/posts', async (c) => {
  const { title, body } = c.req.valid('form')
  // ...
})
ts
app.get('/posts/:id', (c) => {
  return c.json({ path: c.req.routePath })
})
```

The 'valid' method is used to get validated data from the specified target. The available targets are form, json, query, header, cookie, and param.

The 'routePath' method is used to retrieve the registered path within the handler.

- Make sure to use the correct target with the 'valid' method.
- The 'routePath' method returns the path as registered in the app, not the actual URL.

- [Validation section](/docs/guides/validation)

- Use the 'valid' method to get validated data when handling form submissions or API requests.
- Use the 'routePath' method to get the registered path for logging or debugging purposes.

**Reasoning:** This rule is important as it demonstrates how to use the 'valid' method and 'routePath' method in Hono. The 'valid' method is used to get validated data from different targets such as form, json, query, header, cookie, and param. The 'routePath' method is used to retrieve the registered path within the handler.

*Source: docs/api/request.md*

### Defining and Accessing Route Parameters in Hono

In Hono, you can define a route with a parameter by using a colon (`:`) followed by the parameter name in the route string. You can then access this parameter within the route handler using the `req.routePath` property.

Here is an example:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:id', (c) => {
  return c.json({ path: c.req.routePath })
})
json
{ "path": "/posts/:id" }
```

When you define a route with a parameter in Hono, the framework automatically extracts the parameter from the incoming request URL and makes it available within the route handler through the `req.routePath` property.

- Route parameters are a powerful feature that allows you to create dynamic routes. However, they should be used judiciously to avoid creating overly complex routes that are difficult to maintain.

- [Hono Documentation](https://hono.beyondco.de/docs/routing)

- Creating a blog post detail page where the post ID is dynamic.
- Building a user profile page where the user ID is dynamic.

#### Code Snippet

```typescript

If you access `/posts/123`, it will return `/posts/:id`:

```

**Reasoning:** This rule is important as it demonstrates how to define a route with a parameter in Hono and how to access that parameter within the route handler. It also shows how to return the registered path within the handler. This is a fundamental concept in building web applications with Hono, as it allows developers to create dynamic routes that can handle a variety of requests.

*Source: docs/api/request.md*

### Handling Route Parameters in Hono

In Hono, you can define routes with parameters and access these parameters in the route handler. Here is an example:

```javascript
const app = new Hono()
app.get('/posts/:id', (c) => {
  return c.json({ path: c.req.routePath })
})
json
{ "path": "/posts/:id" }
```

This is useful when you want to handle requests to different URLs in a similar way, but the exact URL is not known in advance. For example, you might want to display a specific post based on its ID, and the ID is part of the URL.

- The route parameters are accessible through the `c.req.routePath` object.
- The route parameters are always strings.

- [Hono Documentation](https://hono.bevry.me/)

- Retrieving a specific resource based on its ID from the URL.
- Handling requests to different URLs in a similar way.

#### Code Snippet

```typescript

In this example, `:id` is a route parameter. When you access `/posts/123`, it will return `/posts/:id`:

```

**Reasoning:** This rule is important as it demonstrates how to handle route parameters in Hono. It shows how to define a route with a parameter and how to access this parameter in the route handler. This is a common requirement in many web applications where the URL contains some dynamic part.

*Source: docs/api/request.md*

### Accessing the Request Pathname in Hono

This code demonstrates how to access the request pathname in Hono.

```ts
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const pathname = c.req.path // `/about/me`
  // ...
})
```

In this snippet, a GET request handler is set up for the path '/about/me'. Inside the handler, the request pathname is accessed using `c.req.path`. This will return the path of the request, in this case, '/about/me'.

- The request object (`c.req`) contains information about the HTTP request that triggered the event. It includes properties such as `path` (the request pathname), `method` (the HTTP method), and `headers` (the HTTP headers).

- [Hono Documentation](https://hono.bj/hono)

- Use the request pathname to handle different routes in your application.
- Use the request pathname to perform different actions based on the specific route.

**Reasoning:** This rule is important as it demonstrates how to access the request pathname in Hono. Understanding how to retrieve the request pathname is crucial for routing and handling requests in a web application.

*Source: docs/api/request.md*

### Accessing Request Pathname and URL in Hono

This code demonstrates how to access the request pathname and URL in the Hono web framework.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const pathname = c.req.path // `/about/me`
  // ...
})
ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const url = c.req.url // `http://localhost:8787/about/me`
  // ...
})
```

In these snippets, `c.req.path` and `c.req.url` are used to access the request pathname and URL respectively. The `c` object is the context object passed to the route handler, which contains the request (`req`) and response (`res`) objects among other things.

- The request pathname does not include the protocol or domain.
- The request URL includes the protocol and domain.

- [Hono Documentation](https://hono.bike/)

- Checking the request pathname or URL to perform specific actions based on the route.
- Logging the request pathname or URL for debugging or analytics purposes.

**Reasoning:** This rule is important as it demonstrates how to access the request pathname and URL in the Hono web framework. Understanding how to retrieve these values is crucial for handling requests and routing in web applications.

*Source: docs/api/request.md*

### Handling HTTP GET Requests in Hono

This code snippet demonstrates how to handle HTTP GET requests in the Hono framework. It shows how to extract the URL and the method of the request.

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/about/me', async (c) => {
  const url = c.req.url // `http://localhost:8787/about/me`
  // ...
})
```

In the above code, `app.get` is used to handle GET requests to the '/about/me' endpoint. The callback function takes a context object `c` as an argument, which contains the request and response objects. The URL of the request can be accessed with `c.req.url`, and the method of the request with `c.req.method`.

- The context object `c` contains other useful properties and methods for handling the request and response.

- [Hono Documentation](https://hono.bike/)

- Retrieving the URL or method of the request is useful in many situations, such as logging, routing, or conditional processing based on the request details.

**Reasoning:** This rule is important as it demonstrates how to handle HTTP GET requests in the Hono framework. It shows how to extract the URL and the method of the request, which are fundamental aspects of handling HTTP requests in any web framework.

*Source: docs/api/request.md*

### Accessing Request Method and Raw Request in Hono

The following code snippets demonstrate how to access the method name of the request and the raw request object in Hono.

To access the method name of the request:

```ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/about/me', async (c) => {
  const method = c.req.method // `GET`
  // ...
})
ts
// For Cloudflare Workers
app.post('/', async (c) => {
  const metadata = c.req.raw.cf?.hostMetadata?
  // ...
})
```

In the first snippet, `c.req.method` is used to access the method name of the request. In the second snippet, `c.req.raw` is used to access the raw request object.

These properties can be useful for handling different types of HTTP requests and for accessing raw request data when necessary.

References:
- [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)

Common use cases:
- Checking the HTTP method of a request to perform different actions based on the method
- Accessing raw request data for advanced use cases

#### Code Snippet

```typescript

To access the raw request object:

```

**Reasoning:** This rule is important as it demonstrates how to access the method name of the request and the raw request object in Hono. Understanding how to access these properties is crucial for handling different types of HTTP requests and for accessing raw request data when necessary.

*Source: docs/api/request.md*

### Custom Error Handling in Hono

In Hono, the `app.onError` method is used to handle any errors that occur during the execution of the application. This method takes a callback function as an argument, which is called when an error occurs. The callback function receives the error object and a context object as arguments.

Here is a code snippet demonstrating this:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})
```

In this example, when an error occurs, the error message is logged to the console and a custom error message is returned with a status code of 500.

- The `app.onError` method should be used for error handling in Hono applications.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Customizing error responses in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to handle errors in the Hono framework. It shows how to use the `app.onError` method to handle any errors that occur during the execution of the application and return a customized response. This is crucial for robust error handling and providing meaningful feedback to the user.

*Source: docs/api/hono.md*

### Handling Errors and Adding Fetch Event Listener in Hono

This code demonstrates how to handle errors and add a fetch event listener in Hono framework.

```ts
import { Hono } from 'hono'
const app = new Hono()

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})
ts
app.fire()
ts
addEventListener('fetch', (event: FetchEventLike): void => {
  event.respondWith(this.dispatch(...))
})
```

This means that whenever a fetch event occurs, the application will automatically respond with the result of the `dispatch()` method.

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)

- Handling errors in a Hono application
- Adding a fetch event listener to a Hono application

#### Code Snippet

```typescript

In the above code, `app.onError()` is used to handle any errors that occur in the application. The error and the context are passed to the callback function, which logs the error and returns a custom error message with a status code of 500.

The `fire()` method is used to automatically add a global `fetch` event listener. This is useful in environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.

```

**Reasoning:** This rule is important as it demonstrates how to handle errors in Hono framework and how to use the `fire()` method to add a global `fetch` event listener. Understanding this rule is crucial for developers to ensure their applications can handle errors gracefully and respond to fetch events correctly.

*Source: docs/api/hono.md*

### Setting up the Entry Point in Hono

The `app.fetch` function is used to set up the entry point of your application in the Hono web framework. This is the first point of contact for incoming requests to your application.

Here is an example of how to set this up for Cloudflare Workers:

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
type Env = any
type ExecutionContext = any
// ---cut---
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
```

The `app.fetch` function is called when a request is made to your application. The `fetch` function takes in a `request` object, an `env` object representing the environment, and a `ctx` object representing the execution context.

- The `app.fetch` function is specific to the Hono web framework and may not be available in other frameworks.

- [Hono Documentation](https://hono.boutell.com/)

- Setting up the entry point for a new Hono application.
- Modifying the entry point for an existing Hono application.

**Reasoning:** This rule is important as it demonstrates how to set up the entry point of an application using the Hono web framework. The entry point is crucial as it is the first point of contact for incoming requests to the application. Understanding how to correctly set this up is key to ensuring the application functions as expected.

*Source: docs/api/hono.md*

### Exporting a Hono Instance

This guide demonstrates two different ways of exporting a Hono instance in a module.

```ts
import { Hono } from 'hono'
const app = new Hono()
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  },
}
ts
import { Hono } from 'hono'
const app = new Hono()
export default app
```

In this method, we are directly exporting the Hono instance. This method is more concise and is suitable when no additional logic is needed in the fetch function.

- Choose the method that best suits your needs. If you need to add additional logic in the fetch function, use the first method. If you don't need to add additional logic, use the second method for conciseness.

- [Hono Documentation](https://hono.readthedocs.io/en/latest/)

- When creating a module that uses Hono for fetching data.

#### Code Snippet

```typescript

In this method, we are explicitly defining a fetch function that calls the fetch function of the Hono instance. This method is more verbose and allows for additional logic to be added in the fetch function if needed.