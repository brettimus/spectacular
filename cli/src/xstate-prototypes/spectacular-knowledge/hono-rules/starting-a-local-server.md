## Starting a Local Server

Once the package installation is complete, the following commands can be used to start a local server.

```

**Reasoning:** This rule is important as it demonstrates how to navigate to the application directory and install dependencies using different package managers. It also shows how to start a local server. Understanding this is crucial for setting up and running a Hono application.

*Source: docs/getting-started/basic.md*

### Creating a Basic Hono Application

This code snippet demonstrates how to create a basic Hono application.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

1. The Hono module is imported.
2. A new instance of Hono is created.
3. A GET route is defined on the root path ('/'). When this route is hit, it returns a text response 'Hello Hono!'.
4. The Hono application is exported.

The `import` and the final `export default` parts may vary from runtime to runtime, but all of the application code will run the same code everywhere.

- [Hono Documentation](https://hono.bun.dev/)

- Creating a new Hono application
- Defining routes in a Hono application

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application. It shows how to import the Hono module, instantiate it, define a route, and export the application. This is a fundamental pattern in Hono framework usage that every developer should understand.

*Source: docs/getting-started/basic.md*

### Basic Setup and Usage of Hono Web Framework

This code demonstrates the basic setup and usage of the Hono web framework.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
sh
npm run dev
sh
yarn dev
sh
pnpm dev
sh
bun run dev
```

Then, access `http://localhost:8787` with your browser.

1. The `Hono` class is imported from the 'hono' module.
2. A new instance of `Hono` is created and assigned to the `app` variable.
3. The `get` method of the `app` object is used to define a route that responds to HTTP GET requests at the root URL ('/'). The route handler function takes a context object `c` and returns a text response 'Hello Hono!'.
4. The `app` object is exported for use in other modules.

- The route handler function can return a response in different formats, such as text, HTML, or JSON, using the appropriate methods of the context object.

- [Hono documentation](https://hono.bun.dev/)

- Building a simple web server with Hono
- Defining routes and route handlers in a Hono application

#### Code Snippet

```typescript

To start the development server, use one of the following commands based on your package manager:

```

**Reasoning:** This rule is important as it demonstrates the basic setup and usage of the Hono web framework. It shows how to create a new Hono application, define a simple GET route, and start the development server. Understanding this basic pattern is crucial for building applications with Hono.

*Source: docs/getting-started/basic.md*

### Handling GET Requests and Returning JSON Response in Hono

This code snippet demonstrates how to handle a GET request and return a JSON response in the Hono framework.

```ts
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  })
})
```

In this code snippet, `app.get` is used to handle a GET request to the `/api/hello` endpoint. The callback function takes a context object `c` as an argument, which is used to return a JSON response using `c.json` method.

The `c.json` method sets the Content-Type header to `application/json` and sends the response.

- [Hono Documentation](https://hono.bayrell.org/en/)

This pattern is commonly used when building APIs that need to return JSON data.

**Reasoning:** This rule is important as it demonstrates how to handle a GET request and return a JSON response in the Hono framework. Understanding this rule is crucial for building APIs that return JSON data.

*Source: docs/getting-started/basic.md*

### Handling GET Requests and Manipulating Responses in Hono

The following code snippets demonstrate how to handle GET requests and manipulate responses in Hono.

To handle a GET request to `/api/hello` and return a JSON response, you can use the `get` method of the `app` object and the `json` method of the context `c`:

```ts
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  })
})
ts
app.get('/posts/:id', (c) => {
  const page = c.req.query('page')
  const id = c.req.param('id')
  c.header('X-Message', 'Hi!')
  return c.text(`You want to see ${page} of ${id}`)
})
```

In Hono, the `app.get` method is used to handle GET requests. The first argument is the path, and the second argument is a callback function that takes a context `c` as its argument. The context `c` has several methods to manipulate the request and the response. The `req.query` method is used to get a URL query value, the `req.param` method is used to get a path parameter, and the `header` method is used to append a response header.

- The `req.query` and `req.param` methods return `undefined` if the specified query or parameter does not exist.
- The `header` method does not return anything.

- [Hono Documentation](https://hono.boutell.com/)

- Building APIs that handle GET requests.
- Building APIs that need to extract path parameters and query values.
- Building APIs that need to manipulate response headers.

#### Code Snippet

```typescript

To get a path parameter, a URL query value, and append a response header, you can use the `req` and `header` methods of the context `c`:

```

**Reasoning:** This rule is important as it demonstrates how to handle GET requests, extract path parameters and query values, and append response headers in Hono. Understanding this rule is crucial for building APIs with Hono as it forms the basis of request-response handling.

*Source: docs/getting-started/basic.md*

### Handling Different HTTP Methods and Responses in Hono

This code snippet demonstrates how to handle different HTTP methods such as GET, POST, DELETE in Hono framework. It also shows how to extract parameters from the request and how to set headers and return responses in different formats.

```ts
app.get('/posts/:id', (c) => {
  const page = c.req.query('page')
  const id = c.req.param('id')
  c.header('X-Message', 'Hi!')
  return c.text(`You want to see ${page} of ${id}`)
})

app.post('/posts', (c) => c.text('Created!', 201))
app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)
```

1. `app.get`, `app.post`, `app.delete` are used to handle GET, POST, DELETE requests respectively.
2. `c.req.query` is used to get query parameters from the request.
3. `c.req.param` is used to get route parameters from the request.
4. `c.header` is used to set response headers.
5. `c.text` is used to return a text response.

- Make sure to return a response in the handler function, otherwise the request will hang.

- [Hono Documentation](https://hono.boutell.com/)

- Building RESTful APIs with different HTTP methods.
- Returning different types of responses based on the request.

**Reasoning:** This rule is important as it demonstrates how to handle different HTTP methods such as GET, POST, DELETE in Hono framework. It also shows how to extract parameters from the request and how to set headers and return responses in different formats.

*Source: docs/getting-started/basic.md*

### Handling HTTP Methods and Returning HTML in Hono

This code snippet demonstrates how to handle different HTTP methods and return HTML or JSX in a Hono application.

```ts
app.post('/posts', (c) => c.text('Created!', 201))
app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)
tsx
const View = () => {
  return (
    <html>
      <body>
        <h1>Hello Hono!</h1>
      </body>
    </html>
  )
}

app.get('/page', (c) => {
  return c.html(<View />)
})
```
In the above code, we define a GET route that returns an HTML response. The HTML is defined using JSX syntax.

- To use JSX, rename the file to `src/index.tsx` and configure it. The configuration may vary depending on the runtime.
- You can also write HTML using the html Helper.

- [Hono Documentation](https://hono.boutell.com/)

- Building RESTful APIs with different HTTP methods.
- Returning HTML or JSX from a Hono application.

#### Code Snippet

```typescript
In the above code, we define routes for POST and DELETE methods. The POST route creates a new post and returns a text response with status code 201. The DELETE route deletes a post with a specific id and returns a text response.

```

**Reasoning:** This rule is important as it demonstrates how to handle different HTTP methods such as POST, DELETE and GET in Hono, and how to return HTML or JSX from a Hono application. Understanding these patterns is crucial for building web applications using the Hono framework.

*Source: docs/getting-started/basic.md*

### Creating a Basic Hono Application, Returning Raw Responses and Using Middleware

This rule demonstrates how to create a basic Hono application, return raw responses and use middleware for tasks like authentication.

```tsx
const View = () => {
  return (
    <html>
      <body>
        <h1>Hello Hono!</h1>
      </body>
    </html>
  )
}

app.get('/page', (c) => {
  return c.html(<View />)
})
ts
app.get('/', () => {
  return new Response('Good morning!')
})
ts
import { basicAuth
```

1. The `View` function returns a JSX component which is rendered as HTML.
2. The `app.get` function sets up a route handler for the '/page' route, which returns the rendered HTML.
3. The raw Response can be returned directly from the route handler.
4. Middleware functions can be imported and used to handle common tasks like authentication.

- JSX components must be transpiled to JavaScript before they can be used in a Hono application.
- Middleware functions are executed in the order they are defined.

- [Hono Documentation](https://hono.bayfront.cloud/)
- [MDN Response Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Response)

- Building a simple web page with Hono
- Returning raw responses for simple text responses
- Using middleware for authentication

#### Code Snippet

```typescript

You can also return the raw Response.

```

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application, return raw responses and use middleware for tasks like authentication. Understanding these concepts is crucial for building and managing applications using the Hono framework.

*Source: docs/getting-started/basic.md*

### Using Middleware for Basic Authentication in Hono

This code snippet demonstrates how to use middleware in Hono to add Basic Authentication to a route.

```ts
import { basicAuth } from 'hono/basic-auth'

// ...

app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
)

app.get('/admin', (c) => {
  return c.text('You are authenticated!')
})
```

The `app.use` function is used to apply middleware to routes. The first argument is the route pattern, and the second argument is the middleware function. In this case, the `basicAuth` middleware is used, which requires a username and password.

- Middleware functions are executed in the order they are added.
- Middleware can be applied to specific routes or to all routes.

- [Hono Documentation](https://hono.beyondnlp.com/)

- Protecting routes with Basic Authentication
- Applying logging or error handling middleware to all routes

**Reasoning:** This rule is important as it demonstrates how to use middleware in Hono for adding Basic Authentication to routes. Middleware can handle complex tasks and improve code reusability and organization. In this case, the basicAuth middleware is used to protect the '/admin/*' route by requiring a username and password.

*Source: docs/getting-started/basic.md*

### Using Middleware and Adapters in Hono

This code snippet demonstrates the use of built-in and third-party middleware in Hono, as well as handling platform-dependent functions using Adapters.

```text
There are useful built-in middleware including Bearer and authentication using JWT, CORS and ETag.
Hono also provides third-party middleware using external libraries such as GraphQL Server and Firebase Auth.
And, you can make your own middleware.

There are Adapters for platform-dependent functions, e.g., handling static files or WebSocket.
For example, to handle WebSocket in Cloudflare Workers, import `hono/cloudflare-workers`.
```

Middleware in Hono can be used to handle requests and responses. Built-in middleware includes Bearer and JWT authentication, CORS, and ETag. Hono also supports third-party middleware from external libraries such as GraphQL Server and Firebase Auth. You can also create custom middleware.

Adapters in Hono are used for platform-dependent functions, such as handling static files or WebSocket. For instance, to handle WebSocket in Cloudflare Workers, you can import the `hono/cloudflare-workers` Adapter.

- Middleware is crucial for handling requests and responses in Hono.
- Adapters allow for platform-specific functionality in Hono.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Using built-in middleware for authentication, CORS, and ETag.
- Using third-party middleware from external libraries.
- Handling platform-dependent functions using Adapters.

**Reasoning:** This rule is important as it demonstrates how to use built-in and third-party middleware in Hono, and how to handle platform-dependent functions using Adapters. Middleware is crucial for handling requests and responses, while Adapters allow for platform-specific functionality.

*Source: docs/getting-started/basic.md*

### Creating a New Project Directory in Vite

This code snippet demonstrates how to create a new project directory when starting a new Vite project.

```sh
mkdir my-app
cd my-app
```

1. `mkdir my-app`: This command creates a new directory named 'my-app'.
2. `cd my-app`: This command changes the current working directory to 'my-app'.

- Ensure you have the necessary permissions to create and access the directory.

- [Vite Documentation](https://vitejs.dev/guide/)

- Starting a new Vite project
- Creating a new directory for any project

**Reasoning:** This rule is important as it demonstrates the initial steps to create a new project directory for a Vite project. Understanding these steps is crucial for setting up the project structure correctly.

*Source: docs/getting-started/service-worker.md*

### Creating a Basic package.json File in Hono

The following code snippet demonstrates how to create a basic `package.json` file for a new project in Hono:

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "vite dev"
  },
  "type": "module"
}
```

1. `name`: This is the name of your application. It should be lowercase and one word, but hyphens and underscores can be used.
2. `private`: This is a safety measure to prevent accidental publication of private repositories. When set to true, this option prevents the package from being accidentally published on npm.
3. `scripts`: This is where you can define script commands that are part of your application's lifecycle. In this case, the `dev` command is used to start the development server.
4. `type`: This field signifies that the code should be treated as ECMAScript modules.

- The `package.json` file is a crucial part of any Node.js project and should be set up correctly.

- [npm documentation on package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)

- Setting up a new Node.js project
- Defining project metadata and configuration

**Reasoning:** This rule is important as it demonstrates how to set up a basic package.json file for a new project in Hono. The package.json file is a crucial part of any Node.js project as it holds various metadata relevant to the project. This file is used to give information to npm that allows it to identify the project as well as handle the project's dependencies. It can also contain other metadata such as a project description, the version of the project in a particular distribution, license information, even configuration data - all of which can be vital to both npm and to the end users of the package.

*Source: docs/getting-started/service-worker.md*

### Setting up a new Hono project

When starting a new Hono project, it's necessary to create a `package.json` and a `tsconfig.json` file with the appropriate configurations.

The `package.json` file should look like this:

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "vite dev"
  },
  "type": "module"
}
json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "WebWorker"],
    "moduleResolution": "bundler"
  },
  "include": ["./"],
  "exclude": ["node_modules"]
}
sh
npm i hono
npm i -D vite
sh
yarn add hono
yarn add -D vite
sh
pnpm add hono
pnpm add -D vite
```

This setup is crucial for the proper functioning of a Hono project.

#### Code Snippet

```typescript

The `tsconfig.json` file should look like this:

```

**Reasoning:** This rule is important as it demonstrates how to set up a new Hono project with the necessary configuration files and dependencies. The `package.json` file is used to define the project and its scripts, while the `tsconfig.json` file is used to specify the TypeScript compiler options. The installation commands show how to add the Hono and Vite packages to the project.

*Source: docs/getting-started/service-worker.md*

### Installing Hono and Setting Up a Basic Page

This code snippet demonstrates how to install the Hono framework and its dependencies using different package managers, and how to set up a basic 'Hello World' page.

```sh
npm i hono
npm i -D vite
sh
yarn add hono
yarn add -D vite
sh
pnpm add hono
pnpm add -D vite
sh
bun add hono
bun add -D vite
html
<!doctype html>
<html>
  <body>
    <a href="/sw">Hello World by Service Worker</a>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

The first part of the code installs Hono and its dependencies using npm, yarn, pnpm, or bun. The `-D` flag in the installation command is used to save the package for development purpose only.

The second part of the code sets up a basic 'Hello World' page. The `index.html` file is edited to include a link that displays 'Hello World by Service Worker' and a script tag that links to `main.ts`.

- Make sure to install the correct version of Hono and its dependencies.
- The `main.ts` file should be properly set up for the script tag in `index.html` to work correctly.

- [Hono Documentation](https://hono.bike/docs)

- Setting up a new Hono project
- Installing dependencies for a Hono project

#### Code Snippet

```typescript

or

```

**Reasoning:** This rule is important as it demonstrates how to install the Hono framework and its dependencies using different package managers, and how to set up a basic 'Hello World' page using Hono. Understanding this rule is crucial for developers to get started with Hono and to understand the basic structure of a Hono application.

*Source: docs/getting-started/service-worker.md*

### Registering a Hono Application to the Fetch Event with Service Worker Adapter's Handle Function

This code snippet demonstrates how to create an application using Hono and register it to the `fetch` event with the Service Worker adapter’s `handle` function. This allows the Hono application to intercept access to `/sw`.

```ts
// To support types
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope

import { Hono } from 'hono'
import { handle } from 'hono/service-worker'
```

1. The `declare const self: ServiceWorkerGlobalScope` line is used to support types in TypeScript.
2. The `Hono` and `handle` functions are imported from the `hono` and `hono/service-worker` modules respectively.
3. The `handle` function is used to register the Hono application to the `fetch` event. This allows the application to intercept access to `/sw`.

- This setup is necessary for applications that need to use service workers for tasks like caching, offline functionality, etc.

- [TypeScript Issue #14877](https://github.com/microsoft/TypeScript/issues/14877)

- Caching assets for offline use
- Intercepting and modifying requests
- Background data synchronization

**Reasoning:** This rule is important as it demonstrates how to create an application using Hono and register it to the `fetch` event with the Service Worker adapter’s `handle` function. This is crucial for intercepting access to certain routes in the application, in this case `/sw`, which can be useful for caching strategies, offline functionality, or other service worker use cases.

*Source: docs/getting-started/service-worker.md*

### Setting Up a Basic Service Worker and Running the Development Server in Hono

This code snippet demonstrates how to set up a basic service worker using the Hono framework, and how to start the development server.

```text
import { Hono } from 'hono'
import { handle } from 'hono/service-worker'

const app = new Hono().basePath('/sw')
app.get('/', (c) => c.text('Hello World'))

self.addEventListener('fetch', handle(app))
sh
npm run dev
sh
yarn dev
sh
pnpm run dev
sh
bun run dev
```

By default, the development server will run on port `5173`.

The `Hono` class is imported from the 'hono' module, and the `handle` function is imported from 'hono/service-worker'. A new instance of `Hono` is created, with the base path set to '/sw'. A GET request handler is set up for the root path ('/'), which responds with the text 'Hello World'. The `fetch` event listener is added to the service worker, which uses the `handle` function to handle requests.

The development server is started using one of the provided commands, depending on the package manager being used.

- The `handle` function is a key part of setting up a service worker in Hono, as it handles incoming requests.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Setting up a basic service worker for a web application.
- Starting the development server for a web application.

#### Code Snippet

```typescript

To run the development server, use the following commands:

```

**Reasoning:** This rule is important as it demonstrates how to set up a basic service worker using the Hono framework, and how to start the development server. Understanding this is crucial for developers as service workers are a key component in creating reliable, fast web pages, and running the development server is a fundamental step in the development process.

*Source: docs/getting-started/service-worker.md*

### Initializing a Hono Project with Deno

This code snippet demonstrates how to initialize a new Hono project using Deno.

```sh
deno init --npm hono my-app
```

The `deno init --npm hono my-app` command initializes a new Hono project in a directory named `my-app`. This command sets up the necessary files and configurations for a Hono project.

- The `my-app` is the name of the directory that will be created for the new project. You can replace `my-app` with the name of your choice.

- For Deno, you don't have to install Hono explicitly.

- [Official Hono Documentation](https://docs.deno.com/runtime/manual/getting_started/installation)

- Setting up a new Hono project in a Deno environment.

**Reasoning:** This rule is important as it demonstrates how to initialize a new Hono project using Deno. It's a fundamental step for developers to start working with Hono in a Deno environment.

*Source: docs/getting-started/deno.md*

### Creating a Basic Hono Application in Deno

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono framework in Deno.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Deno!'))

Deno.serve(app.fetch)
```

1. The Hono module is imported.
2. A new Hono application is created.
3. A route is defined for the root URL ('/') that responds with the text 'Hello Deno!'.
4. The application is served using Deno's built-in server.

- For Deno, you don't have to install Hono explicitly.
- You can change the port number by updating the arguments of `Deno.serve`.

- [Hono Documentation](https://hono.bayrell.org/en/)
- [Deno Documentation](https://deno.land/manual)

- Creating a basic web application.
- Learning the structure of a Hono application.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono framework in Deno. It shows how to import the Hono module, create a new Hono application, define a route, and serve the application. Understanding this basic structure is crucial for building more complex applications using Hono.

*Source: docs/getting-started/deno.md*

### Creating, Running and Changing Port of a Hono Application

This code demonstrates how to create a basic Hono application, run it, and change the port number.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Deno!'))

Deno.serve(app.fetch)
sh
deno task start
ts
Deno.serve(app.fetch) // default port
Deno.serve({ port: 8787 }, app.fetch) // custom port
```

1. The Hono application is created and a GET route is defined.
2. The application is served using Deno's built-in server.
3. The `deno task start` command is used to run the application.
4. The port number can be changed by passing an options object to `Deno.serve`.

- The `app.fetch` method is used to handle HTTP requests and responses.
- The `deno task start` command requires the `--allow-net` flag to allow network access.

- [Hono Documentation](https://hono.land)
- [Deno Documentation](https://deno.land)

- Creating a basic web server with Hono and Deno.
- Changing the port number of a Hono application.

#### Code Snippet

```typescript

To run the application, use the command:

```

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application, run it, and change the port number. Understanding this is fundamental to getting started with the Hono web framework in Deno.

*Source: docs/getting-started/deno.md*

### Serving an Application and Changing the Port Number in Hono using Deno

This code snippet demonstrates how to serve an application and change the port number in Hono using Deno. It also shows how to serve static files.

```ts
Deno.serve(app.fetch)
Deno.serve({ port: 8787 }, app.fetch)
```

The `Deno.serve` function is used to serve the application. The first argument can be an object that specifies the port number. If no port number is specified, the default port number is used.

To serve static files, the `serveStatic` function imported from `hono/middleware.ts` is used.

- The port number must be a number and not a string.
- The `serveStatic` function can only serve static files. It cannot be used to serve dynamic content.

- [Hono Documentation](https://hono.beyondnlp.com/docs)

- Serving a web application on a specific port number
- Serving static files in a web application

**Reasoning:** This rule is important as it demonstrates how to serve an application and change the port number in Hono using Deno. It also shows how to serve static files, which is a common requirement in web development. Understanding how to configure the port number and serve static files is crucial for setting up and managing a web server.

*Source: docs/getting-started/deno.md*

### Serving Static Files in Hono

This code demonstrates how to serve static files using the Hono web framework in Deno.

```ts
import { Hono } from 'hono'
import { serveStatic } from 'hono/deno'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))

Deno.serve(app.fetch)
```

The `serveStatic` function from `hono/deno` is used to serve static files. The `app.use` and `app.get` methods are used to define routes and their corresponding handlers. The `serveStatic` function is used as a handler for these routes, and it takes an object as an argument that specifies the root directory or path of the static file to be served.

- The `serveStatic` function serves files from the specified root directory or path.
- The `app.use` method is used to define middleware functions that have access to the request object, the response object, and the next function in the application’s request-response cycle.

- [Hono Documentation](https://hono.land)

- Serving static assets like images, CSS files, and JavaScript files.
- Serving a default file as a fallback when no routes match.

**Reasoning:** This rule is important as it demonstrates how to serve static files using the Hono web framework in Deno. Serving static files is a common requirement in many web applications, and understanding how to do this in Hono can help developers build more efficient and performant applications.

*Source: docs/getting-started/deno.md*

### Serving Static Files and Handling Fallbacks in Hono

In Hono, you can serve static files from a directory and set a fallback file for any unmatched routes. Here is a code snippet that demonstrates this:

```ts
app.get('*', serveStatic({ path: './static/hello.txt' }))
app.get('*', serveStatic({ path: './static/fallback.txt' }))

Deno.serve(app.fetch)

./
├── favicon.ico
├── index.ts
└── static
    ├── demo
    │   └── index.html
    ├── fallback.txt
    ├── hello.txt
    └── images
        └── dinotocat.png
ts
app.get(
  '/static/*',
  serveStatic({
    root: '.
```

The `serveStatic` function serves static files from the specified path. If a route does not match any file, the fallback file is served.

The `rewriteRequestPath` option allows you to map a request path to a different directory structure.

- The `serveStatic` function and the `rewriteRequestPath` option are part of the Hono framework.
- The fallback file is served for any unmatched routes.

- [Hono Documentation](https://hono.bryntum.com/docs)

- Serving static resources like images, CSS files, and JavaScript files.
- Setting a default file to be served when no routes match.

#### Code Snippet

```typescript

This code will work well with the following directory structure:

```

**Reasoning:** This rule is important as it demonstrates how to serve static files and handle fallbacks in Hono. It also shows how to rewrite request paths to map to a different directory structure. Understanding this rule is crucial for managing static resources in a Hono application.

*Source: docs/getting-started/deno.md*

### Rewriting Request Paths in Hono

This code snippet demonstrates how to rewrite request paths in Hono. This is useful when you want to serve static files from a different directory than the one specified in the URL.

```ts
app.get(
  '/static/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) =>
      path.replace(/^\/static/, '/statics'),
  })
)
```

The `rewriteRequestPath` option is a function that takes the request path as an argument and returns the new path. In this case, it replaces `/static` with `/statics` in the request path.

- The `rewriteRequestPath` function is called for every request, so it should be as efficient as possible.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Serving static files from a different directory than the one specified in the URL.

**Reasoning:** This rule is important as it demonstrates how to rewrite request paths in Hono. It shows how to map a URL pattern to a different directory in the server. This is useful when you want to serve static files from a different directory than the one specified in the URL.

*Source: docs/getting-started/deno.md*

### Serving Static Files and Adding MIME Types in Hono

This code snippet demonstrates how to serve static files and add MIME types in Hono framework.

```ts
app.get(
  '/static/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) =>
      path.replace(/^\/static/, '/statics'),
  })
)
ts
app.get(
  '/static/*',
  serveStatic({
    mimes: {
      m3u8: 'application/vnd.apple.mpegurl',
      ts: 'video/mp2t',
    },
  })
)
```

In this code, MIME types for 'm3u8' and 'ts' files are added. This is important for the browser to handle the received content correctly.

- The `serveStatic` function is used to serve static files in Hono.
- The `rewriteRequestPath` function can be used to rewrite the request path.
- You can add MIME types using the `mimes` option.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Serving static files in a web application.
- Adding MIME types for specific file types.

#### Code Snippet

```typescript

In the above code, `app.get` is used to handle GET requests to the '/static/*' path. The `serveStatic` function is used to serve static files from the root directory. The `rewriteRequestPath` function is used to rewrite the request path by replacing '/static' with '/statics'.

You can also add MIME types with `mimes`:

```

**Reasoning:** This rule is important as it demonstrates how to serve static files and add MIME types in Hono framework. MIME types are essential for browsers to handle the received content correctly. The rule also shows how to rewrite the request path, which can be useful for redirecting requests or handling them differently based on the path.

*Source: docs/getting-started/deno.md*

### Handling Static Files in Hono

This code snippet demonstrates how to handle different scenarios when serving static files in Hono.

```ts
app.get(
  '/static/*',
  serveStatic({
    // ...
    onFound: (_path, c) => {
      c.header('Cache-Control', `public, immutable, max-age=31536000`)
    },
  })
)
```

In this example, the `onFound` handler is used to set a custom 'Cache-Control' header when a file is found. This can be useful for controlling how client browsers cache the static files.

It's also possible to define an `onNotFound` handler to handle situations when a file is not found. This could be used to log the event or return a custom error message.

- The `onFound` and `onNotFound` handlers provide a way to customize the behavior of the server when serving static files.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Serving static files such as images, stylesheets, and scripts in a web application.
- Setting custom headers for caching or other purposes.
- Customizing the error handling when a file is not found.

**Reasoning:** This rule is important as it demonstrates how to handle different scenarios when serving static files in Hono. It shows how to set custom headers when a file is found and how to handle situations when a file is not found. Understanding these handlers is crucial for building robust applications with proper error handling and response management.

*Source: docs/getting-started/deno.md*

### Handling File Not Found in Hono Framework

This code snippet demonstrates how to handle scenarios when a requested file is not found in Hono framework. It uses the 'onNotFound' option in 'serveStatic' method to log the path that was not found and the path that was accessed.

```ts
app.get(
  '/static/*',
  serveStatic({
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  })
)
```

When a file is not found at the specified path, the 'onNotFound' function is triggered. This function takes two parameters - the path that was not found and the context 'c'. It then logs a message indicating the path that was not found and the path that was accessed.

- The 'onNotFound' option is a part of the 'serveStatic' method in Hono framework.
- The 'serveStatic' method is used to serve static files.

- [Hono Documentation](https://hono.bayrell.org/en)

- Logging file not found errors in a web application.

**Reasoning:** This rule is important as it demonstrates how to handle scenarios when a requested file is not found in Hono framework. It also shows how to use the 'onNotFound' option in 'serveStatic' method to log the path that was not found and the path that was accessed.

*Source: docs/getting-started/deno.md*

### Serving Static Files with Precompression in Hono

This code snippet demonstrates how to serve static files with precompression enabled in Hono.

```ts
app.get(
  '/static/*',
  serveStatic({
    precompressed: true,
  })
)
```

The `serveStatic` function is used with the `precompressed` option set to `true`. This tells Hono to check if precompressed versions of the files with extensions like `.br` or `.gz` are available and serve them based on the `Accept-Encoding` header. Hono prioritizes Brotli, then Zstd, and Gzip. If none are available, it serves the original file.

- The `precompressed` option should be used when you have precompressed versions of your static files available.
- The path '/static/*' is a wildcard path that matches any path starting with '/static/'. You can replace this with the path to your static files.

- [Hono Official Documentation](https://hono.boutell.com/)

- Serving static files such as images, stylesheets, and scripts in a web application.

**Reasoning:** This rule is important as it demonstrates how to serve static files in Hono with precompression enabled. Precompression can significantly reduce the size of the files being served, leading to faster load times and a better user experience. It also shows how Hono prioritizes different compression methods based on the 'Accept-Encoding' header.

*Source: docs/getting-started/deno.md*

### Adding a Dependency and Writing a Test in Hono

This code demonstrates how to add a dependency in Deno and how to write a basic test using the Hono framework.

First, add the `@std/assert` module using the `deno add` command:

```sh
deno add jsr:@std/assert
ts
import { Hono } from 'hono'
import { assertEquals } from '@std/assert'

Deno.test('Hello World', async () => {
  const app = new Hono()
  app.get('/', (c) => c.text('Please test me'))

  const
```

The `deno add` command adds the `@std/assert` module to your project. The `Deno.test` function is used to define a test, and the `assertEquals` function is used to assert that two values are equal.

- The `Deno.test` function is asynchronous, so you need to use the `await` keyword when calling it.

- [Deno Documentation](https://docs.deno.com/deploy/manual/)
- [Hono Documentation](https://hono.com)

- Writing tests for your Hono application

#### Code Snippet

```typescript

Then, write a test using the `Deno.test` function and the `assertEquals` function from the `@std/assert` module:

```

**Reasoning:** This rule is important as it demonstrates how to add a dependency in Deno and how to write a basic test using the Hono framework. It shows the usage of the `Deno.test` function and the `assertEquals` function from the `@std/assert` module. Understanding this rule is crucial for setting up tests for your Hono application.

*Source: docs/getting-started/deno.md*

### Writing and Running Tests in Deno using Hono and @std/assert

The following code snippet demonstrates how to write a simple test in Deno using the Hono framework and the assertEquals function from the @std/assert library.

```ts
import { Hono } from 'hono'
import { assertEquals } from '@std/assert'

Deno.test('Hello World', async () => {
  const app = new Hono()
  app.get('/', (c) => c.text('Please test me'))

  const res = await app.request('http://localhost/')
  assertEquals(res.status, 200)
})
sh
deno test hello.ts
```

1. The Hono framework is imported to create a new Hono application.
2. The assertEquals function from the @std/assert library is imported to assert that the response status is 200.
3. A new test is defined using the `Deno.test` function. The test creates a new Hono application, sets up a GET route, and makes a request to that route.
4. The assertEquals function is used to assert that the response status is 200, indicating a successful request.

- The @std/assert library provides a set of assertion functions for use in tests.
- The `Deno.test` function is used to define a test.

- [Deno Testing Documentation](https://deno.land/manual/testing)
- [Hono Documentation](https://hono.land/)

- Writing tests for a Hono application.
- Asserting that a request to a Hono application returns a successful response.

#### Code Snippet

```typescript

To run the test, use the `deno test` command followed by the filename.

```

**Reasoning:** This rule is important as it demonstrates how to write and run tests in Deno using the Hono framework and the assertEquals function from the @std/assert library. It is crucial to write tests for your application to ensure it behaves as expected.

*Source: docs/getting-started/deno.md*

### Creating and Testing a Basic Hono Application and Importing npm Packages in Deno

This code snippet demonstrates how to create a basic Hono application, handle a GET request, and test the application using Deno. It also shows how to import the Hono module using the `npm:` specifier in `deno.json`.

```sh
const app = new Hono()
app.get('/', (c) => c.text('Please test me'))

const res = await app.request('http://localhost/')
assertEquals(res.status, 200)
sh
deno test hello.ts
json
{
  "imports": {
    "hono": "npm:hono"
  }
}
```

1. A new Hono application is created.
2. A GET request handler is set up for the root URL ('/'). The handler sends a text response 'Please test me'.
3. The application is tested by sending a request to 'http://localhost/' and asserting that the response status is 200.
4. The `npm:` specifier is used to import the Hono module in `deno.json`.

- The `npm:` specifier allows you to import npm packages in Deno.

- [Hono Documentation](https://hono.bayrell.org/)
- [Deno Documentation](https://deno.land/)

- Creating a basic web application with Hono
- Testing a Hono application with Deno
- Importing npm packages in Deno

#### Code Snippet

```typescript

Then run the command:

```

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application, how to handle a GET request, and how to test the application using Deno. It also shows how to import the Hono module using the `npm:` specifier in `deno.json`.

*Source: docs/getting-started/deno.md*

### Importing Hono in a Deno Project

This code snippet demonstrates how to import the Hono library in a Deno project. You can use either the 'npm:' or 'jsr:' specifiers to import the library.

```json
{
  "imports": {
    "hono": "jsr:@hono/hono" // [!code --]
    "hono": "npm:hono" // [!code ++]
  }
}
```

In the 'deno.json' file, you specify the source of the Hono library. The 'npm:' specifier imports the library from the npm registry, while the 'jsr:' specifier imports it from the jsr registry.

- You can only use one specifier at a time. If you want to switch between specifiers, you need to comment out the current one and uncomment the other.
- If you want to use third-party middleware with TypeScript type inferences, you need to use the 'npm:' specifier.

- [Deno Manual - Import Maps](https://deno.land/manual/linking_to_external_code/import_maps)

- Setting up a new Deno project with Hono
- Switching between different versions or sources of the Hono library

**Reasoning:** This rule is important as it demonstrates how to import the Hono library in a Deno project using either the 'npm:' or 'jsr:' specifiers. This is crucial for setting up a project with Hono and understanding how to switch between different versions or sources of the library.

*Source: docs/getting-started/deno.md*

### Importing Third-Party Middleware in Hono

This code snippet demonstrates how to import third-party middleware in Hono using the `npm:` specifier.

```json
{
  "imports": {
    "hono": "npm:hono",
    "zod": "npm:zod",
    "@hono/zod-validator": "npm:@hono/zod-validator"
  }
}
```

In the `imports` object, each key represents the name of the module you want to import, and the value is the specifier that tells Hono where to find the module. In this case, we're using the `npm:` specifier to tell Hono to look for these modules in the npm registry.

- When using third-party middleware with TypeScript Type inferences, you need to use the `npm:` specifier.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Importing validation libraries like `@hono/zod-validator` for input validation in your Hono applications.

**Reasoning:** This rule is important as it demonstrates how to import third-party middleware in Hono using the `npm:` specifier. This is crucial for leveraging external libraries and tools, such as the `@hono/zod-validator`, in your Hono projects.

*Source: docs/getting-started/deno.md*

### Creating a new Hono application and installing dependencies

This code snippet demonstrates how to create a new Hono application and install its dependencies using different package managers.

```sh
yarn create hono my-app
sh
pnpm create hono my-app
sh
bun create hono@latest my-app
sh
deno init --npm hono my-app
sh
cd my-app
npm i
sh
cd my-app
yarn
sh
cd my-app
pnpm i
sh
cd my-app
bun i
```

The `create` command is used to create a new Hono application. The `cd` command is used to move into the application directory. The `i` or `install` command is used to install the dependencies of the application.

Different package managers require slightly different commands to create a new application and install its dependencies.

- [Hono documentation](https://hono.bun.dev/)

- Starting a new Hono project
- Installing dependencies for a Hono project

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and install its dependencies using different package managers. Understanding this is fundamental to getting started with the Hono framework.

*Source: docs/getting-started/vercel.md*

### Setting Up a Basic Route and Installing Dependencies in Hono

This rule demonstrates how to set up a basic 'Hello World' route using the Hono framework in a Vercel environment. It also shows how to install dependencies in different environments (npm, yarn, pnpm, bun).

```ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello World'
  })
})
```

1. Import the necessary modules from Hono and Vercel.
2. Set the runtime to 'edge'.
3. Create a new Hono instance and set the base path to '/api'.
4. Define a GET route '/hello' that returns a JSON object with a 'Hello World' message.

- Ensure that the necessary dependencies are installed in your environment. You can do this by moving into your app directory and running the install command for your environment (npm i, yarn, pnpm i, bun i).

- [Supported HTTP Methods](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods)

- Setting up basic routes in a Hono application.
- Installing dependencies in different environments.

**Reasoning:** This rule is important as it demonstrates how to set up a basic 'Hello World' route using the Hono framework in a Vercel environment. It also shows how to install dependencies in different environments (npm, yarn, pnpm, bun). Understanding this rule is crucial for developers to get started with creating and handling routes in Hono.

*Source: docs/getting-started/vercel.md*

### Setting up a Basic Hono Application with Vercel and Next.js

This code snippet demonstrates how to set up a basic Hono application with Vercel and Next.js.

```javascript
const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export const GET = handle(app)
export const POST = handle(app)
typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import type { PageConfig } from 'next'

export const config: PageConfig = {
  runtime: 'edge',
}

const app = new Hono().basePath('/api')
```

1. A new Hono application is created with the base path set to '/api'.
2. A GET route '/hello' is defined that returns a JSON response.
3. The handlers for GET and POST requests are exported.
4. In the `pages/api/[[...route]].ts` file, the runtime for the application is configured to 'edge'.

- The `basePath` method is used to set the base path for the application.
- The `get` method is used to define a GET route.
- The `handle` function from 'hono/vercel' is used to create the handlers for GET and POST requests.

- [Hono Documentation](https://hono.bayfront.cloud/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

- Creating a basic Hono application with Vercel and Next.js.
- Defining routes and handlers for GET and POST requests.

#### Code Snippet

```typescript

In the `pages/api/[[...route]].ts` file, you can configure the runtime for the application.

```

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application with Vercel and Next.js. It shows how to define the base path, create a simple GET route, and export the handlers for GET and POST requests. It also shows how to configure the runtime for the application in the `pages/api/[[...route]].ts` file.

*Source: docs/getting-started/vercel.md*

### Defining a GET Endpoint and Running the Server Locally in Hono

This code snippet demonstrates how to define a simple GET endpoint in Hono and how to run the development server locally.

```javascript
const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export default handle(app)
sh
npm run dev
sh
yarn dev
sh
pnpm dev
sh
bun run dev
```

After running the server, you can access `http://localhost:3000` in your web browser. The `/api/hello` endpoint will return a JSON response with the message 'Hello Next.js!'.

- The `basePath` method is used to set the base path for all routes.
- The `get` method is used to define a GET endpoint.
- The `json` method is used to return a JSON response.

- [Hono Documentation](https://hono.bun.dev/)

- Defining endpoints for a REST API
- Returning JSON responses from endpoints

#### Code Snippet

```typescript

To run the development server locally, use one of the following commands:

```

**Reasoning:** This rule is important as it demonstrates how to define a simple GET endpoint using the Hono web framework and how to run the development server locally. It also shows how to return a JSON response from the endpoint, which is a common requirement in web development.

*Source: docs/getting-started/vercel.md*

### Running and Deploying a Hono Application

This code snippet demonstrates how to run a Hono application locally, deploy it using Vercel, and set the runtime to Node.js.

```text
:::

Now, `/api/hello` just returns JSON, but if you build React UIs, you can create a full-stack application with Hono.

If you have a Vercel account, you can deploy by linking the Git repository.

You can also run Hono on Next.js running on the Node.js runtime.

For the App Router, you can simply set the runtime to `nodejs` in your route handler:
```

1. Run the Hono application locally using the command `npm run dev`, `yarn dev`, `pnpm dev`, or `bun run dev`.
2. Access the application in your web browser at `http://localhost:3000`.
3. To deploy the application, link the Git repository to your Vercel account.
4. To run Hono on Next.js with the Node.js runtime, set the runtime to `nodejs` in your route handler.

- Ensure that you have installed the required dependencies before running the application locally.
- You need a Vercel account to deploy the application.

- [Hono documentation](https://hono.dev/docs/getting-started)

- Developing and deploying full-stack applications using Hono and Vercel.
- Running Hono on Next.js with the Node.js runtime.

**Reasoning:** This rule is important as it demonstrates how to set up and run a Hono application locally, deploy it using Vercel, and how to set the runtime to Node.js. Understanding this process is crucial for developers to effectively use the Hono framework and deploy their applications.

*Source: docs/getting-started/vercel.md*

### Defining a Basic Hono Application and Installing Node.js Adapter for Pages Router

This code snippet demonstrates how to define a basic Hono application with a single route and how to handle GET and POST requests. It also shows the necessity of installing the Node.js adapter for the Pages Router in Hono.

```javascript
const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!',
  })
})

export const GET = handle(app)
export const POST = handle(app)
```

1. A new Hono application is created with a base path of '/api'.
2. A GET route '/hello' is defined which returns a JSON response with a message.
3. The GET and POST handlers for the application are exported.

- The Node.js adapter needs to be installed for the Pages Router in Hono. This can be done using npm, yarn, pnpm, or bun.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Defining basic routes in a Hono application.
- Handling different types of HTTP requests in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to define a basic Hono application with a single route and how to handle GET and POST requests. It also shows the necessity of installing the Node.js adapter for the Pages Router in Hono.

*Source: docs/getting-started/vercel.md*

### Installing Hono Node Server and Utilizing the Handle Function

This code snippet demonstrates how to install the Hono node server using different package managers and how to import and utilize the 'handle' function from '@hono/node-server/vercel'.

```sh
npm i @hono/node-server
sh
yarn add @hono/node-server
sh
pnpm add @hono/node-server
sh
bun add @hono/node-server
ts
import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import type { PageConfig } from 'next'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}
```

The 'handle' function is a utility function provided by the Hono node server for handling requests and responses in a serverless function environment.

Ensure that the Hono node server is installed before attempting to import and use the 'handle' function.

- Hono Documentation: https://hono.io/docs/getting-started

- Setting up a Hono server
- Handling requests and responses in a serverless function environment

**Reasoning:** This rule is important as it demonstrates how to install the Hono node server using different package managers and how to import and utilize the 'handle' function from '@hono/node-server/vercel'. This is a fundamental step in setting up a Hono server and utilizing its functionalities.

*Source: docs/getting-started/vercel.md*

### Disabling Vercel Node.js Helpers for Hono

In this code snippet, we are disabling Vercel Node.js helpers to ensure Hono works correctly with the Pages Router. This is done by setting up an environment variable in your project dashboard or in your `.env` file.

```text
NODEJS_HELPERS=0
```

By setting the `NODEJS_HELPERS` environment variable to `0`, we are disabling Vercel Node.js helpers. This is necessary because Hono might not function correctly with these helpers enabled.

Ensure to set this environment variable in your project dashboard or in your `.env` file.

- Hono documentation
- Vercel documentation

This is commonly used when you are using Hono with the Pages Router and you are deploying your application on Vercel.

**Reasoning:** This rule is important as it demonstrates how to disable Vercel Node.js helpers for Hono to work with the Pages Router. This is crucial because Hono might not function correctly with the Vercel Node.js helpers enabled.

*Source: docs/getting-started/vercel.md*

### Creating a Basic 'Hello World' Application with Hono on Lambda@Edge

This code demonstrates how to create a basic 'Hello World' application using the Hono framework on Lambda@Edge.

```sh
mkdir my-app
cd my-app
cdk init app -l typescript
pnpm add hono
mkdir lambda
ts
import { Hono } from 'hono'
import { handle } from 'hono/lambda-edge'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono on Lambda@Edge!'))

export const handler = handle(app)
```

1. A new Hono application is created.
2. A GET route is defined on the root path ('/'). When this route is accessed, it responds with the text 'Hello Hono on Lambda@Edge!'.
3. The application is exported as a handler that can be used by AWS Lambda.

- Ensure that Hono is added to the project using `pnpm add hono` or `bun add hono`.
- The lambda directory must be created in the project root.

- [Hono Documentation](https://hono.bun.dev/)

- Creating a basic web application with Hono.
- Setting up a serverless application with AWS Lambda.

#### Code Snippet

```typescript

After setting up the application and adding Hono, a lambda directory is created. Then, a simple GET route is defined in `lambda/index_edge.ts`.

```

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono framework on Lambda@Edge. It shows the process of setting up the application, adding Hono, creating a lambda directory, and defining a simple GET route. This is a fundamental pattern in Hono framework usage.

*Source: docs/getting-started/lambda-edge.md*

### Creating and Deploying a Basic Hono Application with AWS Lambda@Edge

This code demonstrates how to set up a basic Hono application and deploy it using AWS Lambda@Edge.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/lambda-edge'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono on Lambda@Edge!'))

export const handler = handle(app)
ts

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MyAppStack } from '../lib/my-app-stack'

const app = new cdk.App()
new MyAppStack(app, 'MyAppStack')
```

1. A new instance of Hono is created.
2. A GET route is defined on the root path ('/') of the application. When this route is hit, it returns the text 'Hello Hono on Lambda@Edge!'.
3. The handler for the Hono application is exported using the `handle` function from 'hono/lambda-edge'. This handler can be used by AWS Lambda@Edge to handle incoming requests.
4. To deploy the application, a new AWS CDK App is created and a new instance of `MyAppStack` is added to the app.

- The `handle` function from 'hono/lambda-edge' is used to create a handler for AWS Lambda@Edge.

- [Hono Documentation](https://hono.boutique/docs/)

- Creating serverless applications with Hono and AWS Lambda@Edge.

#### Code Snippet

```typescript

To deploy the application, edit `bin/my-app.ts`.

```

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application and deploy it using AWS Lambda@Edge. It shows the process of creating a Hono instance, defining a simple GET route, and exporting the handler for AWS Lambda@Edge to use. This is a fundamental pattern in serverless applications using the Hono framework.

*Source: docs/getting-started/lambda-edge.md*

### Initializing a New Application Stack in Hono

This code snippet demonstrates how to initialize a new application stack in Hono using the AWS CDK.

```ts
import { MyAppStack } from '../lib/my-app-stack'

const app = new cdk.App()
new MyAppStack(app, 'MyAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
})
```

1. Import the `MyAppStack` class from the `lib` directory.
2. Create a new instance of the `cdk.App` class.
3. Create a new instance of the `MyAppStack` class, passing in the `app` instance, a name for the stack, and an object containing the environment variables for the AWS account and region.

- The `CDK_DEFAULT_ACCOUNT` environment variable should be set to your AWS account ID.
- The region is set to 'us-east-1', but this can be changed to any valid AWS region.

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

- Initializing a new application stack in Hono.

**Reasoning:** This rule is important as it demonstrates how to initialize a new application stack in Hono using the AWS CDK (Cloud Development Kit). It shows how to set the environment variables for the AWS account and region. This is a fundamental step in setting up an application in Hono, as it sets up the basic infrastructure for the application.

*Source: docs/getting-started/lambda-edge.md*

### Deploying Edge Lambda Function and Using Callback in Hono Framework

This code snippet demonstrates how to deploy an edge lambda function using the Hono framework and the Cloud Development Kit (CDK). It also shows how to use the callback function for Basic Auth and request processing after verification.

```text
edgeLambdas: [
  {
    functionVersion: edgeFn.currentVersion,
    eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
  },
],
},
})
}
}
sh
cdk deploy
ts
import { Hono } from 'hono'
import { basicA
```

The `edgeLambdas` array contains the configuration for the edge lambda function. The `functionVersion` is the current version of the function, and the `eventType` is the type of event that triggers the function. The `cdk deploy` command deploys the function.

The `c.env.callback()` function is used for Basic Auth and to continue with request processing after verification.

Ensure that the `functionVersion` and `eventType` are correctly set in the `edgeLambdas` array. Also, make sure to import the necessary modules before using the `c.env.callback()` function.

- [Hono Documentation](https://hono.bike/docs)

This pattern is commonly used when deploying edge lambda functions and implementing Basic Auth in applications using the Hono framework.

#### Code Snippet

```typescript

To deploy the function, run the following command:

```

**Reasoning:** This rule is important as it demonstrates how to deploy an edge lambda function using the Hono framework and the Cloud Development Kit (CDK). It also shows how to use the callback function for Basic Auth and request processing after verification.

*Source: docs/getting-started/lambda-edge.md*

### Using Callback in Hono for Basic Auth and Request Processing

In Hono, you can use the `c.env.callback()` function to add Basic Auth and continue with request processing after verification. This is a common pattern in Hono where the callback function is used to continue the execution of the application after a certain operation has been completed.

Here is a code snippet demonstrating this:

```ts
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import type { Callback, CloudFrontRequest } from 'hono/lambda-edge'
import { handle } from 'hono/lambda-edge'

type Bindings 
```

The `c.env.callback()` function is called after the Basic Auth operation has been completed. This function then continues the execution of the application.

- The `c.env.callback()` function is a part of the Hono framework and is used to continue the execution of the application after a certain operation has been completed.

- Hono Documentation

- Adding Basic Auth to an application and continuing with request processing after verification.

**Reasoning:** This rule is important as it demonstrates how to use the callback function in Hono to add Basic Auth and continue with request processing after verification. This is a common pattern in Hono where the callback function is used to continue the execution of the application after a certain operation has been completed.

*Source: docs/getting-started/lambda-edge.md*

### Creating a Basic Hono Application for AWS Lambda

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono framework in an AWS Lambda environment.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export const handler = handle(app)
```

1. The Hono and handle modules from 'hono/aws-lambda' are imported.
2. A new Hono application is created.
3. A route handler for the root path ('/') is defined. This handler simply returns the text 'Hello Hono!'.
4. The handler is exported for AWS Lambda to use.

- The 'handle' function from 'hono/aws-lambda' is used to create a handler that AWS Lambda can use to handle incoming requests.

- [Hono Documentation](https://hono.bun.dev/)

- Creating a basic serverless application using Hono and AWS Lambda.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono framework in an AWS Lambda environment. It shows how to initialize a new Hono application, define a route handler for the root path ('/') and export the handler for AWS Lambda to use.

*Source: docs/getting-started/aws-lambda.md*

### Setting Up and Deploying a Hono Application with AWS Lambda

This code snippet demonstrates how to set up a basic Hono application and deploy it using AWS Lambda.

```ts
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export const handler = handle(app)
```

1. Import the `Hono` class from the `hono` package and the `handle` function from `hono/aws-lambda`.
2. Create a new instance of `Hono`.
3. Define a GET route for the root URL (`/`) that responds with 'Hello Hono!'.
4. Export a handler for AWS Lambda using the `handle` function, passing the Hono application instance as an argument.

- The `handle` function is specifically designed for AWS Lambda and helps to adapt the Hono application to the AWS Lambda environment.

- [Hono Documentation](https://hono.bayfront.cloud/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

- Creating serverless applications with Hono and AWS Lambda.
- Deploying Hono applications to AWS Lambda.

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application and deploy it using AWS Lambda. It shows how to create a Hono application, define a simple GET route, and export a handler for AWS Lambda. This is a fundamental pattern in serverless applications development using Hono and AWS Lambda.

*Source: docs/getting-started/aws-lambda.md*

### Deploying AWS Lambda Function with Hono

This code snippet demonstrates how to deploy an AWS Lambda function using the Hono framework. It also shows how to add a function URL and create a REST API for the function.

```text
untime: lambda.Runtime.NODEJS_20_X,
})
fn.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
})
new apigw.LambdaRestApi(this, 'myapi', {
  handler: fn,
})
}
sh
cdk deploy
```

1. The `lambda.Runtime.NODEJS_20_X` specifies the runtime environment for the Lambda function.
2. The `addFunctionUrl` method is used to add a URL for the function. The `authType` is set to `NONE`, meaning no authentication is required to access the function.
3. The `LambdaRestApi` class is used to create a REST API for the function.
4. The `cdk deploy` command is used to deploy the function.

- Make sure to replace `'myapi'` with the actual name of your API.
- The `cdk deploy` command should be run in the root directory of your project.

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

- Deploying serverless applications using AWS Lambda and Hono.

#### Code Snippet

```typescript

To deploy the function, run the command:

```

**Reasoning:** This rule is important as it demonstrates how to deploy an AWS Lambda function using the Hono framework. It also shows how to add a function URL and create a REST API for the function. Understanding this rule is crucial for developers who want to deploy serverless applications using Hono and AWS Lambda.

*Source: docs/getting-started/aws-lambda.md*

### Serving Binary Data in Hono using AWS Lambda

Hono supports binary data as a response. In AWS Lambda, base64 encoding is required to return binary data. Once binary type is set to `Content-Type` header, Hono automatically encodes data to base64.

```ts
app.get('/binary', async (c) => {
  // ...
  c.status(200)
  c.header('Content-Type', 'image/png') // means binary data
  return c.body(buffer) // supports `ArrayBufferLike` type, encoded to base64
```

1. Define a route using `app.get()`.
2. Set the status code to 200 using `c.status(200)`.
3. Set the `Content-Type` header to the type of binary data you are serving using `c.header('Content-Type', 'image/png')`.
4. Return the binary data as the response body using `return c.body(buffer)`. Hono will automatically encode the `ArrayBufferLike` type data to base64.

- Hono automatically handles the base64 encoding once the `Content-Type` header is set to a binary type.

- [Hono Documentation](https://hono.bevry.me/)

- Serving images or other binary data from a Hono application using AWS Lambda.

**Reasoning:** This rule is important as it demonstrates how to serve binary data in Hono using AWS Lambda. It shows that base64 encoding is required to return binary data in Lambda and once the binary type is set to `Content-Type` header, Hono automatically encodes the data to base64.

*Source: docs/getting-started/aws-lambda.md*

### Handling Binary Data in Hono

In Hono, you can handle binary data by setting the status and content type of the response, and returning the binary data in the response body.

```ts
p.get('/binary', async (c) => {
  // ...
  c.status(200)
  c.header('Content-Type', 'image/png') // means binary data
  return c.body(buffer) // supports `ArrayBufferLike` type, encoded to base64.
})
```

1. `c.status(200)`: This sets the HTTP status code of the response to 200.
2. `c.header('Content-Type', 'image/png')`: This sets the content type of the response to 'image/png', indicating that the response contains binary data.
3. `return c.body(buffer)`: This returns the binary data in the response body. The `body` method supports `ArrayBufferLike` type, which is encoded to base64.

- The `body` method supports `ArrayBufferLike` type, which is encoded to base64. This means that you can return binary data in the response body.

- [Hono documentation](https://hono.bayrell.org/en/)

- Returning images or other binary data in the response body.

**Reasoning:** This rule is important as it demonstrates how to handle binary data in Hono. It shows how to set the status and content type of the response, and how to return binary data in the response body.

*Source: docs/getting-started/aws-lambda.md*

### Accessing AWS Lambda RequestContext in Hono

In Hono, you can access the AWS Lambda request context by binding the `LambdaEvent` type and using `c.env.event.requestContext`.

```ts
import { Hono } from 'hono'
import type { LambdaEvent } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
  event: LambdaEvent
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/aws-lambda-info/', (c) => {
  return c.json({
    isBase64Encoded: c.env.event.isBase64Encoded,
    awsRequestId: c.env.lambdaContext.awsRequestId,
  })
})

export const handler = handle(app)
```

1. Import the necessary modules from Hono and AWS Lambda.
2. Define the bindings for the AWS Lambda event.
3. Create a new Hono application with the defined bindings.
4. Define a GET route that returns a JSON response with specific information from the AWS Lambda request context.
5. Export the handler function that handles the Hono application.

- The `LambdaEvent` type provides access to the AWS Lambda request context.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Retrieving specific information from the AWS Lambda request context for processing in your application.

**Reasoning:** This rule is important as it demonstrates how to access the AWS Lambda request context in Hono. Understanding this is crucial for developers who need to interact with AWS Lambda functions and retrieve specific information from the request context.

*Source: docs/getting-started/aws-lambda.md*

### Accessing AWS Lambda Request Context in Hono (Before v3.10.0)

This code snippet demonstrates how to access the AWS Lambda request context in Hono before version 3.10.0. This is done by binding the `ApiGatewayRequestContext` type and using `c.env.`.

```text
import { Hono } from 'hono'
import type { ApiGatewayRequestContext } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
  requestContext: ApiGatewayRequestContext
}

app.get('/custom-context/', (c) => {
  const lambdaContext = c.env.event.requestContext
  return c.json(lambdaContext)
})

export const handler = handle(app)
```

1. The `ApiGatewayRequestContext` type is imported from `hono/aws-lambda`.
2. A new Hono app is created with the `Bindings` type, which includes `requestContext` of type `ApiGatewayRequestContext`.
3. In the route handler for '/custom-context/', the AWS Lambda request context is accessed through `c.env.event.requestContext`.
4. The request context is then returned as a JSON response.

- This method is deprecated in Hono version 3.10.0 and later.

- Hono documentation: [https://hono.bayfront.io/](https://hono.bayfront.io/)

- Accessing the AWS Lambda request context to get information about the request, such as the HTTP method, path, headers, and more.

**Reasoning:** This rule is important as it demonstrates how to access the AWS Lambda request context in Hono before version 3.10.0. This is crucial when developing AWS Lambda functions using Hono, as it allows developers to access and manipulate the request context, which contains useful information about the request.

*Source: docs/getting-started/aws-lambda.md*

### Achieving Streaming Response with AWS Lambda in Hono

In Hono, you can change the invocation mode of AWS Lambda to achieve a streaming response. This is done by setting the `invokeMode` property to `lambda.InvokeMode.RESPONSE_STREAM` when adding a function URL.

```diff
fn.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
+  invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
})
```

This change allows AWS Lambda to send large amounts of data in chunks rather than all at once, which can improve performance and reduce memory usage.

When you set the `invokeMode` to `RESPONSE_STREAM`, AWS Lambda will write data to a NodeJS.Writable stream. This allows the data to be sent in chunks rather than all at once.

- The `invokeMode` property is only available in the `addFunctionUrl` method.
- The `RESPONSE_STREAM` mode is best used when you need to send large amounts of data.

- [AWS Lambda Response Streaming](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/)

- Sending large amounts of data from a Lambda function.
- Reducing memory usage when sending data from a Lambda function.

**Reasoning:** This rule is important because it demonstrates how to change the invocation mode of AWS Lambda to achieve a streaming response. This is useful when you want to send large amounts of data in chunks rather than all at once, which can improve performance and reduce memory usage.

*Source: docs/getting-started/aws-lambda.md*

### Implementing Traditional Streaming Response in Hono with AWS Lambda Adaptor

In Hono, you can achieve the traditional streaming response using AWS Lambda Adaptor's `streamHandle` instead of `handle`. This is particularly useful when you want to leverage the power of AWS Lambda functions in your Hono applications without losing the traditional streaming response functionality.

Here's how you can do it:

```ts
import { Hono } from 'hono'
import { streamHandle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/stream', async (c) => {
  return streamText(c, async (stream) => {
    for (let i = 0; 
diff
fn.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
+  invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
})
```

- [AWS Lambda Response Streaming](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/)

- Streaming large amounts of data from AWS Lambda functions
- Implementing real-time updates or notifications

#### Code Snippet

```typescript

### How it works

Typically, the implementation requires writing chunks to NodeJS.WritableStream using `awslambda.streamifyResponse`. But with the AWS Lambda Adaptor, you can achieve the traditional streaming response of Hono by using `streamHandle` instead of `handle`.

### Important notes

Make sure to set the `invokeMode` to `RESPONSE_STREAM` when adding the function URL.

```

**Reasoning:** This rule is important as it demonstrates how to achieve traditional streaming response in Hono using AWS Lambda Adaptor's streamHandle instead of handle. This is crucial for developers who want to leverage the power of AWS Lambda functions in their Hono applications without losing the traditional streaming response functionality.

*Source: docs/getting-started/aws-lambda.md*

### Creating a Basic Hono Application

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono framework and the hono-alibaba-cloud-fc3-adapter.

```ts
import { Hono } from 'hono'
import { handle } from 'hono-alibaba-cloud-fc3-adapter'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export const handler = handle(app)
```

1. The `Hono` and `handle` modules are imported from 'hono' and 'hono-alibaba-cloud-fc3-adapter' respectively.
2. A new instance of `Hono` is created and assigned to the `app` variable.
3. A GET route is defined on the root path ('/') of the application. When this route is hit, it responds with the text 'Hello Hono!'.
4. The `handle` function is used to create a handler for the `app` and this handler is exported.

- The `handle` function from 'hono-alibaba-cloud-fc3-adapter' is used to create a handler for the Hono application. This is necessary for the application to work with Alibaba Cloud Function Compute.

- [Hono Documentation](https://hono.bun.dev/)

- This pattern is commonly used when creating a basic Hono application for Alibaba Cloud Function Compute.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono framework and the hono-alibaba-cloud-fc3-adapter. It shows how to set up the project, import necessary modules, create a new Hono instance, define a route, and export the handler function.

*Source: docs/getting-started/ali-function-compute.md*

### Setting Up a Basic Hono Application and Integrating with Alibaba Cloud Function Compute

This code snippet demonstrates how to set up a basic Hono application and integrate it with Alibaba Cloud Function Compute using the Hono Alibaba Cloud FC3 adapter. It also shows how to use the serverless-devs tool to manage serverless applications.

```ts
import { Hono } from 'hono'
import { handle } from 'hono-alibaba-cloud-fc3-adapter'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export const handler = handle(app)
```

1. Import the necessary modules from Hono and the Hono Alibaba Cloud FC3 adapter.
2. Create a new Hono application.
3. Define a GET route that responds with 'Hello Hono!'.
4. Export a handler function that wraps the Hono application with the Alibaba Cloud FC3 adapter.

- The handler function is what Alibaba Cloud Function Compute will use to handle incoming requests.

- [Hono](https://github.com/hono-xx/hono)
- [Hono Alibaba Cloud FC3 Adapter](https://github.com/hono-xx/hono-alibaba-cloud-fc3-adapter)
- [Serverless Devs](https://github.com/Serverless-Devs/Serverless-Devs)

- Creating serverless applications that run on Alibaba Cloud Function Compute.

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application and integrate it with Alibaba Cloud Function Compute using the Hono Alibaba Cloud FC3 adapter. It also shows how to use the serverless-devs tool to manage serverless applications.

*Source: docs/getting-started/ali-function-compute.md*

### Configuring Alibaba Cloud AccessKeyID & AccessKeySecret and Basic Serverless Application Setup in Hono

This code snippet demonstrates how to add the Alibaba Cloud AccessKeyID & AccessKeySecret and how to set up a basic serverless application configuration in Hono using the 's.yaml' file.

```sh
npx s config add

yaml
edition: 3.0.0
name: my-app
access: 'default'

vars:
  region: 'us-west-1'

resources:
  my-app:
    component: fc3
    props:
      region: ${vars.region}
      functionName: 'my-app'
      desc
```

1. The 'npx s config add' command is used to add the Alibaba Cloud AccessKeyID & AccessKeySecret.
2. The 's.yaml' file is a serverless application model file in Hono. It defines the serverless application.

- The 'access' field in the 's.yaml' file should match the name you used when you configured your Alibaba Cloud credentials.
- The 'region' is a variable that is defined under the 'vars' field and is used in the 'props' field.

- [Hono Documentation](https://www.hono.io/)

- Setting up a serverless application on Alibaba Cloud using Hono.

#### Code Snippet

```typescript

After adding the AccessKeyID & AccessKeySecret, you need to edit the 's.yaml' file as follows:

```

**Reasoning:** This rule is important as it demonstrates how to configure Alibaba Cloud AccessKeyID & AccessKeySecret and how to set up a basic serverless application configuration in Hono using the 's.yaml' file. This is a crucial step in deploying serverless applications on Alibaba Cloud using Hono.

*Source: docs/getting-started/ali-function-compute.md*

### Configuring Build and Deploy Scripts in package.json for Hono Applications

This code snippet demonstrates how to configure the build and deploy scripts in the package.json file for a Hono application.

```json
{
  "scripts": {
    "build": "esbuild --bundle --outfile=./dist/index.js --platform=node --target=node20 ./src/index.ts",
    "deploy": "s deploy -y"
  }
}
```

1. The `build` script uses esbuild to bundle the TypeScript source code into a single JavaScript file, which is output to the ./dist directory.
2. The `deploy` script uses the Serverless Framework's deploy command to deploy the application.

- The `--platform=node` and `--target=node20` options in the `build` script specify that the code should be bundled for the Node.js 20 runtime.
- The `-y` option in the `deploy` script automatically confirms any prompts that may appear during the deployment process.

- [esbuild documentation](https://esbuild.github.io/getting-started/)
- [Serverless Framework documentation](https://www.serverless.com/framework/docs/)

- Automating the build and deployment process of a Hono application

**Reasoning:** This rule is important as it demonstrates how to configure the build and deploy scripts in the package.json file for a Hono application. This is a crucial step in automating the build and deployment process of the application.

*Source: docs/getting-started/ali-function-compute.md*

### Deploying a Function to Alibaba Cloud Function Compute with npm Scripts

This code snippet demonstrates how to deploy a function to Alibaba Cloud Function Compute using npm scripts.

```json
{
  "scripts": {
    "build": "esbuild --bundle --outfile=./dist/index.js --platform=node --target=node20 ./src/index.ts",
    "deploy": "s deploy -y"
  }
}
sh
npm run build # Compile the TypeScript code to JavaScript
npm run deploy # Deploy the function to Alibaba Cloud Function Compute
```

1. The `build` script uses esbuild to compile the TypeScript code to JavaScript, targeting Node.js 20 and outputting the result to `./dist/index.js`.
2. The `deploy` script uses the Serverless Framework's `s` command to deploy the function, with the `-y` flag automatically confirming any prompts.

- Ensure that you have the necessary permissions to deploy to Alibaba Cloud Function Compute.
- Make sure that your function's dependencies are correctly installed and that your TypeScript code compiles without errors before attempting to deploy.

- [Alibaba Cloud Function Compute Documentation](https://www.alibabacloud.com/help/product/50980.htm)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)

- Deploying serverless functions to Alibaba Cloud Function Compute
- Automating deployment processes with npm scripts

#### Code Snippet

```typescript

To deploy, run the following commands:

```

**Reasoning:** This rule is important as it demonstrates how to deploy a function to Alibaba Cloud Function Compute using npm scripts. It shows the correct sequence of commands to compile TypeScript code to JavaScript and then deploy the function.

*Source: docs/getting-started/ali-function-compute.md*

### Creating a new Hono application and installing dependencies

This code snippet demonstrates how to create a new Hono application and install its dependencies using different package managers.

```sh
yarn create hono my-app
sh
pnpm create hono my-app
sh
bun create hono@latest my-app
sh
deno init --npm hono my-app
sh
cd my-app
npm i
sh
cd my-app
yarn
sh
cd my-app
pnpm i
sh
cd my-app
bun i
```

The `create` command is used to create a new Hono application. The `cd` command is used to move to the application directory. The `i` or `install` command is used to install the dependencies of the application.

- Make sure to use the correct command for your package manager.
- The `@latest` tag can be used to create an application with the latest version of Hono.

- [Hono documentation](https://hono.bun.dev/)

- Setting up a new Hono project

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and install its dependencies using different package managers. Understanding this rule is crucial for setting up a new Hono project correctly.

*Source: docs/getting-started/cloudflare-workers.md*

### Creating a Basic Hono Application

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono framework.

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Cloudflare Workers!'))

export default app
```

1. The Hono framework is imported.
2. A new Hono application is created.
3. A GET route is defined for the root URL ('/'). The response is a simple text message.
4. The application is exported for use elsewhere.

- This is a very basic example of a Hono application. Real-world applications will typically have more complex routing and response logic.

- [Hono Documentation](https://hono.bun.dev/)

- Creating a simple serverless application with Hono and Cloudflare Workers.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono framework. It shows the basic structure of a Hono application, including how to define routes and responses.

*Source: docs/getting-started/cloudflare-workers.md*

### Running a Hono Application Locally

This code snippet demonstrates how to run a Hono application on your local machine using different package managers.

```sh
npm run dev
sh
yarn dev
sh
pnpm dev
sh
bun run dev
```

After running one of these commands, you can access the application by opening `http://localhost:8787` in your web browser.

These commands start the development server for your Hono application. The server listens on port 8787 and serves the application.

- Ensure that the specified port is not being used by another service.

- [Hono Documentation](https://hono.bun.dev/)

- Running the application for testing during development.

**Reasoning:** This rule is important as it demonstrates how to run a Hono application locally using different package managers. It shows the command to start the development server and how to access the application in a web browser. Understanding this rule is crucial for testing and debugging during development.

*Source: docs/getting-started/cloudflare-workers.md*

### Changing Port Number and Deploying Application in Cloudflare Workers

This rule demonstrates how to change the port number and deploy the application using different package managers in the context of Cloudflare Workers.

```text
:::

If you need to change the port number you can follow the instructions here to update `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` files:
[Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#local-development-settings)

Or, you can follow the instructions here to set CLI options:
[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

If you have a Cloudflare account, you can deploy to Cloudflare. In `package.json`, `$npm_execpath` needs to be changed to your package manager of choice.

::: code-group
```

1. To change the port number, you can update the `wrangler.toml`, `wrangler.json`, or `wrangler.jsonc` files as per the instructions provided in the Wrangler Configuration link.
2. Alternatively, you can set CLI options as per the instructions provided in the Wrangler CLI link.
3. To deploy the application, you need to have a Cloudflare account. In the `package.json` file, you need to change `$npm_execpath` to your package manager of choice.

- Ensure to use a unique port number to avoid port conflicts.
- Choose the package manager you are most comfortable with for deploying the application.

- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#local-development-settings)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

- Changing the port number when the default port is already in use.
- Deploying the application using different package managers based on personal preference or project requirements.

**Reasoning:** This rule is important as it demonstrates how to change the port number and deploy the application using different package managers in the context of Cloudflare Workers. Understanding how to change the port number is crucial for avoiding port conflicts and ensuring the application runs smoothly. Moreover, knowing how to deploy the application using different package managers provides flexibility and allows developers to use the package manager they are most comfortable with.

*Source: docs/getting-started/cloudflare-workers.md*

### Using Module Worker mode and Service Worker mode in Hono

In Hono, there are two syntaxes for writing the Cloudflare Workers: _Module Worker mode_ and _Service Worker mode_.

Here is how you can write in both modes:

```ts
// Module Worker
export default app
ts
// Service Worker
app.fire()
```

While both syntaxes are supported, it is recommended to use Module Worker mode. This is because in Module Worker mode, binding variables are localized, which can help in maintaining clean and manageable code.

- While both modes are supported, Module Worker mode is recommended for better management of binding variables.

- Use Module Worker mode when you want to keep your binding variables localized.

- Use Service Worker mode when you want to fire the application immediately.

**Reasoning:** This rule is important as it demonstrates the two syntaxes for writing Cloudflare Workers in Hono: Module Worker mode and Service Worker mode. It also highlights the recommendation to use Module Worker mode for localized binding variables, which can be crucial for maintaining clean and manageable code.

*Source: docs/getting-started/cloudflare-workers.md*

### Integrating Hono with Other Event Handlers in Module Worker Mode

In Hono, you can integrate with other event handlers (such as `scheduled`) in Module Worker mode. To do this, you need to export `app.fetch` as the module's `fetch` handler, and then implement other handlers as needed.

Here is a code snippet demonstrating this:

```ts
const app = new Hono()

export default {
  fetch: app.fetch,
  scheduled: async (batch, env) => {},
}
```

In the above code, `app.fetch` is exported as the module's `fetch` handler. This allows Hono to handle fetch events. The `scheduled` handler is also defined, but it doesn't do anything in this example.

- The `scheduled` handler can be replaced with any other event handler as per your application's requirements.

- [Hono Documentation](https://hono.bouzuya.net/)

- Integrating Hono with a scheduling system to perform tasks at specific intervals.
- Extending the functionality of a Hono application with additional event handlers.

**Reasoning:** This rule is important as it demonstrates how to integrate Hono with other event handlers in Module Worker mode. This is crucial for developers who want to extend the functionality of their Hono applications with additional event handlers.

*Source: docs/getting-started/cloudflare-workers.md*

### Serving Static Files in Hono using Cloudflare Workers

The following code snippet demonstrates how to serve static files using the Static Assets feature of Cloudflare Workers in a Hono application. This is done by specifying the directory for the files in `wrangler.toml`:

```toml
assets = { directory = "public" }
```

After this, you need to create the `public` directory and place the files there. For instance, `./public/static/hello.txt` will be served as `/static/hello.txt`.

1. The `assets` field in the `wrangler.toml` file is used to specify the directory that contains the static files.
2. The `directory` field within the `assets` field is set to the directory that contains the static files. In this case, it is set to `public`.
3. Any file placed within the `public` directory can be accessed as a static file. For example, a file at `./public/static/hello.txt` can be accessed at the URL `/static/hello.txt`.

- The directory specified in the `directory` field must exist, otherwise, an error will occur.
- The static files feature is a part of Cloudflare Workers and may not be available in other environments.

- [Cloudflare Workers Static Assets Feature](https://developers.cloudflare.com/workers/static-assets/)

- Serving images, CSS files, JavaScript files, etc., as static files.
- Hosting a static website or a single-page application.

**Reasoning:** This rule is important as it demonstrates how to serve static files using the Static Assets feature of Cloudflare Workers in a Hono application. This is a common requirement in many web applications where static files like images, CSS, JavaScript files, etc., need to be served to the client.

*Source: docs/getting-started/cloudflare-workers.md*

### Serving Static Assets with Cloudflare Workers in Hono

In Hono, you can serve static assets using the Cloudflare Workers feature. To do this, you need to specify the directory for the static files in the `wrangler.toml` file. For instance:

```toml
assets = { directory = "public" }

.
├── package.json
├── public
│   ├── favicon.ico
│   └── static
│       └── hello.txt
├── src
│   └── index.ts
└── wrangler.toml
```

- Ensure that the directory specified in the `wrangler.toml` file exists and contains the static files you want to serve.

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)

- Serving static files like images, CSS, and JavaScript for a web application.

#### Code Snippet

```typescript

Then, you need to create the `public` directory and place your static files there. For example, if you place a file at `./public/static/hello.txt`, it will be served at the path `/static/hello.txt`.

Your project directory should look something like this:

```

**Reasoning:** This rule is important as it demonstrates how to serve static assets using the Cloudflare Workers feature in Hono. It shows how to specify the directory for static files in the `wrangler.toml` file and how to structure the project directory for serving these files.

*Source: docs/getting-started/cloudflare-workers.md*

### Installing '@cloudflare/workers-types' for TypeScript Development in Cloudflare Workers

The code snippet demonstrates how to install the '@cloudflare/workers-types' package using different package managers. This package provides type definitions for Cloudflare Workers, which are essential for TypeScript development.

```sh
npm i --save-dev @cloudflare/workers-types
sh
yarn add -D @cloudflare/workers-types
sh
pnpm add -D @cloudflare/workers-types
```

These commands add the '@cloudflare/workers-types' package as a development dependency, meaning it will not be included in the production build of your project.

- Make sure to install the '@cloudflare/workers-types' package as a development dependency, as it is only needed during development and not in the production build.

- [Cloudflare Workers TypeScript documentation](https://developers.cloudflare.com/workers/learning/typescript)

- When setting up a new TypeScript project for Cloudflare Workers, you should install the '@cloudflare/workers-types' package to benefit from autocompletion and type checking capabilities.

**Reasoning:** This rule is important as it demonstrates how to install the '@cloudflare/workers-types' package, which provides type definitions for Cloudflare Workers. These type definitions are essential for TypeScript development, as they provide autocompletion and type checking capabilities, improving the developer experience and reducing the likelihood of runtime errors.

*Source: docs/getting-started/cloudflare-workers.md*

### Adding Development Dependencies and Setting Up Testing in Hono

This code snippet demonstrates how to add development dependencies in a Hono project using different package managers. It also shows how to set up testing using the '@cloudflare/vitest-pool-workers' package.

```sh

yarn add -D @cloudflare/workers-types

pnpm add -D @cloudflare/workers-types

bun add --dev @cloudflare/workers-types
ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Please test me!'))
```

You can test if it returns a '_200 OK_' Response with this code.

- The '-D' flag in the commands is used to add the package as a development dependency.
- The '@cloudflare/workers-types' package provides TypeScript definitions for Cloudflare Workers.
- The '@cloudflare/vitest-pool-workers' package is recommended for testing Hono applications.

- [Hono Documentation](https://honojs.com)
- [Cloudflare Workers Types](https://www.npmjs.com/package/@cloudflare/workers-types)
- [Vitest Pool Workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers)

- Setting up a new Hono project
- Adding development dependencies to a Hono project
- Setting up testing for a Hono application

#### Code Snippet

```typescript

For testing, we recommend using '@cloudflare/vitest-pool-workers'. You can refer to the [examples](https://github.com/honojs/examples) for setting it up.

Here is an example of a simple test case for a Hono application:

```

**Reasoning:** This rule is important as it demonstrates how to add development dependencies in a Hono project using different package managers like yarn, pnpm, and bun. It also shows how to set up testing using the '@cloudflare/vitest-pool-workers' package and provides an example of a simple test case for a Hono application.

*Source: docs/getting-started/cloudflare-workers.md*

### Testing a Basic Hono Application

This code demonstrates how to test a basic Hono application using Jest. The application is set up to respond to GET requests at the root URL ('/') with a text response.

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Please test me!'))
ts
describe('Test the application', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(200)
  })
})
```

This works by making a request to the application and checking the status of the response. If the status is 200, the test passes.

- The `app.request` method is a part of Hono's API that allows for making requests to the application.
- Jest's `expect` function is used to assert that the response status is 200.

- [Hono Documentation](https://honojs.com/docs)
- [Jest Documentation](https://jestjs.io/docs)

- Testing the response of different routes in your Hono application.
- Checking the status code of HTTP responses.

#### Code Snippet

```typescript

We can test if it returns a 200 OK response with this code:

```

**Reasoning:** This rule is important as it demonstrates how to test a basic Hono application using Jest. It shows how to make a request to the application and check if it returns a 200 status code, which indicates a successful HTTP request. This is a fundamental part of developing and maintaining reliable web applications.

*Source: docs/getting-started/cloudflare-workers.md*

### Binding and Accessing Environment Values in Hono

In the Cloudflare Workers, we can bind the environment values, KV namespace, R2 bucket, or Durable Object. You can access them in `c.env`. It will have the types if you pass the '_type struct_' for the bindings to the `Hono` as generics.

```ts
type Bindings = {
  MY_BUCKET: R2Bucket
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()
```

1. Define a type for the bindings.
2. Pass this type as a generic parameter when creating a new Hono instance.
3. Access the bindings in `c.env`.

- The bindings are available in `c.env`.
- The bindings have types if you pass the '_type struct_' for the bindings to the `Hono` as generics.

- [Hono documentation](https://hono.beyondco.de/docs/getting-started)

- Binding environment values in Cloudflare Workers
- Accessing KV namespace, R2 bucket, or Durable Object in Cloudflare Workers

**Reasoning:** This rule is important as it demonstrates how to bind environment values, KV namespace, R2 bucket, or Durable Object in Cloudflare Workers using Hono. It also shows how to access these bindings in `c.env` and how to pass the '_type struct_' for the bindings to the `Hono` as generics, which provides type safety.

*Source: docs/getting-started/cloudflare-workers.md*

### Using Environment Variables in Hono Middleware

In Hono, if you need to use environment variables or secret variables in middleware, such as 'username' or 'password' in Basic Authentication Middleware, you can do so as shown in the following code snippet.

```ts
import { basicAuth } from 'hono/basic-auth'

type Bindings = {
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

//...

app.use('/auth/*', async (c, next) =>
```

This is particularly useful when you need to use sensitive data like usernames or passwords in your middleware, which should not be hard-coded for security reasons. Instead, these values can be stored in environment variables and accessed as shown.

- This is the only case for Module Worker mode.
- Always ensure to keep your environment variables secure and do not expose them in your code or version control systems.

- [Hono Documentation](https://hono.boutell.com/)

- Using environment variables for sensitive data in middleware
- Implementing Basic Authentication using environment variables

**Reasoning:** This rule is important as it demonstrates how to use environment variables in Hono middleware. This is particularly useful when you need to use sensitive data like usernames or passwords in your middleware, which should not be hard-coded for security reasons.

*Source: docs/getting-started/cloudflare-workers.md*

### Setting up Authentication Middleware and Deploying Hono Project to Cloudflare using GitHub Actions

This code snippet demonstrates how to set up basic authentication middleware in a Hono application. The same process can be applied to other types of authentication middleware such as Bearer Authentication Middleware, JWT Authentication, etc.

```text
app.use('/auth/*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  })
  return auth(c, next)
})
```

The snippet also shows how to deploy a Hono project to Cloudflare using GitHub Actions. Before deploying, you need a Cloudflare token which can be managed from User API Tokens. If it's a newly created token, select the Edit Cloudflare Workers template. If you already have another token, make sure the token has the corresponding permissions.

Add a new secret with the name CLOUDFLARE_API_TOKEN in your GitHub repository settings dashboard. Then create .github/workflows/deploy.yml in your Hono project root folder and paste the deployment code.

The authentication middleware intercepts requests to '/auth/*' paths and checks if the provided username and password match the ones in the environment variables. If they match, the request is allowed to proceed, otherwise, it's rejected.

The deployment process is triggered whenever you push to the main branch of your repository. GitHub Actions checks out your code and deploys it to Cloudflare using the provided API token.

- Make sure to keep your Cloudflare API token secret to prevent unauthorized access to your Cloudflare account.

- [Hono Documentation](https://hono.boutell.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

- Securing routes in your Hono application
- Automating the deployment of your Hono application to Cloudflare

**Reasoning:** This rule is important as it demonstrates how to set up authentication middleware in Hono and how to deploy a Hono project to Cloudflare using GitHub Actions. Understanding this rule is crucial for securing your Hono applications and for automating the deployment process.

*Source: docs/getting-started/cloudflare-workers.md*

### Configuring the 'wrangler.toml' file for Cloudflare Workers deployment

This code snippet demonstrates how to configure the 'wrangler.toml' file when deploying a Cloudflare Workers application.

```toml
main = "src/index.ts"
minify = true
```

After the `compatibility_date` line in the 'wrangler.toml' file, add the above lines. The `main` line specifies the main entry point for the application, which in this case is 'src/index.ts'. The `minify` line enables minification for the deployed code, which can help reduce the size of the deployed code and improve performance.

- The 'wrangler.toml' file is a configuration file used by the Wrangler CLI, which is a tool for deploying Cloudflare Workers applications.
- The `main` and `minify` options should be configured according to the specific needs of your application.

- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/cli-wrangler/configuration)

- Configuring the 'wrangler.toml' file for a Cloudflare Workers deployment

**Reasoning:** This rule is important as it demonstrates how to configure the 'wrangler.toml' file for a Cloudflare Workers deployment. It shows how to specify the main entry point for the application and enable minification for the deployed code.

*Source: docs/getting-started/cloudflare-workers.md*

### Configuring Environment Variables for Local Development in Cloudflare Worker Project

This code snippet demonstrates how to configure environment variables for local development in a Cloudflare worker project.

```text

To configure the environment variables for local development, create the `.dev.vars` file in the root directory of the project.
Then configure your environment variables as you would with a normal env file.
```

1. Create a `.dev.vars` file in the root directory of your project.
2. Add your environment variables to this file in the format `KEY=value`.

- Keep this file out of version control to prevent sensitive data from being exposed. Add `.dev.vars` to your `.gitignore` file.

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/wrangler/c)

- Storing API keys, database passwords, and other sensitive data.
- Managing configurations that vary between deployment environments.

**Reasoning:** This rule is important as it demonstrates how to configure environment variables for local development in a Cloudflare worker project. Environment variables are crucial for managing configurations that vary between deployment environments (like development, staging, production). They help to keep sensitive data like API keys, database passwords, etc., out of the codebase.

*Source: docs/getting-started/cloudflare-workers.md*

### Accessing Environment Variables in Hono with Cloudflare Workers

When working with Hono and Cloudflare Workers, environment variables are accessed differently than in other Node.js environments. Instead of using `process.env`, you should use `c.env.*`.

Here's a code snippet demonstrating this:

```ts
Then we use the `c.env.*` to get the environment variables in our code.

For Cloudflare Workers, environment variables must be obtained via `c`, not via `process.env`.
```

This is due to the way Cloudflare Workers handle environment variables. For more information, refer to the [Cloudflare documentation](https://developers.cloudflare.com/workers/wrangler/configuration/#secrets).

Common use cases include accessing API keys, database credentials, or other sensitive information stored in environment variables.

**Reasoning:** This rule is important as it demonstrates how to correctly access environment variables in a Hono application when using Cloudflare Workers. It's crucial to understand that in this context, environment variables must be accessed via `c.env.*` and not `process.env` as is common in other Node.js environments. This is due to the specific way Cloudflare Workers handle environment variables.

*Source: docs/getting-started/cloudflare-workers.md*

### Creating a new Hono application and installing dependencies

This code snippet demonstrates how to create a new Hono application and install its dependencies using different package managers. 

```sh
[yarn]
yarn create hono my-app
sh
[pnpm]
pnpm create hono my-app
sh
[bun]
bun create hono@latest my-app
sh
[deno]
deno init --npm hono my-app
sh
[npm]
cd my-app
npm i
sh
[yarn]
cd my-app
yarn
sh
[pnpm]
cd my-app
pnpm i
sh
[bun]
cd my-app
bun i
```

The `create` command is used to create a new application. The `cd` command is used to move into the application directory. The `i` or `install` command is used to install the dependencies of the application.

- Different package managers have different syntax for the same operations.
- Always ensure to install the dependencies after creating a new application.

- [Hono documentation](https://hono.com/docs)

- Setting up a new Hono application

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and install its dependencies using different package managers. Understanding this is crucial for setting up a new Hono project correctly.

*Source: docs/getting-started/cloudflare-pages.md*

### Navigating into a Project Directory and Installing Dependencies in Hono

This code snippet demonstrates how to navigate into a project directory and install dependencies using different package managers. It also provides a basic directory structure for a Hono project.

```sh
[npm]
cd my-app
npm i
sh
[yarn]
cd my-app
yarn
sh
[pnpm]
cd my-app
pnpm i
sh
[bun]
cd my-app
bun i
text
./
├── package.json
├── public
│   └── static // Put your static files.
│       └── style.css // You can refer to it as `/static/style.css`.
├── src
│   ├── index.tsx // The entry point for serve
```

The `cd` command is used to navigate into the project directory. The `i` command is used to install the dependencies listed in the `package.json` file. The directory structure shows where to place static files and the entry point for the server.

Different package managers (npm, yarn, pnpm, bun) can be used to install dependencies, but the exact command may vary.

- [Hono documentation](https://hono.bun.dev/)

This is a common setup step when starting a new Hono project or when pulling an existing project from a repository.

**Reasoning:** This rule is important as it demonstrates how to navigate into a project directory and install dependencies using different package managers. It also shows the basic directory structure for a Hono project, which is crucial for understanding how to organize files and directories in such a project.

*Source: docs/getting-started/cloudflare-pages.md*

### Setting Up a Basic Hono Application and Defining Routes

This code snippet demonstrates how to set up a basic Hono application and define routes.

```tsx
import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello, Cloudflare Pages!</h1>)
})
```

1. The Hono module is imported.
2. A new Hono application is created.
3. A wildcard route (`*`) is defined, which matches any path. The `renderer` function is used as the handler for this route.
4. A root route (`/`) is defined, which returns a rendered HTML string.

- The order of route definitions matters. Hono checks routes in the order they are defined.

- [Hono documentation](https://hono.boutique/docs)

- Setting up a new Hono application
- Defining routes in a Hono application

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application and define routes. It shows the standard way of importing the Hono module, creating a new Hono application, and defining a wildcard route and a root route. This is a fundamental pattern in Hono application development.

*Source: docs/getting-started/cloudflare-pages.md*

### Defining Routes and Rendering Responses in Hono

This code snippet demonstrates how to define routes and render responses in a Hono application. It also shows how to run the application locally and access it via a web browser.

```javascript
} from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello, Cloudflare Pages!</h1>)
})

export default app
```

1. The `Hono` class is instantiated to create a new Hono application.
2. The `get` method is used to define routes. The first argument is the path, and the second argument is the handler function.
3. The `renderer` function is used to render responses.
4. The application is exported for use in other modules.

- The `*` path in the `get` method matches all routes.
- The `renderer` function should be defined in the same module or imported from another module.

- [Hono Documentation](https://hono.bun.dev/)

- Defining routes and rendering responses in a Hono application.
- Running a Hono application locally.

**Reasoning:** This rule is important as it demonstrates how to define routes and render responses in a Hono application. It also shows how to run the application locally and access it via a web browser.

*Source: docs/getting-started/cloudflare-pages.md*

### Deploying a Hono Application to Cloudflare

This code snippet demonstrates how to deploy a Hono application to Cloudflare using different package managers.

```sh
::: code-group

```sh [npm]
npm run deploy
sh [yarn]
yarn deploy
sh [pnpm]
pnpm run deploy
sh [bun]
bun run deploy

1. The `run deploy` command is used to deploy the application. The command that is used depends on the package manager that you are using.
2. In `package.json`, `$npm_execpath` needs to be changed to your package manager of choice.

- Make sure that you have a Cloudflare account before attempting to deploy.
- The package manager used must be installed in your system.

- [Hono Documentation](https://hono.bouffier.dev/docs)
- [Cloudflare Documentation](https://developers.cloudflare.com/pages/)

- Deploying a Hono application to the cloud for user accessibility.

**Reasoning:** This rule is important as it demonstrates how to deploy a Hono application to Cloudflare using different package managers. It shows the necessary commands to run in the terminal for different package managers (npm, yarn, pnpm, bun) to deploy the application. This is crucial for developers to understand as it allows them to deploy their applications to the cloud, making it accessible to users.

*Source: docs/getting-started/cloudflare-pages.md*

### Deploying Hono Application via Cloudflare Dashboard with GitHub and Creating Local Bindings

This code snippet demonstrates how to deploy a Hono application via the Cloudflare dashboard with GitHub and how to create local bindings using the `wrangler.toml` file.

```text

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select Workers & Pages > Create application > Pages > Connect to Git.
3. Authorize your GitHub account, and select the repository. In Set up builds and deployments, provide the following information:

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `dist`          |

You can use Cloudflare Bindings like Variables, KV, D1, and others.
In this section, let's use Variables and KV.

First, create `wrangler.toml` for local Bindings:
```

1. The Cloudflare dashboard is used to connect to a GitHub repository and set up the build and deployment settings.
2. The `wrangler.toml` file is created for local bindings. This file is used to specify variables that can be used in the Hono application.

- Make sure to replace the `main` branch, `npm run build` command, and `dist` directory with the actual values for your Hono application.
- The `wrangler.toml` file should be located in the root directory of your Hono application.

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

- Deploying a Hono application to production
- Setting up local bindings for a Hono application

**Reasoning:** This rule is important as it demonstrates how to deploy a Hono application via the Cloudflare dashboard with GitHub and how to create local bindings using the `wrangler.toml` file. Understanding this process is crucial for deploying and managing Hono applications in a production environment.

*Source: docs/getting-started/cloudflare-pages.md*

### Creating and Specifying a Variable in `wrangler.toml` File

This code snippet demonstrates how to create and specify a variable in the `wrangler.toml` file in the Hono framework.

```toml
[vars]
MY_NAME = "Hono"
```

1. The `[vars]` section in the `wrangler.toml` file is used to define environment variables.
2. The variable `MY_NAME` is defined and assigned the value `Hono`.

- Variables defined in the `wrangler.toml` file can be accessed in the application code.
- The `wrangler.toml` file is a configuration file for the Wrangler CLI, which is used to manage and deploy Workers projects.

- [Wrangler Configuration](https://developers.cloudflare.com/workers/cli-wrangler/configuration)

- Defining environment-specific variables such as API keys, database connection strings, etc.
- Managing different configurations for different environments (development, staging, production).

**Reasoning:** This rule is important as it demonstrates how to create and specify a variable in the `wrangler.toml` file in the Hono framework. Understanding how to define variables is crucial for managing and configuring the application's environment.

*Source: docs/getting-started/cloudflare-pages.md*

### Creating a Key-Value Namespace in Cloudflare Workers

This code snippet demonstrates how to create a Key-Value (KV) namespace using the `wrangler` command in Cloudflare Workers.

```sh
wrangler kv namespace create MY_KV --preview
```

The `wrangler kv namespace create` command creates a new namespace under your account. The `--preview` flag is used to create the namespace in preview mode.

After running the command, you should note down the `preview_id` from the output. This `preview_id` will be used to bind the namespace to your worker.

- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv)

This command is commonly used when setting up a new Cloudflare Worker project and you need to store data in a distributed, eventually-consistent key-value store.

**Reasoning:** This rule is important as it demonstrates how to create a Key-Value (KV) namespace using the `wrangler` command in Cloudflare Workers. KV namespaces are a feature of Cloudflare Workers that allow you to store data in a distributed, eventually-consistent key-value store. This is a fundamental step in setting up a Cloudflare Worker project.

*Source: docs/getting-started/cloudflare-pages.md*

### Creating and Binding a KV Namespace in Cloudflare

This code snippet demonstrates how to create a Key-Value (KV) namespace in Cloudflare and bind it to a specific identifier using the `wrangler` command.

```sh
wrangler kv namespace create MY_KV --preview

{ binding = "MY_KV", preview_id = "abcdef" }
toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abcdef"
```

The `wrangler` command creates a new KV namespace. The `--preview` flag is used to get a `preview_id` which is then used to bind the namespace to a specific identifier.

- The `preview_id` is unique to each KV namespace and is used to identify it.
- The `binding` is the identifier to which the KV namespace is bound.

- [Cloudflare KV Namespace Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv)

- Storing and retrieving data in a distributed, low-latency manner for high-performance web applications.

#### Code Snippet

```typescript

After running the command, note down the `preview_id` from the output.

```

**Reasoning:** This rule is important because it demonstrates how to create a Key-Value (KV) namespace in Cloudflare using the `wrangler` command, and how to bind it to a specific identifier. This is crucial in Hono as it allows for the storage and retrieval of data in a distributed, low-latency manner, which is essential for high-performance web applications.

*Source: docs/getting-started/cloudflare-pages.md*

### Creating and Binding a Namespace in Cloudflare Workers KV

In Cloudflare Workers, you can create a namespace in Workers KV by running the following `wrangler` command:

```sh
wrangler kv namespace create MY_KV --preview

{ binding = "MY_KV", preview_id = "abcdef" }
toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abcdef"
```

The `wrangler kv namespace create` command creates a new namespace in Workers KV. The `--preview` flag ensures that the namespace is only created in the preview environment, not in the production environment.

The `preview_id` is a unique identifier for the namespace. You need to specify this ID along with the binding name in your application's configuration file to bind the namespace to your application.

- Make sure to replace `MY_KV` and `abcdef` with your actual binding name and preview ID.
- The binding name must be unique across your application.

- [Cloudflare Workers KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv)

- Storing and retrieving data in a distributed, eventually consistent key-value store in a Cloudflare Workers application.

#### Code Snippet

```typescript

This command will output a `preview_id` that you need to note down:

```

**Reasoning:** This rule is important as it demonstrates how to create a namespace in Cloudflare Workers KV and bind it to a specific ID. This is a crucial step in setting up a Cloudflare Workers environment, as it allows the application to store and retrieve data in a distributed, eventually consistent key-value store. The rule also shows how to configure the binding in the application's configuration file.

*Source: docs/getting-started/cloudflare-pages.md*

### Editing the `vite.config.ts` File in Hono

In a Hono project, the `vite.config.ts` file is used to configure the Vite development server and build process. This file is crucial for the proper functioning of a Hono application.

Here is a code snippet demonstrating how to edit this file:

```ts

Edit the `vite.config.ts`:
```

To edit this file, you need to import the necessary modules from Hono, such as the development server and the Cloudflare adapter. Then, you can define your configuration using the `defineConfig` function from Vite.

It's important to note that the specific configuration will depend on the needs of your project. Always refer to the Hono and Vite documentation for more details on how to configure your application.

- [Hono Documentation](https://hono.dev/docs)
- [Vite Documentation](https://vitejs.dev/config/)

- Configuring the development server for a Hono application
- Setting up the build process for a Hono application

**Reasoning:** This rule is important as it demonstrates how to edit the `vite.config.ts` file in a Hono project. This file is crucial for configuring the Vite development server and build process, which are essential for the proper functioning of a Hono application.

*Source: docs/getting-started/cloudflare-pages.md*

### Using Bindings in Hono Applications

In Hono, you can use bindings to utilize variables and key-value (KV) pairs in your application. It is important to set the types for these bindings to ensure type safety and improve code readability and maintainability.

Here is a code snippet demonstrating this:

```ts
type Bindings = {
  MY_NAME: string
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()
```

In this snippet, a `Bindings` type is defined with `MY_NAME` as a string and `MY_KV` as a `KVNamespace`. Then, a new Hono application is created with these bindings.

When you define a type for your bindings, you specify the types of the variables and KV pairs you will use in your application. This helps TypeScript to understand the types of these bindings and can prevent type-related errors.

- Always define types for your bindings to ensure type safety.

- [Hono Documentation](https://hono.boutique/docs)

- Using bindings to store and retrieve application-specific data.
- Using bindings to manage environment-specific variables.

**Reasoning:** This rule is important as it demonstrates how to use bindings in a Hono application. Bindings allow you to use variables and key-value (KV) pairs in your application. By setting the types for these bindings, you ensure type safety and improve code readability and maintainability.

*Source: docs/getting-started/cloudflare-pages.md*

### Handling Different Environments in Hono

This rule demonstrates how to handle different environments in Hono, specifically for Cloudflare Pages and client-side scripts.

```text

For Cloudflare Pages, you will use `wrangler.toml` for local development, but for production, you will set up Bindings in the dashboard.

You can write client-side scripts and import them into your application using Vite's features.
If `/src/client.ts` is the entry point for the client, simply write it in the script tag.
Additionally, `import.meta.env.PROD` is useful for detecting whether it's running on a dev server or in the build phase.
```

For Cloudflare Pages, `wrangler.toml` is used for local development. For production, Bindings are set up in the dashboard. On the client-side, scripts can be written and imported into the application using Vite's features. The entry point for the client is `/src/client.ts`, which can be written in the script tag. The environment variable `import.meta.env.PROD` can be used to detect whether the application is running on a dev server or in the build phase.

It's crucial to correctly set up the environment configurations to ensure the application runs correctly in different environments.

- [Hono Documentation](https://hono.boutique/docs)

- Setting up different configurations for local development and production
- Detecting the running environment to adjust application behavior

**Reasoning:** This rule is important as it demonstrates how to handle different environments in Hono, specifically for Cloudflare Pages and client-side scripts. It shows how to use different configuration files for local development and production, and how to use environment variables to detect the running environment.

*Source: docs/getting-started/cloudflare-pages.md*

### Configuring Hono Application with vite.config.ts

The `vite.config.ts` file is used to configure your Hono application. This file is important for setting up your development environment and ensuring that your application runs correctly.

Here is an example of how to use the `vite.config.ts` file:

```ts
import pages from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client
```

In this example, we are importing the necessary modules and defining the configuration for our application. The `defineConfig` function is used to define the configuration for our application.

- The `vite.config.ts` file is crucial for setting up your development environment and ensuring that your application runs correctly.
- Make sure to import the necessary modules and define the configuration correctly.

- [Hono Documentation](https://hono.bike/docs)

- Setting up the development environment for a Hono application.

**Reasoning:** This rule is important as it demonstrates how to properly configure a Hono application using the `vite.config.ts` file. This is crucial for setting up the development environment and ensuring that the application runs correctly.

*Source: docs/getting-started/cloudflare-pages.md*

### Building Server and Client Script with Vite

This code snippet demonstrates how to use the Vite build command to compile the server and client script.

```sh
vite build --mode client && vite build
```

The `vite build --mode client` command builds the client script, while the `vite build` command builds the server script. The `&&` operator is used to run these commands sequentially.

- Ensure that Vite is installed and properly configured in your project before running these commands.

- [Vite Documentation](https://vitejs.dev/guide/build.html)

- Use this command when you want to compile your source code for production deployment.

**Reasoning:** This rule is important as it demonstrates how to build the server and client script using the Vite build command. This is a crucial step in the development process as it compiles the source code into a format that can be executed by the browser or server.

*Source: docs/getting-started/cloudflare-pages.md*

### Integrating Cloudflare Pages Middleware with Hono

Cloudflare Pages uses its own middleware system that is different from Hono's middleware. This can be enabled in a Hono application by exporting an `onRequest` function in a `_middleware.ts` file.

Here is a code snippet demonstrating this:

```ts
// functions/_middleware.ts
export async function onRequest(pagesContext) {
  console.log(`You are accessing ${pagesContext.request.url}`)
  return await pagesContext.next()
}
```

The `onRequest` function is exported from the `_middleware.ts` file. This function logs the URL being accessed and then calls the `next` function on the `pagesContext` object, allowing the request to proceed to the next middleware in the stack.

- The `_middleware.ts` file should be located in the `functions` directory of your Hono application.

- [Cloudflare Pages Middleware Documentation](https://developers.cloudflare.com/pages/functions/middleware/)

- Logging requests in a Hono application hosted on Cloudflare Pages.
- Implementing custom middleware functionality in a Hono application hosted on Cloudflare Pages.

**Reasoning:** This rule is important as it demonstrates how to integrate Cloudflare Pages middleware with Hono. It shows how to create and export an `onRequest` function in a `_middleware.ts` file, which is a key step in enabling Cloudflare Pages middleware in a Hono application.

*Source: docs/getting-started/cloudflare-pages.md*

### Using Hono's Middleware in Cloudflare Pages

This guide demonstrates how to use Hono's middleware as Cloudflare Pages middleware.

```ts
// functions/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = handleMiddleware(async (c, next) => {
  console.log(`You are accessing ${c.req.url}`)
```

The `handleMiddleware` function from the 'hono/cloudflare-pages' module is imported and used to handle HTTP requests. The function logs the URL of the request.

- The `handleMiddleware` function is specific to the Hono framework and is used to handle HTTP requests in a Cloudflare Pages environment.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Logging HTTP request URLs in a Cloudflare Pages environment using Hono's middleware.

**Reasoning:** This rule is important as it demonstrates how to use Hono's middleware as Cloudflare Pages middleware. It shows how to import and use the `handleMiddleware` function from the 'hono/cloudflare-pages' module to handle HTTP requests in a Cloudflare Pages environment.

*Source: docs/getting-started/cloudflare-pages.md*

### Using Middleware in Hono

This code snippet demonstrates how to use built-in and third-party middleware in Hono. Middleware is a crucial part of web development as it allows developers to add functionality to their applications in a modular and reusable way.

```ts
import { handleMiddleware } from 'hono/cloudflare-pages'
import { basicAuth } from 'hono/basic-auth'

export const onRequest = handleMiddleware(
  basicAuth({
    username: 'user',
    password: 'pass'
  })
)
```

In this example, we're adding Basic Authentication to our Hono application using Hono's Basic Authentication Middleware. This middleware will require a valid username and password to be provided with each request.

1. We import the `handleMiddleware` function from `hono/cloudflare-pages`.
2. We import the `basicAuth` middleware from `hono/basic-auth`.
3. We use the `handleMiddleware` function to apply the `basicAuth` middleware to our `onRequest` function.

- Middleware functions are applied in the order they are defined.
- Middleware can modify the request and response objects.

- [Hono's Basic Authentication Middleware](/docs/middleware/builtin/basic-auth)

- Adding authentication to your application.
- Logging requests.
- Handling errors.

**Reasoning:** This rule is important as it demonstrates how to use built-in and third-party middleware in Hono. Middleware is a crucial part of web development as it allows developers to add functionality to their applications in a modular and reusable way. In this case, the code shows how to add Basic Authentication to a Hono application using Hono's Basic Authentication Middleware.

*Source: docs/getting-started/cloudflare-pages.md*

### Accessing EventContext in Hono Framework

In Hono framework, you can access the `EventContext` object via `c.env` in `handleMiddleware`. This object provides information about the event that triggered the function.

Here is a code snippet demonstrating this:

```ts
// functions/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = [
  handleMiddleware(async (c, next) => {
    c.env.eventContext.data.user = 'Joe'
  })
]
```

In this example, `c.env.eventContext.data.user` is being set to 'Joe'. This could be useful in scenarios where you need to modify or access event data.

- The `EventContext` object is read-only and its properties cannot be modified.

- [Cloudflare Pages API Reference](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext)

- Modifying or accessing event data
- Implementing custom logic based on event data

**Reasoning:** This rule is important as it demonstrates how to access the EventContext object in Hono framework using Cloudflare Pages. The EventContext object is a crucial part of Cloudflare Pages as it provides information about the event that triggered the function. Understanding how to access this object is key to effectively using the Hono framework with Cloudflare Pages.

*Source: docs/getting-started/cloudflare-pages.md*

### Setting and Accessing Event Context Data Using Middleware in Hono

This code demonstrates how to use middleware in Hono to set and access data in the event context. This is a common pattern in Hono and other web frameworks, allowing developers to share data across different parts of the application.

```ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = [
  handleMiddleware(async (c, next) => {
    c.env.eventContext.data.user = 'Joe'
    await next()
  }),
]
ts
// functions/api/[[route]].ts
import type { EventContext } from 'hono/cloudflare-pages'
import { handle } from 'hono/cloudflare-pages'

// ...

type Env = {
  Bindings: {
    eventContext: EventContext
  }
}
```

The `handleMiddleware` function is used to create a middleware function that sets a user value in the event context. This middleware function is then added to the `onRequest` array, which is a list of middleware functions that are run when a request is received.

In the handler, the `EventContext` type is imported from 'hono/cloudflare-pages' and used to type the `eventContext` property of the `Env` type. The user value set in the middleware can then be accessed via `c.env.eventContext`.

- Middleware functions in Hono are asynchronous and must call the `next` function to pass control to the next middleware function in the stack.

- [Hono Documentation](https://hono.boutique/docs)

- Sharing data across different parts of the application
- Setting up context-specific data for handlers

#### Code Snippet

```typescript

Then, you can access the data value in via `c.env.eventContext` in the handler:

```

**Reasoning:** This rule is important as it demonstrates how to use middleware in Hono to set and access data in the event context. This is a common pattern in Hono and other web frameworks, allowing developers to share data across different parts of the application.

*Source: docs/getting-started/cloudflare-pages.md*

### Installing Azure Functions Core Tools on macOS

This code snippet demonstrates how to install Azure Functions Core Tools on macOS using Homebrew.

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4
```

1. `brew tap azure/functions`: This command adds the Azure Functions repository to the list of formulae that brew tracks, updates, and installs from.

2. `brew install azure-functions-core-tools@4`: This command installs the Azure Functions Core Tools version 4.

- Ensure that Homebrew is installed on your macOS before running these commands.

- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4#install-the-azure-functions-core-tools)

- Setting up the development environment for working with Azure Functions.

**Reasoning:** This rule is important as it demonstrates how to install Azure Functions Core Tools on macOS using Homebrew. Azure Functions Core Tools is a command line tool that allows you to create, test, run, and manage Azure Functions on your local development machine. It is a crucial step in setting up the development environment for working with Azure Functions.

*Source: docs/getting-started/azure-functions.md*

### Initializing a TypeScript Node.js V4 Project and Changing Default Route Prefix in Azure Functions

This code snippet demonstrates how to initialize a TypeScript Node.js V4 project and change the default route prefix of the host in Azure Functions.

```sh
func init --typescript
json
"extensions": {
    "http": {
        "routePrefix": ""
    }
}
```

The `func init --typescript` command initializes a new TypeScript Node.js V4 project in the current folder. The `routePrefix` property in `host.json` determines the default route prefix for all HTTP routes.

- The `routePrefix` property should be set to an empty string to remove the default route prefix.

- [Azure Functions documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)

- Setting up a serverless function in Azure
- Changing the default route prefix for HTTP routes

#### Code Snippet

```typescript

After initializing the project, you can change the default route prefix of the host by adding the following property to the root json object of `host.json`:

```

**Reasoning:** This rule is important as it demonstrates how to initialize a TypeScript Node.js V4 project and how to change the default route prefix of the host in Azure Functions. This is a fundamental step in setting up a serverless function in Azure using the Hono framework.

*Source: docs/getting-started/azure-functions.md*

### Changing the Default Route Prefix in Azure Functions with Hono

This code snippet demonstrates how to change the default route prefix in Azure Functions when using the Hono framework.

```json
"extensions": {
    "http": {
        "routePrefix": ""
    }
}
```

This code should be added to the root JSON object of `host.json` in your Azure Functions project. The `routePrefix` property is set to an empty string, which removes the default '/api' prefix.

The default Azure Functions route prefix is '/api'. If you don't change it as shown above, be sure to start all your Hono routes with '/api'.

- [Azure Functions documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference)

This rule is commonly used when you want to customize the route prefix in your Azure Functions project using the Hono framework.

**Reasoning:** This rule is important as it demonstrates how to change the default route prefix in Azure Functions when using the Hono framework. By default, Azure Functions uses '/api' as the route prefix. If this is not changed, all Hono routes must start with '/api'. This rule shows how to change this default setting, which can be useful in cases where a different route prefix is desired.

*Source: docs/getting-started/azure-functions.md*

### Setting Up a Basic Hono Application with Azure Functions

To start with, you need to install Hono and the Azure Functions adapter. Depending on your package manager, you can use one of the following commands:

```sh
yarn add @marplex/hono-azurefunc-adapter hono
sh
pnpm add @marplex/hono-azurefunc-adapter hono
sh
bun add @marplex/hono-azurefunc-adapter hono
ts
// src/app.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Azure Functions!'))

export default app
```

This code creates a new Hono application and defines a GET route at the root path (`/`). When this route is accessed, it responds with the text 'Hello Azure Functions!'.

Finally, create a new file `src/functions/httpTrigger.ts` and add the necessary code to set up an Azure Functions HTTP trigger.

- Make sure to install the Azure Functions adapter alongside Hono. This adapter is necessary for Hono to work with Azure Functions.
- The `app.get` method is used to define a GET route. The first argument is the path, and the second argument is a callback function that takes a context object `c` and returns the response.

- [Hono Documentation](https://marplex.github.io/hono/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)

- Setting up a basic Hono application with Azure Functions
- Defining simple routes in a Hono application

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application with Azure Functions. It shows how to install necessary dependencies and create a simple 'Hello World' route.

*Source: docs/getting-started/azure-functions.md*

### Creating a Basic Hono Application and a HTTP Trigger Function in Azure

This code demonstrates how to set up a basic Hono application and how to create a HTTP trigger function in Azure using Hono.

```ts
// src/app.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Azure Functions!'))

export default app
ts
// src/functions/httpTrigger.ts
import { app } from '@azure/functions'
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter'
import honoApp from '../app'

app.http('httpTrigger', {
  m
```

1. The first code snippet creates a new Hono application and sets up a route handler for GET requests at the root URL (`/`). The handler simply returns a text response.

2. The second code snippet imports the Hono application and sets up a HTTP trigger function in Azure. The `httpTrigger` function is configured to use the Hono application.

- The `azureHonoHandler` function from the `@marplex/hono-azurefunc-adapter` package is used to adapt the Hono application to work with Azure Functions.

- [Hono documentation](https://hono.marplex.net/)

- Setting up a basic Hono application
- Creating a HTTP trigger function in Azure using Hono

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application and how to create a HTTP trigger function in Azure using Hono. Understanding this rule is crucial for developers who want to use Hono with Azure Functions.

*Source: docs/getting-started/azure-functions.md*

### Defining Supported HTTP Methods and Running a Hono Application

This code snippet demonstrates how to define the HTTP methods supported by your Hono application and how to run the development server locally.

```text
ds: [
    //Add all your supported HTTP methods here
    'GET',
    'POST',
    'DELETE',
    'PUT',
],
authLevel: 'anonymous',
route: '{*proxy}',
handler: azureHonoHandler(honoApp.fetch),
})
text
npm run start
text
yarn start
text
pnpm start
text
bun run start
```

The `ds` array is where you define all the HTTP methods your application supports. The `authLevel` is set to 'anonymous', which means no authentication is required. The `route` is set to '{*proxy}', which means all routes are handled by the specified handler.

The `npm run start` command starts the development server locally. You can access the application in your web browser at `http://localhost:7071`.

Make sure to define all the HTTP methods your application supports in the `ds` array. If a method is not defined, the application will not respond to requests using that method.

- [Hono documentation](https://www.eclipse.org/hono/docs/)

- Setting up and running a Hono application
- Defining supported HTTP methods

#### Code Snippet

```typescript

To run the development server locally, use the following command:

```

**Reasoning:** This rule is important as it demonstrates how to define HTTP methods supported by the Hono application, how to run the development server locally, and how to start the application using different package managers. Understanding this rule is crucial for setting up and running a Hono application.

*Source: docs/getting-started/azure-functions.md*

### Preparing a Project for Deployment to Azure

This code snippet demonstrates how to prepare a project for deployment to Azure. It involves building the project using different package managers such as npm, yarn, pnpm, and bun.

```text
:::

::: info
Before you can deploy to Azure, you need to create some resources in your cloud infrastructure. Please visit the Microsoft documentation on [Create supporting Azure resources for your function](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4&tabs=windows%2Cazure-cli%2Cbrowser#create-supporting-azure-resources-for-your-function)
:::

Build the project for deployment:

::: code-group
```

Before deploying a project to Azure, it's necessary to build the project. This can be done using the `build` command of the package manager that's being used. The `build` command compiles the source code into a format that can be run on the server.

- Before deploying to Azure, it's necessary to create some resources in the cloud infrastructure. This can be done by following the provided Microsoft documentation link.

- [Microsoft Documentation: Create supporting Azure resources for your function](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4&tabs=windows%2Cazure-cli%2Cbrowser#create-supporting-azure-resources-for-your-function)

- Preparing a project for deployment to Azure
- Building a project using different package managers

**Reasoning:** This rule is important as it demonstrates how to prepare a project for deployment to Azure using different package managers. It highlights the necessary steps to build the project before deploying it to the cloud infrastructure.

*Source: docs/getting-started/azure-functions.md*

### Deploying a Hono Project to Azure Cloud

This code snippet demonstrates how to deploy a Hono project to the Azure Cloud.

```sh
func azure functionapp publish <YourFunctionAppName>
```

The `func azure functionapp publish` command is used to deploy your project to the function app in Azure Cloud. You need to replace `<YourFunctionAppName>` with the name of your app.

- Ensure that you have the Azure Functions Core Tools installed on your machine.

- You need to be logged in to your Azure account in the terminal or command prompt from which you are running the command.

- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=windows%2Ccsharp%2Cbash)

- Deploying a Hono project to Azure Cloud for hosting.

- Updating a Hono project that is already hosted on Azure Cloud.

**Reasoning:** This rule is important as it demonstrates how to deploy a Hono project to the Azure Cloud. Understanding this process is crucial for developers who want to host their applications on the Azure platform.

*Source: docs/getting-started/azure-functions.md*

### Creating a New Hono Application and Installing Dependencies

This code snippet demonstrates how to create a new Hono application and install its dependencies using different package managers.

```sh
yarn create hono my-app
sh
pnpm create hono my-app
sh
bun create hono@latest my-app
sh
deno init --npm hono my-app
sh
cd my-app
npm i
sh
cd my-app
yarn
sh
cd my-app
pnpm i
sh
cd my-app
bun i
```

The `create` command is used to create a new application. The `cd` command is used to move to the application directory. The `i` or `install` command is used to install the dependencies.

- Ensure that you have the package manager installed on your system before running these commands.

- Hono Documentation

- Setting up a new Hono project

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and install its dependencies using different package managers. Understanding this rule is crucial for setting up a new Hono project correctly.

*Source: docs/getting-started/nodejs.md*

### Creating a Basic Hono Application

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono web framework.

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Node.js!'))

serve(app)
```

1. The necessary modules are imported.
2. A new Hono application is created.
3. A route is defined for the root URL ('/') that responds with the text 'Hello Node.js!'.
4. The application is served using the 'serve' function.

- The 'serve' function starts the server and listens for requests.
- The 'get' method is used to define a route for HTTP GET requests.

- Hono documentation: https://hono.beyondco.de/docs/getting-started

- Creating a simple web server with Hono.
- Defining routes and handling requests in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono web framework. It shows how to import the necessary modules, create a new Hono application, define a route, and serve the application.

*Source: docs/getting-started/nodejs.md*

### Running a Hono Application Locally

This code snippet demonstrates how to run a Hono application on your local machine for development and testing purposes.

```text

Run the development server locally. Then, access `http://localhost:3000` in your Web browser.

::: code-group
```

1. The `npm run dev`, `yarn dev`, or `pnpm dev` command starts the development server.
2. Once the server is running, you can access the application by navigating to `http://localhost:3000` in your web browser.

- Make sure to install the necessary dependencies before running the server.
- Ensure that the port 3000 is not being used by another service.

- [Hono Documentation](https://hono.boutique/docs/)

- Running the application for local development and testing.
- Debugging the application in a local environment.

**Reasoning:** This rule is important as it demonstrates how to run a Hono application locally. It shows the commands to start the development server using different package managers like npm, yarn, and pnpm. Understanding how to run the server is crucial for local development and testing.

*Source: docs/getting-started/nodejs.md*

### Changing the Port Number in Hono

In Hono, you can specify the port number with the `port` option when calling the `serve` function. This is useful when you need to run your application on a different port than the default one.

Here is a code snippet demonstrating this:

```ts
serve({
  fetch: app.fetch,
  port: 8787,
})
```

In this example, the Hono application will run on port 8787.

The `serve` function takes an options object as its argument. One of the options you can specify is `port`, which determines the port number the application will run on.

- The `port` option only changes the port number for the current run of the application. If you want to permanently change the port number, you should set it in your application's configuration.

- [Hono API Documentation](https://hono.beyondnlp.com/api)

- Running your application on a different port in a development environment.
- Temporarily changing the port number for testing purposes.

**Reasoning:** This rule is important as it demonstrates how to change the port number in a Hono application. This is a common requirement in web development, as different environments may require the application to run on different ports.

*Source: docs/getting-started/nodejs.md*

### Accessing Raw Node.js APIs in Hono

In Hono, you can access the raw Node.js APIs from `c.env.incoming` and `c.env.outgoing`. This can be useful when you need to use specific Node.js features that are not directly exposed by Hono.

Here is a code snippet demonstrating this:

```ts
import { Hono } from 'hono'
import { serve, type HttpBindings } from '@hono/node-server'

// or `Http2Bindings` if you use HTTP2
type Bindings = HttpBindings & {
  /* ... */
}

const app = new Hono
```

The `c.env.incoming` and `c.env.outgoing` are properties of the context object `c` in Hono. They provide access to the raw incoming and outgoing Node.js APIs respectively.

- Be careful when using the raw Node.js APIs as they may not be compatible with the rest of your Hono application.

- [Hono documentation](https://hono.beyondco.de/docs/getting-started)

- When you need to use specific Node.js features that are not directly exposed by Hono.

**Reasoning:** This rule is important as it demonstrates how to access the raw Node.js APIs from within the Hono framework. This can be useful when developers need to use specific Node.js features that are not directly exposed by Hono.

*Source: docs/getting-started/nodejs.md*

### Creating a Basic HTTP Server and Serving Static Files with Hono

In Hono, you can create a basic HTTP server and serve static files from the local file system. The code snippet below demonstrates this:

```javascript
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.json({
    remoteAddress: c.env.incoming.socket.remoteAddress,
  })
})

serve(app)
```

In this example, an instance of Hono is created and a GET route is defined for the root URL (`/`). The callback function for this route returns a JSON response containing the remote address of the client.

To serve static files, you can use the `serveStatic` function. For example, if a request to the path `/static/*` comes in and you want to return a file under `./static`, you can use `serveStatic` to achieve this.

- The `serveStatic` function is not shown in the code snippet but is mentioned in the text. It's a common function used in many web frameworks to serve static files.

- Hono documentation: https://hono.bike/

- Serving static files like images, CSS, and JavaScript in a web application.
- Creating a basic HTTP server.

**Reasoning:** This rule is important as it demonstrates how to create a basic HTTP server using Hono and how to serve static files from the local file system. Serving static files is a common requirement in many web applications, and understanding how to do this in Hono is crucial.

*Source: docs/getting-started/nodejs.md*

### Serving Static Files in Hono

This code demonstrates how to serve static files from a local file system using Hono web framework.

```ts
import { serveStatic } from '@hono/node-server/serve-static'

app.use('/static/*', serveStatic({ root: './' }))
```

When a request to the path `/static/*` comes in, Hono will return a file under `./static` directory.

The `serveStatic` function from `@hono/node-server/serve-static` is used as a middleware in the application. This function takes an options object where `root` property specifies the root directory from which to serve static assets.

- The path `/static/*` is a wildcard path that matches any path starting with `/static/`.
- The `root` option in `serveStatic` function specifies the root directory from which to serve static assets.

- [Hono documentation](https://hono.bevry.me/)

- Serving images, CSS, and JavaScript files in a web application.

**Reasoning:** This rule is important as it demonstrates how to serve static files from a local file system using Hono web framework. It shows how to handle incoming requests to a specific path and return a file from a specified directory. This is a common requirement in many web applications where static resources like images, CSS, and JavaScript files are served from the server.

*Source: docs/getting-started/nodejs.md*

### Serving Static Files in Specific Paths with Hono

In Hono, you can serve static files in specific paths using the 'serveStatic' function from '@hono/node-server/serve-static'. Here's an example of how to serve a 'favicon.ico' file in the directory root:

```ts
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
```

In this code snippet, 'app.use' is used to define a middleware function to be used for requests to the '/favicon.ico' path. The 'serveStatic' function is then used with the 'path' option set to './favicon.ico', which means that requests to '/favicon.ico' will be served the 'favicon.ico' file in the directory root.

- The 'serveStatic' function can be used to serve any static file, not just 'favicon.ico'.
- The path provided to 'serveStatic' should be relative to the directory where your server script is running.

- [Hono Documentation](https://hono.bike/docs)

- Serving a custom 404 page
- Serving images, stylesheets, and scripts for a website

**Reasoning:** This rule is important as it demonstrates how to serve static files in a specific path using the Hono web framework. It shows how to use the 'serveStatic' function from '@hono/node-server/serve-static' to serve a specific file (in this case, 'favicon.ico') in the directory root. This is a common requirement in web development, where certain files need to be served statically and at specific paths.

*Source: docs/getting-started/nodejs.md*

### Serving Static Files with Hono

In Hono, you can serve static files from different directories by mapping requests to specific paths to the corresponding static files in the server's file system. This is done using the `serveStatic` function and specifying the `root` or `path` option.

Here is an example of how to serve all files in the root directory when a request to the path `/static/*` comes in:

```ts
app.use('/static/*', serveStatic({ root: './' }))
ts
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
ts
app.use('*', serveStatic({ root: './static' }))
```

- The `serveStatic` function is part of the Hono framework and is used to serve static files.
- The `root` option specifies the root directory from which to serve static files.
- The `path` option specifies the path to a specific file to serve.

- [Hono Documentation](https://hono.bevry.me/)

- Serving static files like images, CSS, and JavaScript in a web application.
- Serving a favicon for a website.
- Serving files from different directories based on the request path.

#### Code Snippet

```typescript

If you want to serve a specific file, like `favicon.ico`, from the root directory, you can do it like this:

```

**Reasoning:** This rule is important as it demonstrates how to serve static files in different directories using Hono. It shows how to map requests to specific paths to the corresponding static files in the server's file system. This is a common requirement in web development, and understanding how to do it efficiently can greatly improve the performance and responsiveness of a web application.

*Source: docs/getting-started/nodejs.md*

### Using 'rewriteRequestPath' to Map URL Paths to Different Directories in Hono

In Hono, you can use the 'rewriteRequestPath' option to map a specific URL path to a different directory. This is particularly useful when you want to serve static files from a directory that is different from the one specified in the URL.

Here is a code snippet demonstrating this:

```ts
app.get(
  '/static/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) =>
      path.replace(/^\/static/, '/statics'),
  })
)
```

In this example, any request to 'http://localhost:3000/static/*' will be mapped to the './statics' directory instead of the './static' directory.

The 'rewriteRequestPath' option takes a function that modifies the request path. In this case, the function replaces '/static' with '/statics' in the request path.

- The 'rewriteRequestPath' option only modifies the request path for the purpose of serving static files. It does not change the actual URL of the request.

- [Hono Documentation](https://hono.bevry.me/)

- Serving static files from a different directory than the one specified in the URL.
- Redirecting requests to a different directory based on certain conditions.

**Reasoning:** This rule is important as it demonstrates how to use the 'rewriteRequestPath' option in Hono to map a specific URL path to a different directory. This is useful in cases where you want to serve static files from a different directory than the one specified in the URL.

*Source: docs/getting-started/nodejs.md*

### Running Hono on a Node.js http2 Server

This code snippet demonstrates how to run Hono on a Node.js http2 Server.

```ts
import { createServer } from 'node:http2'

const server = serve({
  fetch: app.fetch,
  createServer,
})
```

1. The `createServer` function from the `node:http2` module is imported.
2. The `serve` function is called with an object that includes the `fetch` method from the Hono application and the `createServer` function.

- This setup is for an unencrypted http2 server. For an encrypted server, you would need to use the `createSecureServer` function from the `node:http2` module.

- [Node.js http2 Server](https://nodejs.org/api/http2.html)

- When you want to leverage the benefits of http2 in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to run Hono on a Node.js http2 Server. It shows the basic setup for an unencrypted http2 server, which is crucial for developers who want to leverage the benefits of http2, such as server push, header compression, and full request and response multiplexing.

*Source: docs/getting-started/nodejs.md*

### Setting Up Unencrypted and Encrypted HTTP2 Servers in Node.js with Hono

This guide demonstrates how to set up both unencrypted and encrypted http2 servers in Node.js using the Hono framework.

```ts
import { createServer } from 'node:http2'

const server = serve({
  fetch: app.fetch,
  createServer,
})
ts
import { createSecureServer } from 'node:http2'
import { readFileSync } from 'node:fs'

const server = serve({
  fetch: app.fetch,
  createServer: createSecureServer,
  serverOptions: {
    key: readFileSync('path/to/key'),
    cert: readFileSync('path/to/cert')
  }
})
```

In the unencrypted server setup, the `createServer` function from the `node:http2` module is used. In the encrypted server setup, the `createSecureServer` function is used instead, along with server options for the SSL key and certificate.

**Important Notes:**

- Ensure that the paths to your SSL key and certificate are correct in the encrypted server setup.

**References:**

- [Node.js http2 Server](https://nodejs.org/api/http2.html)

**Common Use Cases:**

- Setting up a basic http2 server for a web application.
- Setting up a secure http2 server for a web application that handles sensitive data.

#### Code Snippet

```typescript

### Encrypted HTTP2 Server

```

**Reasoning:** This rule is important as it demonstrates how to set up both unencrypted and encrypted http2 servers in Node.js using the Hono framework. Understanding how to correctly implement these servers is crucial for ensuring the security and functionality of your web application.

*Source: docs/getting-started/nodejs.md*

### Building and Deploying a Hono Application

This code snippet demonstrates the necessary steps to build and deploy a Hono application.

```text
1. Add "outDir": "./dist" to the `compilerOptions` section `tsconfig.json`.
2. Add "exclude": ["node_modules"] to `tsconfig.json`.
3. Add "build": "tsc" to `script` section of `package.json`.
4. Run `npm install typescript --save-dev`.
5. Add "type": "module" to `package.json`.
6. Run `npm run build`!
Dockerfile
FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json tsconfig.json src ./

RUN npm ci && \
    npm run build && \
    npm prune
```

The steps configure TypeScript and package.json for the application, install TypeScript as a development dependency, and build the application. The Dockerfile then creates a Docker image of the application, which can be deployed to any environment that supports Docker.

- The Dockerfile assumes that the application's source code is in a directory named 'src'. If your application's source code is in a different directory, you will need to modify the Dockerfile accordingly.

- [Hono's Vite plugins](https://github.com/honojs/vite-plugins)

- Building and deploying a Hono application
- Containerizing a Hono application for deployment

#### Code Snippet

```typescript

After these steps, a Dockerfile is provided for building a Docker image of the application.

```

**Reasoning:** This rule is important as it demonstrates the process of building and deploying a Hono application. It covers the necessary steps to configure TypeScript and package.json, install necessary dependencies, and build the application. It also provides an example of a Dockerfile for containerizing the application, which is a common practice for deploying web applications.

*Source: docs/getting-started/nodejs.md*

### Initializing a New Supabase Project

This code snippet demonstrates how to initialize a new Supabase project in the current directory.

```bash
supabase init
```

The `supabase init` command initializes a new Supabase project in the current directory. This is the first step in creating a new project with Supabase.

- Ensure that you have Supabase CLI installed on your machine before running this command.
- This command should be run in the directory where you want to create your new Supabase project.

- [Supabase CLI Documentation](https://supabase.io/docs/guides/cli)

- Starting a new project with Supabase.

**Reasoning:** This rule is important as it demonstrates the initialization of a new Supabase project, which is a fundamental step in starting any project with Supabase. Understanding this command is crucial for developers to get started with their projects.

*Source: docs/getting-started/supabase-functions.md*

### Creating a New Edge Function in Supabase

This guide demonstrates how to create a new Edge Function in a Supabase project using the Hono framework.

```bash
supabase functions new hello-world
```

The `supabase functions new` command is used to create a new Edge Function in your Supabase project. The `hello-world` argument specifies the name of the new function.

- The new function is created in the `supabase/functions` directory of your project.
- The function name should be unique within your project.

- [Supabase Documentation](https://supabase.io/docs)

- Adding new functionalities to your Supabase project.
- Creating a function to handle specific tasks in your application.

**Reasoning:** This rule is important as it demonstrates how to create a new Edge Function in a Supabase project using the Hono framework. Understanding this rule allows developers to effectively add new functionalities to their Supabase projects.

*Source: docs/getting-started/supabase-functions.md*

### Creating a Basic Function in Hono

This code snippet demonstrates how to create a basic 'Hello World' function using the Hono framework.

```ts
import { Hono } from 'jsr:@hono/hono'

// change this to your function name
const functionName = 'hello-world'
const app = new Hono().basePath(`/${functionName}`)

app.get('/hello', (c) => c.text('Hello from hono-server!'))

Deno.serve(app.fetch)
```

1. The Hono module is imported.
2. A constant `functionName` is defined with the name of the function.
3. A new Hono instance is created and the base path for the function is set using the `basePath` method.
4. A GET request handler for the '/hello' path is defined using the `get` method. The handler sends a text response 'Hello from hono-server!'.
5. The function is served using the `Deno.serve` method and the `fetch` method of the Hono instance.

- The function name should be unique within the project.
- The `basePath` method sets the base URL path for all routes of the Hono instance.

- Hono documentation: https://hono.bayrell.org/

- Creating a basic web server
- Defining request handlers for specific paths

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' function using the Hono framework. It shows how to import the Hono module, define a function name, set a base path for the function, define a GET request handler for the '/hello' path, and serve the function using Deno. Understanding this pattern is crucial for developers to get started with creating web applications using the Hono framework.

*Source: docs/getting-started/supabase-functions.md*

### Starting Supabase Stack and Serving Functions Locally

This code snippet demonstrates how to start a Supabase stack and serve a function locally using Hono. It also shows how to bypass JWT verification during local development.

```bash
supabase start # start the supabase stack
supabase functions serve --no-verify-jwt # start the Functions watcher
```

1. `supabase start` command is used to start the Supabase stack.
2. `supabase functions serve --no-verify-jwt` command is used to start the Functions watcher. The `--no-verify-jwt` flag allows you to bypass JWT verification during local development.

- The `--no-verify-jwt` flag should only be used during local development and should not be used in a production environment.

- [Supabase Documentation](https://supabase.io/docs)

- Starting a Supabase stack and serving functions locally for testing and debugging purposes.

**Reasoning:** This rule is important as it demonstrates how to start a Supabase stack and serve a function locally using Hono. It also shows how to bypass JWT verification during local development, which can be useful for testing and debugging.

*Source: docs/getting-started/supabase-functions.md*

### Making GET Requests and Deploying Functions in Hono

This guide demonstrates how to make a GET request to a Hono server and how to deploy all Edge Functions in Supabase with a single command.

```bash
curl  --location  'http://127.0.0.1:54321/functions/v1/hello-world/hello'
bash
supabase functions deploy
```

The `--no-verify-jwt` flag allows you to bypass JWT verification during local development.

- [Hono Documentation](https://hono.eclipse.org/)
- [Supabase Documentation](https://supabase.io/docs)

These commands are commonly used during local development and deployment of applications using the Hono framework.

#### Code Snippet

```typescript

### How it Works

The `curl` command is used to make a GET request to the specified URL. The `--location` flag tells curl to handle redirects.

To deploy all your Edge Functions in Supabase, use the command:

```

**Reasoning:** This rule is important as it demonstrates how to make a GET request to a Hono server and how to deploy all Edge Functions in Supabase with a single command. Understanding these commands is crucial for local development and deployment of applications using the Hono framework.

*Source: docs/getting-started/supabase-functions.md*

### Deploying Functions in Supabase with Hono

This code snippet demonstrates how to deploy functions in Supabase using Hono.

To deploy all of your Edge Functions in Supabase, use the following command:

```bash
supabase functions deploy
bash
supabase functions deploy hello-world
```

The `supabase functions deploy` command deploys all the Edge Functions in your Supabase project. If you want to deploy a specific function, you can specify the function name after the `deploy` keyword.

- Make sure you have the necessary permissions to deploy functions in your Supabase project.

- [Supabase Functions Documentation](https://supabase.io/docs/guides/database)

- Deploying changes to your functions in a Supabase project.
- Deploying a specific function after making changes to it.

#### Code Snippet

```typescript

Alternatively, you can deploy individual Edge Functions by specifying the name of the function in the deploy command:

```

**Reasoning:** This rule is important as it demonstrates how to deploy functions in Supabase using Hono. It shows both the method to deploy all functions at once and the method to deploy a specific function. Understanding this rule is crucial for managing and deploying functions in a Supabase project.

*Source: docs/getting-started/supabase-functions.md*

### Deploying Functions in Supabase

This code snippet demonstrates how to deploy functions in Supabase. You can either deploy all functions at once or deploy individual functions by specifying the function name.

```bash
supabase functions deploy
bash
supabase functions deploy hello-world
```

The `supabase functions deploy` command deploys all the functions in your Supabase project. If you want to deploy a specific function, you can do so by specifying the function name after the deploy command.

- Make sure you have the correct permissions to deploy functions.
- Ensure your function is working correctly before deploying to avoid breaking changes.

- [Supabase Documentation](https://supabase.com/docs/guides/functions/deploy)

- Deploying changes to a function in production
- Deploying all functions after a major update

#### Code Snippet

```typescript

To deploy an individual function, specify the function name in the deploy command:

```

**Reasoning:** This rule is important as it demonstrates how to deploy functions in Supabase, either all at once or individually. Understanding how to deploy functions is crucial for the development and production process, as it allows changes to be pushed live.

*Source: docs/getting-started/supabase-functions.md*

### Creating a new Hono application and installing dependencies

The following code snippets demonstrate how to create a new Hono application and install its dependencies using different package managers.

```sh
yarn create hono my-app
sh
pnpm create hono my-app
sh
bun create hono@latest my-app
sh
deno init --npm hono my-app
sh
cd my-app
npm i
sh
cd my-app
yarn
sh
cd my-app
pnpm i
sh
cd my-app
bun i
```

The `create` command is used to create a new Hono application. The `cd` command is used to move to the application directory. The `i` or `install` command is used to install the dependencies of the application.

- Make sure to use the correct command for your package manager.
- The `@latest` tag can be used to create an application with the latest version of Hono.

- [Hono documentation](https://hono.bun.dev/)

- Setting up a new Hono project

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and install its dependencies using different package managers. Understanding this rule is crucial for setting up a new Hono project correctly.

*Source: docs/getting-started/fastly.md*

### Creating a Basic 'Hello World' Application in Hono

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono web framework.

```ts
// src/index.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Fastly!'))

app.fire()
```

1. Import the Hono web framework.
2. Create a new instance of Hono.
3. Define a GET route for the root URL ('/') that sends the text 'Hello Fastly!' as a response.
4. Start the Hono application with the `fire` method.

- The `c.text` method sends a text response to the client.
- The `fire` method starts the Hono application and begins listening for incoming requests.

- [Hono Documentation](https://hono.bun.dev/)

- Creating a basic web application with Hono.
- Defining routes and sending responses in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono web framework. It shows the basic structure of a Hono application, how to define a route, and how to send a response from the server to the client.

*Source: docs/getting-started/fastly.md*

### Running a Hono Application Locally

This code snippet demonstrates how to run a Hono application locally. After setting up your application, you can start the development server and access your application via `http://localhost:7676` in your web browser.

```sh
npm run start
sh
yarn start
sh
pnpm run start
sh
bun run start
```

These commands start the development server for your Hono application. Depending on the package manager you're using, you can use either `npm`, `yarn`, `pnpm`, or `bun` to start the server.

Ensure that you have installed all the necessary dependencies before running these commands. If you encounter any errors, they are likely due to missing dependencies or configuration issues.

- [Hono Documentation](https://hono.dev/docs/getting-started)

This is a common step that you'll perform regularly during the development process. It's typically done after making changes to your code to test and debug your application.

**Reasoning:** This rule is important as it demonstrates how to run a Hono application locally. Running the application locally is a crucial step in the development process as it allows developers to test and debug their application before deploying it to a live environment.

*Source: docs/getting-started/fastly.md*

### Deploying an Application to Fastly

This code snippet demonstrates how to deploy an application to Fastly using different package managers like npm, yarn, pnpm, and bun.

```text
:::

To build and deploy your application to your Fastly account, type the following command. The first time you deploy the application, you will be prompted to create a new service in your account.

If you don't have an account yet, you must [create your Fastly account](https://www.fastly.com/signup/).

::: code-group
```

1. The command `npm run deploy`, `yarn deploy`, `pnpm run deploy`, or `bun run deploy` is used to build and deploy the application.
2. If it's the first time deploying the application, you will be prompted to create a new service in your Fastly account.

- You must have a Fastly account to deploy the application. If you don't have one, you can create it [here](https://www.fastly.com/signup/).

- [Fastly Documentation](https://docs.fastly.com/)

- Deploying an application to Fastly for the first time.
- Updating an existing application on Fastly.

**Reasoning:** This rule is important as it demonstrates how to deploy an application to Fastly using different package managers. It shows the commands needed to build and deploy the application, which is a crucial step in the development process.

*Source: docs/getting-started/fastly.md*