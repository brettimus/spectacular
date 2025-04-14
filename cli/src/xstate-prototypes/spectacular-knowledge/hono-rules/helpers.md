# Drizzle SQLite Rules

## Helpers

### Defining Routes and Generating Static Site Content in Hono

This code snippet demonstrates how to define routes in a Hono application and how to use the 'toSSG' function to generate static site content.

```tsx
// index.tsx
const app = new Hono()

app.get('/', (c) => c.html('Hello, World!'))
app.use('/about', async (c, next) => {
  c.setRenderer((content, head) => {
    return c.html(
      <html>
        <head>
          <title>{head.title ?? ''}</title>
        </head>
        <body>
          <p>{content}</p>
        </body>
      </html>
    )
  })
  await next()
})
app.get('/about', (c) => {
  return c.render('Hello!', { title: 'Hono SSG Page' })
})

export default app
```

1. A new Hono application is created.
2. The root route ('/') is defined to return a simple HTML string.
3. A middleware is added to the '/about' route that sets a custom renderer. This renderer wraps the content in a basic HTML structure and uses the 'head.title' property for the page title.
4. The '/about' route is defined to render a string with a title.
5. The application is then exported for use in other modules.

- The 'toSSG' function is used to generate static site content. It takes the Hono application and a file system module as arguments.

- [Hono documentation](https://hono.bayfront.cloud/)

- Building static websites or blogs with Hono.
- Defining custom renderers for specific routes.

**Reasoning:** This rule is important as it demonstrates how to define routes in a Hono application and how to use the 'toSSG' function to generate static site content. It also shows how to use middleware to set a custom renderer for a specific route.

*Source: docs/helpers/ssg.md*

### Using Hono's Static Site Generation (SSG) Feature

This code snippet demonstrates how to use Hono's static site generation (SSG) feature to pre-render pages at build time.

```ts
// build.ts
import app from './index'
import { toSSG } from 'hono/ssg'
import fs from 'fs/promises'

toSSG(app, fs)
```

1. Import the application from the index file.
2. Import the `toSSG` function from 'hono/ssg'.
3. Import 'fs/promises' for file system operations.
4. Call the `toSSG` function with the application and the file system module as arguments.

- The `toSSG` function pre-renders the pages at build time, improving performance and SEO.
- The output files will be HTML files corresponding to the routes defined in the application.

- [Hono Documentation](https://hono.dev/docs)

- Pre-rendering pages for static site generation in Hono applications.

**Reasoning:** This rule is important as it demonstrates how to use Hono's static site generation (SSG) feature to pre-render pages at build time. This is particularly useful for improving performance and SEO of Hono applications.

*Source: docs/helpers/ssg.md*

### Generating Static Site Files with Hono's 'toSSG' Function

The 'toSSG' function in Hono is used to generate static site files. Here is a code snippet demonstrating its usage:

```ts
// build.ts
import app from './index'
import { toSSG } from 'hono/ssg'
import fs from 'fs/promises'

toSSG(app, fs)
bash
ls ./static
about.html  index.html
```

1. The 'toSSG' function is imported from the 'hono/ssg' module.
2. The function is then applied to an app, along with the file system module.
3. The function generates static site files from the app and writes them to the file system.

- The 'toSSG' function is part of the Hono framework, which is designed for building server-rendered JavaScript apps.
- The function generates static site files, which can be served by any static file server.

- [Hono GitHub](https://github.com/honojs/hono)

- Generating static site files for a server-rendered JavaScript app.

#### Code Snippet

```typescript

When this script is executed, it outputs the files as follows:

```

**Reasoning:** This rule is important as it demonstrates how to use the 'toSSG' function from the Hono framework to generate static site files. It shows the process of importing the function, applying it to an app, and using the file system module to write the static files. The rule also highlights the output of the process, which is the creation of HTML files in the static directory.

*Source: docs/helpers/ssg.md*

### Defining the toSSG Function Interface in Hono

The `toSSG` function in Hono is used for generating static sites. It takes an application, a filesystem module, and an optional options object as arguments. The correct way to define this function in TypeScript is by using an interface, as shown in the following code snippet:

```ts
export interface ToSSGInterface {
  (
    app: Hono,
    fsModule: FileSystemModule,
    options?: ToSSGOptions
  ): Promise<ToSSGResult>
}
```

In this interface:

- `app` specifies `new Hono()` with registered routes.
- `fsModule` is an object that represents the filesystem module, assuming `node:fs/promise`.
- `options` is an optional object that can be used to specify additional options for the function.

The function returns a promise that resolves with a `ToSSGResult` object.

- Defining the function in this way allows TypeScript's static type checking to ensure the function is used correctly.

- [Hono Documentation](https://hono.bespokejs.com)

- Generating static sites with Hono.

**Reasoning:** This rule is important as it demonstrates how to define an interface for the toSSG function in Hono, which is used for generating static sites. It shows the correct way to define the function parameters and their types, which is crucial for TypeScript's static type checking and for ensuring the function is used correctly.

*Source: docs/helpers/ssg.md*

### Defining and Using the FileSystemModule Interface in Hono

In Hono, the FileSystemModule interface is used to define methods for file operations. It includes methods for writing data to a file and creating a directory.

Here is a code snippet demonstrating this:

```ts
export interface FileSystemModule {
  writeFile(path: string, data: string | Uint8Array): Promise<void>
  mkdir(
    path: string,
    options: { recursive: boolean }
  ): Promise<void | string>
}
```

1. The `writeFile` method takes a path and data (either a string or Uint8Array) as arguments and returns a Promise that resolves to void. This method is used to write data to a file at the specified path.

2. The `mkdir` method takes a path and an options object as arguments and returns a Promise that resolves to either void or a string. This method is used to create a directory at the specified path. The options object has a `recursive` property which, when set to true, allows for the creation of directories recursively.

- These methods return Promises, so they are asynchronous and should be handled accordingly.

- [Hono Documentation](https://hono.bun.js.org/)

- Writing data to a file
- Creating a directory

**Reasoning:** This rule is important as it demonstrates how to define and use the FileSystemModule interface in Hono. It shows the methods that need to be implemented for file operations, which are writeFile and mkdir. This is crucial for any operations that involve reading from or writing to the file system.

*Source: docs/helpers/ssg.md*

### Using 'toSSG' function in Hono for Deno and Bun

This code snippet demonstrates how to use the 'toSSG' function provided by Hono for different file systems like Deno and Bun.

```ts
import { toSSG } from 'hono/deno'

toSSG(app) // The second argument is an option typed 'ToSSGOptions'.
```

1. The 'toSSG' function is imported from 'hono/deno' for Deno and 'hono/bun' for Bun.
2. The function is then called with the 'app' argument. The second argument is an option typed 'ToSSGOptions'.

- The 'toSSG' function is specific to the file system being used. Make sure to import it from the correct module.
- The second argument to the 'toSSG' function is optional and should be of type 'ToSSGOptions'.

- Hono documentation: [link]

- When you want to use SSG on Deno or Bun with Hono, you can use the 'toSSG' function as demonstrated in the code snippet.

**Reasoning:** This rule is important as it demonstrates how to use the 'toSSG' function provided by Hono for different file systems like Deno and Bun. It shows the correct way to import and use the function, and highlights that the second argument is an option typed 'ToSSGOptions'. Understanding this rule is crucial for developers who want to use SSG on Deno or Bun with Hono.

*Source: docs/helpers/ssg.md*

### Using the `toSSG` function in Hono

In Hono, a `toSSG` function is provided for each file system. This function is used to convert an application into a static site generator.

For Deno:

```ts
import { toSSG } from 'hono/deno'

toSSG(app) // The second argument is an option typed `ToSSGOptions`.
ts
import { toSSG } from 'hono/bun'

toSSG(app) // The second argument is an option typed `ToSSGOptions`.
```

The `ToSSGOptions` interface specifies the options for the `toSSG` function. These options include `dir`, `concurrency`, `beforeRequestHook`, and `afterResponse`.

The `toSSG` function takes two arguments: the application and an options object. The options object is typed `ToSSGOptions` and can include various properties to customize the behavior of the static site generator.

- The `toSSG` function is specific to the Hono framework and may not work in other frameworks.

- [Hono Documentation](https://hono.io/docs)

- Converting a dynamic Hono application into a static site for improved performance and security.

#### Code Snippet

```typescript

For Bun:

```

**Reasoning:** This rule is important as it demonstrates how to use the `toSSG` function in Hono framework for both Deno and Bun. The `toSSG` function is used to convert an application into a static site generator. Understanding how to use this function is crucial for developers who want to leverage the benefits of static site generation in their Hono applications.

*Source: docs/helpers/ssg.md*

### Configuring the 'toSSG' function in Hono

The 'toSSG' function is used to generate static sites. It accepts an application instance and an optional 'ToSSGOptions' object as arguments. The 'ToSSGOptions' interface allows developers to customize the static site generation process.

Here is the 'ToSSGOptions' interface:

```ts
export interface ToSSGOptions {
  dir?: string
  concurrency?: number
  beforeRequestHook?: BeforeRequestHook
  afterResponseHook?: AfterResponseHook
  afterGenerateHook?: AfterGenerateHook
  extensionMap?: Record<string, string>
}
ts
import { toSSG } from 'hono/bun'

toSSG(app, {
  dir: './public',
  concurrency: 5,
  beforeRequestHook: () => console.log('Before request'),
  afterResponseHook: () => console.log('After response'),
  afterGenerateHook: () => console.log('After generate'),
  extensionMap: { '.html': 'text/html' }
})
```

In this example, the static site will be generated in the './public' directory, with a concurrency of 5. The specified hooks will log messages at different stages of the generation process, and '.html' files will be served with the 'text/html' MIME type.

#### Code Snippet

```typescript

- `dir`: Specifies the output destination for static files. Default is `./static`.
- `concurrency`: Specifies the concurrent number of files to be generated at the same time. Default is `2`.
- `beforeRequestHook`, `afterResponseHook`, `afterGenerateHook`: These are optional hooks that can be used to perform actions before a request is made, after a response is received, and after a file is generated, respectively.
- `extensionMap`: An optional object that maps file extensions to their MIME types.

### Usage

```

**Reasoning:** This rule is important as it demonstrates how to use the 'toSSG' function in Hono framework, specifically how to configure the options for the 'ToSSGOptions' interface. Understanding these options allows developers to customize the static site generation process according to their specific needs.

*Source: docs/helpers/ssg.md*

### Defining TypeScript Interface for Function Results in Hono

In Hono, it's common to define TypeScript interfaces for the results of functions. This helps with type checking and ensures that the function returns the correct data structure. Here's an example of how to define an interface for the result of the 'toSSG' function.

```ts
export interface ToSSGResult {
  success: boolean
  files: string[]
  error?: Error
}
```

In this code snippet:

- `success` is a boolean indicating whether the operation was successful.
- `files` is an array of strings, representing the files processed.
- `error` is an optional field of type Error, which will be defined if there was an error during the operation.

- The `error` field is optional (`error?`). This means it does not have to be included in the objects that implement this interface.

- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)

- Defining the expected return type of a function in TypeScript.

**Reasoning:** This rule is important as it demonstrates how to define an interface in TypeScript for the result of the 'toSSG' function in Hono. The interface 'ToSSGResult' includes a boolean 'success' field, a 'files' field which is an array of strings, and an optional 'error' field of type Error. This pattern is crucial in TypeScript for type checking and ensuring the correct data structure is returned by functions.

*Source: docs/helpers/ssg.md*

### Defining and Using Hooks in Hono

In Hono, you can customize the process of `toSSG` by specifying custom hooks in options. These hooks are functions that get called at different stages of the request-response lifecycle.

Here is how you can define these hooks:

```ts
export type BeforeRequestHook = (req: Request) => Request | false
export type AfterResponseHook = (res: Response) => Response | false
export type AfterGenerateHook = (
  result: ToSSGResult
) => void | Promise<void>
```

The `BeforeRequestHook` is called before a request is made. It receives the request object as a parameter and should return the modified request object or `false` to cancel the request.

The `AfterResponseHook` is called after a response is received. It receives the response object as a parameter and should return the modified response object or `false` to cancel the response.

The `AfterGenerateHook` is called after the static site files have been generated. It receives the `ToSSGResult` object as a parameter and should return `void` or a `Promise` that resolves to `void`.

- Hooks are a powerful feature that allow you to customize the behavior of Hono. However, they should be used with care as they can also introduce complexity and potential issues.

- [Hono Documentation](https://hono.beyondco.de/docs/hooks)

- Modifying requests or responses
- Performing actions after the generation of static site files

**Reasoning:** This rule is important as it demonstrates how to define and use hooks in Hono. Hooks are a powerful feature that allow developers to customize the process of `toSSG` by specifying custom functions that get called at different stages of the request-response lifecycle. This can be used to modify requests and responses, or to perform actions after the generation of static site files.

*Source: docs/helpers/ssg.md*

### Filtering Requests Using Hooks in Hono

This code snippet demonstrates how to use hooks in Hono to filter requests. Specifically, it uses the 'beforeRequestHook' to filter out all non-GET requests.

```ts
toSSG(app, fs, {
  beforeRequestHook: (req) => {
    if (req.method === 'GET') {
      return req
    }
    return false
  },
})
```

The 'beforeRequestHook' is a function that is called before each request is processed. If the function returns false, the request is not processed.

In this case, the function checks if the request method is 'GET'. If it is, the request is processed. If it's not, the request is not processed.

- The 'beforeRequestHook' can be used to filter requests based on any criteria, not just the request method.

- [Hono Documentation](https://hono.bike/docs/hooks/)

- Logging only GET requests
- Preventing certain types of requests from being processed

**Reasoning:** This rule is important as it demonstrates how to filter requests in the Hono framework using hooks. In this case, the 'beforeRequestHook' is used to filter out all non-GET requests, which can be useful in scenarios where only GET requests need to be processed or logged.

*Source: docs/helpers/ssg.md*

### Filtering Responses by Status Code Using afterResponseHook in Hono

This code snippet demonstrates how to use the 'afterResponseHook' in Hono's 'toSSG' function to filter responses based on their status codes.

```ts
toSSG(app, fs, {
  afterResponseHook: (res) => {
    if (res.status === 200 || res.status === 500) {
      return res
    }
    return false
  },
})
```

In this example, the 'afterResponseHook' function is used to check the status code of each response. If the status code is either 200 or 500, the response is returned and processed further. If the status code is anything else, the function returns 'false', effectively filtering out the response.

This can be useful in scenarios where only certain responses are needed for static site generation, such as only successful responses (status code 200) or server error responses (status code 500).

- The 'afterResponseHook' function is called after each response is received, but before it is processed by 'toSSG'.
- The 'afterResponseHook' function should return the response if it should be processed further, or 'false' if it should be filtered out.

- [Hono Documentation](https://hono.bjacobel.com/docs)

- Filtering responses by status code for static site generation
- Logging or handling specific types of responses separately

**Reasoning:** This rule is important as it demonstrates how to use the 'afterResponseHook' in Hono's 'toSSG' function to filter responses based on their status codes. This can be useful in scenarios where only certain responses are needed for static site generation, such as only successful responses (status code 200) or server error responses (status code 500).

*Source: docs/helpers/ssg.md*

### Using afterGenerateHook in Hono

The `afterGenerateHook` is a feature in Hono that allows you to execute additional logic after the `toSSG` function has run. This can be useful for logging, debugging, or other post-processing tasks.

Here is an example of how to use it:

```ts
toSSG(app, fs, {
  afterGenerateHook: (result) => {
    if (result.files) {
      result.files.forEach((file) => console.log(file))
    }
  }
})
```

In this example, if the `result` object contains a `files` array, it logs each file to the console.

- The `afterGenerateHook` function is called after the `toSSG` function has completed.
- The `result` object passed to the `afterGenerateHook` function contains the result of the `toSSG` function.

- [Hono Documentation](https://hono.bespokejs.com)

- Logging the result of the `toSSG` function for debugging purposes.
- Performing additional post-processing on the `result` object.

**Reasoning:** This rule is important as it demonstrates how to use the 'afterGenerateHook' in Hono. This hook allows developers to execute additional logic after the 'toSSG' function has run, which is useful for logging, debugging, or other post-processing tasks.

*Source: docs/helpers/ssg.md*

### Customizing File Extensions in Hono's Static Site Generator

This code snippet demonstrates how to customize the file extensions in Hono's SSG based on the `Content-Type` returned by each route.

```ts
import { toSSG, defaultExtensionMap } from 'hono/ssg'

// Save `application/x-html` content with `.html`
toSSG(app, fs, {
  extensionMap: {
    'application/x-html': 'html',
    ...defaultExtensionMap,
  },
})
```

The `toSSG` function is used to configure the SSG. The `extensionMap` option is set to map the `Content-Type` 'application/x-html' to the '.html' extension. The `defaultExtensionMap` is spread into the `extensionMap` to include the default mappings.

Paths ending with a slash are saved as index.ext regardless of the extension.

- [Hono Documentation](https://hono.bevry.me/docs/ssg)

- Serving different types of content in a static website
- Customizing file extensions for specific content types

**Reasoning:** This rule is important as it demonstrates how to customize file extensions in Hono's static site generator (SSG) based on the `Content-Type` returned by each route. This is crucial for serving different types of content correctly in a static website.

*Source: docs/helpers/ssg.md*

### Defining Routes in Hono to Return HTML and Text Responses

This rule demonstrates how to define routes in Hono that return HTML and text responses. The 'get' method is used to handle HTTP GET requests to specific paths ('/html/' and '/text/'), and the 'html' and 'text' methods are used to send responses of different types.

```ts
// save to ./static/html/index.html
app.get('/html/', (c) => c.html('html'))

// save to ./static/text/index.txt
app.get('/text/', (c) => c.text('text'))
```

1. The 'get' method is used to define a route that handles HTTP GET requests. The first argument is the path, and the second argument is a callback function that is executed when the route is matched.

2. The callback function takes a context object 'c' as an argument. This object contains information about the HTTP request and has methods for sending a response.

3. The 'html' and 'text' methods of the context object are used to send HTML and text responses, respectively.

- The paths in the 'get' method calls end with a slash. This means that the routes will match requests to '/html/' and '/text/', but not to '/html' and '/text'.

- The 'html' and 'text' methods automatically set the correct 'Content-Type' HTTP header in the response ('text/html' and 'text/plain', respectively).

- [Hono Documentation](https://hono.boutell.com/)

- Use the 'html' method to send an HTML response when you want to render a web page.

- Use the 'text' method to send a text response when you want to send plain text data, for example, as a response to an API request.

**Reasoning:** This rule is important as it demonstrates how to define routes in Hono that return HTML and text responses. It also shows how to use the 'get' method to handle HTTP GET requests to specific paths ('/html/' and '/text/') and how to use the 'html' and 'text' methods to send responses of different types. Understanding this rule is crucial for creating dynamic web applications with Hono.

*Source: docs/helpers/ssg.md*

### Using Built-in Middleware for Static Site Generation in Hono

In Hono, you can use built-in middleware for static site generation (SSG). This is particularly useful when you want to pre-render pages at build time for performance benefits.

Here's an example of how to use the `ssgParams` middleware to generate static parameters for a route:

```ts
app.get(
  '/shops/:id',
  ssgParams(async () => {
    const shops = await getShops()
    return shops.map((shop) => ({ id: shop.id }))
  }),
  async (c) => {
    const shop = await getShop(c.req.param('id'))
    if (!shop) {
      return c.notFound()
    }
    return c.render(
      <div>
        <h1>{shop.name}</h1>
      </div>
    )
  }
)
```

In this code snippet:

1. The `ssgParams` middleware is used to generate static parameters for the route '/shops/:id'. It fetches a list of shops and returns an array of objects, each containing an `id` property.

2. In the route handler, it fetches the shop with the requested `id` and renders a response. If the shop is not found, it returns a 404 response.

This approach allows you to generate static pages for each shop at build time, improving the performance of your application.

**Important notes:**

- The `ssgParams` middleware is similar to the `generateStaticParams` API in Next.js.
- Routes with the `disableSSG` middleware set are excluded from static file generation.

**Common use cases:**

- Pre-rendering pages at build time for performance benefits.
- Handling routes with dynamic parameters.

**References:**

- [Hono documentation](https://hono.dev/docs)
- [Next.js documentation](https://nextjs.org/docs)

**Reasoning:** This rule is important as it demonstrates how to use the built-in middleware in Hono for static site generation (SSG). It shows how to use the `ssgParams` middleware to generate static parameters for a route, similar to the `generateStaticParams` API in Next.js. It also shows how to handle routes with dynamic parameters and how to render a response based on the fetched data.

*Source: docs/helpers/ssg.md*

### Using disableSSG Middleware to Exclude Routes from Static File Generation in Hono

In Hono, the `disableSSG` middleware is used to exclude certain routes from static file generation by `toSSG`. This is particularly useful for routes that should not be statically generated, such as API endpoints.

Here is an example of how to use it:

```ts
app.get('/api', disableSSG(), (c) => c.text('an-api'))
```

In this code snippet, the route '/api' is set to be excluded from static file generation. This means that when `toSSG` is executed, this route will not be included in the generated static files.

- The `disableSSG` middleware should be used sparingly, as it can lead to performance issues if used excessively.

- [Hono Documentation](https://hono.boutique/docs)

- Excluding API endpoints from static file generation
- Excluding routes that require dynamic content from static file generation

**Reasoning:** This rule is important as it demonstrates how to use the `disableSSG` middleware in Hono to exclude certain routes from static file generation by `toSSG`. This is useful when you have routes that should not be statically generated, such as API endpoints.

*Source: docs/helpers/ssg.md*

### Using onlySSG Middleware to Serve Static Pages in Hono

This code snippet demonstrates how to use the 'onlySSG' middleware in Hono to serve static pages.

```ts
app.get('/static-page', onlySSG(), (c) => c.html(<h1>Welcome to my site</h1>))
```

In this example, the '/static-page' route is defined with the 'onlySSG' middleware. This means that this route will only be available during the static site generation process. If a request is made to this route outside of this process, the 'c.notFound()' method will be called, returning a 'not found' error.

- The 'onlySSG' middleware is useful for pages that should only be statically generated and not served dynamically.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Serving static pages that should not be available dynamically.

**Reasoning:** This rule is important as it demonstrates how to use the 'onlySSG' middleware in Hono to serve static pages. It shows how to define a route that will only be available during the static site generation process and will return a 'not found' error at other times. This is useful for pages that should only be statically generated and not served dynamically.

*Source: docs/helpers/ssg.md*

### Handling Accept Headers with Hono's Accepts Helper

The Accepts Helper in Hono is used to handle Accept headers in requests. This is crucial in web development as it helps the server understand what type of content the client can handle.

```ts
import { Hono } from 'hono'
import { accepts } from 'hono/accepts'
```

The `accepts()` function looks at the Accept header, such as Accept-Encoding and Accept-Language, and returns the proper value.

- The Accepts Helper is a part of the Hono framework and must be imported from 'hono/accepts'.
- The Accepts Helper is typically used in the context of a GET request.

- Hono Documentation

- When the server needs to understand what type of content the client can handle, the Accepts Helper can be used.

**Reasoning:** The Accepts Helper in Hono is important as it allows the handling of Accept headers in requests. This is crucial in web development as it helps the server understand what type of content the client can handle. This rule demonstrates how to import and use the Accepts Helper in Hono.

*Source: docs/helpers/accepts.md*

### Handling Accept Headers with Hono's 'accepts' Function

The 'accepts' function in Hono is used to handle different Accept headers in a request. It looks at the specified Accept header and returns the proper value based on the supported values and a default value.

Here is a code snippet demonstrating its usage:

```ts
import { accepts } from 'hono/accepts'

app.get('/', (c) => {
  const accept = accepts(c, {
    header: 'Accept-Language',
    supports: ['en', 'ja', 'zh'],
    default: 'en',
  })
  return c.json({ lang: accept })
})
```

In this example, the 'accepts' function is used to handle the 'Accept-Language' header. It supports 'en', 'ja', and 'zh' languages, with 'en' as the default language.

This function is crucial for handling internationalization and different content types in a web application. It allows the application to respond appropriately based on the client's preferences.

- The 'accepts' function should be used in the route handler, as it needs the context 'c' which contains the request and response objects.

- [Hono documentation](https://hono.beyondco.de/docs/helpers/accepts)

- Handling different languages in a web application
- Handling different content types in a web application

**Reasoning:** This rule is important as it demonstrates how to use the 'accepts' function from Hono to handle different Accept headers in a request. It shows how to specify the header, the supported values, and a default value. This is crucial for handling internationalization and different content types in a web application.

*Source: docs/helpers/accepts.md*

### Defining AcceptHeader Type in Hono

In Hono, you can define an `AcceptHeader` type to specify the types of accept headers your application can handle. This is done using TypeScript's union type (`|`), which allows you to define a type that can be one of several types.

Here is an example of how to define an `AcceptHeader` type:

```ts
export type AcceptHeader =
  | 'Accept'
  | 'Accept-Charset'
  | 'Accept-Encoding'
  | 'Accept-Language'
  | 'Accept-Patch'
  | 'Accept-Post'
  | 'Accept-Ranges'
```

When you define a variable of type `AcceptHeader`, it can only be assigned one of the specified values. If you try to assign a value that is not in the list, TypeScript will throw a compile-time error.

- The `AcceptHeader` type definition is not limited to the values shown in the example. You can add or remove values as needed for your application.

- [TypeScript Union Type](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)

- Use the `AcceptHeader` type when you need to work with accept headers in your application, to ensure that only valid headers are used.

**Reasoning:** This rule is important as it demonstrates how to define an AcceptHeader type in Hono. Accept headers are used in HTTP requests to tell the server what content types the client can handle. By defining the AcceptHeader type, we ensure that only valid accept headers are used in our application, reducing the chance of errors.

*Source: docs/helpers/accepts.md*

### Importing and Using the 'css' Module from Hono

This code snippet demonstrates how to import and use the 'css' module from the 'hono' library in TypeScript.

```ts
import { Hono } from 'hono'
import { css, cx, keyframes, Style } from 'hono/css'
```

The 'css' module allows developers to write CSS in a template literal. The return value of 'css' will be the class name, which can then be set to the value of the class attribute in your components. The '<Style />' component will then contain the value of the CSS.

- The 'css' module is marked as 'Experimental'. This means that it is still under development and may change in future versions of Hono.

- [Hono Documentation](https://hono.brontosaurusrex.com/)

- Styling components in a more JavaScript-centric way.
- Managing styles in a single place, making it easier to maintain and update the styles of your application.

**Reasoning:** This rule is important as it demonstrates how to import and use the 'css' module from the 'hono' library in TypeScript. The 'css' module allows developers to write CSS in a template literal, which can then be used as a class name in the application. This is a key feature of the Hono framework, enabling developers to manage styles in a more JavaScript-centric way.

*Source: docs/helpers/css.md*

### Styling Pseudo-classes in Hono

In Hono, you can style pseudo-classes like `:hover` by using the nesting selector, `&`.

Here is an example:

```ts
const buttonClass = css`
  background-color: #fff;
  &:hover {
    background-color: red;
  }
`
```

In this code snippet, the `&` symbol represents the current selector. So, `&:hover` is equivalent to `.buttonClass:hover` in regular CSS. When the user hovers over an element with the `buttonClass` class, the background color changes to red.

- The `&` symbol can be used to reference the current selector in other contexts as well, not just pseudo-classes.

- [Nesting selector - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector)

- Changing the color of a button when the user hovers over it
- Displaying a dropdown menu when the user hovers over a navigation item

**Reasoning:** This rule is important as it demonstrates how to style pseudo-classes like `:hover` in Hono using the nesting selector `&`. This is a common practice in CSS-in-JS libraries, and it's crucial for developers to understand how to use it to create interactive styles in their applications.

*Source: docs/helpers/css.md*

### Using Nesting Selectors and Extending CSS in Hono

In Hono, you can use the nesting selector, `&`, to define styles that should apply under certain conditions. For example, you can define a hover style for a button like this:

```ts
const buttonClass = css`
  background-color: #fff;
  &:hover {
    background-color: red;
  }
`
tsx
const baseClass = css`
  color: white;
  background-color: blue;
`

const header1Class = css`
  ${baseClass}
  font-size: 3rem;
`

const header2Class = css`
  ${baseClass}
  font-size: 2rem;
`
```

In this snippet, both `header1Class` and `header2Class` will have the styles defined in `baseClass`, but with different font sizes.

- The `&` symbol refers to the parent selector.
- You can embed a class name to extend its styles.

- [Nesting selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector)

- Defining hover, active, focus, etc. styles for an element.
- Creating base styles that can be extended and customized for different elements.

#### Code Snippet

```typescript

In this snippet, the `&:hover` means 'when this element is hovered over'. The `&` refers to the parent selector, in this case the button.

You can also extend the CSS definition by embedding the class name. This is useful when you want to apply a base style to multiple elements, but with some variations. For example:

```

**Reasoning:** This rule is important as it demonstrates how to use the nesting selector and how to extend CSS definitions in Hono. This is a common practice in CSS-in-JS libraries to keep your code DRY (Don't Repeat Yourself) and to maintain a consistent style across your application.

*Source: docs/helpers/css.md*

### Reusing and Nesting CSS Classes in Hono

This code snippet demonstrates how to reuse and nest CSS classes in Hono. This is done by defining a base class and then using it in other classes. The syntax `${baseClass} {}` is used to nest classes.

```tsx
const baseClass = css`
  color: white;
  background-color: blue;
`

const header1Class = css`
  ${baseClass}
  font-size: 3rem;
`

const header2Class = css`
  ${baseClass}
  font-size: 2rem;
`

const headerClass = css`
  color: white;
  background-color: blue;
`

const containerClass = css`
  ${headerClass} {
    h1 {
      font-size: 3rem;
    }
  }
`
```

The base class is defined with the `css` function. This class is then used in other classes with the `${baseClass}` syntax. This allows the properties of the base class to be reused in other classes. The `${baseClass} {}` syntax is used to nest classes, allowing for hierarchical structuring of CSS.

- Changes to the base class will propagate to all classes that use it, promoting code maintainability.
- Nesting classes can make the code easier to understand and manage.

- [Hono Documentation](https://hono.bokuweb.me/)

- When you want to reuse CSS properties across multiple classes.
- When you want to structure your CSS in a hierarchical manner.

**Reasoning:** This rule is important as it demonstrates how to reuse and nest CSS classes in Hono. This promotes code reusability and maintainability, as changes to the base class will propagate to all classes that use it. It also shows how to structure CSS in a hierarchical manner, which can make the code easier to understand and manage.

*Source: docs/helpers/css.md*

### Defining Global Styles in Hono

In Hono, you can define global styles using the `:-hono-global` pseudo-selector. This is useful when you want to apply a certain style to all elements of a particular type, regardless of their location in the document tree.

Here is a code snippet demonstrating this:

```tsx
const globalClass = css`
  :-hono-global {
    html {
      font-family: Arial, Helvetica, sans-serif;
    }
  }
`

return c.render(
  <div class={globalClass}>
    <h1>Hello!</h1>
    <p>Today is
```

In this snippet, the `:-hono-global` pseudo-selector is used to define a global style that sets the font-family of all html elements to Arial, Helvetica, sans-serif.

- The `:-hono-global` pseudo-selector can only be used within the `css` tagged template literal.
- The styles defined within the `:-hono-global` block will be applied globally, affecting all matching elements in the document.

- [Hono Documentation](https://hono.io/docs)

- Setting a global font-family or font-size.
- Applying a global background color or text color.

**Reasoning:** This rule is important as it demonstrates how to define global styles in Hono using the `:-hono-global` pseudo-selector. This is useful when you want to apply a certain style to all elements of a particular type, regardless of their location in the document tree.

*Source: docs/helpers/css.md*

### Using `keyframes` in Hono for Animations

In Hono, you can use `keyframes` to write the contents of `@keyframes`. This is useful for creating animations. In the given code snippet, `fadeInAnimation` is the name of the animation.

```tsx
const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
const headerClass = css`
  animation-name: ${fadeInAnimation};
  animation-duration: 2s;
`
```

1. Define the `keyframes` with the desired animation. Here, the `fadeInAnimation` changes the opacity from 0 to 1.
2. Use the defined `keyframes` in your CSS with the `animation-name` property.
3. Set the `animation-duration` property to determine how long the animation should take.

- The `keyframes` feature in Hono is marked as experimental. It may change in future releases.

- [Hono Documentation](https://hono.bespokejs.com)

- Use `keyframes` to create animations for page transitions, loading spinners, and hover effects.

**Reasoning:** This rule is important as it demonstrates how to use `keyframes` in Hono to create animations. Animations can greatly enhance the user experience by providing visual feedback, guiding tasks, and offering a smooth transition.

*Source: docs/helpers/css.md*

### Compositing Class Names with `cx` in Hono

In Hono, you can use the `cx` function to composite multiple class names. This is useful when you want to apply multiple styles to a single element, and those styles are defined in separate classes.

Here is a code snippet demonstrating this:

```tsx
const buttonClass = css`
  border-radius: 10px;
`
const primaryClass = css`
  background: orange;
`
const Button = () => (
  <a class={cx(buttonClass, primaryClass)}>Click!</a>
)
```

In this example, the `Button` component has two classes applied to it: `buttonClass` and `primaryClass`. The `cx` function composites these two classes, allowing the button to have both a border radius and an orange background.

- The `cx` function is experimental and may change in future versions of Hono.

- [Hono Documentation](https://hono.brontosaurusrex.com/)

- Applying multiple styles to a single element
- Compositing classes to create complex styles

**Reasoning:** This rule is important as it demonstrates how to use the `cx` function in Hono to composite multiple class names. This is useful when you want to apply multiple styles to a single element, and those styles are defined in separate classes.

*Source: docs/helpers/css.md*

### CSS Class Composition in Hono

This code snippet demonstrates how to define and apply CSS styles to components in Hono. It also shows how to use the `cx` function to apply multiple classes to a component and to compose simple strings.

```tsx
const buttonClass = css`
  border-radius: 10px;
`
const primaryClass = css`
  background: orange;
`
const Button = () => (
  <a class={cx(buttonClass, primaryClass)}>Click!</a>
)
tsx
const Header = () => <a class={cx('h1', primaryClass)}>Hi</a>
```

In this case, the `cx` function is used to apply the 'h1' string and the `primaryClass` to the `Header` component.

- The `cx` function is a powerful tool for applying multiple classes or composing strings in Hono.
- The `css` function is used to define CSS classes in Hono.

- [Hono Documentation](https://hono.bike/docs)

- Styling components in Hono
- Applying multiple classes to a component
- Composing simple strings

#### Code Snippet

```typescript

In the above code, `buttonClass` and `primaryClass` are CSS classes defined using the `css` function. The `cx` function is then used to apply both classes to the `Button` component.

The `cx` function can also be used to compose simple strings, as shown below:

```

**Reasoning:** This rule is important as it demonstrates how to use css in Hono to define and apply styles to components. It shows how to define css classes and how to apply multiple classes to a component using the cx function. It also shows that the cx function can be used to compose simple strings.

*Source: docs/helpers/css.md*

### Using CSS Helpers with Secure Headers Middleware in Hono

This code snippet demonstrates how to use css helpers in combination with the Secure Headers middleware in Hono. It shows how to add the 'nonce' attribute to the 'Style' component to avoid Content-Security-Policy issues caused by the css helpers.

```tsx
<Style nonce={c.get('secureHeadersNonce')} />
```

The 'nonce' attribute is a security feature that can be used to make a whitelist of trusted sources of content. By adding this attribute to the 'Style' component, you can ensure that the css helpers are trusted and will not cause Content-Security-Policy issues.

- The 'nonce' attribute should be a base64-encoded random value that changes for each HTTP request.

- [Secure Headers Middleware](/docs/middleware/builtin/secure-headers)
- [Nonce Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)

This pattern is commonly used when you want to use css helpers in your Hono application and need to ensure that they do not cause security issues.

**Reasoning:** This rule is important as it demonstrates how to use css helpers in combination with the Secure Headers middleware in Hono. It shows how to add the 'nonce' attribute to the 'Style' component to avoid Content-Security-Policy issues caused by the css helpers. This is crucial for maintaining the security of the application and ensuring that the css helpers function correctly.

*Source: docs/helpers/css.md*

### Managing Cookies in Hono Framework

This code demonstrates how to manage cookies in Hono framework using the cookie helper functions.

```ts
import { Hono } from 'hono'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
```

1. Import the Hono framework and the cookie helper functions.
2. Use the `setCookie` function to set a cookie. It takes three arguments: the context, the cookie name, and the cookie value.
3. Use the `getCookie` function to retrieve a cookie. It takes two arguments: the context and the cookie name.
4. Use the `deleteCookie` function to delete a cookie. It takes two arguments: the context and the cookie name.

- The `getSignedCookie` and `setSignedCookie` functions are used for signed cookies, which are a type of cookie that have a signature, so they can't be tampered with.

- [Hono documentation](https://hono.bayfrontcloud.com/docs)

- Managing session data
- Storing user preferences

**Reasoning:** This rule is important as it demonstrates how to manage cookies in Hono framework. It shows how to import and use the cookie helper functions such as getCookie, setCookie, and deleteCookie. Understanding this rule is crucial for developers to manage session data and user preferences, which are common use cases for cookies.

*Source: docs/helpers/cookie.md*

### Handling Cookies in Hono

This rule demonstrates how to handle cookies in Hono framework. The operations include setting, getting, and deleting cookies.

```ts
import { Hono } from 'hono'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'

app.get('/cookie', (c) => {
  setCookie(c, 'cookie_name', 'cookie_value')
  const yummyCookie = getCookie(c, 'cookie_name')
  deleteCookie(c, 'cookie_name')
  const allCookies = getCookie(c)
  // ...
})
```

In the above code:

- `setCookie(c, 'cookie_name', 'cookie_value')` sets a cookie with the name 'cookie_name' and value 'cookie_value'.
- `getCookie(c, 'cookie_name')` retrieves the value of the cookie named 'cookie_name'.
- `deleteCookie(c, 'cookie_name')` deletes the cookie named 'cookie_name'.
- `getCookie(c)` retrieves all cookies.

Note: The 'c' parameter represents the context of the request.

Common use cases include maintaining user sessions, tracking user behavior, etc.

**Reasoning:** This rule is important as it demonstrates how to handle cookies in Hono framework. It covers how to set, get, and delete regular cookies, which are common operations in web development for maintaining user sessions, tracking user behavior, etc.

*Source: docs/helpers/cookie.md*

### Handling Signed Cookies in Hono

This code snippet demonstrates how to set, retrieve, and delete signed cookies in Hono. Signed cookies are a security measure that ensures the data stored in the cookie has not been tampered with.

```ts
app.get('/signed-cookie', (c) => {
  const secret = 'secret'

  await setSignedCookie(c, 'cookie_name0', 'cookie_value', secret)
  const fortuneCookie = await getSignedCookie(c, secret, 'cookie_name0')
  deleteCookie(c, 'cookie_name0')
  const allSignedCookies = await getSignedCookie(c, secret)
})
```

In this snippet:

- A secret key is defined.
- `setSignedCookie` is used to set a signed cookie.
- `getSignedCookie` is used to retrieve the value of a signed cookie. It will return `false` if the signature was tampered with or is invalid.
- `deleteCookie` is used to delete a cookie.

- The secret key should be a large enough string to be secure.
- The operations are asynchronous due to the async nature of the WebCrypto API, which is used to create HMAC SHA-256 signatures.

- Storing user session information in a secure manner.
- Storing temporary data between requests.

- [Hono Documentation](https://hono.boutell.com/)

**Reasoning:** This rule is important as it demonstrates how to set, retrieve, and delete signed cookies in Hono. Signed cookies are a security measure that ensures the data stored in the cookie has not been tampered with. This is done by appending a signature to the cookie value and verifying it when the cookie is read.

*Source: docs/helpers/cookie.md*

### Setting and Deleting Cookies in Hono

This code demonstrates how to set and delete cookies in Hono. It includes examples for both regular and signed cookies.

```ts
// Regular cookies
setCookie(c, 'great_cookie', 'banana', {
  path: '/',
  secure: true,
  domain: 'example.com',
  httpOnly: true,
  maxAge: 1000,
  expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
  sameSite: 'Strict',
})

// Signed cookies
await setSignedCookie(
  c,
  'fortune_cookie',
  'lots-of-money',
  'secret ingredient',
  {
    path: '/',
    secure: true,
    domain: 'example.com',
    httpOnly: true,
    maxAge: 1000,
    expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
    sameSite: 'Strict',
  }
)
```

The `setCookie` function is used to set a regular cookie, while the `setSignedCookie` function is used to set a signed cookie. Both functions take a context object, the cookie name, the cookie value, and an options object as parameters. The options object can include properties like `path`, `secure`, `domain`, `httpOnly`, `maxAge`, `expires`, and `sameSite`.

- `setSignedCookie` also takes a secret parameter, which is used to sign the cookie.
- The `deleteCookie` function is used to delete a cookie. It takes a context object, the cookie name, and an options object as parameters. The options object can include properties like `path`, `secure`, and `domain`.

- [Hono documentation](https://hono.bespoken.io/docs/cookies/)

- Storing user session data
- Tracking user behavior
- Personalizing user experience

**Reasoning:** This rule is important as it demonstrates how to set and delete cookies in Hono, including regular and signed cookies. Cookies are essential for maintaining session data and other information on the client side. Understanding how to correctly set and delete cookies is crucial for managing user sessions, personalization, and tracking.

*Source: docs/helpers/cookie.md*

### Deleting Cookies in Hono

This code snippet demonstrates how to delete a cookie using the Hono web framework.

```ts
deleteCookie(c, 'banana', {
  path: '/',
  secure: true,
  domain: 'example.com',
})
```

The `deleteCookie` function takes three parameters:

1. `c`: The context object.
2. `'banana'`: The name of the cookie to be deleted.
3. An options object that specifies the path, whether the cookie is secure, and the domain.

- The `deleteCookie` function returns the deleted value.
- The Cookie helper supports `__Secure-` and `__Host-` prefix.

- [Hono Documentation](https://hono.bike/docs/cookies)

- Deleting user session cookies when a user logs out.
- Deleting tracking cookies when a user opts out of tracking.

**Reasoning:** This rule is important as it demonstrates how to delete a cookie using the Hono web framework. Understanding how to delete cookies is crucial for managing user sessions, tracking, and personalization features.

*Source: docs/helpers/cookie.md*

### Deleting Cookies and Handling Secure Cookie Prefixes in Hono

This code demonstrates how to delete a cookie in Hono.

```ts
deleteCookie(c, 'banana', {
  path: '/',
  secure: true,
  domain: 'example.com',
})
ts
const deletedCookie = deleteCookie(c, 'delicious_cookie')
ts
const deletedCookie = deleteCookie(c, 'delicious_cookie')
```

- The `deleteCookie` function requires the cookie name and optionally, the path, secure flag, and domain.
- The `__Secure-` and `__Host-` prefixes are used to ensure that the cookie is only sent over secure connections and cannot be accessed via JavaScript respectively.

- Deleting user session cookies when the user logs out.
- Deleting cookies when they are no longer needed to free up space.

- [MDN Web Docs - Secure and HttpOnly cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)

#### Code Snippet

```typescript

The `deleteCookie` function returns the deleted value:

```

**Reasoning:** This rule is important as it demonstrates how to delete a cookie using the Hono framework. It also shows how to handle cookies with `__Secure-` and `__Host-` prefixes, which are security features for cookies. Understanding this rule is crucial for managing user sessions and implementing security measures in web applications.

*Source: docs/helpers/cookie.md*

### Using `__Secure-` and `__Host-` Prefixes in Cookie Names with Hono

In Hono, you can add `__Secure-` and `__Host-` prefixes to cookie names for added security. Here's how you can do it:

```ts
const securePrefixCookie = getCookie(c, 'yummy_cookie', 'secure')
const hostPrefixCookie = getCookie(c, 'yummy_cookie', 'host')

const securePrefixSignedCookie = await getSignedCookie(
  c,
  secret,
  'fortune_cookie',
  'secure'
)
const hostPrefixSignedCookie = await getSignedCookie(
  c,
  secret,
  'fortune_cookie',
  'host'
)
ts
setCookie(c, 'delicious_cookie', 'macha', {
  prefix: 'secure', // or `host`
})
```

- The `__Secure-` prefix tells the browser to only send the cookie over an encrypted HTTPS connection.
- The `__Host-` prefix requires the cookie to be secure and its path attribute to be `/`, ensuring that the cookie won't be sent across different sites.

- [Cookie Prefixes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Cookie_prefixes)

- Use `__Secure-` and `__Host-` prefixes when you want to ensure that your cookies are only sent over secure connections and are not accessible across different sites.

#### Code Snippet

```typescript

In this code snippet, `getCookie` and `getSignedCookie` functions are used to retrieve cookies with `__Secure-` and `__Host-` prefixes. The third argument to these functions is the prefix type.

To set a cookie with a prefix, you can use the `setCookie` function and specify the prefix type in the options object:

```

**Reasoning:** This rule is important as it demonstrates how to use the `__Secure-` and `__Host-` prefixes in cookie names using the Hono framework. These prefixes add an extra layer of security to cookies. The `__Secure-` prefix tells the browser to only send the cookie over an encrypted HTTPS connection. The `__Host-` prefix requires the cookie to be secure and its path attribute to be `/`, ensuring that the cookie won't be sent across different sites.

*Source: docs/helpers/cookie.md*

### Setting Cookies and Signed Cookies with a Prefix in Hono

This code snippet demonstrates how to set cookies and signed cookies in Hono with a prefix.

```ts
setCookie(c, 'delicious_cookie', 'macha', {
  prefix: 'secure', // or `host`
})

await setSignedCookie(
  c,
  'delicious_cookie',
  'macha',
  'secret choco chips',
  {
    prefix: 'secure', // or `host`
  }
)
```

The `setCookie` and `setSignedCookie` functions are used to set a cookie and a signed cookie respectively. The `prefix` option is used to specify a prefix when setting the cookie.

Following the best practices for cookie settings is crucial for secure and efficient web development. The New Cookie RFC (a.k.a cookie-bis) and CHIPS include some best practices for Cookie settings that developers should follow.

- [RFC6265bis-13](https://datatracker.i

This is commonly used when you want to set a cookie or a signed cookie with a specific prefix in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to set cookies and signed cookies in Hono with a prefix. The prefix option is used to specify a prefix when setting the cookie. Following best practices for cookie settings is crucial for secure and efficient web development.

*Source: docs/helpers/cookie.md*

### Handling WebSocket Connections in Hono

This code snippet demonstrates how to handle WebSocket connections in the Hono framework using the `upgradeWebSocket()` function.

```ts
import type { ServerWebSocket } from 'bun'

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

// ...

export default {
  fetch: app.fetch,
  websocket,
}
```

In the above code, `upgradeWebSocket()` is used to return a handler for handling WebSocket connections. This handler can be used to listen for incoming messages from the client and send responses.

1. Import the necessary modules and types.
2. Create a new WebSocket using `createBunWebSocket()`.
3. Use `upgradeWebSocket()` to return a handler for handling WebSocket connections.
4. Export the handler so it can be used elsewhere in your application.

- The `upgradeWebSocket()` function is part of the Hono framework and is designed to work with the `ServerWebSocket` type from the 'bun' module.

- [@hono/node-ws](https://github.com/honojs/middleware/tree/main/packages/node-ws)

- Real-time applications that require bi-directional communication between the client and server.
- Applications that require push notifications from the server to the client.

**Reasoning:** This rule is important as it demonstrates how to handle WebSocket connections in the Hono framework. It shows how to upgrade a connection to a WebSocket and handle incoming messages from the client.

*Source: docs/helpers/websocket.md*

### Using WebSocket Helper in Hono Framework

The WebSocket Helper in Hono framework supports various events such as `onOpen`, `onMessage`, `onClose`, and `onError`. However, currently, Cloudflare Workers does not support the `onOpen` event.

```text
Available events:

- `onOpen` - Currently, Cloudflare Workers does not support it.
- `onMessage`
- `onClose`
- `onError`
```

It's important to note that if you use middleware that modifies headers (e.g., applying CORS) on a route that uses WebSocket Helper, you may encounter an error saying you can't modify immutable headers. This is because `upgradeWebSocket()` also changes headers internally. Therefore, caution is required when using WebSocket Helper and middleware at the same time.

Handlers defined with WebSocket Helper also support RPC mode.

When a WebSocket connection is established, the events are triggered based on the interaction. For instance, `onMessage` is triggered when a message is received from the client.

Be cautious when using middleware that modifies headers on a route that uses WebSocket Helper, as it can lead to errors due to immutable headers.

- Hono framework documentation

- Real-time communication between client and server
- Implementing chat applications, multiplayer games, live updates, etc.

**Reasoning:** This rule is important as it demonstrates the use of WebSocket Helper in Hono framework and the events it supports. It also highlights the caution required when using middleware that modifies headers on a route that uses WebSocket Helper, as it can lead to errors due to immutable headers.

*Source: docs/helpers/websocket.md*

### Creating WebSocket Server and Client in Hono

This code demonstrates how to create a WebSocket server and client using the Hono framework.

```ts
// server.ts
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'

const app = new Hono().get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage: (e

// client.ts
const client = hc<WebSocketApp>('http://localhost:8787')
const socket = client.ws.$ws() // A WebSocket object for a client
```

On the server side, the `upgradeWebSocket` function is used to upgrade an HTTP connection to a WebSocket connection. On the client side, the `hc` function is used to create a WebSocket client that connects to the server.

- The `upgradeWebSocket` function is specific to the Hono framework and may not work with other frameworks.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Real-time applications such as chat apps, live updates, etc.

**Reasoning:** This rule is important as it demonstrates how to create a WebSocket client and server using the Hono framework. It shows how to upgrade an HTTP connection to a WebSocket connection on the server side and how to create a WebSocket client that connects to the server.

*Source: docs/helpers/websocket.md*

### Establishing WebSocket Connection with Hono

This code snippet demonstrates how to establish a WebSocket connection using the Hono framework.

```javascript
const client = hc<typeof app>('http://localhost:8787')
const ws = client.ws.$ws(0)

ws.addEventListener('open', () => {
  setInterval(() => {
    ws.send(new Date().toString())
  }, 1000)
})
```

1. A client is created that connects to the server at 'http://localhost:8787'.
2. A WebSocket (ws) is created using the client's WebSocket method.
3. An event listener is added to the WebSocket that triggers when the connection is opened.
4. Inside the event listener, a setInterval function is used to send the current date and time to the server every second.

- The WebSocket connection is established at the start of the application and remains open for real-time data transfer.
- The server must be set up to handle WebSocket connections and messages.

- [Hono Documentation](https://hono.bouffier.com/docs)

- Real-time data transfer between client and server
- Live updates or notifications
- Collaborative applications where multiple users interact with the same data

**Reasoning:** This rule is important as it demonstrates how to establish a WebSocket connection using the Hono framework. WebSockets provide a full-duplex communication channel over a single TCP connection, which is essential for real-time data transfer between the client and server.

*Source: docs/helpers/websocket.md*

### Importing and Using JWT Functionality in Hono

This code snippet demonstrates how to import and use the JWT functionality from the Hono framework.

```ts
import { decode, sign, verify } from 'hono/jwt'
```

The `decode`, `sign`, and `verify` functions are imported from the `hono/jwt` module. These functions are used to handle JWT tokens in the application.

- `decode`: This function is used to decode a JWT token and retrieve the payload.
- `sign`: This function is used to generate a JWT token by encoding a payload and signing it.
- `verify`: This function is used to verify a JWT token and ensure it is valid.

The JWT Middleware also imports the `jwt` function from the `hono/jwt` module.

- [JWT Middleware](/docs/middleware/builtin/jwt)

- Implementing user authentication and authorization in a web application.
- Verifying the integrity of data sent between the client and server.

**Reasoning:** This rule is important as it demonstrates how to import and use the JWT functionality from the Hono framework. JWT (JSON Web Tokens) are commonly used for authorization purposes in web applications. Understanding how to import and use these functions is crucial for implementing secure authorization in a web application using Hono.

*Source: docs/helpers/jwt.md*

### Generating JWT Tokens in Hono

The `sign` function from the `hono/jwt` module is used to generate a JWT (JSON Web Token) by encoding a payload and signing it using a specified algorithm and secret.

Here is the function signature:

```ts
sign(
  payload: unknown,
  secret: string,
  alg?: 'HS256';
): Promise<string>;
ts
import { sign } from 'hono/jwt'

const payload = {
  sub: 'user123',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
}

const secret = 'your-secret'

const token = await sign(payload, secret)
```

In this example, a payload is created with a subject (`sub`), a role, and an expiration time (`exp`). The `sign` function is then used to generate a JWT token using this payload and a secret.

- The `sign` function returns a promise that resolves to a string. This string is the JWT token.

- The `alg` parameter is optional and defaults to 'HS256', which stands for HMAC SHA-256, a commonly used cryptographic algorithm for generating JWT tokens.

- [Hono JWT Documentation](https://hono.bryntum.com/docs/modules/jwt.html)

- Authenticating users in a web application
- Securely transmitting information between parties

#### Code Snippet

```typescript

And here is an example of its usage:

```

**Reasoning:** This rule is important as it demonstrates how to use the 'sign' function from the 'hono/jwt' module to generate a JWT token. JWT tokens are a common method for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

*Source: docs/helpers/jwt.md*

### Verifying JWT Tokens in Hono

This code snippet demonstrates how to verify a JWT token using the Hono framework.

```ts
verify(
  token: string,
  secret: string,
  alg?: 'HS256';
): Promise<any>;
ts
import { verify } from 'hono/jwt'

const tokenToVerify = 'token'
const secretKey = 'mySecretKey'

const decodedPayload = await verify(tokenToVerify, secretKey)
console.log(decodedPayload)
```

- The `verify` function only checks the validity of the token if you have added Payload Validation.
- The secret key should be kept secure and not exposed to the client.

- [Hono JWT Documentation](https://hono.bryntum.com/docs/classes/jwt.html)

- Verifying user authentication tokens in a web application.

#### Code Snippet

```typescript

### How it works

The `verify` function takes in three parameters: the token to be verified, the secret key used for signing the token, and an optional algorithm parameter (default is 'HS256'). It returns a promise that resolves with the decoded payload if the token is valid.

### Example

```

**Reasoning:** This rule is important as it demonstrates how to verify a JWT token using the Hono framework. JWT tokens are used for authentication and secure data transfer. Verifying the token ensures it hasn't been tampered with and is still valid, which is crucial for maintaining security in web applications.

*Source: docs/helpers/jwt.md*

### Decoding a JWT Token in Hono

This code snippet demonstrates how to decode a JWT token using the Hono framework. The `decode` function extracts and returns the header and payload from the token.

```ts
import { decode } from 'hono/jwt'

// Decode the JWT token
const tokenToDecode = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAidXNlcjEyMyIsICJyb2xlIjogImFkbWluIn0.JxUwx6'

const decodedToken = decode(tokenToDecode);
```

The `decode` function takes a JWT token as a string and returns an object with the header and payload.

This function does not perform signature verification. It should be used when you trust the source of the token and don't need to verify it.

- [Hono Documentation](https://hono.bryntum.com/docs/classes/jwt.html#decode)

- Extracting user information from a JWT token in an authenticated request
- Debugging JWT tokens during development

**Reasoning:** This rule is important as it demonstrates how to decode a JWT token using the Hono framework. Decoding a JWT token is a common operation in web development, especially when dealing with authentication and authorization. It allows developers to extract the header and payload from the token, which can contain useful information such as the user's role or other metadata.

*Source: docs/helpers/jwt.md*

### Decoding JWT Token in Hono Framework

This code snippet demonstrates how to decode a JWT token using Hono framework. The 'decode' function from 'hono/jwt' is used to decode the token.

```ts
import { decode } from 'hono/jwt'

// Decode the JWT token
const tokenToDecode = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAidXNlcjEyMyIsICJyb2xlIjogImFkbWluIn0.JxUwx6Ua1B0D1B0FtCrj72ok5cm1Pkmr_hL82sd7ELA'

const { header, payload } = decode(tokenToDecode)

console.log('Decoded Header:', header)
console.log('Decoded Payload:', payload)
```

The 'decode' function takes a JWT token as input and returns an object containing the header and payload of the token.

- The 'decode' function does not perform signature verification. It only decodes the token to extract the header and payload.

- [Hono JWT Documentation](https://hono.bosch.io/docs/api/jwt/)

- Inspecting the header and payload of a JWT token in applications.

**Reasoning:** This rule is important as it demonstrates how to decode a JWT token using Hono framework. Decoding a JWT token is a common requirement in many applications for inspecting the header and payload of the token. This rule can be used as a reference for developers to understand how to use the 'decode' function from 'hono/jwt' to decode a JWT token.

*Source: docs/helpers/jwt.md*

### Using Development Helper Methods in Hono

In Hono, you can use the development helper methods for debugging and development purposes. Here's how you can do it:

```ts
import { Hono } from 'hono'
import { getRouterName, showRoutes } from 'hono/dev'
ts
const app = new Hono()

// ...

console.log(getRouterName(app))
ts
const app = new Hono()

// ...

showRoutes(app)
```

- These methods are meant to be used in a development environment and not in a production environment.

- [Hono Documentation](https://hono.bevry.me/)

- Debugging router issues
- Visualizing the routes in your application

#### Code Snippet

```typescript

### `getRouterName()`

You can get the name of the currently used router with `getRouterName()`.

```

**Reasoning:** This rule is important as it demonstrates how to use the development helper methods provided by the Hono framework. These methods can be useful for debugging and development purposes. The `getRouterName()` function can be used to retrieve the name of the currently used router, and the `showRoutes()` function can be used to display the routes.

*Source: docs/helpers/dev.md*

### Using Helper Functions in Hono

In Hono, there are helper functions that can be used for debugging and understanding the state of your application. Two of these functions are `getRouterName()` and `showRoutes()`.

You can get the name of the currently used router with `getRouterName()`. Here is an example of how to use it:

```ts
import { Hono } from 'hono'
import { getRouterName } from 'hono/dev'

const app = new Hono()

// ...

console.log(getRouterName(app))
ts
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'

const app = new Hono().basePath('/v1')

app.get('/posts')

// ...

showRoutes(app)
```

These functions are particularly useful during the development phase of your application, as they provide insights into the state of your router and routes.

#### Code Snippet

```typescript

### `showRoutes()`

`showRoutes()` function displays the registered routes in your console. Here is an example of how to use it:

```

**Reasoning:** This rule is important as it demonstrates how to use the helper functions `getRouterName()` and `showRoutes()` in the Hono framework. These functions are useful for debugging and understanding the state of your application, as they allow you to retrieve the name of the currently used router and display the registered routes respectively.

*Source: docs/helpers/dev.md*

### Displaying Registered Routes in Hono

In Hono, you can display all the registered routes in your application using the `showRoutes()` function. This can be particularly useful for debugging and understanding the structure of your application.

Here is an example of how to use it:

```ts
const app = new Hono().basePath('/v1')

app.get('/posts', (c) => {
  // ...
})

app.get('/posts/:id', (c) => {
  // ...
})

app.post('/posts', (c) => {
  // ...
})

showRoutes(app, {
  verbose: true,
})
txt
GET   /v1/posts
GET   /v1/posts/:id
POST  /v1/posts
```

- The `showRoutes()` function takes two arguments: the Hono application instance and an options object. In this case, we're passing `{ verbose: true }` to display detailed information about each route.
- The `basePath()` function sets a base path for all routes. In this case, all routes will be prefixed with `/v1`.

- [Hono Documentation](https://hono.bespokejs.com)

- Debugging: You can use this feature to quickly check all the routes in your application and ensure they are set up correctly.
- Documentation: This can also be useful for generating documentation for your API, as it provides a clear overview of all the available endpoints.

#### Code Snippet

```typescript

When this application starts running, the routes will be shown in your console as follows:

```

**Reasoning:** This rule is important as it demonstrates how to display all the registered routes in a Hono application. This can be useful for debugging and understanding the structure of the application.

*Source: docs/helpers/dev.md*

### Defining and Displaying Routes in Hono

In Hono, routes are defined using the `app.get` or `app.post` methods. The first argument is the route path and the second argument is a callback function that handles the request and response.

```txt
app.post('/posts', (c) => {
  // ...
})
txt
showRoutes(app, {
  verbose: true,
})
txt
GET   /v1/posts
GET   /v1/posts/:id
POST  /v1/posts
```

- The callback function for a route takes a context object 'c' as an argument. This object contains information about the request and response.
- The 'verbose' option in 'showRoutes' is optional. If it is not provided, the default value is false.

- [Hono Documentation](https://hono.bike/)

- Defining routes for different HTTP methods (GET, POST, etc.)
- Displaying the routes in the console for debugging purposes

#### Code Snippet

```typescript

To display the routes in the console when the application starts, use the 'showRoutes' function. The 'verbose' option can be set to true to display more detailed information.

```

**Reasoning:** This rule is important as it demonstrates how to define routes in a Hono application and how to use the 'showRoutes' function to display the routes in the console. It also shows the usage of the 'verbose' option, which when set to true, displays more detailed information about the routes.

*Source: docs/helpers/dev.md*

### Importing and Using 'getConnInfo' in Hono

This rule demonstrates how to import and use the 'getConnInfo' helper function from the Hono framework in both Lambda@Edge and Node.js contexts.

For Lambda@Edge:

```ts
import { Hono } from 'hono'
import { getConnInfo } from 'hono/lambda-edge'
ts
import { Hono } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
ts
const app = new Hono()

app.get('/', (c) => {
  const info = getConnInfo(c) // info is `ConnInfo`
  return c.text(`Your remote address is ${info.remote.address}`)
})
```

The 'getConnInfo' function is imported from the appropriate module depending on the context (Lambda@Edge or Node.js). It is then used inside a route handler to retrieve connection information from the context object 'c'. The remote address of the client is then sent back in the response.

- The 'getConnInfo' function returns an object of type 'ConnInfo', which includes various properties related to the connection.
- The context object 'c' passed to route handlers in Hono includes the request and response objects, among other things.

- [Hono Documentation](https://hono.beyondnlp.com/)

- Logging client information for debugging or analytics
- Performing security checks based on client information

#### Code Snippet

```typescript

For Node.js:

```

**Reasoning:** This rule is important as it demonstrates how to import and use the 'getConnInfo' helper function from the Hono framework in both Lambda@Edge and Node.js contexts. This function is used to retrieve connection information, such as the remote address of a client, which can be useful in various scenarios like logging, debugging, or security checks.

*Source: docs/helpers/conninfo.md*

### Using 'getConnInfo()' Helper Function to Retrieve Connection Information in Hono

This code snippet demonstrates how to use the 'getConnInfo()' helper function in Hono to retrieve connection information.

```ts
const app = new Hono()

app.get('/', (c) => {
  const info = getConnInfo(c) // info is `ConnInfo`
  return c.text(`Your remote address is ${info.remote.address}`)
})
ts
type AddressType = 'IPv6' | 'IPv4' | undefined

type NetAddrInfo = {
  /**
   * Transport protocol type
   */
  transport?: 'tcp' | 'udp'
  /**
   * Transport port number
   */
  port?: number
}
```

The 'getConnInfo()' function retrieves connection information from the context object 'c'. This information includes the remote address, transport protocol type, and transport port number.

- The 'getConnInfo()' function is a helper function provided by Hono.
- The returned 'ConnInfo' object contains detailed information about the connection.

- [Hono Documentation](https://hono.beyondco.de/)

- Retrieving connection information for logging or debugging purposes.
- Displaying connection information to the user.

#### Code Snippet

```typescript

The 'getConnInfo()' function returns an object of type 'ConnInfo'. The type definitions for the values that can be obtained from this function are as follows:

```

**Reasoning:** This rule is important as it demonstrates how to use the 'getConnInfo()' helper function in Hono to retrieve connection information. It also shows the type definitions for the values that can be obtained from this function. Understanding this rule is crucial for developers to effectively use Hono's helper functions and handle connection information in their applications.

*Source: docs/helpers/conninfo.md*

### Importing and Using the testClient Function in Hono

This code snippet demonstrates how to import and use the 'testClient' function from the 'hono/testing' module in Hono framework.

```ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
```

The 'testClient()' function takes an instance of Hono as its first argument and returns an object of the Hono Client. This allows you to define your requests for testing purposes.

- The 'testClient()' function is part of the 'hono/testing' module and must be imported before use.
- The function requires an instance of Hono as its first argument.

- Hono Client: /docs/guides/rpc#client

- Testing Hono applications: The 'testClient()' function simplifies the testing process by providing an instance of the Hono Client, which can be used to define requests.

**Reasoning:** This rule is important as it demonstrates how to import and use the 'testClient' function from the 'hono/testing' module in Hono framework. This function is crucial for testing Hono applications as it simplifies the process by returning an instance of the Hono Client, which can be used to define requests.

*Source: docs/helpers/testing.md*

### Testing Hono Applications with testClient

This code snippet demonstrates how to use the 'testClient' function from Hono's testing module to test a Hono application.

```ts
import { testClient } from 'hono/testing'

it('test', async () => {
  const app = new Hono().get('/search', (c) =>
    c.json({ hello: 'world' })
  )
  const res = await testClient(app).search.$get()

  expect(await res.json()).toEqual({ hello: 'world' })
})
```

In this example, a Hono application is created with a GET route '/search' that returns a JSON response. The 'testClient' function is then used to send a GET request to this route. The response is awaited and then checked to ensure it matches the expected output.

- The 'testClient' function takes a Hono application as its argument and returns an object that can be used to send requests to the application.
- The '$get' function is used to send a GET request to a specific route.

- [Hono Testing Documentation](https://hono.bayrell.org/docs/en/testing)

- Testing the behavior of routes in a Hono application.
- Checking the response of a route to ensure it matches the expected output.

**Reasoning:** This rule is important as it demonstrates how to use the 'testClient' function from Hono's testing module to test a Hono application. It shows how to create a Hono application, define a route, and then use the 'testClient' function to send a GET request to that route. The response is then checked to ensure it matches the expected output. This is a fundamental aspect of testing in Hono, ensuring that the application behaves as expected.

*Source: docs/helpers/testing.md*

### Importing and Using Streaming Helpers in Hono

This code demonstrates how to import and use the streaming helpers provided by the Hono framework.

```ts
import { Hono } from 'hono'
import { stream, streamText, streamSSE } from 'hono/streaming'
```

1. The `Hono` object is imported from the `hono` package. This object is the main entry point for using the Hono framework.
2. The `stream`, `streamText`, and `streamSSE` functions are imported from the `hono/streaming` module. These functions are used to create streaming responses.

- The `stream` function returns a simple streaming response as a `Response` object.
- The `streamText` function is used for streaming text responses.
- The `streamSSE` function is used for streaming Server-Sent Events (SSE).

- [Hono Documentation](https://hono.bike/docs/helpers/)

- Streaming large amounts of data in a response.
- Sending real-time updates to the client using SSE.

**Reasoning:** This rule is important as it demonstrates how to import and use the streaming helpers provided by the Hono framework. These helpers allow for streaming responses in a Hono application, which can be useful for handling large amounts of data or real-time updates.

*Source: docs/helpers/streaming.md*

### Handling Streaming Responses with Hono's stream() Function

In Hono, the `stream()` function is used to return a simple streaming response as a `Response` object. This function takes two arguments: the context `c` and an async function that handles the stream.

Here is a code snippet demonstrating its usage:

```ts
app.get('/stream', (c) => {
  return stream(c, async (stream) => {
    // Write a process to be executed when aborted.
    stream.onAbort(() => {
      console.log('Aborted!')
    })
    // Write a Uint8Array.
    await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    // Pipe a readable stream.
    await stream.pipe(anotherReadableStream)
  })
})
```

In this snippet:

1. The `onAbort()` function is used to handle the abort event. In this case, it logs 'Aborted!' to the console.
2. The `write()` function is used to write a Uint8Array to the stream.
3. The `pipe()` function is used to pipe a readable stream.

- Make sure to handle the abort event to prevent unexpected behavior.
- The `write()` and `pipe()` functions return promises, so make sure to use `await` or handle the promises properly.

- [Hono Documentation](https://hono.balthazar.dev/docs)

- Streaming large files or data in chunks to prevent blocking the event loop.
- Streaming real-time data.

**Reasoning:** This rule is important as it demonstrates how to use the stream() function in Hono to return a simple streaming response as a Response object. It shows how to handle the abort event, write a Uint8Array to the stream, and pipe a readable stream. Understanding this rule is crucial for developers who need to handle streaming responses in their Hono applications.

*Source: docs/helpers/streaming.md*

### Streaming Text in Hono

This code demonstrates how to use the `streamText` function in Hono to return a streaming response with specific headers. It shows how to write text with and without a new line, and how to introduce a delay in the stream.

```ts
app.get('/streamText', (c) => {
  return streamText(c, async (stream) => {
    // Write a text with a new line ('\n').
    await stream.writeln('Hello')
    // Wait 1 second.
    await stream.sleep(1000)
    // Write a text without a new line.
    await stream.write(`Hono!`)
  })
})
```

The `streamText` function takes two arguments: the context `c` and a callback function. The callback function takes a `stream` object, which is used to write text to the response. The `writeln` method writes a text with a new line, while the `write` method writes a text without a new line. The `sleep` method introduces a delay in the stream.

If you are developing an application for Cloudflare Workers, a streaming may not work well on Wrangler. If so, add `Identity` for `Content-Encoding` header.

- [Hono Documentation](https://hono.boutell.com/)

- Real-time applications
- Streaming large amounts of data

**Reasoning:** This rule is important as it demonstrates how to use the streamText function in Hono to return a streaming response with specific headers. It shows how to write text with and without a new line, and how to introduce a delay in the stream. This is useful in scenarios where data needs to be streamed to the client, for example, in real-time applications.

*Source: docs/helpers/streaming.md*

### Handling Streaming in Cloudflare Workers with Hono

When developing an application for Cloudflare Workers, streaming may not work well on Wrangler. To handle this, you need to set the 'Content-Encoding' header to 'Identity'.

Here is a code snippet demonstrating this:

```ts
app.get('/streamText', (c) => {
  c.header('Content-Encoding', 'Identity')
  return streamText(c, async (stream) => {
    // ...
  })
})
```

In this code snippet, we are defining a GET route '/streamText'. Inside the route handler, we first set the 'Content-Encoding' header to 'Identity'. Then, we return a stream of text.

- Make sure to set the 'Content-Encoding' header to 'Identity' when working with streaming on Wrangler.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Streaming text or other data in a Cloudflare Worker application.

**Reasoning:** This rule is important as it demonstrates how to handle streaming in Cloudflare Workers using the Hono framework. It shows the correct way to set the 'Content-Encoding' header to 'Identity' to ensure proper functioning of streaming on Wrangler.

*Source: docs/helpers/streaming.md*

### Streaming Server-Sent Events with Hono

This code snippet demonstrates how to use the `streamSSE()` function in Hono to stream Server-Sent Events (SSE). This is a common use case for real-time applications where the server needs to push updates to the client.

```ts
const app = new Hono()
let id = 0

app.get('/sse', async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      const message = `It is ${new Date().toISOString()}`
      await stream.writeSSE({
        data: message,
        event: 'time-update',
        id: String(id++),
      })
      await stream.sleep(1000)
    }
  })
})
```

The `streamSSE()` function takes two arguments: the context object `c` and a callback function. The callback function is called with a `stream` object that has a `writeSSE()` method. This method is used to send a Server-Sent Event to the client.

- The `writeSSE()` method takes an object with `data`, `event`, and `id` properties. The `data` property is the message to send, the `event` property is the type of event, and the `id` property is a unique identifier for the event.
- The `stream.sleep()` method is used to pause execution for a specified amount of time. This is useful for throttling the rate of events.

- [Hono Documentation](https://hono.bouzuya.net/)

- Real-time updates: Use SSE to push updates from the server to the client in real-time. For example, you could use this to push real-time stock price updates, chat messages, or game state updates.

**Reasoning:** This rule is important as it demonstrates how to use the streamSSE() function in Hono to stream Server-Sent Events (SSE). This is a common use case for real-time applications where the server needs to push updates to the client.

*Source: docs/helpers/streaming.md*

### Error Handling in Hono's Streaming Helper

In Hono, the third argument of the streaming helper is used as an error handler. This argument is optional, and if not specified, the error will be output as a console error.

Here is an example of how to use it:

```ts
app.get('/stream', (c) => {
  return stream(
    c,
    async (stream) => {
      // Write a process to be executed when aborted.
      stream.onAbort(() => {
        console.log('Aborted!')
      })
      // Write a Uint8Array.
      await stream.write(
        new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
      )
      // Pipe a readable stream.
      await stream.pipe(anotherReadableStream)
    },
    (err, stream) => {
      stream.writeln('An error occurred!')
      console.error(err)
    }
  )
})
```

In this code snippet, the error handler is used to write a message to the stream and output the error to the console when an error occurs.

The stream will be automatically closed after the callbacks are executed. If the callback function of the streaming helper throws an error, the `onError` event of Hono will not be triggered.

- The error handler is optional. If not specified, the error will be output as a console error.
- The stream will be automatically closed after the callbacks are executed.

- [Hono Documentation](https://hono.bouzuya.net/)

- Streaming large amounts of data
- Handling errors during streaming

**Reasoning:** This rule is important as it demonstrates how to handle errors in Hono's streaming helper. It shows how to use the third argument of the streaming helper as an error handler, and how to write a process to be executed when an error occurs or when the stream is aborted.

*Source: docs/helpers/streaming.md*

### Importing and Using Factory Helper in Hono

This code demonstrates how to import and use the Factory Helper in Hono to create an instance of the Factory class.

```ts
import { Hono } from 'hono'
import { createFactory, createMiddleware } from 'hono/factory'
ts
import { createFactory } from 'hono/factory'

const factory = createFactory()
```

The `createFactory` function is imported from 'hono/factory' and used to create an instance of the Factory class. This instance can then be used to create Hono's components such as Middleware.

- The Factory Helper is a useful tool for setting up the proper TypeScript types in Hono.
- The `createFactory` function creates an instance of the Factory class.

- Hono documentation: https://hono.boshanlu.com/

- Creating an instance of the Factory class to use in creating Hono's components such as Middleware.

#### Code Snippet

```typescript

To create an instance of the Factory class, use the `createFactory()` function.

```

**Reasoning:** This rule is important as it demonstrates how to import and use the Factory Helper in Hono, which provides useful functions for creating Hono's components such as Middleware. It also shows how to create an instance of the Factory class using the createFactory() function. This is crucial for setting up the proper TypeScript types in Hono.

*Source: docs/helpers/factory.md*

### Creating an Instance of the Factory Class and Passing Environment Types as Generics in Hono

In Hono, you can create an instance of the Factory class using the 'createFactory()' function. This function is imported from 'hono/factory'.

Here is a basic example of how to use it:

```ts
import { createFactory } from 'hono/factory'

const factory = createFactory()
ts
import { createFactory } from 'hono/factory'

type Env = {
  Variables: {
    foo: string
  }
}

const factory = createFactory<Env>()
```

- The 'createFactory()' function is a part of the 'hono/factory' module.
- You can pass environment types as Generics to the function for type safety.

- Hono Documentation: [https://hono.bespokejs.com](https://hono.bespokejs.com)

- Creating an instance of the Factory class in Hono.
- Passing environment types as Generics to the 'createFactory()' function.

#### Code Snippet

```typescript

You can also pass your environment types as Generics to the 'createFactory()' function. This is useful for ensuring type safety and correct usage of environment variables within your application. Here is an example:

```

**Reasoning:** This rule is important as it demonstrates how to create an instance of the Factory class using the 'createFactory()' function in Hono. It also shows how to pass environment types as Generics to the function, which is crucial for type safety and ensuring the correct usage of environment variables within the application.

*Source: docs/helpers/factory.md*

### Creating Factory Instance with Environment Variables in Hono

In Hono, you can create a factory instance using the 'createFactory' function. You can also pass your environment types as Generics to this function. Here is an example:

```ts
import { createFactory } from 'hono/factory'

type Env = {
  Variables: {
    foo: string
  }
}

const factory = createFactory<Env>()
```

In this code snippet, a type 'Env' is defined with a 'Variables' property. This 'Env' type is then passed as a Generic to the 'createFactory' function to create a factory instance.

The 'createFactory' function in Hono is used to create a factory instance. This function can take environment types as Generics, allowing you to define the types of your environment variables.

- The 'createFactory' function is a part of the 'hono/factory' module.
- The environment types passed as Generics should be defined before they are used.

- Hono Documentation: https://hono.bosch.io/docs/

- Defining environment variables for a Hono application.
- Creating a factory instance with specific environment variables.

**Reasoning:** This rule is important as it demonstrates how to create a factory instance in Hono with environment variables. It shows how to use the 'createFactory' function and how to pass environment types as Generics. This is a common pattern in Hono framework usage, and understanding this can help in creating more flexible and reusable code.

*Source: docs/helpers/factory.md*

### Setting Default Options for a Hono Application

This code snippet demonstrates how to set default options for a Hono application using the 'createFactory' function.

```ts
const factory = createFactory({
  defaultAppOptions: { strict: false },
})

const app = factory.createApp() // `strict: false` is applied
```

In this example, a factory is created with the default option 'strict' set to false. This factory is then used to create an application, and the 'strict' option is automatically applied to this application.

1. The 'createFactory' function is called with an object containing the default options.
2. This function returns a factory with these default options.
3. The 'createApp' method of the factory is then called to create an application with these default options.

- The 'createFactory' function can be used to set any default options for a Hono application.
- The 'createApp' method of the factory will automatically apply these default options to any applications it creates.

- [Hono Documentation](https://hono.bryntum.com/docs/)

- Setting default options for a Hono application to ensure consistent behavior across multiple instances of the application.

**Reasoning:** This rule is important as it demonstrates how to set default options for a Hono application using the 'createFactory' function. It shows how to create a factory with default options and then use this factory to create an application with these default options.

*Source: docs/helpers/factory.md*

### Creating Custom Middleware in Hono

In Hono, you can create custom middleware using the `createMiddleware()` function. This function allows you to execute code before the final request handler, thus providing a way to manage the request-response cycle.

Here is an example of how to create a custom middleware that sets a response header:

```ts
const messageMiddleware = createMiddleware(async (c, next) => {
  await next()
  c.res.headers.set('X-Message', 'Good morning!')
})
```

In this code snippet, `createMiddleware()` is used to create a middleware that sets the 'X-Message' response header to 'Good morning!'. The `next()` function is called to pass control to the next middleware function in the stack.

- The `next()` function is crucial as it passes control to the next middleware function. If it is not called, the request will hang.

- [Hono Documentation](https://hono.bike/docs/middleware/)

- Setting response headers
- Logging requests
- Authenticating users

**Reasoning:** This rule is important as it demonstrates how to create custom middleware in Hono. Middleware is a crucial part of any web application as it allows you to execute code before the final request handler, thus providing a way to manage the request-response cycle. In this case, the custom middleware is used to set a response header.

*Source: docs/helpers/factory.md*

### Creating and Using Middleware to Set Custom Response Headers in Hono

In Hono, middleware functions are used to perform operations on the request and response objects. They are functions that have access to the `context` object and the `next` middleware function in the application’s request-response cycle.

The following code snippet demonstrates how to create a middleware function that sets a custom response header. This middleware function can be reused across different routes or for all routes.

```ts
const messageMiddleware = (message: string) => {
  return createMiddleware(async (c, next) => {
    await next()
    c.res.headers.set('X-Message', message)
  })
}

app.use(messageMiddleware('Good evening!'))
```

In this code:

1. A middleware function `messageMiddleware` is created. This function takes a string `message` as an argument and returns another function that is the actual middleware.
2. The returned middleware function takes `context` and `next` as arguments. `context` is the context object that encapsulates a request and a response. `next` is a function that, when called, passes control to the next middleware function.
3. The middleware function sets a custom response header 'X-Message' with the value of `message`.
4. The middleware function is then used in the application with `app.use()`. This applies the middleware to all routes.

This pattern is useful when you need to perform the same operation for multiple or all routes, such as setting custom headers, logging, or error handling.

**Reasoning:** This rule is important as it demonstrates how to create and use middleware in Hono to set custom response headers. Middleware functions are a fundamental part of any Hono application as they have access to the request and response objects, and the next middleware function in the application’s request-response cycle. This pattern allows developers to encapsulate logic that manipulates the response object in a reusable function.

*Source: docs/helpers/factory.md*

### Creating Middleware and Handlers using Factory in Hono

This code demonstrates how to use the factory module in Hono to create middleware and handlers, and how to use them in an application.

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

1. Import the necessary modules from Hono.
2. Create a factory instance using `createFactory()`.
3. Use the factory instance to create middleware using `createMiddleware()`. This middleware sets a variable 'foo' to 'bar'.
4. Use the factory instance to create handlers using `createHandlers()`. These handlers return a JSON response with the value of 'foo'.
5. Use the created handlers in the application's route.

- The factory module in Hono helps to organize code in a modular way.
- Middleware and handlers created using the factory can be used across different parts of the application.

- [Hono Documentation](https://hono.bevry.me/)

- Creating reusable middleware and handlers for an application.

**Reasoning:** This rule is important as it demonstrates how to use the factory module in Hono to create middleware and handlers. It also shows how to use these created elements in an application. This pattern is crucial for organizing code in a modular way, allowing for better maintainability and scalability.

*Source: docs/helpers/factory.md*

### Avoiding Redundancy in `Env` Type Definition in Hono

In Hono framework, you might need to set the `Env` type in two places when using `new Hono()` and `createMiddleware()`. This can lead to redundancy and potential errors if the `Env` type changes.

Here is an example of this scenario:

```ts
import { createMiddleware } from 'hono/factory'

type Env = {
  Variables: {
    myVar: string
  }
}

// 1. Set the `Env` to `new Hono()`
const app = new Hono<Env>()

// 2. Set the `Env` to `createMiddleware()`
const mw = createMiddleware<Env>(async (c, next) => {
  await next()
})

app.use(mw)
```

To avoid this redundancy, you can use `createFactory()` and `createApp()` to set the `Env` only in one place. This leads to cleaner and more maintainable code.

- [Hono Documentation](https://hono.bike/#/)

This pattern is commonly used when you have a complex `Env` type that is used in multiple places in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to avoid redundancy in the definition of the `Env` type in Hono framework. It shows how to use `createFactory()` and `createApp()` to set the `Env` only in one place, instead of setting it in two places when using `new Hono()` and `createMiddleware()`. This leads to cleaner and more maintainable code.

*Source: docs/helpers/factory.md*

### Using `createFactory()` and `createApp()` to Set `Env` in One Place in Hono

This code snippet demonstrates how to use the `createFactory()` and `createApp()` methods in Hono to set the `Env` in one place.

```ts
import { createFactory } from 'hono/factory'

// ...

// Set the `Env` to `createFactory()`
const factory = createFactory<Env>()

const app = factory.createApp()

// factory also has `createMiddleware()`
const mw = factory.createMiddleware(async (c, next) => {
  await next()
})
```

1. Import the `createFactory` function from the 'hono/factory' module.
2. Set the `Env` to `createFactory()`.
3. Use the `createApp()` method of the factory to create an app.
4. Use the `createMiddleware()` method of the factory to create a middleware.

- `createFactory()` can receive the `initApp` option to initialize an `app` created by `createApp()`.

- [Hono Documentation](https://hono.bayrell.org/en/)

- When you want to set the `Env` in one place for better code reusability and maintainability.

**Reasoning:** This rule is important as it demonstrates how to use the `createFactory()` and `createApp()` methods in Hono to set the `Env` in one place. This is a best practice in Hono framework usage as it promotes code reusability and maintainability.

*Source: docs/helpers/factory.md*

### Initializing an Application with a Database in Hono Framework

The following code snippet demonstrates how to initialize an application with a database using the `initApp` option in the `createFactory` function in Hono framework.

```ts
// factory-with-db.ts
type Env = {
  Bindings: {
    MY_DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}

export default createFactory<Env>({ 
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = drizzle(c.env.MY_DB)
      c.set('db', db)
      await next()
    })
  },
})
```

In the `createFactory` function, the `initApp` option is used to initialize the application. A middleware is set up using the `app.use` function. This middleware creates a database connection using the `drizzle` function and the `MY_DB` binding from the environment. The database connection is then set in the context using the `c.set` function.

- The `initApp` option is a common way to set up middleware in Hono framework.
- The `drizzle` function is used to create a database connection.

- [Hono Documentation](https://hono.bevry.me/)

- Setting up a database connection for an application.
- Initializing an application with other types of middleware.

**Reasoning:** This rule is important as it demonstrates how to initialize an application with a database using the `initApp` option in the `createFactory` function. This is a common pattern in Hono framework to set up middleware for the application, in this case, setting up a database connection.

*Source: docs/helpers/factory.md*

### Initializing and Accessing a Database Connection in Hono

This code snippet demonstrates how to use a factory function to initialize an application with a database connection in the Hono framework.

```ts
export default createFactory<Env>({ 
  initApp: (app) => { 
    app.use(async (c, next) => { 
      const db = drizzle(c.env.MY_DB) 
      c.set('db', db) 
      await next() 
    }) 
  }, 
})
ts
// crud.ts
import factoryWithDB from './factory-with-db'

const app = factoryWithDB.createApp()

app.post('/posts', (c) => { 
  c.var.db.insert() 
  // ...
})
```

1. The `createFactory` function is used to create a factory for the application. This factory includes an `initApp` function that sets up a middleware to create a database connection using the `drizzle` function and the `MY_DB` environment variable.
2. The middleware sets the database connection on the context object (`c`) using the `set` method.
3. In the route handler, the database connection is accessed from the context object and used to perform a database operation.

- The `drizzle` function and the `MY_DB` environment variable are placeholders and should be replaced with actual database connection logic and configuration.
- The `set` method is used to set the database connection on the context object, and the `var` property is used to access it.

- [Hono documentation](https://hono.boutique/docs/)

- Initializing a database connection when starting an application
- Accessing a database connection in route handlers

#### Code Snippet

```typescript

And accessing the database connection in a route handler:

```

**Reasoning:** This rule is important as it demonstrates how to use a factory function to initialize an application with a database connection in the Hono framework. It shows how to use middleware to set up a database connection and how to access this connection in a route handler.

*Source: docs/helpers/factory.md*

### Importing and Using the Adapter Helper in Hono

This code snippet demonstrates how to import and use the Adapter Helper from the Hono framework.

```ts
import { Hono } from 'hono'
import { env, getRuntimeKey } from 'hono/adapter'
```

1. The `Hono` object is imported from the 'hono' package.
2. The `env` and `getRuntimeKey` functions are imported from the 'hono/adapter' module.

- The `env()` function is used to retrieve environment variables across different runtimes.
- The `getRuntimeKey()` function is used to get the runtime key for the current environment.

- [Hono Documentation](https://hono.bryntum.com/docs)

- Retrieving environment variables in a unified way across different platforms.
- Getting the runtime key for the current environment.

**Reasoning:** This rule is important because it demonstrates how to import and use the Adapter Helper from the Hono framework. The Adapter Helper provides a unified interface to interact with various platforms, which is crucial for building scalable and maintainable applications. The `env()` function and `getRuntimeKey()` function are particularly useful for retrieving environment variables across different runtimes.

*Source: docs/helpers/adapter.md*

### Retrieving Environment Variables in Different Runtimes with Hono

This code snippet demonstrates how to retrieve environment variables across different runtimes using Hono's 'env' function from the 'adapter' module.

```ts
import { env } from 'hono/adapter'

app.get('/env', (c) => {
  // NAME is process.env.NAME on Node.js or Bun
  // NAME is the value written in `wrangler.toml` on Cloudflare
  const { NAME } = env<{ NAME: string }>(c)
  return c.text(NAME)
})
```

The 'env' function retrieves the value of the environment variable 'NAME'. The value that can be retrieved may be different for each runtime. For example, in Node.js or Bun, 'NAME' is process.env.NAME, while in Cloudflare, 'NAME' is the value written in `wrangler.toml`.

- The 'env' function supports different runtimes, serverless platforms, and cloud services, including Cloudflare Workers and Deno.

- [Deno.env](https://docs.deno.com/runtime/manual/basics/env_va)

- Retrieving environment variables in a unified way across different platforms
- Building scalable and portable applications

**Reasoning:** This rule is important as it demonstrates how to retrieve environment variables in different runtimes using Hono's 'env' function from the 'adapter' module. It shows how to access environment variables in a unified way across different platforms, which is crucial for building scalable and portable applications.

*Source: docs/helpers/adapter.md*

### Retrieving Environment Variables in Hono

This code snippet demonstrates how to retrieve environment variables in the Hono framework by passing the runtime key as the second argument.

```ts
app.get('/env', (c) => {
  const { NAME } = env<{ NAME: string }>(c, 'workerd')
  return c.text(NAME)
})
```

In the code snippet, `env<{ NAME: string }>(c, 'workerd')` is used to get the environment variable `NAME` for the 'workerd' runtime. The `env` function takes two arguments: the context `c` and the runtime key 'workerd'.

- The `env` function is used to manage user-defined data in Hono.
- The runtime key must be specified correctly to retrieve the appropriate environment variables.

- [Hono Documentation](https://hono.bevry.me/)

- Configuring the application based on the runtime environment
- Managing user-defined data

**Reasoning:** This rule is important as it demonstrates how to retrieve environment variables in the Hono framework by specifying the runtime key. Understanding this is crucial for managing user-defined data and configuring the application based on the runtime environment.

*Source: docs/helpers/adapter.md*

### Using `getRuntimeKey()` to Identify Runtime Environment in Hono

The `getRuntimeKey()` function in Hono is used to identify the current runtime environment. This can be useful when the application behavior needs to be adjusted based on the runtime environment.

Here is a code snippet demonstrating its usage:

```ts
app.get('/', (c) => {
  if (getRuntimeKey() === 'workerd') {
    return c.text('You are on Cloudflare')
  } else if (getRuntimeKey() === 'bun') {
    return c.text('You are on Bun')
  }
  ...
})
```

In this snippet, the `getRuntimeKey()` function is used to check if the current runtime environment is 'workerd' or 'bun'. Depending on the result, a different response is returned.

- The `getRuntimeKey()` function returns a string that represents the current runtime environment.
- The returned value can be 'workerd', 'bun', or any other string representing a supported runtime environment.

- Adjusting application behavior based on the runtime environment.
- Debugging issues that occur only in specific runtime environments.

**Reasoning:** This rule is important as it demonstrates how to use the `getRuntimeKey()` function in Hono to identify the current runtime environment. This can be useful in scenarios where the application behavior needs to be adjusted based on the runtime environment.

*Source: docs/helpers/adapter.md*

### Importing and Using Proxy Helper in Hono

This guide demonstrates how to import and use the proxy helper from the Hono framework.

```ts
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
```

The above code imports the Hono framework and the proxy helper from it. The proxy helper provides a `fetch()` API wrapper for proxy. The parameters and return value are the same as for `fetch()` (except for the proxy-specific options).

- The `proxy()` function is a `fetch()` API wrapper for proxy.
- The parameters and return value are the same as for `fetch()` (except for the proxy-specific options).

- [Hono Documentation](https://hono.bosch.io/docs/)

- Using a Hono application as a (reverse) proxy.

**Reasoning:** This rule is important as it demonstrates how to import and use the proxy helper from the Hono framework. The proxy helper provides useful functions when using a Hono application as a (reverse) proxy. Understanding how to correctly import and use this helper is crucial for developers working with Hono.

*Source: docs/helpers/proxy.md*

### Proxying Requests in Hono

This code demonstrates how to use the proxy function in Hono to handle requests and redirect them to another server.

```ts
app.get('/proxy/:path', (c) => {
  return proxy(`http://${originServer}/${c.req.param('path')}`)
})
```

The `app.get` function is used to handle GET requests to the '/proxy/:path' endpoint. The `:path` is a parameter that will be replaced by the actual path in the request. The `proxy` function is then used to create a new request to the `originServer` with the same path as the original request.

- The `originServer` variable should be the URL of the server you want to proxy the requests to.
- The `c.req.param('path')` function is used to get the path parameter from the request.

- [Hono Documentation](https://hono.bike/#/)

- Proxying requests to different services in a microservices architecture.
- Redirecting requests to a different domain.

**Reasoning:** This rule is important as it demonstrates how to use the proxy function in Hono to handle requests and redirect them to another server. This is a common use case in many applications where you need to proxy requests to different services.

*Source: docs/helpers/proxy.md*

### Using the Proxy Helper in Hono

This code snippet demonstrates how to use the proxy helper in Hono to forward requests to another server. It also shows how to handle headers, including how to forward all request data, how to set specific headers, and how to prevent certain headers from being propagated. Finally, it shows how to delete a response header before returning the response.

```ts
app.get('/proxy/:path', async (c) => {
  const res = await proxy(
    `http://${originServer}/${c.req.param('path')}',
    {
      headers: {
        ...c.req.header(), // optional, specify only when forwarding all the request data (including credentials) is necessary.
        'X-Forwarded-For': '127.0.0.1',
        'X-Forwarded-Host': c.req.header('host'),
        Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
      },
    }
  )
  res.headers.delete('Set-Cookie')
  return res
})
```

The proxy helper is used to forward the request to another server. The path to the other server is specified in the first argument to the proxy function. The second argument is an options object, where you can specify headers to be included in the forwarded request. You can forward all request data by spreading `c.req.header()`, set specific headers, or prevent certain headers from being propagated by setting them to `undefined`. After the request is forwarded and the response is received, you can manipulate the response headers before returning the response.

- Be careful when forwarding all request data, as it might include sensitive information like credentials.
- When setting the 'X-Forwarded-For' and 'X-Forwarded-Host' headers, make sure to use the correct values.
- Deleting a response header might affect the behavior of the client that receives the response.

- [Hono documentation](https://hono.beebotte.com/docs)

- Forwarding requests to another server in a microservices architecture.
- Implementing a reverse proxy.

**Reasoning:** This rule is important as it demonstrates how to use the proxy helper in Hono to forward requests to another server. It shows how to handle headers, including how to forward all request data, how to set specific headers, and how to prevent certain headers from being propagated. It also shows how to delete a response header before returning the response.

*Source: docs/helpers/proxy.md*

### Proxying Requests and Manipulating Headers in Hono

This code snippet demonstrates how to use a proxy in Hono to forward requests to another server. It also shows how to manipulate the headers of the request to prevent sensitive information from being propagated.

```ts
app.all('/proxy/:path', (c) => {
  return proxy(`http://${originServer}/${c.req.param('path')}`, {
    ...c.req, // optional, specify only when forwarding all the request data (including credentials) is necessary.
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': '127.0.0.1',
      'X-Forwarded-Host': c.req.header('host'),
      Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
    },
  })
})
```

The `app.all` method is used to handle all types of HTTP requests. The `proxy` function is used to forward the request to another server. The headers of the request are manipulated by spreading the existing headers and then overriding the 'Authorization' header with `undefined` to prevent it from being propagated.

- Be careful when manipulating headers as it can lead to unexpected behavior.

- [Hono documentation](https://hono.bike/)

- Forwarding requests to another server while hiding sensitive information.

**Reasoning:** This rule is important as it demonstrates how to use a proxy in Hono to forward requests to another server, while also showing how to manipulate the headers of the request. This is particularly useful when you want to hide sensitive information like 'Authorization' from being propagated.

*Source: docs/helpers/proxy.md*

### Defining ProxyFetch Interface in Hono

This code snippet demonstrates how to define interfaces for a ProxyFetch function in Hono.

```ts
interface ProxyRequestInit extends Omit<RequestInit, 'headers'> {
  raw?: Request
  headers?:
    | HeadersInit
    | [string, string][]
    | Record<RequestHeader, string | undefined>
    | Record<string, string | undefined>
}

interface ProxyFetch {
  (
    input: string | URL | Request,
    init?: ProxyRequestInit
  ): Promise<Response>
}
```

The `ProxyRequestInit` interface extends the `RequestInit` interface but omits the 'headers' property. It defines two optional properties: 'raw' of type Request and 'headers' which can be of type HeadersInit, an array of string pairs, or a Record of RequestHeader or string to string or undefined.

The `ProxyFetch` interface defines a function that takes an input of type string, URL, or Request and an optional `ProxyRequestInit` object and returns a Promise of type Response.

- The 'headers' property is omitted from the `RequestInit` interface to allow for custom header definitions.

- [Hono Documentation](https://hono.bike/docs/)

- Defining a ProxyFetch function in Hono to handle HTTP requests.

**Reasoning:** This rule is important as it demonstrates how to define interfaces for a ProxyFetch function in Hono. It shows how to extend the RequestInit interface while omitting the 'headers' property and how to define the ProxyFetch function that takes an input and an optional ProxyRequestInit object and returns a Promise of type Response.

*Source: docs/helpers/proxy.md*

### Using the `html` Helper in Hono

The `html` helper in Hono allows you to write HTML in JavaScript template literals. This is particularly useful when you need to generate dynamic HTML content based on some variables.

Here is a code snippet demonstrating its usage:

```ts
import { Hono } from 'hono'
import { html, raw } from 'hono/html'

const app = new Hono()

app.get('/:username', (c) => {
  const { username } = c.req.param()
  return c.html(
    html`<!doctype html>
      <h1>Hello! ${username}!</h1>`
  )
})
```

In this example, the `html` helper is used to generate a simple HTML document with a greeting message that includes the username passed in the URL.

The `raw()` function can be used to render content as is. This is useful when dealing with user-generated content or any content that needs to be rendered exactly as it is without any modifications. However, you need to be careful with this function as it does not escape the content, so you have to escape these strings by yourself to prevent any potential security issues.

- [Hono Documentation](https://hono.bike/#/)

- Generating dynamic HTML content based on some variables
- Rendering user-generated content or any content that needs to be rendered exactly as it is

**Reasoning:** This rule is important as it demonstrates how to use the `html` helper in Hono to write HTML in JavaScript template literals. It also shows how to use the `raw()` function to render content as is, which is crucial when dealing with user-generated content or any content that needs to be rendered exactly as it is without any modifications.

*Source: docs/helpers/html.md*

### Using the 'html' Helper Function in Hono to Generate Dynamic HTML Content

This rule demonstrates how to use the 'html' helper function in Hono to generate HTML content dynamically. The 'html' function allows you to insert dynamic content into HTML templates.

```ts
const app = new Hono()

app.get('/:username', (c) => {
  const { username } = c.req.param()
  return c.html(
    html`<!doctype html>
      <h1>Hello! ${username}!</h1>`
  )
})
```

In the code snippet, a new Hono application is created. A route handler is defined for the path '/:username'. In the route handler, the 'username' parameter is extracted from the request parameters. The 'html' function is then used to generate an HTML response that includes the 'username' parameter.

The 'html' function allows you to insert dynamic content into HTML templates. However, it does not automatically escape the content. You need to ensure that the content is properly escaped to prevent cross-site scripting (XSS) attacks.

- [Hono Documentation](https://hono.bike/#/)

The 'html' function is commonly used in web development to generate dynamic HTML content. For example, it can be used to personalize web pages based on user input or to display data from a database.

**Reasoning:** This rule is important as it demonstrates how to use the 'html' helper function in Hono to generate HTML content dynamically. It shows how to insert dynamic content into HTML templates, which is a common requirement in web development.

*Source: docs/helpers/html.md*

### Using Hono's `html` Helper for Inline Scripts and Functional Components

This code snippet demonstrates how to use Hono's `html` helper to insert inline scripts into JSX and how it can act as a functional component.

```tsx
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <title>Test Site</title>
        {html`
          <script>
            // No need to use dangerouslySetInnerHTML.
            // If you write it here, it will not be escaped.
          </script>
        `}
      </head>
      <body>Hello!</body>
    </html>
  )
})
```

The `html` helper allows you to insert inline scripts directly into your JSX. This means you can avoid using `dangerouslySetInnerHTML` and the potential security risks it carries. The scripts you write will not be escaped.

Since `html` returns an HtmlEscapedString, it can act as a fully functional component without using JSX. This can be a performance benefit as it can be faster than using `memo`.

- [Hono Documentation](https://hono.dev/docs)

- When you need to insert inline scripts into your JSX
- When you want to use a functional component without using JSX

**Reasoning:** This rule is important as it demonstrates how to use Hono's `html` helper to insert inline scripts into JSX and how it can act as a functional component. It shows how to avoid using `dangerouslySetInnerHTML` by writing scripts directly into the JSX, which will not be escaped. It also highlights the performance benefits of using `html` over `memo`.

*Source: docs/helpers/html.md*

### Creating Functional Components with `html` Helper Function in Hono

In Hono, the `html` helper function can be used to create fully functional components without the need for JSX. This function returns an HtmlEscapedString, which can be embedded directly into the component. This can be a more efficient way of creating components in certain situations.

Here is an example of how to use the `html` function to create a functional component:

In this example, the `html` function is used to create a `Footer` component. The HTML for the footer is embedded directly into the component using the `html` function.

- The `html` function returns an HtmlEscapedString, which can be embedded directly into the component.
- This approach can be more efficient than using JSX in certain situations.

- [Hono documentation](https://hono.bayfront.io/)

- Creating reusable components without the need for JSX.
- Embedding HTML directly into components for efficiency.

#### Code Snippet

```typescript
const Footer = () => html`
  <footer>
    <address>My Address...</address>
  </footer>
`
```

**Reasoning:** This rule is important as it demonstrates how to use the `html` helper function in Hono to create a functional component. This is a key aspect of Hono, as it allows for the creation of reusable components without the need for JSX. The rule also shows how to embed HTML directly into the component, which can be a more efficient way of creating components in certain situations.

*Source: docs/helpers/html.md*

### Using `html` Helper in Hono to Create HTML Templates with Embedded Values

The following code snippet demonstrates how to use the `html` helper in Hono to create HTML templates with embedded values. It defines a layout with props and passes these props to the layout. It also uses the `html` helper to return HTML from a route handler.

1. A `SiteData` interface is defined to type the props.
2. A `Layout` component is defined using the `html` helper. It takes a `SiteData` object as props and embeds the values in the HTML template.
3. A `Content` component is defined that takes a `SiteData` object and a `name` as props. It passes the `SiteData` to the `Layout` and embeds the `name` in a `<h1>` tag.
4. In the route handler for '/', an object with the `SiteData` and `name` is created and passed to the `Content` component. The `html` helper is used to return the resulting HTML.

- The `html` helper allows for efficient creation of HTML templates with embedded values.
- More elements slow down JSX, but not template literals.

- [Hono Documentation](https://hono.boutell.com/)

- Creating dynamic web pages with embedded values.
- Returning HTML from route handlers.

#### Code Snippet

```typescript
interface SiteData {
  title: string
  description: string
  image: string
  children?: any
}
const Layout = (props: SiteData) => html`
<html>
<head>
  <meta charset="UTF-8">
  <title>${props.title}</title>
  <meta name="description" content="${props.description}">
  <head prefix="og: http://ogp.me/ns#">
  <meta property="og:type" content="article">
  <!-- More elements slow down JSX, but not template literals. -->
  <meta property="og:title" content="${props.title}">
  <meta property="og:image" content="${props.image}">
</head>
<body>
  ${props.children}
</body>
</html>
`

const Content = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>Hello {props.name}</h1>
  </Layout>
)

app.get('/', (c) => {
  const props = {
    name: 'World',
    siteData: {
      title: 'Hello <> World',
      description: 'This is a description',
      image: 'https://example.com/image.png',
    },
  }
  return c.html(<Content {...props} />)
})
```

**Reasoning:** This rule is important as it demonstrates how to use the `html` helper in Hono to create HTML templates with embedded values. It shows how to define a layout with props and how to pass these props to the layout. It also shows how to use the `html` helper to return HTML from a route handler. This is a common pattern in Hono and understanding it can help in creating dynamic web pages efficiently.

*Source: docs/helpers/html.md*

### Using the 'raw()' Function in Hono to Prevent HTML Encoding

This code snippet demonstrates how to use the 'raw()' function in Hono to prevent HTML encoding of a string.

```ts
app.get('/', (c) => {
  const name = 'John &quot;Johnny&quot; Smith'
  return c.html(html`<p>I'm ${raw(name)}.</p>`)
})
```

In this example, the string 'John &quot;Johnny&quot; Smith' is passed to the 'raw()' function. This prevents the HTML encoding of the string when it is included in the HTML template literal.

- The 'raw()' function should be used with caution as it can potentially introduce security vulnerabilities if user-supplied input is not properly sanitized.

- Hono documentation: <https://hono.boutique/>

- When you want to include special characters in your string without them being converted into their HTML encoded equivalents.

**Reasoning:** This rule is important as it demonstrates how to use the 'raw()' function in Hono to prevent HTML encoding of a string. This is useful when you want to include special characters in your string without them being converted into their HTML encoded equivalents.

*Source: docs/helpers/html.md*