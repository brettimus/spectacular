## Getting-started

### Creating a Basic Hono Application

This code snippet demonstrates how to create a basic 'Hello World' application using the Hono web framework.

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default handle(app)
```

1. The `Hono` class is imported from the 'jsr:@hono/hono' module.
2. The `handle` function is imported from the 'jsr:@hono/hono/netlify' module.
3. A new instance of `Hono` is created.
4. A GET route for the path '/' is defined. When this route is accessed, it responds with the text 'Hello Hono!'.
5. The `handle` function is used to export the application.

- The `handle` function is specific to Netlify and is used to handle requests in a Netlify environment.

- [Hono Documentation](https://hono.dev/docs)

- Creating a basic web application with Hono.
- Defining simple routes in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to create a basic 'Hello World' application using the Hono web framework. It shows how to initialize a new Hono application and define a simple route that responds with a text message. This is a fundamental pattern in Hono and most web frameworks, and understanding it is crucial for building web applications.

*Source: docs/getting-started/netlify.md*

### Setting Up a Basic Hono Application with Netlify

This code snippet demonstrates how to set up a basic Hono application with Netlify.

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default handle(app)
sh
netlify dev
sh
netlify deploy --prod
ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  console.log(c.env)
  return c.text('Hello Hono!')
})

export default handle(app)
```

- Make sure to install the necessary packages before running the application.
- The 'handle' function from '@hono/hono/netlify' is used to handle the Hono application.

- [Hono Documentation](https://hono.js.org/)
- [Netlify CLI Documentation](https://cli.netlify.com/)

- Creating a basic Hono application with Netlify.
- Accessing the Netlify's context in a Hono application.

#### Code Snippet

```typescript

To run the application locally, use the Netlify CLI:

```

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application with Netlify. It shows how to import the necessary modules, create a new Hono application, define a route, and export the application to be handled by Netlify. It also explains how to run the application locally using the Netlify CLI and how to deploy it to production. Lastly, it shows how to access the Netlify's context through 'c.env'.

*Source: docs/getting-started/netlify.md*

### Deploying a Hono Application with Netlify

This code snippet demonstrates how to deploy a Hono application using Netlify.

```sh
netlify deploy --prod
```

The `netlify deploy --prod` command deploys the application to production. The `--prod` flag indicates that the deployment is for the production environment.

Ensure that you have the necessary permissions and the Netlify CLI installed before running the command.

- [Netlify CLI Documentation](https://cli.netlify.com/)

This command is typically used when you want to deploy your Hono application to the production environment.

**Reasoning:** This rule is important as it demonstrates how to deploy a Hono application using Netlify. It shows the command needed to deploy the application to production. Understanding this rule is crucial for developers to successfully deploy their Hono applications.

*Source: docs/getting-started/netlify.md*

### Accessing Netlify's Context in Hono

In Hono, you can access the Netlify's `Context` through `c.env`. This is useful when you need to use environment variables or context in your application.

Here is a code snippet demonstrating this:

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

// Import the type definition
import type { Context } from 'https://edge.netlify.com/'

export type Env = {

You can access the Netlify's `Context` through `c.env`:
```

In the above code, `c.env` is used to access the Netlify's Context. This allows you to use environment variables and context in your Hono application.

Ensure that you have imported the necessary modules and type definitions before trying to access the `Context`.

- Hono Documentation
- Netlify Documentation

This is commonly used when you need to use environment variables or context in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to access the Netlify's Context through `c.env` in Hono. Understanding this rule allows developers to effectively use the environment variables and context in their Hono applications.

*Source: docs/getting-started/netlify.md*

### Creating a New Project with Bun and Hono

This code snippet demonstrates how to create a new project using the Bun framework and Hono.

```sh
bun create hono@latest my-app
cd my-app
bun install
```

1. The `bun create hono@latest my-app` command creates a new project named 'my-app' with the latest version of Hono.
2. The `cd my-app` command navigates into the newly created project directory.
3. The `bun install` command installs the necessary dependencies for the project.

- Ensure that Bun is installed and updated to its latest version before running these commands.

- Official Bun website: https://bun.sh

- Setting up a new project with Bun and Hono.

**Reasoning:** This rule is important as it demonstrates how to create a new project using the Bun framework and Hono. It shows the command necessary to initialize a new project with the latest version of Hono, and how to navigate into the project directory and install the necessary dependencies. Understanding this rule is crucial for setting up a new project correctly and efficiently.

*Source: docs/getting-started/bun.md*

### Creating and Setting Up a Hono Project with Bun

This guide demonstrates how to create a new project with Hono using Bun, how to set up an existing project with Hono, and how to install the necessary dependencies.

To create a new project with Hono, use the `bun create` command followed by `hono@latest` and your desired project name.

```sh
bun create hono@latest my-app
sh
cd my-app
bun install
sh
bun add hono
```

- Ensure that Bun is properly installed and updated to the latest version before creating or setting up a project with Hono.

- [Bun Documentation](https://bun.js.org/)
- [Hono Documentation](https://hono.eclipse.org/)

- Starting a new project with Hono and Bun.
- Adding Hono to an existing Bun project.

#### Code Snippet

```typescript

Next, navigate into your new project directory and install the dependencies with `bun install`.

```

**Reasoning:** This rule is important as it demonstrates how to create a new project with Hono using Bun, how to set up an existing project with Hono, and how to install the necessary dependencies. Understanding this rule is crucial for developers to get started with Hono and Bun.

*Source: docs/getting-started/bun.md*

### Installing Hono Dependencies with Bun and Creating a Simple Hono Application

This code snippet demonstrates how to install Hono dependencies in an existing project using Bun, a package manager for Deno. It also shows how to create a simple 'Hello World' application using Hono.

```sh
bun add hono
ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))
```

1. Navigate to the project directory (`cd my-app`)
2. Install the dependencies using Bun (`bun install`)
3. Add Hono dependencies to the project (`bun add hono`)
4. Import the Hono module and create a new Hono application
5. Define a GET route for the application that responds with 'Hello Bun!'

- Bun is a package manager for Deno, and it's used to manage and install dependencies for your Deno projects.
- Hono is a web framework for Deno.

- [Bun Package Manager](https://github.com/erfanium/bun)
- [Hono Web Framework](https://github.com/honots/hono)

- Setting up a new Hono project
- Adding Hono dependencies to an existing project
- Creating a simple Hono application

**Reasoning:** This rule is important as it demonstrates how to set up an existing project with Hono dependencies using Bun, a package manager for Deno. It also shows how to create a simple 'Hello World' application using Hono.

*Source: docs/getting-started/bun.md*

### Creating, Running, and Changing Port of a Basic Hono Application

This code snippet demonstrates how to create a basic Hono application, run it, and change the port number.

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))

export default app
```

To run the application, use the command `bun run dev`. Then, access `http://localhost:3000` in your browser.

You can specify the port number with exporting the `port`.

1. The `Hono` class is imported from the `hono` package.
2. An instance of `Hono` is created.
3. The `get` method of the `Hono` instance is used to handle HTTP GET requests to the root URL ('/'). The callback function takes a context object `c` and sends a text response 'Hello Bun!'.
4. The `Hono` instance is exported.

- The `Hono` class is the main class for creating Hono applications.
- The `get` method is used to handle HTTP GET requests.
- The context object `c` represents the HTTP request and response.

- [Hono documentation](https://hono.bun.dev/)

- Creating a basic Hono application
- Handling HTTP GET requests
- Changing the port number of a Hono application

**Reasoning:** This rule is important as it demonstrates how to create a basic Hono application, run it, and change the port number. It shows the basic structure of a Hono application and how to handle HTTP GET requests.

*Source: docs/getting-started/bun.md*

### Setting Up and Running a Basic Hono Application

This code snippet demonstrates how to set up a basic Hono application, run it, and change the port number.

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))

export default app
sh
bun run dev
```

Then, access `http://localhost:3000` in your browser.

To change the port number, you can specify it with exporting the `port`.

The `Hono` class is imported from the `hono` package. An instance of `Hono` is created and a GET route is set up for the root URL (`/`). The route returns the text 'Hello Bun!'. The application is then exported for use elsewhere.

The `bun run dev` command is used to start the application in development mode.

- The default port for Hono applications is 3000. To use a different port, you need to specify it when running the application.

- [Hono Documentation](https://hono.bun.dev/docs)

- Setting up a basic Hono application for development.
- Changing the port number for a Hono application.

#### Code Snippet

```typescript

To run the application, use the command:

```

**Reasoning:** This rule is important as it demonstrates how to set up a basic Hono application, run it, and change the port number. Understanding this is fundamental to getting started with the Hono web framework.

*Source: docs/getting-started/bun.md*

### Changing the Default Port Number in Hono

In Hono, the default port number can be changed by exporting an object with the 'port' property. Here is a code snippet demonstrating this:

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))

export default app // [!code --]
export default { // [!code ++]
  port: 3000, // [!code ++]
  fetch: app.fetch, // [!code ++]
} // [!code ++]
```

1. Import the Hono framework.
2. Create a new Hono application.
3. Define a route.
4. Instead of exporting the app directly, export an object with the 'port' property set to the desired port number.

- The 'port' property should be a number.
- The 'fetch' property should be set to 'app.fetch'.

- [Hono Documentation](https://hono.bun.dev/)

- Running the application in different environments with different port numbers.

**Reasoning:** This rule is important as it demonstrates how to change the default port number in a Hono application. By exporting an object with the 'port' property, developers can specify the port number their application should run on. This is crucial for configuring the application to run in different environments.

*Source: docs/getting-started/bun.md*

### Serving Static Files in Hono

This code snippet demonstrates how to serve static files using Hono web framework.

```ts
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))
```

1. The `serveStatic` function from `hono/bun` is imported.
2. A new instance of Hono is created.
3. The `app.use` function is used to specify the path for serving static files. The `serveStatic` function is used with a configuration object that specifies the root directory for the static files.
4. The `app.get` function is used to define routes and their handlers. In this case, the root route (`/`) returns a text message, and all other routes (`*`) serve a fallback static file.

- The `serveStatic` function takes a configuration object that can have `root` or `path` properties. The `root` property specifies the root directory for the static files, and the `path` property specifies the path to a specific static file.

- [Hono Documentation](https://hono.bun.dev/)

- Serving static assets like images, scripts, and stylesheets in a web application.
- Serving a default file for non-existing routes.

**Reasoning:** This rule is important as it demonstrates how to serve static files using Hono web framework. Serving static files is a common requirement in many web applications, and understanding how to do this in Hono is crucial for developers.

*Source: docs/getting-started/bun.md*

### Serving Static Files and Rewriting Request Paths in Hono

In Hono, you can serve static files and rewrite request paths using the `serveStatic` and `rewriteRequestPath` options respectively. This is useful for managing static assets such as images, CSS files, and JavaScript files.

Here's an example of how to serve a static file:

```ts
app.get('*', serveStatic({ path: './static/fallback.txt' }))
ts
app.get(
  '/static/*',
  serveStatic({
    root: './statics',
    rewriteRequestPath: (req, res) => {
      return req.path.replace('/static', '');
    },
  }),
);
```

In this example, any GET request to `http://localhost:3000/static/*` will be served with the corresponding file from the `./statics` directory.

- The `serveStatic` option serves static files from a specified directory.
- The `rewriteRequestPath` option rewrites request paths based on a specified function.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Serving static assets in a Hono application.
- Rewriting request paths in a Hono application.

#### Code Snippet

```typescript

In this example, any GET request will be served with the `fallback.txt` file from the `./static` directory.

If you want to map `http://localhost:3000/static/*` to `./statics`, you can use the `rewriteRequestPath` option:

```

**Reasoning:** This rule is important as it demonstrates how to serve static files in a Hono application and how to rewrite request paths. Understanding this rule is crucial for managing static assets such as images, CSS files, and JavaScript files in a Hono application.

*Source: docs/getting-started/bun.md*

### Using 'rewriteRequestPath' to Map URL Paths to Local Directories in Hono

This rule demonstrates how to use the 'rewriteRequestPath' option in Hono to map a URL path to a local directory. This is useful when you want to serve static files from a specific directory in your project.

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

The 'rewriteRequestPath' function takes a path as an argument and returns a new path. In this case, it's replacing '/static' with '/statics'. This means that any request to 'http://localhost:3000/static/*' will be served from the './statics' directory.

- The 'rewriteRequestPath' function is a powerful tool that allows you to customize how your server responds to different URL paths.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Serving static files from a specific directory in your project.
- Mapping URL paths to local directories for better organization of your project.

**Reasoning:** This rule is important as it demonstrates how to use the 'rewriteRequestPath' option in Hono to map a URL path to a local directory. This is useful when you want to serve static files from a specific directory in your project.

*Source: docs/getting-started/bun.md*

### Handling Static Files in Hono

This code snippet demonstrates how to serve static files in Hono and handle different scenarios.

```ts
app.get(
  '/static/*',
  serveStatic({
    mimes: {
      m3u8: 'application/vnd.apple.mpegurl',
      ts: 'video/mp2t',
    },
    onFound: (_path, c) => {
      c.header('Cache-Control', `public, immutable, max-age=31536000`)
    },
    onNotFound: (path, c) => {
      console.log(`${path} not found`)
    },
  })
)
```

1. The `app.get` method is used to define a route for serving static files.
2. The `serveStatic` function is used to serve static files. It takes an options object as an argument.
3. The `mimes` option is used to specify custom MIME types.
4. The `onFound` option is used to specify handling when the requested file is found. In this case, it sets the 'Cache-Control' header.
5. The `onNotFound` option is used to specify handling when the requested file is not found. In this case, it logs a message.

- The `onFound` and `onNotFound` options are optional. If not provided, Hono will use default handling.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Serving static files such as images, CSS files, and JavaScript files.
- Setting custom MIME types for certain file extensions.
- Customizing response headers for static files.
- Customizing error handling for not found static files.

**Reasoning:** This rule is important as it demonstrates how to handle different scenarios when serving static files in Hono. It shows how to set custom MIME types, how to handle the scenario when a requested file is found, and how to handle the scenario when a requested file is not found. Understanding these patterns is crucial for building robust web applications with Hono.

*Source: docs/getting-started/bun.md*

### Handling Not Found Errors in Hono

This code snippet demonstrates how to handle not found errors in Hono framework. It uses the 'onNotFound' option in the 'serveStatic' method to specify a custom error handling function when the requested file is not found.

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

When a request is made to a path that does not exist, the function specified in the 'onNotFound' option is called. This function takes two arguments: the path that was not found and the context object 'c'. In this example, a message is logged to the console indicating the path that was not found and the path that was accessed.

- The 'onNotFound' option is only called when the requested file is not found. If the file exists, this function is not called.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Custom error handling when a file is not found
- Logging for debugging purposes

**Reasoning:** This rule is important as it demonstrates how to handle not found errors in Hono framework. It shows how to use the 'onNotFound' option in the 'serveStatic' method to specify a custom error handling function when the requested file is not found.

*Source: docs/getting-started/bun.md*

### Serving Static Files with Precompression in Hono

This code snippet demonstrates how to serve static files with precompression in Hono framework.

```ts
app.get(
  '/static/*',
  serveStatic({
    precompressed: true,
  })
)
```

The 'serveStatic' middleware is used with the 'precompressed' option set to true. This means that if precompressed versions of the files with extensions like `.br` or `.gz` are available, they will be served based on the `Accept-Encoding` header. The middleware prioritizes Brotli, then Zstd, and Gzip. If none are available, it serves the original file.

- The static files need to be precompressed and available in the same directory as the original files.
- The 'Accept-Encoding' header of the request is used to determine which precompressed version of the file to serve.

- [Hono serveStatic middleware documentation](https://hono.bun.dev/middlewares/serveStatic)

- Serving static assets like CSS, JavaScript, and image files in a web application.

**Reasoning:** This rule is important as it demonstrates how to serve static files with precompression in Hono framework. It shows the usage of the 'serveStatic' middleware with the 'precompressed' option set to true. This can significantly improve the performance of a web application by reducing the size of the files that need to be transferred over the network.

*Source: docs/getting-started/bun.md*

### Serving Static Files with Precompression and Testing Server Response in Hono

This code demonstrates how to serve static files with precompression in Hono and how to test the server response using the Bun testing framework.

```ts
app.get(
  '/static/*',
  serveStatic({
    precompressed: true,
  })
)
ts
import { describe, expect, it } from 'bun:test'
import app from '.'

describe('My first test', () => {
  it('Should return 200 Response', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
```

In this test, a new request is created and sent to the server using `app.fetch`. The response status is then checked to be 200, indicating a successful request.

- Ensure that precompressed versions of the files are available when using the `precompressed` option.
- Always validate server responses during development to ensure correct server behavior.

- [Hono Documentation](https://hono.bun.dev/)
- [Bun Testing Framework](https://bun.dev/docs/testing)

- Serving static files in a web application.
- Testing server responses during development.

#### Code Snippet

```typescript

In the above snippet, `app.get` is used to handle GET requests to any route that matches '/static/*'. The `serveStatic` function is used with the `precompressed` option set to true, which means that it will serve precompressed versions of the files if they are available.

To test the server response, the Bun testing framework is used as shown below:

```

**Reasoning:** This rule is important as it demonstrates how to serve static files with precompression and how to test the server response using the Bun testing framework. Understanding this rule ensures efficient delivery of static content and helps in validating server responses during development.

*Source: docs/getting-started/bun.md*

### Writing and Running Basic Tests in Hono

This rule demonstrates how to write a basic test in Hono and run it using the 'bun test' command.

```sh
'Should return 200 Response', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
sh
bun test index.test.ts
```

1. A new Request object is created with the URL of the local server.
2. The 'fetch' method of the 'app' object is used to send the request and the response is awaited.
3. The 'expect' function is used to assert that the status code of the response is 200.
4. The test is run using the 'bun test' command, specifying the test file to run.

- The 'fetch' method returns a Promise that resolves to the Response to that request, whether it is successful or not.

- [Hono Documentation](https://www.eclipse.org/hono/)

- Testing the response of a server to a certain request.
- Checking the status code of a response to ensure it is as expected.

#### Code Snippet

```typescript

Then, run the command.

```

**Reasoning:** This rule is important as it demonstrates how to write and execute a basic test in Hono. Testing is a crucial part of software development to ensure the code behaves as expected. This rule shows how to create a simple test that checks if a request to the local server returns a 200 status code, indicating a successful HTTP request. The test is then run using the 'bun test' command.

*Source: docs/getting-started/bun.md*

### Creating a New Hono Application and Selecting a Template

This code snippet demonstrates how to create a new Hono application and select a template for the application.

```sh
yarn create hono my-app
sh
pnpm create hono@latest my-app
sh
bun create hono@latest my-app
sh
deno init --npm hono@latest my-app

? Which template do you want to use?
    aws-lambda
    bun
    cloudflare-pages
❯   cloudflare-workers
    deno
    fastly
    nextjs
    nodejs
    vercel
```

The `create` command initializes a new Hono application in the directory specified (in this case, 'my-app'). The `@latest` flag ensures you are using the latest version of Hono. After initialization, you are prompted to select a template for your application. The template you choose will shape the structure and functionality of your application.

- Ensure you have the necessary package manager (yarn, pnpm, bun, or deno) installed before running the `create` command.

- [Hono Documentation](https://hono.bun.dev/)

- Initializing a new Hono application
- Selecting a template for a new Hono application

#### Code Snippet

```typescript

or

```

**Reasoning:** This rule is important as it demonstrates how to create a new Hono application and select a template for the application. This is a fundamental step in getting started with the Hono framework.

*Source: docs/getting-started/basic.md*

### Navigating to Project Directory and Installing Dependencies in Hono

After selecting the template for your Hono project, the next step is to navigate to the project directory and install the necessary dependencies. This can be done using various package managers like npm, yarn, pnpm, or bun.

Here is the code snippet demonstrating this:

```sh

cd my-app
npm i

cd my-app
yarn

cd my-app
pnpm i

cd my-app
bun i
```

1. `cd my-app` - This command navigates to the `my-app` directory.
2. `npm i`, `yarn`, `pnpm i`, `bun i` - These commands install the dependencies listed in the `package.json` file.

- Make sure to use the correct command for the package manager you are using.
- The dependencies must be installed before you can start working on the project.

- [Hono Documentation](https://hono.bun.dev/)

- Setting up a new Hono project
- Installing additional dependencies in an existing Hono project

**Reasoning:** This rule is important as it demonstrates how to navigate to the project directory and install the dependencies in a Hono project. It is a fundamental step in setting up a new project, regardless of the package manager being used.

*Source: docs/getting-started/basic.md*

### Navigating to Application Directory, Installing Dependencies, and Starting a Local Server in Hono

The code snippet demonstrates how to navigate to the application directory (`my-app`) and install dependencies using different package managers (`npm`, `yarn`, `pnpm`, `bun`).

```sh

cd my-app
npm i

cd my-app
yarn

cd my-app
pnpm i

cd my-app
bun i
sh

npm run dev

yarn dev

pnpm dev

bun run dev
```

The `cd` command is used to navigate to the application directory. The `i` or `install` command is used to install the dependencies listed in the `package.json` file. The `run dev` command is used to start a local server.

- Ensure that the correct package manager is used for installing dependencies and starting the server.

- [npm documentation](https://docs.npmjs.com/)
- [yarn documentation](https://yarnpkg.com/getting-started)
- [pnpm documentation](https://pnpm.io/)
- [bun documentation](https://bun.js.org/)

- Setting up a new Hono application
- Running a Hono application locally

#### Code Snippet

```typescript