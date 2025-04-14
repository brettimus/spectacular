# Drizzle SQLite Rules

## Concepts

### Configuring the Default Router in Hono

In Hono, you can configure the default router using the SmartRouter. The SmartRouter is a special type of router that selects the best router from the registered routers based on routing speed.

Here is a code snippet demonstrating this:

```ts
// Inside the core of Hono.
readonly defaultRouter: Router = new SmartRouter({
  routers: [new RegExpRouter(), new TrieRouter()],
})
```

In this code snippet, the default router is set to a new instance of SmartRouter. The SmartRouter is initialized with an array of routers - RegExpRouter and TrieRouter.

When the application starts, the SmartRouter selects the fastest router from the registered routers and continues to use it for routing.

- The SmartRouter automatically selects the fastest router based on routing speed. This helps in optimizing the performance of your Hono application.

- [Hono Documentation](https://hono.bosch.io/docs/)

- Use this configuration when you want to optimize the performance of your Hono application by automatically selecting the fastest router.

**Reasoning:** This rule is important as it demonstrates how to configure the default router in Hono using the SmartRouter. The SmartRouter is a special type of router that selects the best router from the registered routers based on routing speed. This configuration is crucial for optimizing the performance of your Hono application.

*Source: docs/concepts/routers.md*

### Performance Comparison of Hono Routers

This code snippet demonstrates a performance comparison of different routers in Hono. The routers compared are LinearRouter, MedleyRouter, FindMyWay, KoaTreeRouter, and TrekRouter.

```console
• GET /user/lookup/username/hey
----------------------------------------------------- -----------------------------
LinearRouter     1.82 µs/iter      (1.7 µs … 2.04 µs)   1.84 µs   2.04 µs   2.04 µs
MedleyRouter     4.44 µs/iter     (4.34 µs … 4.54 µs)   4.48 µs   4.54 µs   4.54 µs
FindMyWay       60.36 µs/iter      (45.5 µs … 1.9 ms)  59.88 µs  78.13 µs  82.92 µs
KoaTreeRouter    3.81 µs/iter     (3.73 µs … 3.87 µs)   3.84 µs   3.87 µs   3.87 µs
TrekRouter       5.84 µs/iter     (5.75 µs … 6.04 µs)   5.86 µs   6.04 µs   6.04 µs

summary for GET /user/lookup/username/hey
  LinearRouter
   2.1x faster than KoaTreeRouter
   2.45x faster than MedleyRouter
   3.21x faster than TrekRouter
   33.24x faster than FindMyWay
```

The benchmarking results show the time taken for each iteration by the different routers. The LinearRouter is the fastest, followed by KoaTreeRouter, MedleyRouter, TrekRouter, and FindMyWay.

For situations like Fastly Compute, it's better to use LinearRouter with the `hono/quick` preset as it provides the best performance.

- Hono Documentation

- When performance is a key factor in your application, consider using the LinearRouter.

**Reasoning:** This rule is important as it demonstrates the performance comparison of different routers in Hono. It shows that the LinearRouter is significantly faster than other routers, which can be crucial for applications where performance is a key factor.

*Source: docs/concepts/routers.md*

### Deploying a Minified Hono Application Using PatternRouter

This code snippet demonstrates how to deploy a minified version of a Hono application using the PatternRouter. The PatternRouter is a feature of Hono that allows for a smaller application size, which can be beneficial in environments with limited resources.

```console
$ npx wrangler deploy --minify ./src/index.ts
 ⛅️ wrangler 3.20.0
-------------------
Total Upload: 14.68 KiB / gzip: 5.38 KiB
```

The `npx wrangler deploy --minify ./src/index.ts` command deploys a minified version of the application located at `./src/index.ts`. The `--minify` flag instructs wrangler to minify the application, reducing its size.

- The size of the minified application is displayed after the deployment process. In this case, the total upload size is 14.68 KiB.

- [Hono PatternRouter Documentation](https://hono.bouzuya.net/)

- Deploying a Hono application in an environment with limited resources.

**Reasoning:** This rule is important as it demonstrates how to deploy a minified version of a Hono application using the PatternRouter. Minifying the application can be crucial in environments with limited resources, as it reduces the size of the application.

*Source: docs/concepts/routers.md*

### Defining Routes in Hono

This code snippet demonstrates how to define routes in Hono. Each route is an object with a `method` and a `path` property. The `method` property specifies the HTTP method (e.g., GET, POST, PUT, DELETE), and the `path` property specifies the URL path for the route.

```ts
interface Route {
  method: string
  path: string
}
// ---cut---
const routes: (Route & { name: string })[] = [
  {
    name: 'short static',
    method: 'GET',
    path: '/user',
  },
```

When a request is made to the application, Hono matches the request's method and URL with the defined routes. If a match is found, the request is directed to the corresponding handler.

- Routes are matched in the order they are defined. Therefore, if two routes could match the same URL, the first one defined will be used.

- The `*` character in a path (e.g., '/static/*') is a wildcard that matches any sequence of characters.

- [Hono Documentation](https://hono.bosch.io/docs/)

- Defining routes for different functionalities in a web application.
- Setting up a RESTful API with different endpoints.

**Reasoning:** This rule is important as it demonstrates how to define routes in Hono. It shows the standard way of defining HTTP methods and paths for different endpoints in an application. Understanding this rule is crucial for setting up the application's routing system, which is responsible for directing incoming requests to the appropriate handlers.

*Source: docs/concepts/benchmarks.md*

### Performance Comparison of Hono with Other Routers for Cloudflare Workers

This code demonstrates the performance comparison of Hono with other routers for Cloudflare Workers. The results are presented in the form of screenshots.

```text
Let's see the results.

The following screenshots show the results on Node.js.

![bench](/images/bench01.png)

![bench](/images/bench02.png)

![bench](/images/bench03.png)

![bench](/images/bench04.png)

![bench](/images/bench05.png)

![bench](/images/bench06.png)

![bench](/images/bench07.png)

![bench](/images/bench08.png)

The following screenshots show the results on Bun.

![bench](/images/bench09.png)

![bench](/images/bench10.png)

![bench](/images/bench11.png)

![bench](/images/bench12.png)

![bench](/images/bench13.png)

![bench](/images/bench14.png)

![bench](/images/bench15.png)

![bench](/images/bench16.png)

**Hono is the fastest**, compared to other routers for Cloudflare Workers.

- Machine: Apple MacBook Pro, 32 GiB, M1 Pro
- Scripts: [benchmarks/handle-event](https://github.com/honojs/hono/tree/main/benchmarks/handle-event)
```

The performance of different routers is tested on different platforms (Node.js, Bun, and Cloudflare Workers). The results are then compared to determine the fastest router.

- Performance can greatly impact the efficiency and user experience of applications.
- Developers should consider the performance of routers when choosing one for their applications.

- [Hono GitHub](https://github.com/honojs/hono/tree/main/benchmarks/handle-event)

- Choosing a router for Cloudflare Workers.
- Comparing the performance of different routers.

**Reasoning:** This rule is important as it demonstrates the performance comparison of Hono with other routers for Cloudflare Workers. It shows that Hono is the fastest among the compared routers. This information is crucial for developers when choosing a router for their Cloudflare Workers, as performance can greatly impact the efficiency and user experience of their applications.

*Source: docs/concepts/benchmarks.md*

### Creating a GET Endpoint and Validating Query Parameters in Hono

This code snippet demonstrates how to create a GET endpoint in Hono that returns a JSON response. It also shows how to validate query parameters using Zod.

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/hello', (c) => {
  return c.json({
    message: `Hello!`,
  })
})
ts
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

app.get(
  '/hello',
  zValidator(
    'query',
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.query
    // ... rest of the code
  }
)
```

This works by defining a schema for the query parameters using Zod and then using the `zValidator` middleware from Hono to validate the query parameters against this schema.

- Always validate the input data to prevent security vulnerabilities and ensure the integrity of the data.

- [Hono Documentation](https://hono.bayfront.cloud/)
- [Zod Documentation](https://github.com/colinhacks/zod)

- Creating API endpoints that return JSON responses.
- Validating query parameters in API requests.

#### Code Snippet

```typescript

To validate the query parameters, you can use Zod. Here's how you can do it:

```

**Reasoning:** This rule is important as it demonstrates how to create a GET endpoint in Hono that returns a JSON response. It also shows how to validate query parameters using Zod, which is crucial for ensuring the integrity and security of the data received in the request.

*Source: docs/concepts/stacks.md*

### Defining and Validating Query Parameters in Hono

In Hono, you can define and validate query parameters using zod. This is done using the `zValidator` function, which takes two arguments: the type of the parameter ('query' in this case) and a zod schema defining the expected format of the parameter. The validated parameters can then be extracted using the `valid` method on the request object.

Here is an example:

```ts
app.get(
  '/hello',
  zValidator(
    'query',
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.req.valid('query')
    return c.json({
      message: `Hello! ${name}`,
    })
  }
)
```

In this example, the 'name' query parameter is expected to be a string. If the incoming request does not meet this expectation, Hono will automatically respond with an error.

This approach is beneficial because it ensures that the incoming requests meet the expected format and prevents potential errors due to invalid data.

**Reasoning:** This rule is important as it demonstrates how to define and validate query parameters in Hono using zod. It also shows how to extract the validated parameters and use them in the route handler. This is crucial for ensuring that the incoming requests meet the expected format and for preventing potential errors due to invalid data.

*Source: docs/concepts/stacks.md*

### Creating a Client Object in Hono

This code snippet demonstrates how to create a client object in Hono by passing the `AppType` type to `hc` as generics. This enables the endpoint path and request type to be suggested, improving code completion and reducing the likelihood of errors.

```ts
import { AppType } from './server'
import { hc } from 'hono/client'

const client = hc<AppType>('/api')
const res = await client.hello.$get({
  query: {
    name: 'Hono',
  },
})
```

1. Import the `AppType` from the server file and `hc` from 'hono/client'.
2. Create a client object by passing the `AppType` type to `hc` as generics.
3. The endpoint path and request type are suggested, improving code completion.

- The `AppType` type should be defined in the server file and should match the structure of the server.

- Hono documentation: https://hono.bayrell.org/

- Creating a client object in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to create a client object in Hono by passing the `AppType` type to `hc` as generics. This enables the endpoint path and request type to be suggested, improving code completion and reducing the likelihood of errors.

*Source: docs/concepts/stacks.md*

### Using Hono Client for GET Requests and Response Parsing

This code snippet demonstrates how to use the Hono client to make a GET request to a server and retrieve data. It also shows how to parse the response using the json() method.

```ts
import { AppType } from './server'
import { hc } from 'hono/client'

const client = hc<AppType>('/api')
const res = await client.hello.$get({
  query: {
    name: 'Hono',
  },
})

const data = await res.json()
console.log(`${data.message}`)
```

1. The Hono client is imported and initialized with the API endpoint.
2. A GET request is made to the 'hello' endpoint with a query parameter.
3. The response is parsed using the json() method, which is compatible with the fetch API.

- The json() method returns a Promise that resolves with the result of parsing the body text as JSON.

- [Hono Client Documentation](https://hono.bayrell.org/en/latest/docs/client/)

- Retrieving data from a server using a GET request.
- Parsing the response data to JSON.

**Reasoning:** This rule is important as it demonstrates how to use the Hono client to make a GET request to a server and retrieve data. It also shows how to parse the response using the json() method, which is compatible with the fetch API. This is crucial for developers to understand as it forms the basis of how data is retrieved from servers using Hono.

*Source: docs/concepts/stacks.md*

### Using Hono with React on Cloudflare Pages

This code snippet demonstrates how to use Hono with React on Cloudflare Pages. It also shows how to handle server-side changes.

```ts
// functions/api/[[route]].ts
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Ho
```

1. Import the necessary modules from Hono, zod, and hono/zod-validator.
2. Initialize a new Hono application.

- Hono is compatible with the fetch API, but the data that can be retrieved with `json()` has a type.
- Sharing API specifications allows you to be aware of server-side changes.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Creating applications on Cloudflare Pages using React.
- Handling server-side changes in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to use Hono with React on Cloudflare Pages. It shows how to create applications and handle server-side changes. Understanding this rule is crucial for developers to effectively use Hono in a React environment and handle API responses.

*Source: docs/concepts/stacks.md*

### Defining Routes and Handling Requests in Hono and Using React Query for Data Fetching

This code snippet demonstrates how to define routes and handle requests in Hono, and how to use React Query for data fetching in a React application.

```tsx
return c.json({
  message: 'created!',
})
})
.get((c) => {
  return c.json({
    todos,
  })
})

export type AppType = typeof route

export const onRequest = handle(app, '/api')
```

In the Hono part, `.get` and `.post` methods are used to define GET and POST routes respectively. The `c.json` method is used to send a JSON response.

In the React part, `useQuery` and `useMutation` hooks from React Query are used for data fetching and mutations respectively.

When a GET or POST request is made to the '/api' endpoint, the corresponding function is executed and a JSON response is sent.

In the React application, `useQuery` and `useMutation` hooks are used to fetch data and perform mutations respectively.

- Make sure to correctly define the type of the route using `typeof`.
- Use the `handle` function to handle requests to a specific route.

- [Hono Documentation](https://hono.bayfront.cloud/)
- [React Query Documentation](https://react-query.tanstack.com/)

- Building RESTful APIs with Hono
- Fetching data in a React application using React Query

**Reasoning:** This rule is important as it demonstrates how to define routes and handle requests in Hono, a web framework. It also shows how to use React Query for data fetching in a React application. Understanding this rule is crucial for building scalable and maintainable web applications with Hono and React.

*Source: docs/concepts/stacks.md*