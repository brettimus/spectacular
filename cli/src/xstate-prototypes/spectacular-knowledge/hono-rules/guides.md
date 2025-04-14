# Drizzle SQLite Rules

## Guides

### Avoid Creating 'Ruby on Rails-like Controllers' in Hono

In Hono, it is recommended to avoid creating 'Ruby on Rails-like Controllers'. This is because the path parameter cannot be inferred in the Controller without writing complex generics, which can make the code more complicated and harder to maintain.

Here is an example of what not to do:

```ts
// 🙁
// A RoR-like Controller
const booksList = (c: Context) => {
  return c.json('list books')
}

app.get('/books', booksList)
```

In this example, the `booksList` function is a 'Ruby on Rails-like Controller'. This is not recommended in Hono because the path parameter cannot be inferred in the Controller without writing complex generics.

- Avoid creating 'Ruby on Rails-like Controllers' in Hono.
- The path parameter cannot be inferred in the Controller without writing complex generics.

- [Hono Documentation](https://hono.bike/docs/guide)

- When defining routes and their corresponding handlers in a Hono application.

**Reasoning:** This rule is important as it emphasizes the best practice of avoiding the creation of 'Ruby on Rails-like Controllers' in Hono. This is because the path parameter cannot be inferred in the Controller without writing complex generics. This rule demonstrates the incorrect way of creating a controller in Hono.

*Source: docs/guides/best-practices.md*

### Avoid RoR-like Controllers in Hono

In Hono, it's recommended to write handlers directly after path definitions. This is because the path parameter cannot be inferred in the Controller without writing complex generics. Here's an example of what not to do:

```ts
// 🙁
// A RoR-like Controller
const bookPermalink = (c: Context) => {
  const id = c.req.param('id') // Can't infer the path param
  return c.json(`get ${id}`)
}
```

In this example, the `id` parameter cannot be inferred, leading to potential issues. Instead, write the handler directly after the path definition to avoid this issue.

- [Hono Documentation](https://hono.bike/docs)

This rule is commonly used when defining routes and handlers in a Hono application.

**Reasoning:** This rule is important as it demonstrates the best practice of writing handlers directly after path definitions in Hono. This is because the path parameter cannot be inferred in the Controller without writing complex generics, which can lead to unnecessary complexity and potential errors in the code.

*Source: docs/guides/best-practices.md*

### Defining Handlers Directly After Path Definitions in Hono

In Hono, it is recommended to define handlers directly after path definitions. This allows for better inference of path parameters, leading to cleaner and more efficient code.

Here is an example of how to do this:

```ts
app.get('/books/:id', (c) => {
  const id = c.req.param('id') // Can infer the path param
  return c.json(`get ${id}`)
})
```

In this example, the handler for the GET request to '/books/:id' is defined directly after the path definition. This allows the 'id' path parameter to be easily inferred and used within the handler.

Note: If you still want to create a RoR-like Controller, you can use `factory.createHandlers()` in `hono/factory`. However, this approach may not allow for as clean inference of path parameters.

**Reasoning:** This rule is important as it demonstrates the best practice for defining handlers directly after path definitions in Hono. This approach allows for better inference of path parameters, leading to cleaner and more efficient code.

*Source: docs/guides/best-practices.md*

### Creating RoR-like Controllers with Hono's factory.createHandlers()

This code demonstrates how to create a RoR-like Controller using Hono's factory.createHandlers() method and how to use middleware in the Hono framework.

```ts
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

// ...

const factory = createFactory()

const middleware = factory.createMiddleware(async (c, next) => {
  c.set('foo', 'bar')
  await next()
})

const handlers = factory.createHandlers(logger(), middleware, (c) => {
  return c.json(c.var.foo)
})

app.get('/api', ...handlers)
```

1. A factory is created using the createFactory() method from 'hono/factory'.
2. Middleware is created using the factory's createMiddleware() method. This middleware sets a variable 'foo' to 'bar' and then calls the next middleware in the stack.
3. Handlers are created using the factory's createHandlers() method. These handlers use the previously created logger and middleware, and return a JSON response containing the value of 'foo'.
4. The handlers are then used in an Express.js route.

- Using factory.createHandlers() ensures that type inference works correctly in TypeScript.

- Hono factory documentation: https://hono.bespokejs.com/docs/helpers/factory

- Creating RoR-like Controllers in Hono.
- Using middleware in Hono.

**Reasoning:** This rule is important as it demonstrates how to create a RoR-like Controller using Hono's factory.createHandlers() method. It also shows how to use middleware in the Hono framework. This pattern ensures that type inference works correctly, which is crucial for maintaining type safety in TypeScript.

*Source: docs/guides/best-practices.md*

### Organizing Endpoints into Separate Files in Hono

In Hono, it's a good practice to separate different endpoints into their own files. This helps in keeping the code organized and maintainable. For instance, if your application has `/authors` and `/books` endpoints, you can create `authors.ts` and `books.ts` files.

Here is an example of how to define basic CRUD operations in `authors.ts`:

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('list authors'))
app.post('/', (c) => c.json('create an author', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

In this code:

- We first import the Hono framework.
- We create a new Hono application.
- We define three routes: a GET route for listing authors, a POST route for creating an author, and another GET route for fetching a specific author by ID.
- Finally, we export the Hono application so it can be used in other parts of our code.

**Important notes:**

- Make sure to export the Hono application at the end of the file so it can be imported and used in other parts of your code.
- The `c.req.param('id')` in the `app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))` line is used to access route parameters.

**References:**

- [Hono Documentation](https://hono.bayfront.cloud/)

**Common use cases:**

- Structuring a large Hono application with multiple endpoints.
- Defining basic CRUD operations for a resource.

**Reasoning:** This rule is important as it demonstrates how to structure a Hono application by separating different endpoints into their own files. This is a common practice in web development to keep code organized and maintainable. It also shows how to define basic CRUD operations using Hono's routing methods.

*Source: docs/guides/best-practices.md*

### Defining and Importing Routes in Hono Framework

This code demonstrates how to define routes for different resources in separate files and then import them into a main file in the Hono framework.

```ts
// books.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('list books'))
app.post('/', (c) => c.json('create a book', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

In the above code, we define routes for the 'books' resource. We then export the 'app' instance so that it can be imported in other files.

This approach promotes modularity and separation of concerns, making the code easier to maintain and understand. It's a common practice in web development to separate routes based on the resources they handle.

- Each route handler is a function that takes a context object 'c' and returns a response using the 'json' method of the context object.
- The 'get' and 'post' methods of the 'app' instance are used to define GET and POST routes respectively.
- The ':id' in the path of the third route is a route parameter that can be accessed using 'c.req.param('id')'.

- [Hono Documentation](https://hono.bike/)

- Defining routes for different resources in a web application.
- Separating route definitions into different files for better code organization.

**Reasoning:** This rule is important as it demonstrates how to define routes for different resources in separate files and then import them into a main file in the Hono framework. This approach promotes modularity and separation of concerns, making the code easier to maintain and understand.

*Source: docs/guides/best-practices.md*

### Route Separation and Mounting in Hono

This code snippet demonstrates how to separate routes into different modules and then import and mount them on the main application in Hono.

```ts
// index.ts
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

// 😃
app.route('/authors', authors)
app.route('/books', books)

export default app
```

1. Import the Hono module and the route modules (authors and books in this case).
2. Create a new Hono application.
3. Use the `app.route()` method to mount the imported route modules on the desired paths.

- This pattern promotes code organization and modularity.
- It's a good practice to separate different parts of the application into different modules.

- [Hono Documentation](https://hono.bike/)

- Building a large scale application with Hono where routes need to be organized in a modular way.

**Reasoning:** This rule is important as it demonstrates how to structure a Hono application by separating routes into different modules and then importing and mounting them on the main application. This promotes code organization and modularity, making the code easier to maintain and understand.

*Source: docs/guides/best-practices.md*

### Using RPC Features in Hono

The code snippet demonstrates how to use the RPC feature in Hono by chaining methods to get the correct type and passing the type of the app to the hc function.

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
ts
import app from './authors'
import { hc } from 'hono/client'

// 😃
const client = hc<typeof app>('http://localhost')
```

The Hono framework allows you to chain methods to define routes and their handlers. When you want to use the RPC feature, you can get the correct type by chaining as shown in the code snippet. The type of the app is then passed to the hc function to get the correct type.

Ensure that you correctly chain the methods and pass the correct type to the hc function to avoid type errors and ensure correct functionality.

- Hono documentation: https://hono.bevry.me/

- When you want to use the RPC feature in Hono and need to ensure type safety.

#### Code Snippet

```typescript

To use the RPC feature, pass the type of the app to the hc function as follows:

```

**Reasoning:** This rule is important as it demonstrates how to correctly use the RPC feature in Hono. It shows how to chain methods to get the correct type and how to pass the type of the app to the hc function to get the correct type. This is crucial for ensuring type safety and correct functionality when using the RPC feature in Hono.

*Source: docs/guides/best-practices.md*

### Correctly Typing the Client in Hono Framework

In Hono framework, it's important to correctly type the client. This can be achieved by passing the type of the 'app' to 'hc'. Here is a code snippet demonstrating this:

```ts
import app from './authors'
import { hc } from 'hono/client'

// 😃
const client = hc<typeof app>('http://localhost') // Typed correctly
```

By doing this, the client gets the correct type, ensuring type safety and expected behavior.

The 'hc' function in Hono takes the type of the 'app' as an argument and returns a client of that type. This is how the client gets correctly typed.

- Always pass the type of the 'app' to 'hc' to correctly type the client.

- [Hono RPC page](/docs/guides/rpc#using-rpc-with-larger-applications)

- When you want to ensure type safety and expected behavior of the client in Hono framework.

**Reasoning:** This rule is important as it demonstrates how to correctly type the client in Hono framework. By passing the type of the 'app' to 'hc', the client gets the correct type. This is crucial for maintaining type safety and ensuring that the client behaves as expected.

*Source: docs/guides/best-practices.md*

### Sharing API Specification with the Client in Hono

In Hono, you can share the API specification with the client by exporting the type. This allows the client to import it and understand the structure of the API.

Here is a code snippet demonstrating this:

```ts
export type AppType = typeof route
ts
import type { AppType } from '.'
import { hc } from 'hono/client'
```

`hc` is a function in Hono that helps with handling client-side operations.

By doing this, you ensure that the client and server are communicating with the same API structure, reducing potential errors and misunderstandings.

#### Code Snippet

```typescript

On the client side, you can then import this type along with `hc` from Hono:

```

**Reasoning:** This rule is important as it demonstrates how to share the API specification with the client in Hono. By exporting the type, the client can import it and understand the structure of the API. This is crucial for ensuring that the client and server are communicating with the same API structure, reducing potential errors and misunderstandings.

*Source: docs/guides/rpc.md*

### Creating a Client in Hono

This guide demonstrates how to create a client in Hono.

First, import the necessary modules and types. In this case, we need `hc` from 'hono/client' and `AppType`.

```ts
import type { AppType } from '.'
import { hc } from 'hono/client'
ts
const client = hc<AppType>('http://localhost:3000')
```

The 'hc' function is used to create a client in Hono. It takes a type and a server URL as arguments. The type is used to ensure that the client and server are using the same API specification.

- Ensure that the server URL is correct. If the server is not running or the URL is incorrect, the client will not be able to communicate with the server.

- [Hono Documentation](https://hono.bike/docs/guide/)

- Setting up a client to communicate with a Hono server.

#### Code Snippet

```typescript

Then, use the 'hc' function to create a client. Pass `AppType` as Generics and specify the server URL as an argument.

```

**Reasoning:** This rule is important as it demonstrates how to create a client in Hono. It shows the process of importing the necessary modules and types, and then using the 'hc' function to create a client. This is a fundamental step in setting up communication between the client and the server in a Hono application.

*Source: docs/guides/rpc.md*

### Creating a Client and Making a POST Request in Hono

This guide demonstrates how to create a client using the Hono framework, specify the server URL, and make a POST request to the server.

Here is the code snippet:

```ts
const client = hc<AppType>('http://localhost:8787/')

const res = await client.posts.$post({
  form: {
    title: 'Hello',
    body: 'Hono is a cool project',
  },
})
```

In the above code:

1. `hc` is a function to create a client. `AppType` is passed as Generics and the server URL is specified as an argument.
2. `client.{path}.{method}` is called and the data to be sent to the server is passed as an argument. In this case, `client.posts.$post` is making a POST request to the 'posts' path.

The response (`res`) is compatible with the 'fetch' Response, and data can be retrieved from it.

- Ensure the server URL is correct when creating the client.
- The data to be sent to the server should be in the correct format.

- [Hono Documentation](https://hono.bike/docs/)

- Sending data to the server
- Making POST requests

**Reasoning:** This rule is important as it demonstrates how to create a client using the Hono framework, specify the server URL, and make a POST request to the server. Understanding this rule is crucial for developers to interact with the server and send data using the Hono framework.

*Source: docs/guides/rpc.md*

### Making a POST request and handling response in Hono

This guide demonstrates how to make a POST request using Hono and handle the response.

Here is the code snippet:

```ts
const res = await client.posts.$post({
  form: {
    title: 'Hello',
    body: 'Hono is a cool project',
  },
})

if (res.ok) {
  const data = await res.json()
  console.log(data.message)
}
```

1. We make a POST request to the 'posts' endpoint using the `$post` method. The data we wish to send to the server is passed as an argument.
2. The response (`res`) is compatible with the 'fetch' Response.
3. We check if the response is ok (status code in the range 200-299).
4. If the response is ok, we retrieve the data from the server using `res.json()`.

- Always check if the response is ok before trying to retrieve the data.

- [Hono documentation](https://hono.bayrell.org/en/)

- Sending data to the server and retrieving the response data.

**Reasoning:** This rule is important as it demonstrates how to make a POST request using Hono and how to handle the response. It shows how to send data to the server and retrieve the response data. Understanding this is crucial for any server-client communication in web development using the Hono framework.

*Source: docs/guides/rpc.md*

### Specifying Status Code in Hono

In Hono, you can explicitly specify the status code, such as `200` or `404`, in `c.json()`. This status code will be added as a type for passing to the client. This is useful in scenarios where you want to inform the client about the status of the processed request.

```text

If you explicitly specify the status code, such as `200` or `404`, in `c.json()`. It will be added as a type for passing to the client.
```

When you specify a status code in `c.json()`, Hono adds it as a type that can be passed to the client. This allows the client to understand the status of the processed request.

- Always ensure to specify the correct status code based on the result of the processed request.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Informing the client about the status of the processed request.

**Reasoning:** This rule is important as it demonstrates how to explicitly specify the status code in Hono framework. This is crucial for client-server communication as it allows the server to inform the client about the status of the processed request.

*Source: docs/guides/rpc.md*

### Handling Error Responses in Hono

This code snippet demonstrates how to handle error responses in Hono. It shows how to return different HTTP status codes and response bodies depending on the result of the operation.

```ts
if (post === undefined) {
  return c.json({ error: 'not found' }, 404)
}

return c.json({ post }, 200)
```

In this example, if the post is not found (i.e., `post === undefined`), a 404 status code along with an error message is returned. If the post is found, a 200 status code along with the post is returned.

The `c.json` function is used to send a JSON response. The first argument is the response body and the second argument is the HTTP status code.

- It's important to return appropriate HTTP status codes to indicate the result of the operation.

- [Hono Documentation](https://hono.bike/docs/)

- Returning different responses based on the result of a database query.

**Reasoning:** This rule is important as it demonstrates how to handle error responses in Hono. It shows how to return different HTTP status codes and response bodies depending on the result of the operation. This is a common pattern in web development where different status codes indicate different outcomes to the client.

*Source: docs/guides/rpc.md*

### Handling Not Found Responses in Hono

In Hono, it's important to handle 'Not Found' responses correctly. Using 'c.notFound()' can lead to incorrect inference of the data that the client gets from the server. This can lead to unexpected behavior and bugs in the application.

Here's an example of how not to handle 'Not Found' responses:

```ts

If you want to use a client, you should not use `c.notFound()` for the Not Found response. The data that the client gets from the server cannot be inferred correctly.
```

Instead, you should handle 'Not Found' responses in a way that allows the client to correctly infer the data from the server.

When a 'Not Found' response is returned, the client needs to be able to correctly infer the data from the server. Using 'c.notFound()' can interfere with this process, leading to incorrect data inference.

Always handle 'Not Found' responses in a way that allows the client to correctly infer the data from the server.

- Hono Documentation

- Handling 'Not Found' responses in a web application built with Hono.

**Reasoning:** This rule is important as it demonstrates the correct way to handle 'Not Found' responses in Hono. Using 'c.notFound()' can lead to incorrect inference of the data that the client gets from the server. This can lead to unexpected behavior and bugs in the application.

*Source: docs/guides/rpc.md*

### Handling Routes with Path Parameters in Hono

This code snippet demonstrates how to handle routes that include path parameters in Hono.

```ts
const route = app.get(
  '/posts/:id',
  zValidator(
    'query',
    z.object({
      page: z.string().optional(),
    })
  ),
  (c) => {
    // ...
    return c.json({
      title: 'Night',
```

1. The `app.get` method is used to define a GET route.
2. The route includes a path parameter `:id` which can be used to get a specific post.
3. The `zValidator` function is used to validate the query parameters. In this case, it checks if the `page` query parameter is a string and is optional.

- The `zValidator` function is part of the zod library which is a runtime validation library.

- [Hono Documentation](https://hono.bayfrontcloud.com/)

- Fetching a specific resource based on the id from the URL.
- Validating query parameters in the request.

**Reasoning:** This rule is important as it demonstrates how to handle routes that include path parameters in Hono. It shows how to define a route with a path parameter and how to use the zValidator to validate the query parameters. This is a common pattern in web development where you need to handle dynamic routes and validate the incoming request parameters.

*Source: docs/guides/rpc.md*

### Including a String in the Path with 'param' and Returning a JSON Object in Hono

This code snippet demonstrates how to include a string in the path using the 'param' keyword and how to return a JSON object from a function in Hono.

```ts
Specify the string you want to include in the path with `param`.

const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
  query: {},
})
```

In the above code, 'param' is used to specify the string that needs to be included in the path. The 'id' is set to '123', which will be included in the URL path. The '$get' function is then called to send a GET request to the server.

- The 'param' keyword is used to include a string in the path.
- The '$get' function is used to send a GET request to the server.

- [Hono Documentation](https://hono.eclipse.org/documentation/)

- When you need to include a specific string in the URL path.
- When you need to return a JSON object from a function.

**Reasoning:** This rule is important as it demonstrates how to include a string in the path using the 'param' keyword in Hono. It also shows how to return a JSON object from a function. Understanding this rule is crucial for developers to manipulate URL parameters and handle responses in Hono.

*Source: docs/guides/rpc.md*

### Using Parameters and Headers in Hono Client Requests

In Hono, you can specify the string you want to include in the path with `param`.

```ts
const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
  query: {},
})
ts
const res = await client.search.$get(
  {
    //...
  },
  {
    headers: {
      'X-Custom-Header': 'Here is Hono Client',
      'X-User-Agent': 'hc',
    },
  }
)
```

In the first code snippet, the `param` object is used to specify the string you want to include in the path. In this case, the `id` parameter is set to '123'.

In the second code snippet, the `headers` object is used to append headers to the request. Here, the 'X-Custom-Header' and 'X-User-Agent' headers are set to 'Here is Hono Client' and 'hc' respectively.

- The `param` and `headers` objects are optional. If not provided, Hono will use the default values.
- The `param` object should match the parameters defined in the path. If the parameters do not match, Hono will throw an error.

- [Hono Documentation](https://hono.bike/docs)

- Retrieving a specific post by its ID
- Sending custom headers with a request

#### Code Snippet

```typescript

You can also append headers to the request to provide additional information that the server needs to process the request.

```

**Reasoning:** This rule is important as it demonstrates how to use parameters and headers in Hono client requests. Parameters are used to specify the string you want to include in the path, while headers can be appended to the request to provide additional information that the server needs to process the request.

*Source: docs/guides/rpc.md*

### Adding Custom Headers to All Requests in Hono

This code snippet demonstrates how to add custom headers to all requests in Hono.

```ts
const client = hc<AppType>('/api', {
  headers: {
    Authorization: 'Bearer TOKEN',
  }
})
```

In the above code, `hc` function is used to create a Hono client. The second argument to the `hc` function is an options object where we can specify common headers for all requests.

In this case, an `Authorization` header is added with a value of 'Bearer TOKEN'. This means that all requests made using this client will include this authorization token in their headers.

- Headers are case-insensitive.
- Not all headers can be set. Some are restricted because they are controlled by the user agent.

- [Hono Documentation](https://hono.bryntum.com/docs/)

- Adding authentication tokens to all requests.
- Setting custom user-agent strings for all requests.

**Reasoning:** This rule is important as it demonstrates how to add custom headers to all requests in Hono. Headers are often used to carry information for HTTP requests and responses. In this case, the headers are used for authentication and user agent identification. Understanding how to set these headers is crucial for secure and efficient communication between the client and server.

*Source: docs/guides/rpc.md*

### Using the `init` option to customize requests in Hono

In Hono, you can pass the fetch's `RequestInit` object to the request as the `init` option. This allows you to customize the request with various options such as method, headers, body, mode, credentials, cache, redirect, referrer, integrity, and keepalive.

```ts

You can pass the fetch's `RequestInit` object to the request as the `init` option. Below is an example of aborting a Request.
```

The `init` option is passed as an argument to the Hono client function. The `RequestInit` object is a built-in fetch API object that allows you to customize the request.

- The `init` option is optional. If not provided, Hono will use the default fetch options.

- [Fetch API - RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)

- Aborting a request
- Customizing request headers
- Sending a request with credentials

**Reasoning:** This rule is important as it demonstrates how to pass the fetch's `RequestInit` object to the request as the `init` option in Hono. This is a key feature of Hono that allows developers to customize the request with various options such as method, headers, body, mode, credentials, cache, redirect, referrer, integrity, and keepalive.

*Source: docs/guides/rpc.md*

### Using RequestInit Object and $url() Method in Hono

In Hono, the `RequestInit` object defined by `init` takes the highest priority. It can be used to overwrite things set by other options like `body`, `method`, and `headers`.

```ts
client.api.posts.$post(
  {
    json: {
      // Request body
    },
  },
  {
    // RequestInit object
    init: {
      signal: abortController.signal,
    },
  }
)

// ...

abortController.abort()
ts
// ❌ Will throw error
const client = hc<AppType>('/')
client.api.post.$url()

// ✅ Will work as expected
const client = hc<AppType>('http://localhost:8787/')
client.api.post.$url()
```

- Always use an absolute URL with the `$url()` method to avoid errors.
- The `RequestInit` object can be used to overwrite default settings, providing flexibility in request configuration.

- [Hono Documentation](https://hono.bike/#/)

- Overwriting default request settings with the `RequestInit` object.
- Accessing the endpoint URL using the `$url()` method.

#### Code Snippet

```typescript

You can get a `URL` object for accessing the endpoint by using `$url()`. However, you must pass in an absolute URL for this to work. Passing in a relative URL `/` will result in an error.

```

**Reasoning:** This rule is important as it demonstrates how to use the `RequestInit` object and the `$url()` method in Hono. The `RequestInit` object allows users to overwrite default settings such as `body`, `method`, and `headers`. The `$url()` method is used to access the endpoint URL, but it requires an absolute URL to function correctly.

*Source: docs/guides/rpc.md*

### Uploading Files Using a Form Body in Hono

In Hono, you can upload files using a form body. This is demonstrated in the following code snippet:

```ts
// client
const res = await client.user.picture.$put({
  form: {
    file: new File([fileToUpload], filename, { type: fileToUpload.type })
  },
});
```

How it works:

1. The `$put` method is used to send a PUT request to the server.
2. The `form` object is used to send form data. In this case, it's a file.
3. The `File` constructor is used to create a new File object from the given fileToUpload, filename, and file type.

Important notes:

- Ensure that the fileToUpload, filename, and file type are correctly defined.

References:

- [Hono Documentation](https://hono.bevry.me/)

Common use cases:

- Uploading profile pictures
- Uploading documents
- Uploading media files

**Reasoning:** This rule is important as it demonstrates how to upload files using a form body in Hono. Understanding this rule is crucial for developers to handle file uploads in their applications.

*Source: docs/guides/rpc.md*

### Setting a Custom `fetch` Method in Hono

In Hono, you can set a custom `fetch` method. This is particularly useful when the default `fetch` method is not suitable or needs to be overridden for specific use cases. For instance, in a Cloudflare Worker environment, you might want to use the Service Bindings' `fetch` method instead of the default one.

Here is an example of how to do this:

```toml

services = [
  { binding = "AUTH", service = "auth-service" },
]
ts
// src/client.ts
const client = hc<CreateProfileType>('/', {
  fetch: c.env.AUTH.fetch.bind(c.env.AUTH)
```

In this example, the `fetch` method from the `AUTH` service binding is used instead of the default `fetch` method.

- The custom `fetch` method should be compatible with the Fetch API.
- Be careful when binding the context (`this`) of the `fetch` method, as it might have unintended side effects if not done correctly.

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

- Overriding the default `fetch` method in a Cloudflare Worker environment.

**Reasoning:** This rule is important as it demonstrates how to set a custom `fetch` method in Hono. This is useful in scenarios where the default `fetch` method may not be suitable or needs to be overridden for specific use cases, such as in a Cloudflare Worker environment.

*Source: docs/guides/rpc.md*

### Using InferRequestType and InferResponseType in Hono

In Hono, you can use `InferRequestType` and `InferResponseType` to understand the type of object to be requested and the type of object to be returned. This is crucial in ensuring type safety and predictability in your code.

Here is a code snippet demonstrating this:

```ts
import type { InferRequestType, InferResponseType } from 'hono/client'

// InferRequestType
const $post = client.todo.$post
type ReqType = InferRequestType<typeof $post>['form']

// InferResponseType
```

In this code snippet, `InferRequestType` is used to infer the type of the request object for a POST request. Similarly, `InferResponseType` can be used to infer the type of the response object.

This is particularly useful when you want to ensure that your code is type-safe and predictable, as it allows you to know exactly what type of object you are dealing with.

References:
- [Hono Documentation](https://hono.bike/docs/client/)

Common use cases:
- When you want to ensure type safety in your code
- When you want to understand the type of object you are dealing with

**Reasoning:** This rule is important as it demonstrates how to use the InferRequestType and InferResponseType in Hono to understand the type of object to be requested and the type of object to be returned. This is crucial in ensuring type safety and predictability in your code.

*Source: docs/guides/rpc.md*

### Using SWR with Hono

This guide demonstrates how to use the SWR library with the Hono framework. SWR is a React Hooks library for remote data fetching.

Here is the code snippet:

```tsx
import useSWR from 'swr'
import { hc } from 'hono/client'
import type { InferRequestType } from 'hono/client'
import type { AppType } from '../functions/api/[[route]]'

const App = () => {
  const
```

1. First, import the `useSWR` function from the SWR library.
2. Then, import the `hc` object from the 'hono/client' module.
3. Import the `InferRequestType` type from the 'hono/client' module.
4. Import the `AppType` type from the '../functions/api/[[route]]' module.
5. Finally, use these imports in your React component.

- The SWR library is not included with Hono, so you need to install it separately.

- [SWR Documentation](https://swr.vercel.app)

- Fetching data from a remote source in a React application using the Hono framework.

**Reasoning:** This rule is important as it demonstrates how to use the SWR library with the Hono framework. SWR is a React Hooks library for remote data fetching. The rule shows how to import the SWR library and use it in a Hono application. This is a common pattern when dealing with data fetching in a React application using the Hono framework.

*Source: docs/guides/rpc.md*

### Chaining Handlers for Correct Type Inference in Larger Applications with Hono

When working with larger applications in Hono, it's important to be careful about type inference. To ensure that types are always correctly inferred, you can chain the handlers. This approach helps to maintain consistency and avoid potential type-related errors.

Here is a code snippet demonstrating this:

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get author ${c.params.id}`))
```

In this example, the handlers for GET and POST requests are chained together. This ensures that the types are always inferred correctly.

- Always chain handlers in larger applications to ensure correct type inference.

- [Building a larger application](/docs/guides/best-practices#building-a-larger-application)

- Building larger applications with Hono
- Ensuring correct type inference in larger applications

**Reasoning:** This rule is important as it demonstrates how to use RPC (Remote Procedure Call) in larger applications with Hono. It emphasizes the importance of type inference and how to maintain it by chaining handlers. This is crucial in larger applications to ensure consistency and avoid potential type-related errors.

*Source: docs/guides/rpc.md*

### Defining Routes and Sub-routes in Hono

This code snippet demonstrates how to define routes and sub-routes in a Hono application.

```javascript
const app = new Hono()
  .get('/', (c) => c.json('list books'))
  .post('/', (c) => c.json('create a book', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
javascript
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

const routes = app.route('/authors', authors).route('/books', books)
```

Here, the 'route' method is used to define sub-routes for authors and books. The route handlers for these sub-routes are chained using the '.' operator.

- Make sure to chain the route handlers for the top level of the app.
- Export the app after defining all the routes.

- [Hono documentation](https://hono.bike/)

- Defining routes for different resources in a web application.

#### Code Snippet

```typescript

In this example, the 'get' and 'post' methods are used to handle HTTP GET and POST requests respectively. The route parameter ':id' is used to get the id from the request URL.

Sub-routers can be imported and used as shown below:

```

**Reasoning:** This rule is important as it demonstrates how to define routes and sub-routes in a Hono application. It shows how to use the 'get' and 'post' methods to handle HTTP GET and POST requests respectively, and how to use route parameters. It also shows how to chain route handlers and how to import and use sub-routers.

*Source: docs/guides/rpc.md*

### Understanding Performance Implications of RPC with Hono

When using RPC with Hono, the number of routes can impact the performance of your IDE. This is due to the fact that Hono executes a large number of type instantiations to infer the type of your app based on the routes.

Here is an example of how Hono infers the type of your app:

```ts
// app.ts
export const app = new Hono().get('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
ts
export const app = Hono<BlankEnv, BlankSchema, '/'>().get
```

The more routes you have, the slower your IDE will become. Therefore, it's important to consider the number of routes in your app and the potential performance implications.

- Hono Documentation

- Building a web app with multiple routes using Hono
- Using RPC with Hono

#### Code Snippet

```typescript

Hono will infer the type as follows:

```

**Reasoning:** This rule is important as it highlights the performance implications of using RPC with Hono and how the number of routes can impact the IDE performance. It demonstrates how Hono infers the type of your app based on the routes and the potential performance issues that can arise due to massive amounts of type instantiations.

*Source: docs/guides/rpc.md*

### Hono Type Inference Based on Route

In Hono, the type of your application is inferred based on the route. For example, if your application has a route like this:

```ts
// app.ts
export const app = new Hono().get('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
ts
export const app = Hono<BlankEnv, BlankSchema, '/'>().get<
  'foo/:id',
  'foo/:id',
  JSONRespondReturn<{ ok: boolean }, 200>,
  BlankInput,
  BlankEnv
>('foo/:id', (c) => c.json({ ok: true }, 200)
```

Hono uses the route definition to infer the type of the application. This type inference is based on the parameters and return type of the route handler function.

- The type inference is based on the route definition, so it's important to define your routes correctly.

- [Hono Documentation](https://hono.bike/docs)

- Defining routes in a Hono application
- Understanding how Hono infers the type of your application

#### Code Snippet

```typescript

Hono will infer the type as follows:

```

**Reasoning:** This rule is important as it demonstrates how Hono infers the type of your application based on the route. Understanding this inference mechanism is crucial for developers to ensure that they are defining their routes correctly and that the application behaves as expected.

*Source: docs/guides/rpc.md*

### Handling Type Instantiation in Hono

Type instantiation in Hono can be time-consuming and slow down your IDE. This is especially true when you have a lot of routes. However, there are ways to mitigate this issue.

The code snippet is a type instantiation for a single route. While the user doesn't need to write these type arguments manually, `tsserver` in your IDE does this time-consuming task every time you use the app.

1. **Hono version mismatch**: If your backend is separate from the frontend and lives in a different directory, ensure that the Hono versions match. Using different Hono versions can lead to issues such as '_Type instantiation is excessively deep and possibly infinite_'.

2. **TypeScript project references**: If your backend and frontend are separate and you want to access code from the backend on the frontend, use TypeScript's project references. This allows one TypeScript codebase to access and use code from another TypeScript codebase.

3. **Compile your code before using it**: `tsc` can do heavy tasks like type instantiation at compile time, making your IDE faster. Compiling your client including the server app gives you the best performance.

- [Hono RPC And TypeScript Project References](https://catalins.tech/hono-rpc-in-monorepos/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

This rule is commonly used in large projects with many routes, where type instantiation can significantly slow down the IDE.

#### Code Snippet

```typescript
export const app = Hono<BlankEnv, BlankSchema, '/'>().get<
  'foo/:id',
  'foo/:id',
  JSONRespondReturn<{ ok: boolean }, 200>,
  BlankInput,
  BlankEnv
>('foo/:id', (c) => c.json({ ok: true }, 200))
```

**Reasoning:** This rule is important as it demonstrates how to handle type instantiation in Hono, which can be time-consuming and slow down your IDE if not managed properly. It also provides tips on how to mitigate this issue, such as ensuring Hono versions match between backend and frontend, using TypeScript project references, and compiling your code before using it.

*Source: docs/guides/rpc.md*

### Using hcWithType instead of hc to get the client with the type already calculated in Hono

This guide demonstrates how to use the 'hcWithType' function instead of 'hc' to get the client with the type already calculated in Hono. This is a best practice in Hono framework usage as it simplifies the process of getting the client and improves code readability.

Here is the code snippet:

```ts
const client = hc<typeof app>('')
export type Client = typeof client

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args)
ts
const client = hcWithType('http://localhost:8787/')
const res = await client.posts.$post({
  form: {
    title: 'Hello',
    body: 'Hono is a cool project',
  },
})
```

The 'hcWithType' function takes the same parameters as 'hc' and returns a client with the type already calculated. This simplifies the process of getting the client and improves code readability.

- The 'hcWithType' function is a best practice in Hono framework usage.

- [Hono Documentation](https://hono.beeceptor.com)

- When you need to get the client with the type already calculated in Hono.

#### Code Snippet

```typescript

After compiling, you can use `hcWithType` instead of `hc` to get the client with the type already calculated.

```

**Reasoning:** This rule is important as it demonstrates how to use the 'hcWithType' function instead of 'hc' to get the client with the type already calculated in Hono. This is a best practice in Hono framework usage as it simplifies the process of getting the client and improves code readability.

*Source: docs/guides/rpc.md*

### Managing Dependencies in a Monorepo and Specifying Type Arguments Manually in Hono

In a monorepo project, you can use a tool like `turborepo` to easily separate the server project and the client project and manage dependencies between them. This can lead to better integration. Here is a working example: [Hono RPC Performance Tips Example](https://github.com/m-shaka/hono-rpc-perf-tips-example).

You can also coordinate your build process manually with tools like `concurrently` or `npm-run-all`.

```text
If your project is a monorepo, this solution does fit well. Using a tool like [`turborepo`](https://turbo.build/repo/docs), you can easily separate the server project and the client project and get better integration managing dependencies between them. Here is [a working example](https://github.com/m-shaka/hono-rpc-perf-tips-example).

You can also coordinate your build process manually with tools like `concurrently` or `npm-run-all`.
ts
const app = new Hono().get<'foo/:id'>('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
```

- [TurboRepo Documentation](https://turbo.build/repo/docs)
- [Hono RPC Performance Tips Example](https://github.com/m-shaka/hono-rpc-perf-tips-example)

#### Code Snippet

```typescript

In Hono, you can specify type arguments manually to avoid type instantiation. This can be a bit cumbersome, but it can make a difference in performance.

```

**Reasoning:** This rule is important as it demonstrates how to manage dependencies in a monorepo project using Hono. It also shows how to manually specify type arguments to avoid type instantiation, which can be beneficial for performance.

*Source: docs/guides/rpc.md*

### Improving Performance by Specifying Single Type Argument and Splitting App and Client into Multiple Files in Hono

This code demonstrates how to specify a single type argument in Hono to improve performance. It also shows how to split your app and client into multiple files for better code organization and manageability.

```text
Specifying just single type argument make a difference in performance, while it may take you a lot of time and effort if you have a lot of routes.

As described in [Using RPC with larger applications](#using-rpc-with-larger-applications), you can split your app into multiple apps. You can also create a client for each app:
```

1. Specify a single type argument when defining routes in Hono. This can improve performance.
2. Split your app into multiple apps and create a client for each app. This can make the code more manageable and easier to understand.

- Specifying a single type argument can improve performance but may require more time and effort if you have many routes.
- Splitting your app and client into multiple files can make the code more manageable but requires careful organization.

- [Using RPC with larger applications](#using-rpc-with-larger-applications)

- Large applications with many routes
- Applications where performance is a concern

**Reasoning:** This rule is important as it demonstrates how to improve performance in Hono by specifying a single type argument. It also shows how to structure larger applications by splitting the app and client into multiple files. This can make the code more manageable and easier to understand.

*Source: docs/guides/rpc.md*

### Using the Cookie Helper in Hono

The following code snippet demonstrates how to use the Cookie helper in Hono to get and set cookies.

```ts
import { getCookie, setCookie } from 'hono/cookie'

const app = new Hono()

app.get('/cookie', (c) => {
  const yummyCookie = getCookie(c, 'yummy_cookie')
  // ...
  setCookie(c, 'delicious_cookie', 'macha')
  //
})
```

1. First, the `getCookie` and `setCookie` functions are imported from `hono/cookie`.
2. A new Hono application is created.
3. A GET route '/cookie' is defined. In the callback function for this route, the `getCookie` function is used to retrieve a cookie named 'yummy_cookie'. The `setCookie` function is then used to set a cookie named 'delicious_cookie' with the value 'macha'.

- The `getCookie` function takes two arguments: the context object `c` and the name of the cookie.
- The `setCookie` function takes three arguments: the context object `c`, the name of the cookie, and the value of the cookie.

- [Hono Cookie Helper Documentation](/docs/helpers/cookie)

- Retrieving user preferences stored in cookies
- Setting session cookies for user authentication

**Reasoning:** This rule is important as it demonstrates how to use the Cookie helper in Hono to get and set cookies. Cookies are often used in web development for session management, personalization, and tracking user behavior.

*Source: docs/guides/helpers.md*

### Importing and Using Validator from Hono Framework

This guide demonstrates how to import and use the validator module from the Hono framework. The validator module is used to validate incoming values in applications.

Here is the code snippet:

```ts
import { validator } from 'hono/validator'
```

1. The `import` statement is used to import the `validator` module from the `hono/validator` package.

- The `validator` module should be imported at the beginning of your script, before it's used.

- [Hono Documentation](https://hono.bosch.io/docs/)

- Validating form data: You can use the `validator` module to validate form data, ensuring that the data entered by users is in the correct format and preventing potential issues related to incorrect data.

**Reasoning:** This rule is important as it demonstrates how to import and use the validator module from the Hono framework. The validator module is crucial for validating incoming values in applications, ensuring data integrity and preventing potential issues related to incorrect or malicious data.

*Source: docs/guides/validation.md*

### Form Validation with Validator Middleware in Hono

This code snippet demonstrates how to use the 'validator' middleware in Hono to validate form data in a POST request.

```ts
app.post(
  '/posts',
  validator('form', (value, c) => {
    const body = value['body']
    if (!body || typeof body !== 'string') {
      return c.text('Invalid!', 400)
    }
    return {
      body: body,
    }
  }),
  //...
```

In the above code, 'validator' is used as a middleware for the POST '/posts' route. The first argument to 'validator' is 'form', indicating that the data to be validated is form data. The second argument is a callback function that takes the form data and a context object 'c'. The function checks if the 'body' field of the form data is a string and if it's not, it returns a 400 response with the text 'Invalid!'. If the 'body' is valid, it returns an object with the 'body'.

Within the request handler, the validated data can be accessed using `c.req.valid('form')`.

- The 'validator' middleware is a powerful tool for validating user input in Hono. It should be used whenever user input needs to be validated.

- [Hono Documentation](https://hono.bike/docs/)

- Validating form data in POST requests
- Returning custom error responses for invalid data

**Reasoning:** This rule is important as it demonstrates how to use the 'validator' middleware in Hono to validate form data in a POST request. This is a common requirement in web applications where user input needs to be validated before processing. The rule also shows how to access the validated data within the request handler.

*Source: docs/guides/validation.md*

### Validating and Extracting Data from a Request in Hono

This code snippet demonstrates how to validate and extract data from a request in the Hono framework.

```ts
, (c) => {
  const { body } = c.req.valid('form')
  // ... do something
  return c.json(
    {
      message: 'Created!',
    },
    201
  )
}
```

In this example, the 'valid' method is used to validate and extract data from the 'form' part of the request. The validated data is then used in the handler.

Validation targets can include 'json', 'query', 'header', 'param', 'cookie' in addition to 'form'. When validating 'json', it is important to ensure that the request contains a 'Content-Type: application/json'.

- Always validate and sanitize data from the request before using it.
- Ensure the correct 'Content-Type' is set when validating 'json'.

- [Hono Documentation](https://hono.bike/)

- Validating and extracting data from the request in a POST or PUT API endpoint.

**Reasoning:** This rule is important as it demonstrates how to validate and extract data from a request in the Hono framework. It shows how to use the 'valid' method to validate and extract data from different parts of the request such as 'json', 'query', 'header', 'param', 'cookie' and 'form'. It also highlights the importance of setting the correct 'Content-Type' when validating 'json'.

*Source: docs/guides/validation.md*

### Setting Content-Type Header and Using Validator Middleware in Hono

In Hono, it's important to set the `content-type` header when testing using `app.request()`. Without it, the request body will not be parsed and a warning will be issued.

Here is an example of how to use the 'validator' middleware to validate and parse incoming request bodies.

```ts
const app = new Hono()
app.post(
  '/testing',
  validator('json', (value, c) => {
    // pass-through validator
    return value
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json(body)
  }
)
```

In this code, a POST route '/testing' is defined. The 'validator' middleware is used to validate and parse the request body as JSON. The validated and parsed body is then returned in the response.

- Always set the 'content-type' header in your requests when testing using `app.request()`.
- The 'validator' middleware is a powerful tool for validating and parsing request bodies in Hono.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Validating and parsing request bodies in API endpoints.

**Reasoning:** This rule is important as it demonstrates how to correctly use the 'validator' middleware in Hono to validate and parse incoming request bodies. It also shows the importance of setting the 'content-type' header in the request, as without it, the request body will not be parsed and a warning will be issued.

*Source: docs/guides/validation.md*

### Validating JSON Data and Headers in Hono

This rule demonstrates how to correctly validate and handle JSON data in Hono. It also shows the importance of setting the correct 'Content-Type' header when sending a request, and the need to use lowercase keys when validating headers.

```ts
r('json', (value, c) => {
    // pass-through validator
    return value
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json(body)
  }
)
```

The code first defines a pass-through validator for JSON data. Then, it uses this validator to validate the JSON data in the request body. If the 'Content-Type' header is not set to 'application/json', the validation will fail.

When validating headers, you need to use lowercase keys. For example, to validate the 'Idempotency-Key' header, you need to use 'idempotency-key' as the key.

- Hono Documentation

- Validating JSON data in a request
- Sending a request with a specific 'Content-Type' header
- Validating headers in a request

**Reasoning:** This rule is important as it demonstrates how to correctly validate and handle JSON data in Hono. It also shows the importance of setting the correct 'Content-Type' header when sending a request, and the need to use lowercase keys when validating headers.

*Source: docs/guides/validation.md*

### Always Use Lowercase for Header Key in Validation

When validating headers in Hono, always use lowercase for the header key. This is because Hono converts all header keys to lowercase. If you use a non-lowercase key, it will result in an undefined value, leading to unexpected behavior.

Here is an example of how to correctly validate the `Idempotency-Key` header:

```ts
// ❌ this will not work
app.post(
  '/api',
  validator('header', (value, c) => {
    // idempotencyKey is always undefined
    // so this middleware always return 400 as not expected
    const idempotencyKey = value['Idempotency-Key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw HTTPException(400, {
        message: 'Idempotency-Key is required',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)

// ✅ this will work
app.post(
  '/api',
  validator('header', (value, c) => {
    // can retrieve the value of the header as expected
    const idempotencyKey = value['idempotency-key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw HTTPException(400, {
        message: 'Idempotency-Key is required',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)
```

In the incorrect example, `Idempotency-Key` is used as the key, which results in an undefined value because Hono converts all header keys to lowercase. In the correct example, `idempotency-key` is used as the key, which allows the value of the header to be retrieved as expected.

Always use lowercase for header keys when validating headers in Hono.

- [Hono Documentation](https://hono.bike/docs/guides/validation/)

This rule is commonly used when validating headers in Hono.

**Reasoning:** This rule is important as it demonstrates the correct way to validate headers in Hono. It shows that when validating headers, the key should be in lowercase. Using a non-lowercase key will result in an undefined value, leading to unexpected behavior.

*Source: docs/guides/validation.md*

### Using Multiple Validators and Third-Party Validators in Hono

In Hono, you can use multiple validators to validate different parts of a request. This is useful when you want to ensure that all parts of the request, such as parameters, query strings, and JSON body, are valid.

Here is an example of how to use multiple validators:

```ts
app.post(
  '/posts/:id',
  validator('param', ...),
  validator('query', ...),
  validator('json', ...),
  (c) => {
    //...
  }
sh [npm]
npm i zod
ts
app.post(
  '/posts/:id',
  validator('param', ...),
  validator('query', ...),
  validator('json', ...),
  (c) => {
    //...
  }
```

- Always validate the data you receive in requests to prevent potential errors or security vulnerabilities.
- You can use any third-party validator that you prefer. Zod is just one of the many options available.

- [Hono Documentation](https://hono.bayrell.org/en/)
- [Zod Documentation](https://zod.dev)

- Validating user input in a form submission
- Checking the validity of parameters in a URL
- Ensuring the JSON body of a request is as expected

#### Code Snippet

```typescript

Hono also supports the use of third-party validators like Zod. To use Zod, you need to install it from the Npm registry:

```

**Reasoning:** This rule is important as it demonstrates how to use multiple validators in Hono to validate different parts of a request. It also shows how to integrate third-party validators like Zod into the Hono framework. This is essential for ensuring that the data being received in the request is valid and as expected, thereby preventing potential errors or security vulnerabilities.

*Source: docs/guides/validation.md*

### Installing and Using Zod for Data Validation in Hono

This guide demonstrates how to install Zod, a third-party data validation library, and use it in a Hono project.

First, install Zod from the Npm registry using your preferred package manager:

```sh
npm i zod
sh
yarn add zod
sh
pnpm add zod
sh
bun add zod
ts
import { z } from 'zod'
ts
const schema = z.object({
  body: z.string(),
})
```

You can use this schema in the callback function for validation and return the validated data.

- Zod is a powerful and flexible library for data validation, but there are many others available. Choose the one that best fits your project's needs.

- [Zod Documentation](https://github.com/colinhacks/zod)

- Validating user input in a form
- Checking the format of data received from an API

**Reasoning:** This rule is important as it demonstrates how to use a third-party validator, Zod, for data validation in Hono. It shows how to install Zod using different package managers, import it into your project, and define a schema for validation. This is a common practice in web development to ensure that the data being processed meets certain criteria, thereby preventing potential errors and security vulnerabilities.

*Source: docs/guides/validation.md*

### Using Zod for Schema Validation in Hono

This guide demonstrates how to use the Zod library for schema validation in Hono.

First, install the Zod library using your preferred package manager:

```sh
npm i zod
sh
yarn add zod
sh
pnpm add zod
sh
bun add zod
ts
import { z } from 'zod'
ts
const schema = z.object({
  body: z.string(),
})
ts
const route = app.post(
  '/posts',
  val
```

Zod is a library for creating schemas that can be used to validate JavaScript and TypeScript data. In this example, we create a schema for a post object that has a `body` property of type `string`.

- Zod is a zero-dependency library, meaning it doesn't require any other packages to work.

- [Zod Documentation](https://github.com/colinhacks/zod)

- Validating API request bodies
- Validating data before saving it to a database

#### Code Snippet

```typescript

or

```

**Reasoning:** This rule is important as it demonstrates how to use the Zod library for schema validation in Hono. Schema validation is a crucial part of any application as it ensures that the data being processed adheres to a certain structure, thus preventing potential errors or security vulnerabilities.

*Source: docs/guides/validation.md*

### Using Zod for Input Validation in Hono

This rule demonstrates how to use the zod library for input validation in Hono. Zod is a JavaScript library for building schemas and validating data.

First, you need to install zod using either pnpm or bun:

```sh
pnpm add zod
sh
bun add zod
ts
import { z } from 'zod'
ts
const schema = z.object({
  body: z.string(),
})
ts
const route = app.post(
  '/posts',
  validator('form', (value, c) => {
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      return c.text('Invalid!', 401)
    }
    return parsed.data
  })
)
```

- Zod provides a variety of methods to define complex schemas.
- The 'safeParse' method is used to validate the data. It returns an object with a 'success' property that indicates whether the validation was successful.

- [Zod documentation](https://github.com/colinhacks/zod)

- Validating user input in form submissions
- Validating API request payloads

#### Code Snippet

```typescript

or

```

**Reasoning:** This rule is important as it demonstrates how to use the zod library for input validation in Hono. It shows how to define a schema and use it to validate incoming data in a route handler. This is a common pattern in web development to ensure that the data received from the client meets certain criteria before it is processed.

*Source: docs/guides/validation.md*

### Using Zod Validator Middleware in Hono

The following code snippet shows how to use the Zod Validator Middleware in the Hono framework.

```sh
npm i @hono/zod-validator
sh
yarn add @hono/zod-validator
sh
pnpm add @hono/zod-validator
sh
bun add @hono/zod-validator
```

After installing the middleware, you can import it into your application.

This middleware simplifies the process of validating data in Hono applications. It provides a set of tools for validating data of various types and formats.

- The Zod Validator Middleware is a third-party package, and you need to install it separately.

- [Zod Validator Middleware](https://github.com/honojs/middleware/tree/main/packages/zod-validator)

- Validating form data in a Hono application.
- Validating API request data in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to use the Zod Validator Middleware in the Hono framework. The Zod Validator Middleware is a tool that simplifies the process of validating data in Hono applications. This rule shows how to install and import the middleware, which is a common pattern in Hono framework usage.

*Source: docs/guides/validation.md*

### Installing and Using zod-validator in Hono

The `@hono/zod-validator` package is used for data validation in Hono. It ensures that the data received in the request matches the expected format. This is crucial for maintaining data integrity and preventing potential errors or security vulnerabilities.

First, install the package using npm, yarn, pnpm, or bun:

```sh
npm i @hono/zod-validator
sh
yarn add @hono/zod-validator
sh
pnpm add @hono/zod-validator
sh
bun add @hono/zod-validator
ts
import { zValidator } from '@hono/zod-validator'
ts
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      body: z.string(),
    })
  ),
```

- Always validate your request data to maintain data integrity and prevent potential errors or security vulnerabilities.

- [Hono Documentation](https://hono.bayrell.org/)

- Validating request data in a POST route.

**Reasoning:** This rule is important as it demonstrates how to install and use the zod-validator package in Hono. The zod-validator is used for data validation, ensuring that the data received in the request matches the expected format. This is crucial for maintaining data integrity and preventing potential errors or security vulnerabilities.

*Source: docs/guides/validation.md*

### Installing and Using zod-validator for Data Validation in Hono

First, install the zod-validator package using either pnpm or bun:

```sh
pnpm add @hono/zod-validator
sh
bun add @hono/zod-validator
ts
import { zValidator } from '@hono/zod-validator'
ts
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      body: z.string(),
    })
  ),
  (c) => {
    const validated = c.req.valid('form')
    // ... use your validated data
  }
)
```

In this example, `zValidator('form', z.object({ body: z.string() }))` is a middleware that validates the 'form' field of the request. If the validation fails, the request is rejected. If it passes, the validated data can be accessed with `c.req.valid('form')`.

- Always validate incoming data to prevent invalid or malicious data from being processed.

- [Hono Framework Documentation](https://hono.bun.dev/)

- Validating form data in POST requests.
- Validating query parameters in GET requests.

#### Code Snippet

```typescript

or

```

**Reasoning:** This rule is important as it demonstrates how to use the zod-validator in Hono framework for data validation. It shows how to install the zod-validator, import it into your project, and use it to validate incoming data in a POST request. This is crucial for ensuring data integrity and preventing invalid or malicious data from being processed by your application.

*Source: docs/guides/validation.md*

### Registering Middleware in Hono

This code snippet demonstrates how to register middleware in Hono web framework.

```ts
// match any method, all routes
app.use(logger())

// specify path
app.use('/posts/*', cors())

// specify method and path
app.post('/posts/*', basicAuth())
```

1. `app.use(logger())`: This registers a logger middleware that will be applied to all routes and methods.

2. `app.use('/posts/*', cors())`: This registers a CORS middleware that will be applied to all routes that match the pattern '/posts/*'.

3. `app.post('/posts/*', basicAuth())`: This registers a basic authentication middleware that will be applied to all POST requests that match the pattern '/posts/*'.

- Middleware functions are executed in the order they are registered.

- Middleware can be applied to specific HTTP methods by using `app.HTTP_METHOD`.

- [Hono Documentation](https://hono.boutell.com/)

- Logging requests and responses
- Enabling CORS
- Authenticating requests

**Reasoning:** This rule is important as it demonstrates how to register middleware in Hono web framework. Middleware is a crucial part of any web application as it allows you to run code before the final request handler, perform operations on the request and response objects, end the request-response cycle, or call the next middleware function in the stack. Understanding how to register middleware is essential for building robust applications with Hono.

*Source: docs/guides/middleware.md*

### Middleware Execution Order in Hono

In Hono, middleware are processed in the order they are defined. This is demonstrated in the following code snippet:

```ts
app.use('/posts/*', cors())
app.post('/posts/*', basicAuth())
app.post('/posts', (c) => c.text('Created!', 201))
ts
logger() -> cors() -> basicAuth() -> *handler*
```

This means that the logger middleware is executed first, followed by the cors middleware, then the basicAuth middleware, and finally the handler.

When a request is made to the '/posts' path, the middleware functions cors and basicAuth are executed in the order they are defined. If the handler returns `Response`, it will be used for the end-user, and stop the processing.

- The order of middleware definition matters in Hono.
- Middleware functions can either end the request-response cycle or pass control to the next middleware function.

- [Hono Documentation](https://hono.boutique/docs/)

- Use middleware for tasks such as logging, authentication, and handling CORS.

#### Code Snippet

```typescript

In this case, four middleware are processed before dispatching like this:

```

**Reasoning:** This rule is important as it demonstrates the order of execution of middleware in the Hono framework. Middleware are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Understanding the order of execution of middleware is crucial for managing the flow of data and control in the application.

*Source: docs/guides/middleware.md*

### Understanding Middleware Execution Order in Hono

In Hono, middleware functions are executed in the order they are defined. However, due to the use of the `await next()` statement, each middleware function can perform operations both before and after the next middleware functions are run. This results in a stack-like execution order.

Consider the following code snippet:

```text
middleware 1 start
  middleware 2 start
    middleware 3 start
      handler
    middleware 3 end
  middleware 2 end
middleware 1 end
```

In this example, 'middleware 1 start' is logged first, followed by 'middleware 2 start', and then 'middleware 3 start'. After 'handler' is logged, 'middleware 3 end' is logged, followed by 'middleware 2 end', and finally 'middleware 1 end'. This demonstrates that each middleware function can perform operations before and after the next middleware functions are run.

This pattern is useful for tasks such as logging, authentication, or any other operations that need to be performed before and/or after the main handler function.

**Reasoning:** This rule is important as it demonstrates the execution order of middleware in Hono. Middleware in Hono runs in a stack-like manner, where the first middleware function can perform operations before and after the next middleware are run. This is crucial for understanding how to structure your middleware and control the flow of execution in your application.

*Source: docs/guides/middleware.md*

### Using Built-in Middleware in Hono

This code demonstrates how to use built-in middleware in Hono.

```ts
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

app.use(poweredBy())
app.use(logger())

app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)
```

In this code, we first import the necessary modules from Hono. We then create a new Hono application. After that, we use the `app.use()` function to add the `poweredBy` and `logger` middleware to our application. Finally, we add the `basicAuth` middleware to any routes that match '/auth/*'.

It's important to note that using a different version of middleware than the Hono version can lead to bugs. Therefore, it's recommended to always use the same version of middleware as the Hono version.

- [Hono Documentation](https://hono.bryntum.com/docs)

- Adding pre-processing or post-processing functionality to your Hono application.
- Adding authentication to certain routes in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to use built-in middleware in Hono. Middleware is a crucial part of many web frameworks, including Hono, as it allows for pre-processing of requests and post-processing of responses. This rule also highlights the potential issues that can arise when using different versions of middleware than the Hono version, which can lead to bugs.

*Source: docs/guides/middleware.md*

### Ensure Consistent Versioning Between Hono and Middleware

In Hono, it's possible to use a different version of middleware than the Hono version. However, this can lead to bugs and inconsistencies in your application. This rule demonstrates the correct way to import and use middleware in Hono, and the potential bugs that can occur when the versions mismatch.

```ts
import { Hono } from 'jsr:@hono/hono@4.4.0'
import { upgradeWebSocket } from 'jsr:@hono/hono@4.4.5/deno'

const app = new Hono()

app.get(
  '/ws',
  upgradeWebSocket(() => ({
    // ...
  }))
)
```

In the above code snippet, the `Hono` and `upgradeWebSocket` are imported from different versions, which can lead to bugs. Always ensure that the versions of Hono and the middleware you're using are consistent.

- Hono Documentation

- When setting up a new Hono application
- When adding new middleware to your Hono application

**Reasoning:** This rule is important because it highlights the potential issues that can arise when using different versions of middleware and the Hono version. It demonstrates the correct way to import and use middleware in Hono, and the potential bugs that can occur when the versions mismatch.

*Source: docs/guides/middleware.md*

### Creating and Using Custom Middleware in Hono

This code snippet demonstrates how to create and use custom middleware in Hono. Middleware functions are used for tasks like logging, adding headers, etc.

```ts
// Custom logger
app.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

// Add a custom header
app.use('/message/*', async (c, next) => {
  await next()
  c.header('x-message', 'This is middleware!')
})

app.get('/message/hello', (c) => c.text('Hello Middleware!'))
```

In this example, the first middleware function logs the request method and URL. The second middleware function adds a custom header to the response for any request that matches the path '/message/*'.

1. The `app.use()` function is used to add middleware functions to the application.
2. The `next` function is called to pass control to the next middleware function. If `next` is not called, the request-response cycle will be halted.

- Middleware functions are executed in the order they are added.
- Middleware functions can end the request-response cycle by not calling `next`, or they can pass control to the next middleware function by calling `next`.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Logging
- Adding headers
- Authentication

**Reasoning:** This rule is important as it demonstrates how to create and use custom middleware in Hono. Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. They can execute any code, make changes to the request and the response objects, end the request-response cycle, and call the next middleware function in the stack.

*Source: docs/guides/middleware.md*

### Creating a Middleware in Hono

In Hono, you can create a middleware using the 'createMiddleware' function from Hono's factory. Here is an example of a simple logging middleware:

```ts
import { createMiddleware } from 'hono/factory'

const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})
```

In this example, the middleware logs the HTTP method and URL of each request. The 'next' function is called to pass control to the next middleware function in the stack.

The 'createMiddleware' function takes a callback function as an argument. This callback function is the actual middleware function that gets executed. It has access to the context object 'c' and a 'next' function. The context object 'c' contains the request and response objects, among other things. The 'next' function is used to pass control to the next middleware function in the stack.

- Middleware functions are called in the order they are defined.
- Don't forget to call the 'next' function to avoid hanging the request-response cycle.

- [Hono Factory](https://hono.dev/docs/api/factory)
- [Hono Context](https://hono.dev/docs/api/context)

- Logging
- Authentication
- Error handling

**Reasoning:** This rule is important as it demonstrates how to create a middleware in Hono using the 'createMiddleware' function from Hono's factory. Middleware is a crucial part of any web application as it allows the execution of code, modification of request and response objects, and ending the request-response cycle. This code snippet shows how to create a simple logging middleware that logs the HTTP method and URL of each request.

*Source: docs/guides/middleware.md*

### Creating and Modifying Middleware in Hono

In Hono, you can create middleware using the 'createMiddleware' function. This function takes a callback function as an argument, which receives the context 'c' and the 'next' function. The context 'c' contains the request and response objects, and 'next' is a function that passes control to the next middleware.

Here is an example of creating a middleware that logs the request method and URL:

```ts
const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})
ts
createMiddleware<{Bindings: Bindings}>(async (c, next) =>
ts
const stripRes = createMiddleware(async (c, next) => {
  await next()
  // modify c.res here
})
```

- Middleware functions are executed in the order they are added.
- Always call 'next' in your middleware to avoid blocking the request-response cycle.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Logging requests
- Authenticating users
- Modifying responses

#### Code Snippet

```typescript

You can also use type generics with 'createMiddleware' to specify the type of the context:

```

**Reasoning:** This rule is important as it demonstrates how to create a middleware in Hono using the 'createMiddleware' function. It also shows how to use type generics with 'createMiddleware' and how to modify responses in middleware. Understanding this rule is crucial for developers to effectively manage HTTP requests and responses in a Hono application.

*Source: docs/guides/middleware.md*

### Modifying the Response in Middleware and Accessing Context in Hono

In Hono, middleware functions can be designed to modify responses if necessary. This is typically done after the 'next' function has been called. The 'next' function passes control to the next middleware function in the stack. After it has been called, you can modify the response object.

Here is an example of how to do this:

```ts
const stripRes = createMiddleware(async (c, next) => {
  await next()
  c.res = undefined
  c.res = new Response('New Response')
})
```

In this code snippet, the response object 'c.res' is first set to undefined, then a new Response is created with the message 'New Response'.

To access the context inside middleware arguments, you can directly use the context parameter provided by 'app.use'.

- The 'next' function should be called before modifying the response object.
- The context parameter 'c' provides access to the request and response objects, among other things.

- [Hono Middleware Documentation](https://hono.bayrell.org/docs/middleware)

- Modifying the response object based on certain conditions.
- Accessing the context to get information about the request or response.

**Reasoning:** This rule is important as it demonstrates how to modify the response after the 'next' function has been called in a middleware function. It also shows how to access the context inside middleware arguments. This is a common pattern in Hono and other web frameworks, allowing developers to manipulate the response object before it is sent back to the client.

*Source: docs/guides/middleware.md*

### Context Access and Middleware Configuration in Hono

This guide demonstrates how to access and use the context inside middleware arguments in Hono. The context parameter provided by `app.use` is used to configure middleware.

Here is the code snippet:

```ts
import { cors } from 'hono/cors'

app.use('*', async (c, next) => {
  const middleware = cors({
    origin: c.env.CORS_ORIGIN,
  })
  return middleware(c, next)
})
```

In the code snippet, the cors middleware is being configured. The context `c` is used to access the environment variable `CORS_ORIGIN` which is then passed as the `origin` option to the cors middleware.

- The context `c` is a parameter provided by `app.use` and it contains useful information about the request and response, as well as any environment variables.

- Middleware in Hono is configured by passing an options object to the middleware function. The options object can use values from the context.

- [Hono documentation](https://hono.bayrell.org/en/)

- Configuring middleware based on environment variables or other context information.
- Accessing request and response information in middleware.

**Reasoning:** This rule is important as it demonstrates how to access and use the context inside middleware arguments in Hono. It shows how to use the context parameter provided by `app.use` to configure middleware, in this case, the cors middleware. Understanding this pattern is crucial for developers to effectively use and configure middleware in their Hono applications.

*Source: docs/guides/middleware.md*

### Extending Context Inside Middleware in Hono

This guide demonstrates how to extend the context inside middleware using the 'c.set' method in Hono. It also shows how to make this type-safe by passing a `{ Variables: { yourVariable: YourVariableType } }` generic argument to the `createMiddleware` function.

```ts
import { createMiddleware } from 'hono/factory'

const echoMiddleware = createMiddleware<{
  Variables: {
    echo: (str: string) => string
  }
}>(async (c, next) => {
  c.set('echo', (str) => str)
  await next()
})

app.get('/echo', echoMiddleware, (c) => {
  return c.text(c.var.echo('Hello!'))
})
```

1. The `createMiddleware` function is imported from 'hono/factory'.
2. A middleware named 'echoMiddleware' is created. This middleware is type-safe and has a variable 'echo' that is a function taking a string and returning a string.
3. Inside the middleware, the 'echo' variable is set to a function that returns the input string.
4. The middleware is then used in a GET request handler for the '/echo' route. The 'echo' function is called with the string 'Hello!' and the result is sent as a text response.

- The 'c.set' method is used to extend the context inside middleware.
- The `{ Variables: { yourVariable: YourVariableType } }` generic argument is used to make the middleware type-safe.

- Hono Documentation: [Middleware](https://hono.bayfront.io/Reference/Middleware)

- Extending the context with custom functions or data in middleware.
- Making middleware type-safe.

**Reasoning:** This rule is important as it demonstrates how to extend the context inside middleware using the 'c.set' method in Hono. It also shows how to make this type-safe by passing a `{ Variables: { yourVariable: YourVariableType } }` generic argument to the `createMiddleware` function. This is a common pattern in Hono framework usage and is crucial for creating reusable and modular code.

*Source: docs/guides/middleware.md*

### Using Third-Party Renovate Configuration in Hono

Since the Hono team does not maintain a Renovate configuration, it's recommended to use a third-party configuration. This can be done by extending the third-party configuration in your `renovate.json` file.

Here is a code snippet demonstrating this:

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>shinGangan/renovate-config-hono" // [!code ++]
  ]
}
```

In this code snippet, the `extends` field is used to specify the third-party configuration that should be used. The value `github>shinGangan/renovate-config-hono` indicates that the configuration from the `renovate-config-hono` repository on GitHub, owned by the user `shinGangan`, should be used.

- Always ensure that the third-party configuration you are using is reliable and secure.

- [Renovate Configuration](https://docs.renovatebot.com/configuration-options/)
- [renovate-config-hono Repository](https://github.com/shinGangan/renovate-config-hono)

- Automating dependency updates in a Hono project.

**Reasoning:** This rule is important as it demonstrates how to use a third-party Renovate configuration in a Hono project. Renovate is a tool that helps to automate dependency updates, which is crucial for maintaining the security and reliability of the project. Since the Hono team does not maintain a Renovate configuration, users are advised to use a third-party configuration.

*Source: docs/guides/faq.md*

### Defining Routes and Handling Requests in Hono

This code snippet demonstrates how to define routes and handle HTTP GET and POST requests in Hono. It also shows how to send different types of responses, such as text and JSON, and how to set custom headers in the response.

```ts
app.get('/posts', (c) => {
  return c.text('Many posts')
})

app.post('/posts', (c) => {
  return c.json(
    {
      message: 'Created',
    },
    201,
    {
      'X-Custom': 'Thank you',
    }
  )
})
```

The `app.get` method is used to handle HTTP GET requests to the '/posts' path. The callback function takes a context object `c` and returns a text response 'Many posts'.

The `app.post` method is used to handle HTTP POST requests to the '/posts' path. The callback function takes a context object `c` and returns a JSON response with a status code of 201 and a custom header 'X-Custom'.

- The context object `c` provides methods for sending different types of responses and for accessing request information.
- The `c.text` method is used to send a text response.
- The `c.json` method is used to send a JSON response. It takes three arguments: the JSON object, the status code, and the headers.

- [Hono documentation](https://hono.bike/docs)

- Defining routes and handling requests in a web application.
- Sending different types of responses based on the request.

**Reasoning:** This rule is important as it demonstrates how to define routes and handle HTTP GET and POST requests in Hono. It also shows how to send different types of responses, such as text and JSON, and how to set custom headers in the response.

*Source: docs/guides/testing.md*

### Testing GET and POST Requests in Hono

This guide demonstrates how to test GET and POST requests in Hono. It shows how to make requests to specific endpoints and how to check the responses for expected status codes and content.

```ts
describe('Example', () => {
  test('GET /posts', async () => {
    const res = await app.request('/posts')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Many posts')
  })
})
```

1. The `describe` function groups related tests.
2. The `test` function defines a test for the 'GET /posts' endpoint.
3. `app.request('/posts')` makes a GET request to the '/posts' endpoint.
4. `expect(res.status).toBe(200)` checks that the response status code is 200.
5. `expect(await res.text()).toBe('Many posts')` checks that the response text is 'Many posts'.

- Ensure that your application is running and that the '/posts' endpoint is correctly configured before running these tests.

- [Hono Documentation](https://hono.boutique/docs/)

- Use this pattern to test any GET or POST request in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to test GET and POST requests in Hono. It shows how to make requests to specific endpoints and how to check the responses for expected status codes and content. This is crucial for ensuring the correct functionality of your web application.

*Source: docs/guides/testing.md*

### Making and Testing a POST Request in Hono

This code snippet demonstrates how to make a POST request using the Hono framework, and how to test the response status, headers, and JSON body.

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

1. The `app.request` function is used to make a POST request to the '/posts' endpoint.
2. The response (`res`) is then tested for a status of 201, indicating that the resource was successfully created.
3. The response headers are checked for a custom header 'X-Custom' with a value of 'Thank you'.
4. The JSON body of the response is parsed and tested to be an object with a 'message' property of 'Created'.

- Ensure that the endpoint '/posts' is set up to handle POST requests in your application.
- The 'X-Custom' header and the JSON response body are specific to this example and may vary based on your application's requirements.

- [Hono Documentation](https://hono.bike/docs/guide/)

- Testing API endpoints in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to make a POST request using the Hono framework, and how to test the response status, headers, and JSON body. Understanding this pattern is crucial for developers to ensure their APIs are functioning as expected.

*Source: docs/guides/testing.md*

### Making a POST Request and Asserting the Response in Hono

This code snippet demonstrates how to make a POST request to the '/posts' endpoint with JSON data, and how to assert the response status, headers, and body.

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
    body: JSON.stringify({ message: 'hello hono' }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

1. The `app.request` function is used to make a request to the '/posts' endpoint with a 'POST' method.
2. The body of the request is a JSON stringified object.
3. The headers of the request include a 'Content-Type' of 'application/json'.
4. The response status is asserted to be 201, indicating that a resource was successfully created.
5. The response headers are asserted to include a custom header 'X-Custom' with a value of 'Thank you'.
6. The response body is asserted to be a JSON object with a 'message' property of 'Created'.

- Ensure that the endpoint and method used in the `app.request` function match the endpoint and method of the route being tested.
- The assertions made on the response should match the expected behavior of the endpoint.

- [Hono Documentation](https://hono.bike/)

- Testing endpoints in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to make a POST request in Hono with JSON data, and how to assert the response status, headers, and body. Understanding this pattern is crucial for testing endpoints in a Hono application.

*Source: docs/guides/testing.md*

### Making a POST request with multipart/form-data in Hono

This code snippet demonstrates how to make a POST request with multipart/form-data using the Hono framework.

```ts
test('POST /posts', async () => {
  const formData = new FormData()
  formData.append('message', 'hello')
  const res = await app.request('/posts', {
    method: 'POST',
    body: formData,
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

1. A new FormData instance is created and a 'message' field is appended to it.
2. The app.request method is used to make a POST request to the '/posts' endpoint, passing the FormData instance as the body of the request.
3. Assertions are performed on the response, checking that the status is 201 (Created), the 'X-Custom' header is 'Thank you', and the body of the response is `{ message: 'Created' }`.

- The FormData API is used to construct a set of key/value pairs representing form fields and their values.
- The app.request method returns a Promise that resolves to the Response to that request, whether it is successful or not.

- [Hono Documentation](https://hono.bevry.me/)

- Submitting forms with file uploads
- Making POST requests with complex data structures

**Reasoning:** This rule is important as it demonstrates how to make a POST request with multipart/form-data using the Hono framework. It also shows how to perform assertions on the response, checking the status, headers, and body of the response. This is a common operation in web development, especially when dealing with forms and file uploads.

*Source: docs/guides/testing.md*

### Testing POST Requests in Hono

This guide demonstrates how to create a test for a POST request in Hono.

```ts
test('POST /posts', async () => {
  const req = new Request('http://localhost/posts', {
    method: 'POST',
  })
  const res = await app.request(req)
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

1. A new Request instance is created with the URL and method set to 'POST'.
2. The request is sent using the app.request method.
3. The response status, headers, and body are asserted using Jest's expect function.

- The URL in the Request constructor should be the URL of the endpoint you want to test.
- The method in the Request constructor should be the HTTP method that the endpoint accepts.
- The assertions should match the expected response of the endpoint.

- [Hono documentation](https://hono.boutique/docs)

- Testing HTTP endpoints in Hono.

**Reasoning:** This rule is important as it demonstrates how to create a test for a POST request in Hono. It shows how to create a new Request instance, how to send the request using the app.request method, and how to assert the response status, headers, and body. This is a common pattern in testing HTTP endpoints in Hono.

*Source: docs/guides/testing.md*

### Mocking Environment Variables for Testing in Hono

This code snippet demonstrates how to mock environment variables for testing in Hono. This is useful when you want to simulate different environments and see how your application behaves under those conditions.

```ts
const MOCK_ENV = {
  API_HOST: 'example.com',
  DB: {
    prepare: () => {
      /* mocked D1 */
    },
  },
}

test('GET /posts', async () => {
  const res = await app.request('/posts', {}, MOCK_ENV)
})
```

1. Define a `MOCK_ENV` object with the environment variables you want to mock.
2. Pass `MOCK_ENV` as the third parameter to `app.request` in your test.

- The `MOCK_ENV` object should mirror the structure of your actual environment variables.

- [Cloudflare Workers Bindings](https://hono.dev/getting-started/cloudflare-workers#bindings)

- Mocking database connections or API hosts for testing.

**Reasoning:** This rule is important as it demonstrates how to mock environment variables for testing in Hono. It allows developers to simulate different environments and test how their application behaves under those conditions. This is particularly useful when testing components that interact with external services or databases.

*Source: docs/guides/testing.md*

### Creating a Simple Counter Component in Hono

This guide demonstrates how to create a simple counter component using the Hono framework. The counter increments when the button is clicked.

Here is the code snippet:

```tsx
import { useState } from 'hono/jsx'
import { render } from 'hono/jsx/dom'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

function App() {
  return (
    <html>
      <body>
        <Counter />
      </body>
    </html>
  )
}

const root = document.getElementById('root')
render(<App />, root)
```

1. The `useState` hook is used to manage the state of the counter.
2. The `render` function is used to insert the `App` component within the HTML element with id 'root'.

- Hono's hooks are compatible with React, so if you're familiar with React, you can easily transition to Hono.

- [Hono Documentation](https://hono.dev/docs)

- Creating interactive components in web applications using Hono.

**Reasoning:** This rule is important as it demonstrates how to create a simple counter component using the Hono framework. It shows how to use the useState hook for state management and the render function to insert JSX components within a specified HTML element. Understanding this rule is crucial for developers to create interactive web applications using Hono.

*Source: docs/guides/jsx-dom.md*

### Rendering JSX Components in Hono

In Hono, you can use the `render()` function to insert JSX components within a specified HTML element. This is a fundamental aspect of displaying your components on the webpage.

Here is a code snippet demonstrating this:

```tsx
render(<Component />, container)
```

In this code snippet, `<Component />` is the JSX component you want to render, and `container` is the HTML element where you want to insert your component.

It's important to note that the `render()` function is part of the hono/jsx/dom library, which provides hooks that are compatible or partially compatible with React. You can learn more about these APIs in the [React documentation](https://react.de).

Common use cases for this function include rendering the main app component into the root HTML element of your webpage.

**Reasoning:** This rule is important as it demonstrates how to use the `render()` function in Hono to insert JSX components within a specified HTML element. Understanding this rule is crucial for developers to properly display their JSX components on the webpage.

*Source: docs/guides/jsx-dom.md*

### Using startViewTransition, useState, and css in Hono

The following code demonstrates how to use the `startViewTransition` function in Hono to create a transition effect when changing the state of a component. It also shows how to use the `useState` hook to manage component state and how to apply CSS styles using the `css` function from Hono.

```tsx
import { useState, startViewTransition } from 'hono/jsx'
import { css, Style } from 'hono/css'

export default function App() {
  const [showLargeImage, setShowLargeImage] = useState(false)
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

The `startViewTransition` function is used to create a transition effect when the state of the `showLargeImage` variable is changed. The `useState` hook is used to manage the state of the `showLargeImage` variable. The `css` function is used to apply CSS styles to the div element.

- The `startViewTransition` function should be used inside an event handler, such as `onClick`.
- The `useState` hook should be used at the top of your function component.
- The `css` function can be used to apply inline styles to your JSX elements.

- [Hono Documentation](https://hono.dev/docs)

- Creating transition effects when changing component state
- Managing component state with the `useState` hook
- Applying CSS styles with the `css` function

**Reasoning:** This rule is important as it demonstrates how to use the `startViewTransition` function in Hono to create a transition effect when changing the state of a component. It also shows how to use the `useState` hook to manage component state and how to apply CSS styles using the `css` function from Hono.

*Source: docs/guides/jsx-dom.md*

### Using View Transitions in Hono

This guide demonstrates how to use view transitions in Hono. The `viewTransition` function is used to create a unique transition name and apply it to a CSS class. The `startViewTransition` function is used to start a view transition when a button is clicked.

```tsx
import { useState, startViewTransition } from 'hono/jsx'
import { viewTransition } from 'hono/jsx/dom/css'
import { css, keyframes, Style } from 'hono/css'

const rotate = keyframes`
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
`

export default function App() {
  const [showLargeImage, setShowLargeImage] = useState(false)
  const [transitionNameClass] = useState(() =>
    viewTransition(css`
      ::view-transition-old() {
        animation-name: ${rotate};
      }
      ::view-transition-new() {
        animation-name: ${rotate};
      }
    `)
  )
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              ${transitionNameClass}
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

1. The `viewTransition` function is used to create a unique transition name and apply it to a CSS class.
2. The `startViewTransition` function is used to start a view transition when a button is clicked.

- The `viewTransition` function returns a unique transition name that can be used in CSS.
- The `startViewTransition` function starts a view transition.

- [Hono Documentation](https://hono.dev/docs)

- Creating unique transitions for different views in a web application.

**Reasoning:** This rule is important as it demonstrates how to use view transitions in Hono. It shows how to use the `viewTransition` function to create a unique transition name and apply it to a CSS class. It also demonstrates how to use the `startViewTransition` function to start a view transition when a button is clicked.

*Source: docs/guides/jsx-dom.md*

### Using `useViewTransition` and `viewTransition` for Animated Transitions in Hono

This code snippet demonstrates how to use Hono's `useViewTransition` and `viewTransition` functions to create a view transition with a rotation animation. It also shows how to use the `useState` function to manage state within a component, and how to conditionally render components based on state.

```tsx
import { useState, useViewTransition } from 'hono/jsx'
import { viewTransition } from 'hono/jsx/dom/css'
import { css, keyframes, Style } from 'hono/css'

const rotate = keyframes`
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
`

export default function App() {
  const [isUpdating, startViewTransition] = useViewTransition()
  const [showLargeImage, setShowLargeImage] = useState(false)
  const [transitionNameClass] = useState(() =>
    viewTransition(css`
      ::view-transition-old() {
        animation-name: ${rotate};
      }
      ::view-transition-new() {
        animation-name: ${rotate};
      }
    `)
  )
  return (
    <>
      <Style />
      <button
        onClick={() =>
          startViewTransition(() =>
            setShowLargeImage((state) => !state)
          )
        }
      >
        Click!
      </button>
      <div>
        {!showLargeImage ? (
          <img src='https://hono.dev/images/logo.png' />
        ) : (
          <div
            class={css`
              ${transitionNameClass}
              background: url('https://hono.dev/images/logo-large.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 600px;
              height: 600px;
              position: relative;
              ${isUpdating &&
              css`
                &:before {
                  content: 'Loading...';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                }
              `}
            `}
          ></div>
        )}
      </div>
    </>
  )
}
```

1. The `useViewTransition` function is used to create a view transition. The `startViewTransition` function is called when the button is clicked, triggering a state change that toggles the `showLargeImage` state.
2. The `viewTransition` function is used to define the transition animation. The `rotate` keyframes are used for the animation.
3. The `useState` function is used to manage the `showLargeImage` state. This state determines whether the large image or the small image is displayed.

- The `useViewTransition` and `viewTransition` functions are part of Hono's JSX Runtime for Client Components. Using this will result in smaller bundled results than using `hono/jsx`.

- [Hono Documentation](https://hono.dev)

- Creating animated transitions between views in a single-page application.

**Reasoning:** This rule is important as it demonstrates how to use Hono's `useViewTransition` and `viewTransition` functions to create a view transition with a rotation animation. It also shows how to use the `useState` function to manage state within a component, and how to conditionally render components based on state.

*Source: docs/guides/jsx-dom.md*

### Configuring JSX Runtime for Client Components in Hono

This guide demonstrates how to configure the JSX runtime for client components in Hono framework. Using this configuration will result in smaller bundled results than using `hono/jsx`.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx/dom"
  }
}
```

This configuration tells the compiler to use 'react-jsx' for JSX and to import JSX from 'hono/jsx/dom'.

- This configuration should be specified in 'tsconfig.json'.
- For Deno, modify the deno.json.

- [Hono Documentation](https://hono.io/docs)

- When you want to optimize the bundle size of your Hono application.
- When you are building client components in Hono.

**Reasoning:** This rule is important as it demonstrates how to configure the JSX runtime for client components in Hono framework. It shows how to specify 'hono/jsx/dom' in 'tsconfig.json' for smaller bundled results. It also provides an alternative way to specify 'hono/jsx/dom' in the esbuild transform options in 'vite.config.ts'.

*Source: docs/guides/jsx-dom.md*

### Specifying JSX Import Source in Vite Configuration for Hono

When using the Hono framework with Vite, you can specify the JSX import source in the Vite configuration file. This is necessary for correctly compiling JSX syntax in a Hono project.

Here is a code snippet demonstrating this:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'hono/jsx/dom',
  },
})
```

In this code snippet, we import the `defineConfig` function from Vite and use it to export a configuration object. Inside this object, we specify the `jsxImportSource` option under the `esbuild` property. This tells Vite to use 'hono/jsx/dom' as the source for JSX imports.

- Make sure to install the necessary dependencies for using JSX with Hono and Vite.

- [Vite Configuration Guide](https://vitejs.dev/config/)

- Use this configuration when you want to use JSX syntax in a Hono project that is built with Vite.

**Reasoning:** This rule is important as it demonstrates how to specify the JSX import source in the Vite configuration file when using the Hono framework. This is crucial for correctly compiling JSX syntax in a Hono project.

*Source: docs/guides/jsx-dom.md*

### Configuring TypeScript Compiler for JSX in Hono

This code demonstrates how to configure the TypeScript compiler to use JSX syntax in a Hono project.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

In the `tsconfig.json` file, we set the 'jsx' compiler option to 'react-jsx' and 'jsxImportSource' to 'hono/jsx'. This instructs the TypeScript compiler to transform JSX syntax into JavaScript that can be understood by the Hono framework.

- This configuration is necessary if you are using JSX syntax in your Hono project.
- If you are using Deno, you should modify the `deno.json` instead of the `tsconfig.json`.

- [TypeScript Handbook: JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)

- Developing a Hono project that uses JSX syntax for UI description.

**Reasoning:** This rule is important as it demonstrates how to configure the TypeScript compiler to use JSX syntax in a Hono project. JSX is a syntax extension for JavaScript, primarily used with React to describe what the UI should look like. By setting the 'jsx' compiler option to 'react-jsx' and 'jsxImportSource' to 'hono/jsx', we instruct the TypeScript compiler to transform JSX syntax into JavaScript that can be understood by the Hono framework.

*Source: docs/guides/jsx.md*

### Configuring JSX for Hono

When using JSX with the Hono framework, you need to modify the `tsconfig.json` or `deno.json` file to specify the JSX syntax and import source.

For TypeScript, the `tsconfig.json` should look like this:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
ts
/** @jsx jsx */
/** @jsxImportSource hono/jsx */
json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "hono/jsx"
  }
}
```

The `jsx` option in the compiler options specifies the JSX factory function to use when targeting react JSX emit. The `jsxImportSource` option specifies the module specifier to use when importing the JSX factory functions when targeting react JSX emit.

- Make sure to use the correct file (`tsconfig.json` for TypeScript, `deno.json` for Deno) and correct options (`react-jsx` for TypeScript, `precompile` for Deno).

- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig#jsx)
- [Deno Compiler Options](https://deno.land/manual/getting_started/typescript#compiler-options)

- Using JSX syntax in a Hono project

#### Code Snippet

```typescript

Alternatively, you can use pragma directives at the top of your TypeScript file:

```

**Reasoning:** This rule is important as it demonstrates how to configure the TypeScript or Deno compiler to use JSX syntax with the Hono framework. JSX is a syntax extension for JavaScript, often used with React, that allows for writing HTML-like code in your JavaScript code. Hono also supports JSX, but it needs to be enabled in the compiler options.

*Source: docs/guides/jsx.md*

### Configuring JSX Compiler Options in Hono

This code snippet demonstrates how to configure the compiler options for JSX in Hono.

```json
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "hono/jsx"
  }
}
```

In the `compilerOptions` object, `jsx` is set to `precompile` which means the TypeScript compiler will convert JSX syntax to JavaScript. The `jsxImportSource` is set to `hono/jsx`, which specifies the module to import JSX functions from.

- This configuration is necessary to use JSX syntax in Hono.
- For Deno, you have to modify the `deno.json` instead of the `tsconfig.json`.

- [Hono JSX Documentation](https://hono.io/docs/jsx)

- When you want to use JSX syntax in your Hono project, you need to configure the compiler options as shown.

**Reasoning:** This rule is important as it demonstrates how to configure the compiler options for JSX in Hono. It shows how to set the JSX processing mode and specify the module to import JSX functions from, which is crucial for using JSX syntax in Hono.

*Source: docs/guides/jsx.md*

### Creating a Basic Hono Application with JSX

This code snippet demonstrates how to create a basic Hono application using JSX syntax.

```tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  )
}

const Top: FC<{ messages: string[] }> = (props: {
  messages: string[]
}) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>
        })}
      </ul>
    </Layout>
  )
}

app.get('/', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})

export default app
```

1. We first import the necessary modules from Hono and define a new Hono application.
2. We then define two functional components, `Layout` and `Top`, using the `FC` (Functional Component) type from Hono's JSX module.
3. The `Layout` component takes in `props` and returns an HTML structure with `{props.children}` as the body content.
4. The `Top` component takes in `props` with a `messages` array and returns the `Layout` component with a list of messages.
5. In the Hono route handler for the root path (`/`), we return the `Top` component with a `messages` array as the HTML response.

- The `FC` type is used to define functional components in Hono with TypeScript.
- The `props` argument in functional components is used to pass data to the components.

- [Hono Documentation](https://hono.bun.js.org/)

- Creating dynamic HTML responses in Hono routes using JSX syntax.

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application with JSX syntax. It shows how to define functional components, how to pass props to components, and how to use these components to render HTML responses in Hono routes.

*Source: docs/guides/jsx.md*

### Using Fragments to Group Multiple Elements in Hono

In Hono, you can use Fragments to group multiple elements without adding extra nodes to the DOM. This is useful for maintaining a clean and efficient DOM structure.

Here is an example of how to use Fragments:

```tsx
import { Fragment } from 'hono/jsx'

const List = () => (
  <Fragment>
    <p>first child</p>
    <p>second child</p>
    <p>third child</p>
  </Fragment>
)
tsx
const List = () => (
  <>
    <p>first child</p>
    <p>second child</p>
    <p>third child</p>
  </>
)
```

- Fragments are a way to return multiple elements from a component without adding extra nodes to the DOM.
- The alternative syntax for Fragments (`<></>`) can be used if it is set up properly.

- [Hono Documentation](https://hono.dev/docs)

- When you need to return multiple elements from a component but don't want to add extra nodes to the DOM.

#### Code Snippet

```typescript

Alternatively, you can use a more concise syntax for Fragments if it is set up properly:

```

**Reasoning:** This rule is important as it demonstrates how to group multiple elements in Hono without adding extra nodes to the DOM. This is crucial for maintaining a clean and efficient DOM structure. It also shows an alternative syntax for Fragments, which can be useful for developers who prefer a more concise syntax.

*Source: docs/guides/jsx.md*

### Using Fragments and PropsWithChildren in Hono

In Hono, you can use Fragments to group a list of children without adding extra nodes to the DOM. This can be done using the `<Fragment>` tag or the shorthand `<>` if it is set up properly.

```tsx
const List = () => (
  <>
    <p>first child</p>
    <p>second child</p>
    <p>third child</p>
  </>
)
tsx
import { PropsWithChildren } from 'hono/jsx'

type Post = {
  id: number
}
```

- Always use `PropsWithChildren` when you need to infer a child element in a function component for type safety.
- Use Fragments when you need to return multiple elements from a component.

- [Hono Documentation](https://hono.io/docs)

- Grouping multiple elements in a component without adding extra nodes to the DOM.
- Inferring child elements in a function component for type safety and reusability.

#### Code Snippet

```typescript

In addition, Hono provides `PropsWithChildren` to correctly infer a child element in a function component. This is crucial for type safety and component reusability.

```

**Reasoning:** This rule is important as it demonstrates how to use Fragments and PropsWithChildren in Hono. Fragments let you group a list of children without adding extra nodes to the DOM. PropsWithChildren is used to correctly infer a child element in a function component, which is crucial for type safety and component reusability.

*Source: docs/guides/jsx.md*

### Using PropsWithChildren in Hono

In Hono, you can use `PropsWithChildren` to correctly infer a child element in a function component. This is particularly useful when you want to create a component that accepts children elements.

Here is an example:

```tsx
import { PropsWithChildren } from 'hono/jsx'

type Post = {
  id: number
  title: string
}

function Component({ title, children }: PropsWithChildren<Post>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

In this code snippet:

1. We import `PropsWithChildren` from 'hono/jsx'.
2. We define a type 'Post' with properties 'id' and 'title'.
3. We create a function component 'Component' that takes 'title' and 'children' as props. The type of the props is 'PropsWithChildren<Post>'.
4. In the return statement of the function, we render a 'div' element with a 'h1' element and the 'children' elements.

- 'PropsWithChildren' is a utility type provided by Hono. It takes a type and adds a 'children' property to it.
- The 'children' property can be any valid JSX element or an array of JSX elements.

- [Hono Documentation](https://hono.io/docs/jsx)

- Creating a wrapper component that accepts children elements.
- Creating a layout component that accepts children elements.

**Reasoning:** This rule is important as it demonstrates how to use 'PropsWithChildren' in Hono to correctly infer a child element in a function component. This is a common pattern in Hono when you want to create a component that accepts children elements.

*Source: docs/guides/jsx.md*

### Inserting Raw HTML in Hono

In Hono, you can directly insert HTML into a component using the `dangerouslySetInnerHTML` property. This is a powerful feature but should be used with caution due to potential security risks associated with inserting raw HTML.

Here is a code snippet demonstrating this:

```tsx
app.get('/foo', (c) => {
  const inner = { __html: 'JSX &middot; SSR' }
  const Div = <div dangerouslySetInnerHTML={inner} />
})
```

In this example, a raw HTML string 'JSX &middot; SSR' is inserted into a div component. The HTML string is wrapped in an object with a `__html` key, which is then passed to the `dangerouslySetInnerHTML` property.

- Always sanitize any user-supplied input to prevent Cross-Site Scripting (XSS) attacks.
- Avoid using `dangerouslySetInnerHTML` if possible. It is much safer to use JSX to compose your components.

- [Hono Documentation](https://hono.dev/docs)

- Displaying server-rendered HTML content
- Inserting third-party content that requires HTML formatting

**Reasoning:** This rule is important as it demonstrates how to insert raw HTML directly into a component using the 'dangerouslySetInnerHTML' property in Hono. This is a powerful feature but should be used with caution due to potential security risks associated with inserting raw HTML.

*Source: docs/guides/jsx.md*

### Optimizing Hono Components with Memoization

In Hono, you can optimize your components by memoizing computed strings using `memo`. This practice can significantly improve the performance of your application by avoiding unnecessary re-rendering of components.

Here is an example of how to use `memo` in Hono:

```tsx
import { memo } from 'hono/jsx'

const Header = memo(() => <header>Welcome to Hono</header>)
const Footer = memo(() => <footer>Powered by Hono</footer>)
const Layout = (
  <div>
    <Header />
    <p>Hono is cool!</p>
    <Footer />
  </div>
)
```

In this example, the `Header` and `Footer` components are wrapped with `memo`, which means that these components will only re-render if their props change. This can be particularly useful in cases where your components are expensive to render.

- Be careful when using `memo` as it can lead to unexpected behavior if not used correctly. Make sure that you only use it on components that are expensive to render and that you test your application thoroughly.

- [Hono Documentation](https://hono.dev/docs)

- Use `memo` to optimize components that are expensive to render.
- Use `memo` to prevent unnecessary re-renders when the props of your components do not change.

**Reasoning:** This rule is important as it demonstrates how to optimize Hono components by memoizing computed strings using `memo`. This practice can significantly improve the performance of your application by avoiding unnecessary re-rendering of components.

*Source: docs/guides/jsx.md*

### Using useContext to Share Data Globally in Hono

This code snippet demonstrates how to use the useContext hook in Hono to share data globally across any level of the Component tree without passing values through props.

```tsx
import type { FC } from 'hono/jsx'
import { createContext, useContext } from 'hono/jsx'

const themes = {
  light: {
    color: '#000000',
    background: '#eeeeee',
  },
  dark: {
    color: '#ffffff',
    background: '#222222',
  },
}

const ThemeContext = createContext(themes.light)

const Button: FC = () => {
  const theme = useContext(ThemeContext)
  return <button style={theme}>Push!</button>
}

const Toolbar: FC = () => {
  return (
    <div>
      <Button />
    </div>
  )
}

// ...

app.get('/', (c) => {
  return c.html(
    <div>
      <ThemeContext.Provider value={themes.dark}>
        <Toolbar />
      </ThemeContext.Provider>
    </div>
  )
})
```

1. A context is created using `createContext` and a default value is provided.
2. The `useContext` hook is used within a component to access the current value of the context.
3. The context provider is used to set a new value for the context within a certain part of the component tree.

- The useContext hook can only be used within a function component.
- The value provided to the context provider will be used by all descendants of the provider that use the useContext hook.

- [Hono documentation](https://hono.dev/docs)

- Sharing theme information across an application
- Sharing user data or other global state

**Reasoning:** This rule is important as it demonstrates how to use the useContext hook in Hono to share data globally across any level of the Component tree without passing values through props. This is a common pattern in Hono and other similar frameworks, and understanding it can greatly simplify the process of passing data around in a complex application.

*Source: docs/guides/jsx.md*

### Creating and Using Asynchronous Components in Hono

In Hono, you can create asynchronous components using the `async`/`await` syntax. When you render it with `c.html()`, it will await automatically. This allows for non-blocking operations, improving the performance and user experience of the application.

Here is a code snippet demonstrating this:

```tsx
const AsyncComponent = async () => {
  await new Promise((r) => setTimeout(r, 1000)) // sleep 1s
  return <div>Done!</div>
}

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        <AsyncComponent />
      </body>
    </html>
  )
})
```

In this code snippet, `AsyncComponent` is an asynchronous component that waits for 1 second before returning a div with the text 'Done!'. When this component is rendered using `c.html()`, it will automatically wait for the promise to resolve before rendering.

- Asynchronous components in Hono are useful for operations that may take some time, such as fetching data from an API.
- Be careful when using asynchronous components as they can lead to unexpected behavior if not handled properly. Always make sure to handle potential errors and consider what should be displayed while the component is loading.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Fetching data from an API before rendering a component.
- Performing calculations or other operations that may take some time before rendering a component.

**Reasoning:** This rule is important as it demonstrates how to create and use asynchronous components in Hono. Asynchronous components allow for non-blocking operations, improving the performance and user experience of the application.

*Source: docs/guides/jsx.md*

### Using Suspense with renderToReadableStream in Hono

This code snippet demonstrates how to use Suspense with renderToReadableStream in Hono. Suspense allows you to specify a fallback UI to display while a component is loading, and renderToReadableStream allows you to render your JSX to a Node.js readable stream.

```tsx
import { renderToReadableStream, Suspense } from 'hono/jsx/streaming'

//...

app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <Suspense fallback={<div>loading...</div>}>
          <Component />
        </Suspense>
      </body>
    </html>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})
```

1. The `renderToReadableStream` function is used to render the JSX to a Node.js readable stream.
2. The `Suspense` component is used to specify a fallback UI to display while the `Component` is loading.
3. The `c.body` function is used to set the response body to the stream and the response headers.

- The 'Content-Type' header is set to 'text/html; charset=UTF-8' to indicate that the response is an HTML document.
- The 'Transfer-Encoding' header is set to 'chunked' to indicate that the response body will be sent in chunks.

- [Hono documentation](https://hono.dev/docs/guides/jsx)

- Providing a fallback UI while a component is loading.
- Rendering JSX to a Node.js readable stream.

**Reasoning:** This rule is important as it demonstrates how to use Suspense with renderToReadableStream in Hono to handle asynchronous operations and provide a fallback UI while the component is loading. It also shows how to set the response headers for the stream.

*Source: docs/guides/jsx.md*

### Error Handling in Hono using ErrorBoundary

In Hono, you can catch errors in child components using `ErrorBoundary`. This is useful to provide a fallback UI in case of an error, ensuring a better user experience and application stability.

Here is an example of how to use it:

```tsx
function SyncComponent() {
  throw new Error('Error')
  return <div>Hello</div>
}

app.get('/sync', async (c) => {
  return c.html(
    <html>
      <body>
        <ErrorBoundary fallback={<div>Out of Service</div>}>
          <SyncComponent />
        </ErrorBoundary>
      </body>
    </html>
  )
})
```

In this example, if an error occurs in `SyncComponent`, the `ErrorBoundary` will catch it and display the fallback UI (`<div>Out of Service</div>`).

Important notes:
- `ErrorBoundary` can also be used with async components and `Suspense`.
- The fallback UI can be any React component.

Common use cases include providing a user-friendly error message or a retry button when an error occurs in a component.

**Reasoning:** This rule is important as it demonstrates how to handle errors in child components using the ErrorBoundary component in Hono. It shows how to provide a fallback UI in case of an error, ensuring a better user experience and application stability.

*Source: docs/guides/jsx.md*

### Handling Errors and Loading States in Asynchronous Components with Hono

In Hono, you can handle errors and loading states in asynchronous components using the ErrorBoundary and Suspense components. The ErrorBoundary component catches JavaScript errors anywhere in their child component tree, logs those errors, and displays a fallback UI. The Suspense component lets you specify a loading state while some suspended component is waiting to render.

Here's an example of how you can use these components:

```tsx
async function AsyncComponent() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  throw new Error('Error')
  return <div>Hello</div>
}

app.get('/with-suspense', async (c) => {
  return c.html(
    <html>
      <body>
        <ErrorBoundary fallback={<div>Out of Service</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <AsyncComponent />
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  )
})
```

In this example, if an error is thrown in the AsyncComponent, the ErrorBoundary will catch it and display 'Out of Service'. If the AsyncComponent is still loading, the Suspense component will display 'Loading...'.

- Error boundaries do not catch errors for:
  - Event handlers
  - Asynchronous code (e.g. setTimeout or requestAnimationFrame callbacks)
  - Server side rendering
  - Errors thrown in the error boundary itself (rather than its children)

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html)

- When you want to handle errors in a component and provide a fallback UI
- When you want to display a loading state while a component is being loaded

**Reasoning:** This rule is important as it demonstrates how to handle errors and loading states in asynchronous components using Hono's JSX and html middlewares. It shows how to use the ErrorBoundary and Suspense components to provide fallback UI when an error occurs or while the component is loading respectively.

*Source: docs/guides/jsx.md*

### Integration of JSX and html middlewares in Hono

This rule demonstrates how to integrate JSX and html middlewares in Hono for powerful templating.

Here is the code snippet:

```tsx
import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono()

interface SiteData {
  title: string
  children?: any
}

const Layout = (props: SiteData) =>
  html`<!doctype html>
    <html>
      <head>
        <title>${props.title}</title>
      </head>
      <body>
        ${props.children}
      </body>
    </html>`

const Content = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>Hello {props.name}</h1>
  </Layout>
)

app.get('/:name', (c) => {
  const { name } = c.req.param()
  const props = {
    name: name,
    siteData: {
      title: 'JSX with html sample',
    },
  }
  return c.html(<Content {...props} />)
})

export default app
```

1. The `SiteData` interface is defined to structure the site data.
2. The `Layout` component is created using the `html` middleware and the `SiteData` interface.
3. The `Content` component is created using the `Layout` component and additional props.
4. In the route handler, the `Content` component is used to return HTML content.

- The `html` middleware is used to create HTML templates in Hono.
- JSX is used to create components in Hono.

- [Hono html middleware documentation](/docs/helpers/html)
- [Hono JSX Renderer Middleware documentation](/docs/middleware/builtin/jsx-renderer)

- Creating HTML pages in Hono using JSX and html middlewares.
- Structuring site data using interfaces in TypeScript.

**Reasoning:** This rule is important as it demonstrates how to integrate JSX and html middlewares in Hono for powerful templating. It shows how to define interfaces for site data, create layout and content components using these interfaces, and use these components in a route handler to return HTML content.

*Source: docs/guides/jsx.md*

### Overriding JSX Type Definitions in Hono

In Hono, you can override the JSX type definitions to include your own custom elements and attributes. This is useful when you want to use your own custom elements in your JSX code.

Here is an example of how to do this:

```ts
declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'my-custom-element': HTMLAttributes & {
        'x-event'?: 'click' | 'scroll'
      }
    }
  }
}
```

In this code snippet, a new custom element called 'my-custom-element' is added to the JSX type definitions. This custom element has an attribute 'x-event' which can take the values 'click' or 'scroll'.

The 'declare module' statement is used to extend the module 'hono/jsx'. Inside this, a new namespace 'JSX' is declared. Inside this namespace, the 'IntrinsicElements' interface is extended to include the new custom element and its attributes.

- The custom element name should be a string.
- The custom attribute names should be strings and their possible values should be specified.

- [Hono Documentation](https://hono.beyondco.de/docs/guides/jsx)

- When you want to use your own custom elements in your JSX code.
- When you want to add new attributes to existing elements.

**Reasoning:** This rule is important as it demonstrates how to extend the JSX type definitions in Hono to include custom elements and attributes. This is useful when you want to add your own custom elements and their attributes to the JSX type definitions, which allows you to use them in your JSX code.

*Source: docs/guides/jsx.md*