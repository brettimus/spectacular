## Builtin

### Importing and Using Language Detector in Hono

This code demonstrates how to import and use the language detector feature in Hono. This is useful for internationalization (i18n) and locale-specific content.

```ts
import { Hono } from 'hono'
import { languageDetector } from 'hono/language'
```

1. The `Hono` module is imported from the 'hono' package.
2. The `languageDetector` module is imported from 'hono/language'.
3. These modules can then be used to detect language from query string, cookie, and header, with a fallback to English.

- The order of detection is query string, cookie, and header by default.
- It's important to specify the supported languages when using the language detector.

- [Hono Documentation](https://hono.bespoken.io/)

- Internationalization (i18n)
- Locale-specific content

**Reasoning:** This rule is important as it demonstrates how to use the language detector feature in Hono for internationalization (i18n) and locale-specific content. It shows how to import the necessary modules and use them to detect language from query string, cookie, and header, with a fallback to English.

*Source: docs/middleware/builtin/language.md*

### Language Detection in Hono

This code demonstrates how to use the `languageDetector` middleware in Hono to detect the language from the query string, cookie, and header. It also shows how to set a fallback language and how to retrieve the detected language in a route handler.

```ts
const app = new Hono()

app.use(
  languageDetector({
    supportedLanguages: ['en', 'ar', 'ja'],
    fallbackLanguage: 'en',
  })
)

app.get('/', (c) => {
  const lang = c.get('language')
  return c.text(`Hello! Your language is ${lang}`)
})
```

The `languageDetector` middleware is used with the Hono application. It is configured with an array of supported languages and a fallback language. The middleware will try to detect the language from the query string, cookie, and header (in that order). If it cannot detect a language, it will use the fallback language.

In the route handler, the detected language can be retrieved with `c.get('language')`.

- The `supportedLanguages` array must include the `fallbackLanguage`.

- [Hono documentation](https://hono.beyondnifty.com/)

- Building a multilingual web application

**Reasoning:** This rule is important as it demonstrates how to use the languageDetector middleware in Hono to detect the language from the query string, cookie, and header. It also shows how to set a fallback language and how to retrieve the detected language in a route handler. This is a common requirement in web applications that need to support multiple languages.

*Source: docs/middleware/builtin/language.md*

### Language Detection and Localization in Hono

This code snippet demonstrates how to handle language detection and localization in Hono. It shows how to set up a fallback language and how to retrieve the language from different sources.

```sh

curl http://localhost:8787/ar/home

curl http://localhost:8787/?lang=ar

curl -H 'Cookie: language=ja' http://localhost:8787/

curl -H 'Accept-Language: ar,en;q=0.9' http://localhost:8787/
```

The Hono framework allows you to specify a fallback language that will be used if no language is specified by the client. The language can be specified in several ways: via the path, a query parameter, a cookie, or a header.

The order of precedence for language detection is as follows: querystring, cookie, header. This means that if a language is specified in both the querystring and the cookie, the language from the querystring will be used.

- [Hono Documentation](https://hono.bouzuya.net/)

This pattern is commonly used in web applications that need to support multiple languages.

**Reasoning:** This rule is important as it demonstrates how to handle language detection and localization in Hono. It shows how to set up a fallback language and how to retrieve the language from different sources such as path, query parameter, cookie, and header.

*Source: docs/middleware/builtin/language.md*

### Setting Up Language Detection in Hono

This code snippet demonstrates how to set up language detection in a Hono application. The `DEFAULT_OPTIONS` object defines the default configuration for language detection.

```ts
export const DEFAULT_OPTIONS: DetectorOptions = {
  order: ['querystring', 'cookie', 'header'],
  lookupQueryString: 'lang',
  lookupCookie: 'language',
  lookupFromHeaderKey: 'accept-language',
  lookupFromPathIndex: 0,
  caches: ['cookie'],
  ignoreCase: true,
  fallbackLanguage: 'en',
  supportedLanguages: ['en'],
  cookieOptions: {
    sameSite: 'Strict',
    secure: true,
    maxAge: 365 * 24 * 60 * 60,
    httpOnly: true,
  },
  debug: false,
}
```

The `order` array defines the sequence of sources that the detector will check for a language preference. It will first check the query string, then the cookie, and finally the header. The `lookup*` properties define the specific keys to look for in each source.

If no language preference is found, the detector will fall back to the language specified by `fallbackLanguage`.

- The `caches` array specifies which sources to cache the detected language in. In this case, the language will be cached in the cookie.
- The `ignoreCase` property determines whether the detector should ignore case when matching languages.

- [Hono Documentation](https://hono.bouzuya.net/)

- Internationalizing a Hono application
- Providing a localized user experience

**Reasoning:** This rule is important as it demonstrates how to set up language detection in a Hono application. It shows the default configuration for language detection, including the order of sources to check for language preference (query string, cookie, header), the specific keys to look for in each source, and the fallback language to use if no preference is found. Understanding this rule can help developers to effectively internationalize their applications, providing a better user experience for users of different languages.

*Source: docs/middleware/builtin/language.md*

### Custom Language Detection Order in Hono

This code snippet demonstrates how to configure the language detection order in Hono. It prioritizes URL path detection over other methods like cookies, query strings, and headers.

```ts
app.use(
  languageDetector({
    order: ['path', 'cookie', 'querystring', 'header'],
    lookupFromPathIndex: 0, // /en/profile → index 0 = 'en'
    supportedLanguages: ['en', 'ar'],
    fallbackLanguage: 'en',
  })
)
```

The `order` array determines the priority of language detection methods. The `lookupFromPathIndex` option is used to specify the index of the language code in the URL path. The `supportedLanguages` array lists the languages supported by the application. If no valid language is detected, the `fallbackLanguage` is used.

- The `order` array should contain at least one method.
- The `lookupFromPathIndex` should be a valid index in the URL path.
- The `supportedLanguages` should contain valid language codes.
- The `fallbackLanguage` should be a valid language code and must be included in the `supportedLanguages` array.

- [Hono Documentation](https://hono.bouzuya.net/)

- Multilingual applications
- Applications that prioritize URL path for language detection

**Reasoning:** This rule is important as it demonstrates how to configure the language detection order in Hono. It shows how to prioritize URL path detection over other methods like cookies, query strings, and headers. This is useful in applications that need to support multiple languages and have a specific preference for how the language should be detected.

*Source: docs/middleware/builtin/language.md*

### Configuring Language Detection in Hono

This code snippet demonstrates how to configure language detection in a Hono application. It shows how to normalize complex language codes and set supported languages and a fallback language.

```ts
app.use(
  languageDetector({
    convertDetectedLanguage: (lang) => lang.split('-')[0],
    supportedLanguages: ['en', 'ja'],
    fallbackLanguage: 'en',
  })
)
```

1. `convertDetectedLanguage`: This function is used to normalize complex language codes. It splits the detected language code by '-' and returns the first part. For example, it converts 'en-US' to 'en'.
2. `supportedLanguages`: This is an array of supported language codes. In this example, 'en' and 'ja' are supported.
3. `fallbackLanguage`: This is the default language that will be used if the detected language is not supported.

- The `languageDetector` middleware must be used before any other middleware that needs to know the user's language preference.

- [Hono Documentation](https://hono.beeceptor.com/docs)

- Multilingual applications that need to adapt the user interface based on the user's language preference.

**Reasoning:** This rule is important as it demonstrates how to configure language detection in a Hono application. It shows how to normalize complex language codes (e.g., en-US to en) and set supported languages and a fallback language. This is crucial for applications that support multiple languages and need to adapt the user interface based on the user's language preference.

*Source: docs/middleware/builtin/language.md*

### Configuring Language Detection and Cookie Settings in Hono

This code snippet demonstrates how to configure language detection and cookie settings in Hono.

```ts
app.use(
  languageDetector({
    lookupCookie: 'app_lang',
    caches: ['cookie'],
    cookieOptions: {
      path: '/',
      sameSite: 'Lax',
      secure: true,
      maxAge: 86400 * 365,
      httpOnly: true,
      domain: '.example.com',
    },
  })
)
```

1. `lookupCookie: 'app_lang'` - This sets the name of the cookie to be used for language detection.
2. `caches: ['cookie']` - This enables caching of the detected language in cookies.
3. `cookieOptions` - This is used to specify various options for the cookie.

- `sameSite: 'Lax'` - This sets the SameSite attribute of the cookie to 'Lax', which means the cookie will only be sent in a first-party context and not with cross-origin requests.
- `secure: true` - This ensures that the cookie is only sent over HTTPS.
- `httpOnly: true` - This makes the cookie inaccessible via JavaScript, providing protection against cross-site scripting (XSS) attacks.

- [Hono Documentation](https://www.eclipse.org/hono/docs/)

- Internationalization and localization of applications
- Managing user sessions securely

**Reasoning:** This rule is important as it demonstrates how to configure language detection and cookie settings in Hono. It shows how to specify supported languages, fallback language, cookie options, and how to enable or disable caching and debugging. Understanding this rule is crucial for internationalization and localization of applications, as well as for managing user sessions securely.

*Source: docs/middleware/builtin/language.md*

### Disabling Cookie Caching in Hono

In Hono, you can disable cookie caching by setting the `caches` option to `false` in the `languageDetector` function.

Here is a code snippet demonstrating this:

```ts
languageDetector({
  caches: false,
})
```

When `caches` is set to `false`, Hono will not store any cookies. This means that every time a request is made, Hono will not have any stored data to refer to and will have to process the request as if it is the first time.

This can be useful in situations where the data is sensitive and should not be stored, or when the data changes frequently and the cache would serve stale data. However, keep in mind that disabling caching can impact performance, as Hono will have to process every request from scratch.

- [Hono Documentation](https://hono.bouzuya.net/)

- When dealing with sensitive data that should not be stored
- When the data changes frequently and the cache would serve stale data

**Reasoning:** This rule is important as it demonstrates how to disable cookie caching in Hono. Caching can be useful for performance, but there may be situations where it is necessary to disable it, such as when the data is sensitive and should not be stored, or when the data changes frequently and the cache would serve stale data.

*Source: docs/middleware/builtin/language.md*

### Enabling Debugging in Hono's Language Detector

This code snippet demonstrates how to enable debugging in Hono's language detector.

```ts
languageDetector({
  debug: true, // Shows: "Detected from querystring: ar"
})
```

By setting the 'debug' option to 'true', the language detector will log the detection steps. This can be useful for understanding how the language detector is working and diagnosing any issues.

When the 'debug' option is set to 'true', the language detector will log the detection steps to the console. This includes the source of the detected language (e.g., 'Detected from querystring: ar').

- Debugging should generally be disabled in production environments, as it can expose sensitive information and negatively impact performance.

- [Hono Documentation](https://www.example.com)

- Debugging issues with language detection
- Understanding how the language detector is working

**Reasoning:** This rule is important as it demonstrates how to enable debugging in Hono's language detector. Debugging is a crucial part of development and testing, as it allows developers to trace the execution of a program and find and fix bugs. In this case, setting the 'debug' option to 'true' will log the detection steps, which can be helpful in understanding how the language detector is working and diagnosing any issues.

*Source: docs/middleware/builtin/language.md*

### Implementing Language Detection and Localization in Hono

The following code snippets demonstrate how to implement language detection and localization in Hono.

```ts
app.get('/:lang/home', (c) => {
  const lang = c.get('language') // 'en', 'ar', etc.
  return c.json({ message: getLocalizedContent(lang) })
})
ts
languageDetector({
  supportedLanguages: ['en', 'en-GB', 'ar', 'ar-EG'],
  convertDetectedLanguage: (lang) => lang.replace('_', '-'), // Normalize
})
```

This snippet demonstrates how to define supported languages and normalize detected languages for consistency.

1. The `languageDetector` function is called with an object that specifies the supported languages and a function to normalize the detected language.
2. The `convertDetectedLanguage` function replaces underscores with hyphens in the detected language code to ensure consistency.

- The `languageDetector` function and the `convertDetectedLanguage` function are part of the Hono framework's internationalization (i18n) support.

- [Hono Documentation](https://hono.boutique/docs)

- Providing localized content to users based on their language preference or location.

#### Code Snippet

```typescript

This snippet shows how to retrieve the language from the request context and return localized content.

```

**Reasoning:** This rule is important as it demonstrates how to implement language detection and localization in Hono. It shows how to define supported languages and normalize detected languages for consistency. This is crucial for applications that need to support multiple languages and provide localized content to users.

*Source: docs/middleware/builtin/language.md*

### Using the 'compress' Middleware in Hono

This code snippet demonstrates how to use the 'compress' middleware in Hono to automatically compress the response body.

```ts
import { Hono } from 'hono'
import { compress } from 'hono/compress'

const app = new Hono()

app.use(compress())
```

The 'compress' middleware uses 'CompressionStream' to compress the response body. This can significantly reduce the size of the data being sent over the network, leading to faster response times.

This middleware uses 'CompressionStream', which is not yet supported in bun. Therefore, it should not be used if you are using bun.

- [Hono Documentation](https://hono.bun.dev/)

This middleware is commonly used in applications where large amounts of data are being sent over the network and faster response times are desired.

**Reasoning:** This rule is important as it demonstrates how to use the 'compress' middleware in Hono. The 'compress' middleware is used to automatically compress the response body, which can significantly reduce the size of the data being sent over the network, leading to faster response times. However, it's important to note that this middleware uses 'CompressionStream', which is not yet supported in bun.

*Source: docs/middleware/builtin/compress.md*

### Using Compression Middleware in Hono

This rule demonstrates how to use the 'compress' middleware in the Hono web framework.

```ts
import { Hono } from 'hono'
import { compress } from 'hono/compress'

const app = new Hono()

app.use(compress())
```

1. Import the necessary modules from 'hono' and 'hono/compress'.
2. Create a new Hono application.
3. Use the 'compress' middleware in the Hono application.

- The 'compress' middleware uses 'CompressionStream' which is not yet supported in bun.
- The 'compress' middleware allows for response compression using either 'gzip' or 'deflate'. If not defined, both are allowed.

- [Hono Documentation](https://hono.bun.dev/)

- Use this middleware when you want to reduce the size of the response body and increase the speed of your web application.

**Reasoning:** This rule is important as it demonstrates how to use the 'compress' middleware in the Hono web framework. It shows how to import the necessary modules and apply the middleware to the Hono application. This is a common practice in web development to reduce the size of the response body and hence, increase the speed of a web application.

*Source: docs/middleware/builtin/compress.md*

### Conditionally Enabling Timing in Hono

In Hono, you can conditionally enable timing for your requests. This can be done by passing a function to the `enabled` option in the `timing` middleware. This function receives the request context and should return a boolean indicating whether or not to enable timing.

Here's an example of how to enable timing only for POST requests:

```ts
const app = new Hono()

app.use(
  '*',
  timing({
    // c: Context of the request
    enabled: (c) => c.req.method === 'POST',
  })
)
```

In this example, the `enabled` function checks if the request method is 'POST'. If it is, timing is enabled for that request.

- The `enabled` function should return a boolean.
- The `enabled` function is called for every request, so it should be as lightweight as possible to avoid impacting performance.

- [Hono Documentation](https://hono.bespokejs.com)

- Conditionally enabling timing based on request method, headers, or other request properties.

**Reasoning:** This rule is important as it demonstrates how to conditionally enable timing in Hono. It shows how to use a function to determine whether or not to enable timing based on the request method. This can be useful in scenarios where you only want to measure the time taken for certain types of requests, such as POST requests.

*Source: docs/middleware/builtin/timing.md*

### Importing IP Restriction Middleware in Hono

This code demonstrates how to import the IP Restriction Middleware in Hono. This middleware is used to limit access to resources based on the user's IP address.

```ts
import { Hono } from 'hono'
import { ipRestriction } from 'hono/ip-restriction'
```

The `import` statements are used to include the `Hono` and `ipRestriction` modules from the 'hono' and 'hono/ip-restriction' packages respectively.

- Make sure the 'hono' and 'hono/ip-restriction' packages are installed in your project before importing them.
- The 'ipRestriction' middleware should be used judiciously as it can block access to legitimate users if not configured properly.

- [Hono Documentation](https://hono.bun.dev/docs)

- Restricting access to certain resources based on the user's IP address.
- Implementing IP-based rate limiting.

**Reasoning:** This rule is important as it demonstrates how to import the IP Restriction Middleware in Hono. This middleware is used to limit access to resources based on the user's IP address, which is crucial for security purposes.

*Source: docs/middleware/builtin/ip-restriction.md*

### Implementing IP Restriction in Hono

This code demonstrates how to implement IP restriction in Hono using the 'ipRestriction' middleware.

```ts
import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'

const app = new Hono()

app.use(
  '*',
  ipRestriction(getConnInfo, {
    denyList: [],
    allowList: ['127.0.0.1', '::1'],
  })
)

app.get('/', (c) => c.text('Hello Hono!'))
```

The 'ipRestriction' middleware is used with the 'app.use' method to apply the IP restriction to all routes ('*'). The 'getConnInfo' function is passed as the first argument to 'ipRestriction', and an object with 'denyList' and 'allowList' properties is passed as the second argument. The 'denyList' property is an array of IP addresses that are denied access, and the 'allowList' property is an array of IP addresses that are allowed access.

- The 'getConnInfo' function should be imported from the appropriate module for your environment.
- The 'denyList' and 'allowList' arrays can be modified to suit your needs.

- [ConnInfo helper](/docs/helpers/conninfo)

- Restricting access to local development environment
- Preventing unauthorized access to certain routes

**Reasoning:** This rule is important as it demonstrates how to implement IP restriction in Hono. It shows how to use the 'ipRestriction' middleware to allow or deny access to certain IP addresses. This is crucial for security purposes, as it can prevent unauthorized access to the application.

*Source: docs/middleware/builtin/ip-restriction.md*

### Implementing IP Restrictions in Hono Framework

This code snippet demonstrates how to implement IP restrictions in a web application using the Hono framework. The 'ipRestriction' middleware and the 'getConnInfo' helper from the ConnInfo helper are used to achieve this.

```ts
import { getConnInfo } from 'hono/deno'
import { ipRestriction } from 'hono/ip-restriction'

//...

app.use(
  '*',
  ipRestriction(getConnInfo, {
    // ...
  })
)
```

The 'getConnInfo' helper is passed as the first argument to the 'ipRestriction' middleware. This helper provides the connection information necessary for the middleware to determine the IP address of the incoming request.

The 'ipRestriction' middleware then uses this information to restrict access based on the IP address. The specific IP addresses or ranges to be restricted can be specified in the options object passed as the second argument to the middleware.

- The 'getConnInfo' helper used may vary depending on the environment. The example shown is for Deno.

- The IP addresses can be specified in various formats including static IP addresses, CIDR notation, or using '*' to represent all addresses.

- [ConnInfo helper](/docs/helpers/conninfo)

- Restricting access to an application based on IP addresses for security purposes.

**Reasoning:** This rule is important as it demonstrates how to implement IP restrictions using the Hono framework. It shows how to use the 'ipRestriction' middleware and the 'getConnInfo' helper to restrict access to the application based on IP addresses. This is a crucial aspect of securing web applications, as it allows developers to control who can access their application based on their IP address.

*Source: docs/middleware/builtin/ip-restriction.md*

### Using IP Restriction in Hono

This code snippet demonstrates how to use the IP restriction feature in Hono. It shows how to deny access to a specific IP range and how to customize the error message when access is denied.

```ts
app.use(
  '*',
  ipRestriction(
    getConnInfo,
    {
      denyList: ['192.168.2.0/24'],
    },
    async (remote, c) => {
      return c.text(`Blocking access from ${remote.addr}`, 403)
    }
  )
)
```

The `app.use` function is used to apply the IP restriction middleware to all routes (`'*'`). The `ipRestriction` function takes three arguments: the connection information function (`getConnInfo`), the IP restriction options, and an error handling function.

The IP restriction options object has a `denyList` property, which is an array of IP addresses or ranges to deny access to. In this case, all IP addresses in the range '192.168.2.0/24' are denied access.

The error handling function is called when access is denied. It takes two arguments: the remote connection information and the context object. It returns a custom error message and status code.

- The IP restriction middleware should be applied before any other middleware or routes.
- The `denyList` can contain both IPv4 and IPv6 addresses and ranges.

- [Hono documentation](https://hono.bouzuya.net/)

- Restricting access to your application based on IP address or range.
- Customizing the error message when access is denied.

**Reasoning:** This rule is important as it demonstrates how to use the IP restriction feature in Hono. It shows how to deny access to a specific IP range and how to customize the error message when access is denied.

*Source: docs/middleware/builtin/ip-restriction.md*

### Limiting Body Size in Hono POST Requests

This code demonstrates how to limit the size of the body in a POST request using the Hono web framework.

```ts
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

const app = new Hono()

app.post(
  '/upload',
  bodyLimit({
    maxSize: 50 * 1024, // 50kb
    onError: (c) => {
      return c.text('overflow :(', 413)
    },
  }),
  async (c) =>
```

The `bodyLimit` function is imported from 'hono/body-limit' and is used as middleware in the POST route. It checks the size of the body against the `maxSize` specified (in this case, 50kb). If the body size exceeds the `maxSize`, the `onError` function is executed.

- The `maxSize` is specified in bytes.
- The `onError` function should return a response to the client. In this case, it returns a text response with the message 'overflow :(' and a 413 (Payload Too Large) HTTP status code.

- [Hono Documentation](https://hono.beyondco.de/)

- Limiting the size of file uploads in a file upload route.
- Preventing large amounts of data from being sent to the server in a form submission route.

**Reasoning:** This rule is important as it demonstrates how to limit the size of the body in a POST request using the Hono web framework. This is crucial in scenarios where you want to prevent clients from sending large amounts of data to the server, which could potentially lead to server overload or other issues.

*Source: docs/middleware/builtin/body-limit.md*

### Limiting Body Size in Hono

This code snippet demonstrates how to limit the size of the body in a POST request using the Hono web framework.

```ts
const app = new Hono()

app.post(
  '/upload',
  bodyLimit({
    maxSize: 50 * 1024, // 50kb
    onError: (c) => {
      return c.text('overflow :(', 413)
    },
  }),
  async (c) => {
    const body = await c.req.parseBody()
    if (body['file'] instanceof File) {
      console.log(`Got file sized: ${body['file'].size}`)
    }
    return c.text('pass :)')
  }
)
```

In this example, the `bodyLimit` middleware is used to limit the size of the body in the POST request to 50KB. If the size of the body exceeds this limit, an error handler is executed, returning a 413 (Payload Too Large) status code and a custom error message.

This is a useful technique for preventing users from uploading files that are too large, which could potentially overload the server or take a long time to process.

- The `maxSize` option is required and specifies the maximum size of the body in bytes.
- The `onError` option is a function that is executed when the size of the body exceeds the `maxSize`.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- Limiting the size of file uploads in a file upload endpoint.

**Reasoning:** This rule is important as it demonstrates how to limit the size of the body in a POST request using the Hono web framework. This is crucial in scenarios where you want to prevent users from uploading files that are too large, which could potentially overload the server or take a long time to process.

*Source: docs/middleware/builtin/body-limit.md*

### Setting the Maximum Request Body Size in Hono and Bun

In Hono and Bun, the default maximum request body size is set to prevent denial of service (DoS) attacks. However, there may be cases where you need to accept larger requests. To do this, you need to set the `maxRequestBodySize` property.

Here is an example of how to do this:

```ts
export default {
  port: process.env['PORT'] || 3000,
  fetch: app.fetch,
  maxRequestBodySize: 1024 * 1024 * 200, // your value here
}
```

In this code snippet, the `maxRequestBodySize` is set to 200MiB. You can adjust this value according to your needs.

The `maxRequestBodySize` property sets the maximum size of the request body that Hono and Bun will accept. If a request exceeds this size, Hono and Bun will respond with a status code of `413` and terminate the connection.

- Be careful when increasing the `maxRequestBodySize`. Setting this value too high can make your application vulnerable to DoS attacks.
- The `maxRequestBodySize` is specified in bytes.

- [Hono Documentation](https://hono.bun.dev/)
- [Bun Documentation](https://bun.dev/)

- Accepting file uploads that are larger than the default maximum request body size.

**Reasoning:** This rule is important as it demonstrates how to set the maximum request body size in Hono and Bun. By default, Hono and Bun limit the size of the request body to prevent denial of service (DoS) attacks. However, in some cases, you may need to accept larger requests. This rule shows how to increase this limit.

*Source: docs/middleware/builtin/body-limit.md*

### Setting Maximum Request Body Size in Hono

This code snippet demonstrates how to set the maximum request body size in Hono. This is done using the `maxRequestBodySize` property.

```ts
Bun.serve({
  fetch(req, server) {
    return app.fetch(req, { ip: server.requestIP(req) })
  },
  maxRequestBodySize: 1024 * 1024 * 200, // your value here
})
```

The `maxRequestBodySize` property is set to the desired limit in bytes. In this example, it is set to 200MB.

- The value for `maxRequestBodySize` should be set according to the specific needs of your application.
- Be aware that setting a very high limit can potentially lead to resource exhaustion if large amounts of data are sent in a single request.

- [Hono Documentation](https://hono.bouzuya.net/)

- Limiting the size of file uploads
- Preventing large payloads from overloading the server

**Reasoning:** This rule is important as it demonstrates how to set the maximum request body size in Hono. This is crucial for controlling the amount of data that can be sent in a single request, preventing potential overflows or resource exhaustion.

*Source: docs/middleware/builtin/body-limit.md*

### Implementing Basic Authentication in Hono

This rule demonstrates how to implement basic authentication in a Hono application.

```ts
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})
```

The `basicAuth` function from 'hono/basic-auth' is used as a middleware for the '/auth/*' route. This function takes an object with a username and password. Any request to '/auth/*' will need to include these credentials in the Authorization header to be successful.

- The username and password are hardcoded in this example, but in a real-world application, you would likely want to check these credentials against a database.

- [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme)

- Protecting routes that should only be accessible to authenticated users.

**Reasoning:** This rule is important as it demonstrates how to implement basic authentication in a Hono application. Basic authentication is a simple authentication scheme built into the HTTP protocol. The client sends HTTP requests with the Authorization header that contains the word Basic word followed by a space and a base64-encoded string username:password. For an application to be secure, it is crucial to implement some form of authentication, and this rule provides an example of how to do so using the Hono framework.

*Source: docs/middleware/builtin/basic-auth.md*

### Hono Basic Authentication with Manual User Verification

In Hono, you can manually verify user credentials using the 'verifyUser' option in the basicAuth middleware. This provides an additional layer of security and flexibility.

Here is a code snippet demonstrating this:

```ts
const app = new Hono()

app.use(
  basicAuth({
    verifyUser: (username, password, c) => {
      return (
        username === 'dynamic-user' && password === 'hono-password'
      )
    },
  })
)
```

In the above code, the 'verifyUser' function checks if the username is 'dynamic-user' and the password is 'hono-password'. If both conditions are met, the function returns true, indicating that the user is authenticated.

- The 'verifyUser' function should return a boolean value.
- The 'verifyUser' function is called with three arguments: username, password, and the context object.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Manually verifying user credentials in applications that require custom authentication logic.

**Reasoning:** This rule is important as it demonstrates how to use the 'verifyUser' option in the basicAuth middleware of Hono framework. This option allows developers to manually verify the user credentials, providing an additional layer of security and flexibility.

*Source: docs/middleware/builtin/basic-auth.md*

### Defining Multiple Users with Basic Authentication in Hono

This code snippet demonstrates how to define multiple users with basic authentication in Hono. It shows how to pass arbitrary parameters containing objects defining more `username` and `password` pairs.

```ts
app.use(
  '/auth/*',
  basicAuth(
    {
      username: 'hono',
      password: 'acoolproject',
      // Define other params in the first object
      realm: 'www.example.com',
    },
    {
      username: 'hono-admin',
      password: 'super-secure',
      // Cannot redefine other params here
    },
    {
      username: 'hono-user-1',
      password: 'a-secret',
      // Or here
    }
  )
)
```

The `basicAuth` function is used as a middleware in the application. It takes an arbitrary number of objects as arguments, each representing a user. Each object should contain a `username` and `password` pair. Other parameters can only be defined in the first object.

- Other parameters can only be defined in the first object.
- The `username` and `password` pairs are hardcoded in this example, but they can also be loaded from a configuration file or a database.

- [Hono Documentation](https://www.hono.com/docs)

- Defining multiple users for basic authentication in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to define multiple users with basic authentication in Hono. It shows how to pass arbitrary parameters containing objects defining more `username` and `password` pairs. It also highlights that other parameters can only be defined in the first object.

*Source: docs/middleware/builtin/basic-auth.md*

### Importing and Using JWT Middleware in Hono

This code demonstrates how to import and use the JWT middleware in the Hono web framework.

```ts
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
```

1. The `Hono` object is imported from the 'hono' package. This is the main object used to create a new Hono application.
2. The `jwt` middleware is imported from 'hono/jwt'. This middleware is used to handle JWT authentication and authorization.
3. The `JwtVariables` type is imported from 'hono/jwt'. This type is used to infer the type of the JWT payload.

- The JWT middleware must be used on routes that require authentication or authorization.
- The `JwtVariables` type should be used to infer the type of the JWT payload.

- [Hono Documentation](https://hono.bayrell.org/en/)
- [JWT](https://jwt.io/introduction/)

- Protecting routes or endpoints that require user authentication or authorization.

**Reasoning:** This rule is important as it demonstrates how to import and use the JWT middleware in the Hono web framework. JWT (JSON Web Tokens) are a popular method of handling authentication and authorization in web applications. Understanding how to correctly import and utilize the JWT middleware in Hono is crucial for securing routes and endpoints in a Hono-based application.

*Source: docs/middleware/builtin/jwt.md*

### Using JWT Authentication in Hono

This code snippet demonstrates how to use JWT for authentication in Hono.

```ts
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'

type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})
```

1. Import the necessary modules from Hono and JWT.
2. Define the JWT variables.
3. Initialize a new Hono application with the defined JWT variables.
4. Apply the JWT middleware to all routes under '/auth'.
5. Define a GET route '/auth/page' that returns a text response.

- The secret used in the JWT middleware should be kept secure and not exposed.

- [Hono JWT Documentation](https://hono.bayrell.org/docs/en/jwt)

- Protecting routes or endpoints that require authentication.
- Retrieving and using JWT payload data.

**Reasoning:** This rule is important as it demonstrates how to use JWT (JSON Web Tokens) for authentication in Hono. It shows how to import the necessary modules, define the JWT variables, apply the JWT middleware to specific routes, and how to retrieve the JWT payload.

*Source: docs/middleware/builtin/jwt.md*

### Using JWT for Authentication in Hono

This code snippet demonstrates how to use JWT (JSON Web Tokens) for authentication in Hono.

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload) // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
})
js
app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})
```

- [Hono Documentation](https://hono.bayrell.org/en/)
- [JWT](https://jwt.io/)

- Protecting routes that require authentication
- Extracting user information from JWTs

#### Code Snippet

```typescript

### How it works

1. A new Hono app is created.
2. A middleware is set up for the route pattern '/auth/*'. This middleware uses the `jwt()` function to check for valid JWTs in the request. The secret used for decoding the JWT is 'it-is-very-secret'.
3. A GET route '/auth/page' is set up. In the route handler, the payload of the JWT is extracted using `c.get('jwtPayload')` and returned as a JSON response.

### Important notes

- The `jwt()` function is just a middleware function. If you want to use an environment variable (eg: `c.env.JWT_SECRET`), you can use it as follows:

```

**Reasoning:** This rule is important as it demonstrates how to use JWT (JSON Web Tokens) for authentication in Hono. It shows how to set up a middleware for a specific route pattern ('/auth/*') to check for valid JWTs, and how to extract the payload from a valid JWT.

*Source: docs/middleware/builtin/jwt.md*

### Using JWT Middleware with Environment Variable for Secret Key in Hono

This code snippet demonstrates how to use the `jwt()` middleware function in Hono with an environment variable for the secret key. This is a common practice to secure sensitive data like the secret key for JWT authentication.

```js
app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})
```

The `jwt()` function is a middleware that is used to authenticate HTTP requests using JSON Web Tokens. In this code snippet, the `jwt()` function is used with an environment variable `c.env.JWT_SECRET` for the secret key. This is done to secure the secret key, as it is sensitive data.

- The `jwt()` function is just a middleware function. It can be used with any route.
- The secret key for the `jwt()` function should be stored securely. In this code snippet, it is stored as an environment variable.

- [Hono Documentation](https://hono.bike/docs)

- Authenticating HTTP requests using JSON Web Tokens.
- Securing sensitive data like the secret key for JWT authentication.

**Reasoning:** This rule is important as it demonstrates how to use the jwt middleware function in Hono with an environment variable for the secret key. This is a common practice to secure sensitive data like the secret key for JWT authentication.

*Source: docs/middleware/builtin/jwt.md*

### Importing and Using jsxRenderer and useRequestContext in Hono

This code demonstrates how to import and use the jsxRenderer and useRequestContext functions from the Hono framework.

```ts
import { Hono } from 'hono'
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
```

1. The jsxRenderer function allows you to render JSX components directly in the c.render() function, without the need for using c.setRenderer().
2. The useRequestContext function enables access to instances of Context within components.

- The jsxRenderer and useRequestContext functions are imported from 'hono/jsx-renderer', not 'hono'.

- [Hono Documentation](https://hono.bayfrontcloud.com/)

- Rendering JSX components in a Hono application.
- Accessing context within components in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to use the jsxRenderer and useRequestContext functions from the Hono framework. The jsxRenderer function allows you to render JSX components directly in the c.render() function, without the need for using c.setRenderer(). The useRequestContext function enables access to instances of Context within components. Understanding this rule is crucial for rendering JSX components and accessing context in a Hono application.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using jsxRenderer in Hono

This rule demonstrates how to use the jsxRenderer in the Hono framework to render JSX components.

```jsx
import { Hono } from 'hono'
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'

const app = new Hono()

app.get(
  '/page/*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <body>
          <header>Menu</header>
          <div>{children}</div>
        </body>
      </html>
    )
  })
)

app.get('/page/about', (c) => {
  return c.render(<h1>About me!</h1>)
})
```

1. First, the Hono and jsxRenderer modules are imported.
2. A new Hono application is created.
3. The jsxRenderer is used to define a route handler for '/page/*'. This handler returns a JSX component.
4. Another route handler is defined for '/page/about'. This handler uses the context's render method to return a JSX component.

- The jsxRenderer allows for the use of JSX in Hono, which is not natively supported.
- The 'useRequestContext' function can be used to access the context within components.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Building dynamic web applications with Hono.
- Using JSX to define route handlers in Hono.

**Reasoning:** This rule is important as it demonstrates how to use the jsxRenderer in the Hono framework to render JSX components. It also shows how to use the 'useRequestContext' function to access the context within components. This is crucial for building dynamic web applications with Hono.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using the 'docType' option in jsxRenderer

This code snippet demonstrates how to use the 'docType' option in the jsxRenderer function of the Hono framework.

```tsx
app.use(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>{children}</body>
        </html>
      )
    },
    { docType: false }
  )
)
```

In this example, the 'docType' option is set to 'false', which means that a DOCTYPE will not be added at the beginning of the HTML.

The jsxRenderer function takes two arguments: a render function and an options object. The render function is used to generate the HTML content, and the options object can be used to control various aspects of the rendering process, including the document type declaration.

- The 'docType' option can be set to 'false' to prevent a DOCTYPE from being added, or it can be set to a string to specify a particular DOCTYPE.

- [Hono documentation](https://hono.bokuweb.me/)

- When you want to control the document type declaration for the rendered HTML.

**Reasoning:** This rule is important as it demonstrates how to use the 'docType' option in the jsxRenderer function of the Hono framework. This option allows developers to control whether a DOCTYPE is added at the beginning of the HTML or not, and if so, what type of DOCTYPE to add. This can be useful in cases where the developer wants to control the document type declaration for the rendered HTML.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using 'stream' option in jsxRenderer for Streaming Responses in Hono

This rule demonstrates how to use the 'stream' option in the jsxRenderer function in Hono framework to render a streaming response. It also shows how to create an asynchronous component and how to use the Suspense component for fallback UI during loading.

```tsx
const AsyncComponent = async () => {
  await new Promise((r) => setTimeout(r, 1000)) // sleep 1s
  return <div>Hi!</div>
}

app.get(
  '*',
  jsxRenderer(
    ({ children }) => {
      return (
        <html>
          <body>
            <h1>SSR Streaming</h1>
            {children}
          </body>
        </html>
      )
    },
    { stream: true }
  )
)

app.get('/', (c) => {
  return c.render(
    <Suspense fallback={<div>loading...</div>}>
      <AsyncComponent />
    </Suspense>
  )
})
ts
{
  'Transfer-Encoding': 'chunked',
  'Content-Type': 'text/html; charset=UTF-8',
  'Content-Encoding': 'Identity'
}
```

- [Hono jsxRenderer documentation](https://hono.bayfront.cloud/Reference/Server/builtin/jsx-renderer)

- When you want to render a streaming response in your Hono application.
- When you want to provide a fallback UI while an asynchronous component is loading.

#### Code Snippet

```typescript

### How it works:

1. An asynchronous component 'AsyncComponent' is created which returns a div element after a delay of 1 second.
2. The jsxRenderer function is used with the 'stream' option set to true to render a streaming response.
3. The Suspense component is used to provide a fallback UI (loading...) while the AsyncComponent is loading.

### Important notes:

When the 'stream' option is set to true, the following headers are added:

```

**Reasoning:** This rule is important as it demonstrates how to use the 'stream' option in the jsxRenderer function in Hono framework to render a streaming response. It also shows how to create an asynchronous component and how to use the Suspense component for fallback UI during loading.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Rendering JSX, Setting Headers and Using Nested Layouts in Hono

In Hono, you can render JSX components using the `render` method. If you have components that might take some time to render, you can use the `Suspense` component to display a fallback content until the component is ready. Here is an example:

```ts
app.get('/', (c) => {
  return c.render(
    <Suspense fallback={<div>loading...</div>}>
      <AsyncComponent />
    </Suspense>
  )
})
ts
{
  'Transfer-Encoding': 'chunked',
  'Content-Type': 'text/html; charset=UTF-8',
  'Content-Encoding': 'Identity'
}
tsx
app.use(
  jsxRenderer(({ children }) => {
    re
```

- [Hono Documentation](https://hono.bayfront.cloud/)

- Rendering JSX components in Hono
- Setting headers for the response
- Using nested layouts in Hono

#### Code Snippet

```typescript

When rendering the JSX, Hono can also set certain headers for the response. By default, if `true` is set, the following headers are added:

```

**Reasoning:** This rule is important as it demonstrates how to render JSX components in Hono using the Suspense and AsyncComponent. It also shows how to set headers for the response and how to use the Layout component for nested layouts. Understanding this rule is crucial for managing asynchronous operations and improving the user experience during data fetching or code splitting, as well as for structuring the application layout in a nested manner.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Creating Nested Layouts with jsxRenderer in Hono

This rule demonstrates how to use the jsxRenderer in Hono to create nested layouts. The jsxRenderer is a middleware that allows you to use JSX syntax in your Hono applications.

Here is the code snippet:

```tsx
app.use(
  jsxRenderer(({ children }) => {
    return (
      <html>
        <body>{children}</body>
      </html>
    )
  })
)

const blog = new Hono()
blog.use(
  jsxRenderer(({ children, Layout }) => {
    return (
      <Layout>
        <nav>Blog Menu</nav>
        <div>{children}</div>
      </Layout>
    )
  })
)

app.route('/blog', blog)
```

In this snippet, the jsxRenderer is used to create a layout for the application. The children prop is used to render the nested components inside the layout. The Layout component is used to wrap the nested components, creating a nested structure.

Important notes:

- The jsxRenderer is a middleware, so it should be used with the app.use() method.
- The children and Layout props are standard in React and JSX-based frameworks, and they are used to create nested structures.

Common use cases:

- Creating complex UI structures in a modular and reusable way.
- Using JSX syntax in Hono applications.

**Reasoning:** This rule is important as it demonstrates how to use the jsxRenderer in Hono for creating nested layouts. It shows how to use the children and Layout props to create a nested structure of components, which is a common pattern in React and JSX-based frameworks. This pattern is useful for creating complex UI structures in a modular and reusable way.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using `useRequestContext()` in Hono to Access Request Context within JSX Components

The `useRequestContext()` function in Hono allows you to access the request context within a JSX component. This is useful when you need to display or use request-specific data within your components.

Here is a code snippet demonstrating its usage:

```tsx
import { useRequestContext, jsxRenderer } from 'hono/jsx-renderer'

const app = new Hono()
app.use(jsxRenderer())

const RequestUrlBadge: FC = () => {
  const c = useRequestContext()
  return <b>{c.req.url}</b>
}

app.get('/page/info', (c) => {
  return c.render(
    <div>
      You are accessing: <RequestUrlBadge />
    </div>
  )
})
```

In this example, `useRequestContext()` is used within the `RequestUrlBadge` component to access the request URL. This URL is then displayed within a bold (`<b>`) HTML element.

Note: You can't use `useRequestContext()` with the Deno's `precompile` JSX option. Use the `react-jsx` instead.

Common use cases for this function include displaying the request URL, path, headers, or other request-specific data within your components.

**Reasoning:** This rule is important as it demonstrates how to use the `useRequestContext()` function in Hono to access the request context within a JSX component. This is useful when you need to display or use request-specific data within your components.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Setting Up JSX Configuration in Hono Framework

In Hono framework, the JSX configuration is set in the compiler options. It is important to use 'react-jsx' instead of 'precompile' for JSX. This is because 'useRequestContext()' cannot be used with Deno's 'precompile' JSX option.

Here is the correct configuration:

```json
"compilerOptions": {
     "jsx": "react-jsx",
     "jsxImportSource": "hono/jsx"
   }
 }
```

The 'jsx' option in the compiler options is set to 'react-jsx'. This allows the use of 'useRequestContext()' in Hono.

The 'jsxImportSource' option is set to 'hono/jsx'. This specifies the module to be used as the source of JSX-related functions.

- 'useRequestContext()' cannot be used with Deno's 'precompile' JSX option.
- Always use 'react-jsx' for JSX in Hono.

- [Hono Documentation](https://hono.bayfront.io/)

- Setting up JSX configuration in Hono framework.

**Reasoning:** This rule is important as it demonstrates the correct JSX configuration for Hono framework. It shows how to set up the compiler options to use 'react-jsx' instead of 'precompile' for JSX. This is crucial because 'useRequestContext()' cannot be used with Deno's 'precompile' JSX option.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using ContextRenderer to Pass Additional Content to the Renderer in Hono

This rule demonstrates how to use the `ContextRenderer` interface in Hono to pass additional content to the renderer. This is particularly useful when you want to modify the contents of the head tag depending on the page.

Here is the code snippet:

```tsx
declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: { title: string }
    ): Response
  }
}

const app = new Hono()

app.get(
  '/page/*',
  jsxRenderer(({ children, title }) => {
    return (
      <html>
        <head>
          <title>{title}</title>
        </head>
        <body>
          <header>Menu</header>
          <div>{children}</div>
        </body>
      </html>
    )
  })
)

app.get('/page/favorites', (c) => {
  return c.render(
    <div>
      <ul>
        <li>Eating sushi</li>
        <li>Watching baseball games</li>
      </ul>
    </div>,
    {
      title: 'My favorites',
    }
  )
})
```

1. The `ContextRenderer` interface is declared with a function that takes a content (which can be a string or a Promise that resolves to a string) and a props object with a title property.
2. The `jsxRenderer` function is used in the `app.get` method to return a JSX element.
3. The `render` method is used in another `app.get` method to render a JSX element with specific properties.

- The `ContextRenderer` interface allows you to pass additional content to the renderer, which can be useful for modifying the contents of the head tag depending on the page.
- The `jsxRenderer` function and the `render` method are used to render JSX elements.

- [Hono Documentation](https://hono.bayfront.io/)

- Modifying the contents of the head tag depending on the page
- Rendering JSX elements with specific properties

**Reasoning:** This rule is important as it demonstrates how to use the ContextRenderer interface in Hono to pass additional content to the renderer. This is particularly useful when you want to modify the contents of the head tag depending on the page. The rule also shows how to use the jsxRenderer function to return a JSX element and how to use the render method to render a JSX element with specific properties.

*Source: docs/middleware/builtin/jsx-renderer.md*

### Using Pretty JSON Middleware in Hono

Pretty JSON middleware in Hono enables '_JSON pretty print_' for JSON response body. By simply adding `?pretty` to the URL query param, the JSON strings are prettified.

Here is an example:

```js
// GET /
{"project":{"name":"Hono","repository":"https://github.com/honojs/hono"}}
js
// GET /?pretty
{
  "project": {
    "name": "Hono",
    "repository": "https://github.com/honojs/hono"
  }
}
```

The Pretty JSON middleware intercepts the JSON response and formats it in a more readable way if the `?pretty` query parameter is present in the URL.

- The Pretty JSON middleware should be used judiciously as it adds overhead to the response time, especially for large JSON objects.

- [Hono Documentation](https://github.com/honojs/hono)

- Debugging: The Pretty JSON middleware can be very useful during development and debugging when you need to inspect the JSON response.
- API Documentation: It can also be used in API documentation to present the JSON response in a more readable way.

#### Code Snippet

```typescript

When the `?pretty` query parameter is added to the URL, the JSON response will be prettified:

```

**Reasoning:** This rule is important as it demonstrates how to use the Pretty JSON middleware in Hono to enable JSON pretty print for JSON response body. This is useful for improving the readability of JSON responses, especially when dealing with large and complex JSON objects.

*Source: docs/middleware/builtin/pretty-json.md*

### Prettifying JSON Responses in Hono

In Hono, you can use the 'prettyJSON' function to format JSON responses. This can be done by adding '?pretty' to the URL query parameter. The JSON strings will then be formatted in a more readable way.

Here is an example of how to use it:

```ts
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.use(prettyJSON()) // With options: prettyJSON({ space: 4 })
js
// GET /?pretty
{
  "project": {
    "name": "Hono",
    "repository": "https://github.com/honojs/hono"
  }
}
```

This feature can be particularly useful during debugging or when presenting data to end users.

- The 'prettyJSON' function is part of the 'hono/pretty-json' package, so make sure to import it before using it.
- You can customize the amount of space used for indentation by passing an object with a 'space' property to the 'prettyJSON' function. The default value is 2.

- [Hono Documentation](https://honojs.com/docs)

- Debugging: Prettifying JSON can make it easier to spot errors or inconsistencies in the data.
- User interface: If you're presenting JSON data directly to the end user, prettifying it can make it more readable and user-friendly.

#### Code Snippet

```typescript

And here is an example of the result:

```

**Reasoning:** This rule is important as it demonstrates how to use the 'prettyJSON' function in Hono to format JSON responses for better readability. By adding '?pretty' to the URL query parameter, the JSON strings are formatted in a more readable way, which can be particularly useful during debugging or when presenting data to end users.

*Source: docs/middleware/builtin/pretty-json.md*

### Using prettyJSON Middleware in Hono

This code snippet demonstrates how to use the 'prettyJSON' middleware in Hono to format JSON responses.

```ts
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.use(prettyJSON()) // With options: prettyJSON({ space: 4 })
app.get('/', (c) => {
  return c.json({ message: 'Hono!' })
})
```

1. Import the 'Hono' and 'prettyJSON' modules from the 'hono' package.
2. Create a new Hono application.
3. Use the 'prettyJSON' middleware in the Hono application. You can optionally pass an options object to the 'prettyJSON' function to customize the formatting. For example, 'prettyJSON({ space: 4 })' will use 4 spaces for indentation.
4. Define a GET route that returns a JSON response.

- The 'prettyJSON' middleware should be used before defining the routes that return JSON responses.

- [Hono Documentation](https://github.com/honojs/hono)

- Improving the readability of JSON responses during development and debugging.

**Reasoning:** This rule is important as it demonstrates how to use the 'prettyJSON' middleware in Hono to format JSON responses. This is useful for improving the readability of JSON responses, especially during development and debugging.

*Source: docs/middleware/builtin/pretty-json.md*

### Using Request ID Middleware in Hono

This code demonstrates how to import and use the Request ID Middleware in Hono. The Request ID Middleware generates a unique ID for each request, which can be used in handlers and middleware.

```ts
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
```

After importing, you can use the Request ID Middleware in your Hono application. You can access the Request ID through the `requestId` variable in the handlers and middleware to which the Request ID Middleware is applied.

This feature is useful for tracking requests and debugging. It can also be used to log request data, correlate logs for specific requests, and more.

- [Hono Documentation](https://hono.bosch.io/docs/)

- Tracking requests
- Debugging
- Logging request data
- Correlating logs for specific requests

**Reasoning:** This rule is important as it demonstrates how to import and use the Request ID Middleware in Hono. The Request ID Middleware generates a unique ID for each request, which can be used in handlers and middleware. This is useful for tracking requests and debugging.

*Source: docs/middleware/builtin/request-id.md*

### Using RequestIdVariables for Type Safety in Hono

This code snippet demonstrates how to use the 'RequestIdVariables' type in Hono to explicitly specify the type of variables. This is crucial for type safety and ensuring that the correct data types are used throughout the application.

```ts
import type { RequestIdVariables } from 'hono/request-id'

const app = new Hono<{
  Variables: RequestIdVariables
}>()
```

1. The 'RequestIdVariables' type is imported from 'hono/request-id'.
2. A new Hono application is set up, with the 'Variables' type explicitly set to 'RequestIdVariables'.

- This is a good practice for ensuring type safety in your Hono application.

- [Hono Documentation](https://hono.bevry.me/)

- When setting up a new Hono application and you want to ensure type safety.

**Reasoning:** This rule is important as it demonstrates how to use the 'RequestIdVariables' type in Hono to explicitly specify the type of variables. It also shows how to set up a new Hono application with these variables. This is crucial for type safety and ensuring that the correct data types are used throughout the application.

*Source: docs/middleware/builtin/request-id.md*

### Using Bearer Authentication in Hono

This code demonstrates how to use bearer authentication in Hono. Bearer authentication is a common method used in APIs to authenticate HTTP requests.

```sh
curl -H 'Authorization: Bearer honoiscool' http://localhost:8787/auth/page
```

In this example, 'honoiscool' is the bearer token. This token is added in the 'Authorization' header of the HTTP request.

The HTTP client adds the 'Authorization' header with 'Bearer {token}' as the header value in the request. The server then verifies this token to authenticate the request.

Your `token` must match the regex `/[A-Za-z0-9._~+/-]+=*/`, otherwise a 400 error will be returned.

- [Hono Documentation](https://www.eclipse.org/hono/docs/)

This method is commonly used when you want to authenticate HTTP requests in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to use bearer authentication in Hono. Bearer authentication is a common method used in APIs to authenticate HTTP requests. The rule shows how to add the 'Authorization' header with 'Bearer {token}' as the header value in the request.

*Source: docs/middleware/builtin/bearer-auth.md*

### Importing and Using Bearer Authentication in Hono

This code snippet demonstrates how to import and use the 'bearerAuth' module from the Hono framework for handling Bearer token authentication.

```ts
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
```

1. The 'Hono' object is imported from the 'hono' package. This is the main object that is used to interact with the Hono framework.
2. The 'bearerAuth' module is imported from 'hono/bearer-auth'. This module provides functionality for handling Bearer token authentication.

Your `token` must match the regex `/[A-Za-z0-9._~+/-]+=*/`, otherwise a 400 error will be returned. Notably, this regex accommodates both URL-safe Base64 and standard Base64.

- Hono Documentation: [https://hono.bjss.com/docs](https://hono.bjss.com/docs)

- Securing endpoints with Bearer token authentication.
- Validating Bearer tokens in requests.

**Reasoning:** This rule is important as it demonstrates how to import and use the 'bearerAuth' module from the Hono framework for handling Bearer token authentication. It is a common practice in web development to secure endpoints using Bearer token authentication, and this rule provides a clear example of how to implement this in Hono.

*Source: docs/middleware/builtin/bearer-auth.md*

### Bearer Token Authentication in Hono

This code snippet demonstrates how to implement bearer token authentication in Hono. It shows how to restrict access to specific routes and methods using a bearer token.

```ts
const app = new Hono()

const token = 'honoiscool'

app.use('/api/*', bearerAuth({ token }))

app.get('/api/page', (c) => {
  return c.json({ message: 'You are authorized' })
})
```

1. A new Hono application is created.
2. A bearer token is defined.
3. The `app.use` method is used to apply the `bearerAuth` middleware to all routes starting with '/api/'. This middleware checks if the request contains the correct bearer token.
4. If the request contains the correct bearer token, the user is authorized and can access the '/api/page' route.

- The `bearerAuth` middleware does not require the bearer token to be a JWT, just that it matches the above regex.
- This code snippet does not handle the case where the request does not contain a bearer token or contains an incorrect bearer token. In a real application, you would need to handle these cases and return appropriate error responses.

- [Hono Documentation](https://hono.bike/)

- Restricting access to certain routes in your application.
- Implementing token-based authentication.

**Reasoning:** This rule is important as it demonstrates how to implement bearer token authentication in Hono. It shows how to restrict access to specific routes and methods using a bearer token. This is crucial for securing your application and ensuring that only authorized users can access certain parts of your application.

*Source: docs/middleware/builtin/bearer-auth.md*

### Implementing Bearer Token Authentication in Hono

This code snippet demonstrates how to implement bearer token authentication in Hono. It shows how to restrict access to specific routes and methods using a token, and how to implement multiple tokens for different levels of access.

```ts
const app = new Hono()

const token = 'honoiscool'

app.get('/api/page', (c) => {
  return c.json({ message: 'Read posts' })
})

app.post('/api/page', bearerAuth({ token }), (c) => {
  return c.json({ message: 'Created post!' }, 201)
})
```

The `bearerAuth` middleware is used to restrict access to the POST route. It checks if the request includes the correct bearer token in the Authorization header. If the token is correct, the request is allowed to proceed. If not, the request is rejected.

- The `bearerAuth` middleware should be used on any routes that require authentication.
- The token should be kept secret and secure.

- [Hono Documentation](https://hono.bayrell.org/en/)

- Restricting access to certain routes or methods to authenticated users.
- Implementing different levels of access using multiple tokens.

**Reasoning:** This rule is important as it demonstrates how to implement bearer token authentication in Hono. It shows how to restrict access to specific routes and methods using a token, and how to implement multiple tokens for different levels of access.

*Source: docs/middleware/builtin/bearer-auth.md*

### Implementing Multiple Tokens for Different Access Levels in Hono

This code snippet demonstrates how to implement multiple tokens for different levels of access in Hono. It shows how to restrict certain HTTP methods to a privileged token, while allowing read access to any valid token.

```ts
const app = new Hono()

const readToken = 'read'
const privilegedToken = 'read+write'
const privilegedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

app.on('GET', '/api/page/*', async (c, next) => {
  // List of valid tokens
  const bearer = bearerAuth({ token: [readToken, privilegedToken] })
  return bearer(c, next)
})
app.on(privilegedMethods, '/api/page/*', async (c, next) => {
  // Single valid privileged token
  const bearer = bearerAuth({ token: privilegedToken })
  return bearer(c, next)
})

// Define handlers for GET, POST, etc.
```

The `app.on` method is used to define handlers for different HTTP methods and paths. The `bearerAuth` function is used to authenticate the request using the provided tokens.

- The `bearerAuth` function takes an object with a `token` property, which can be a single token or an array of tokens.
- The `privilegedMethods` array contains the HTTP methods that require the privileged token.

- [Hono Documentation](https://hono.bevry.me/)

- Implementing different levels of access in a web application
- Restricting certain actions to privileged users

**Reasoning:** This rule is important as it demonstrates how to implement multiple tokens for different levels of access in Hono. It shows how to restrict certain HTTP methods to a privileged token, while allowing read access to any valid token. This is crucial for maintaining security and access control in web applications.

*Source: docs/middleware/builtin/bearer-auth.md*

### Using Bearer Token Authentication in Hono

This code snippet demonstrates how to use the `bearerAuth` middleware in Hono to authenticate requests using bearer tokens. It also shows how to define a custom token verification function.

```ts
const app = new Hono()

app.use(
  '/auth-verify-token/*',
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === 'dynamic-token'
    },
  })
)
```

In this example, the `verifyToken` function checks if the provided token equals the string 'dynamic-token'. If it does, the function returns `true`, indicating that the token is valid.

The `bearerAuth` middleware intercepts incoming requests and checks the Authorization header for a bearer token. If a token is found, it is passed to the `verifyToken` function for validation.

- The `verifyToken` function should return a boolean indicating whether the token is valid or not.

- [Hono Documentation](https://hono.bevry.me/)

- Protecting routes or endpoints that require authentication.
- Implementing custom logic for token validation.

**Reasoning:** This rule is important as it demonstrates how to use the bearerAuth middleware in Hono to authenticate requests using bearer tokens. It shows how to define a custom token verification function, which is useful when you need to implement custom logic for token validation, such as checking the token against a dynamic value or a database.

*Source: docs/middleware/builtin/bearer-auth.md*

### Importing and Using Combine Functions in Hono

In Hono, the `combine` module provides three functions that control the execution of middleware: `some`, `every`, and `except`.

```ts
import { Hono } from 'hono'
import { some, every, except } from 'hono/combine'
```

- `some` runs only one of the given middleware.
- `every` runs all given middleware.
- `except` runs all given middleware only if a condition is not met.

These functions are used to create complex access control rules and other logic in your Hono application.

- [Hono Documentation](https://hono.bevry.me/)

- Restricting access to certain routes based on user roles or permissions.
- Running specific middleware only under certain conditions.

**Reasoning:** This rule is important as it demonstrates how to import and use the combine functions from the Hono web framework. These functions are used to control the execution of middleware in the application, allowing for more complex logic and control flow.

*Source: docs/middleware/builtin/combine.md*

### Using Combine Middleware in Hono for Complex Access Control Rules

This code snippet demonstrates how to use the 'combine' middleware in Hono to create complex access control rules. It shows the usage of 'some' and 'every' functions to combine different middleware functions.

```ts
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { getConnInfo } from 'hono/cloudflare-workers'
import { every, some } from 'hono/combine'
import { ipRestriction } from 'hono/ip-restriction'
import { rateLimit } from '@/my-rate-limit'

const app = new Hono()

app.use(
  '*',
  some(
    every(
      ipRestriction(getConnInfo, { allowList: ['192.168.0.2'] }),
      bearerAuth({ token })
    ),
    // If both conditions are met, rateLimit will not execute.
    rateLimit()
  )
)

app.get('/', (c) => c.text('Hello Hono!'))
```

In this code:
- 'some' function runs the first middleware that returns true. Middleware is applied in order, and if any middleware exits successfully, subsequent middleware will not run.
- 'every' function runs all middleware and requires all to return true.

This pattern is useful when you want to apply multiple conditions for a route and want either all or some of them to be met.

**Reasoning:** This rule is important as it demonstrates how to use the 'combine' middleware in Hono to create complex access control rules. It shows how to use the 'some' and 'every' functions to combine different middleware functions and create a rule that requires either all or some conditions to be met.

*Source: docs/middleware/builtin/combine.md*

### Controlling Middleware Execution with 'some' in Hono

This code demonstrates how to use the 'some' function from Hono's 'combine' module to control the execution of middleware in a Hono application. The 'some' function runs the first middleware that returns true, and if any middleware exits successfully, subsequent middleware will not run.

```ts
import { some } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'
import { myRateLimit } from '@/rate-limit'

// If client has a valid token, skip rate limiting.
// Otherwise, apply rate limiting.
app.use(
  '/api/*',
  some(bearerAuth({ token }), myRateLimit({ limit: 100 }))
)
```

In this example, if the 'bearerAuth' middleware function returns true (indicating that the client has a valid token), the 'myRateLimit' middleware function will not run, effectively skipping rate limiting for clients with a valid token.

- The order of middleware functions passed to 'some' matters, as they are applied in order.
- The 'some' function is part of Hono's 'combine' module, which provides functions for controlling middleware execution.

- [Hono Documentation](https://hono.bjacobel.com/docs)

- Conditionally applying middleware based on the result of a previous middleware function.
- Skipping certain middleware functions for specific requests or clients.

**Reasoning:** This rule is important as it demonstrates how to use the 'some' function from Hono's 'combine' module to control the execution of middleware in a Hono application. It shows how to conditionally apply middleware based on the result of a previous middleware function, in this case, skipping rate limiting if the client has a valid token.

*Source: docs/middleware/builtin/combine.md*

### Controlling Middleware Execution with 'some' and 'every' in Hono

This code snippet demonstrates how to use the 'some' and 'every' functions from Hono's 'combine' module to control the execution of middleware.

```ts
import { some, every } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'
import { myCheckLocalNetwork } from '@/check-local-network'
import { myRateLimit } from '@/rate-limit'

// If client is in local network, skip authentication and rate limiting.
// Otherwise, apply authentication and rate limiting.
app.use(
  '/api/*',
  some(
    myCheckLocalNetwork(),
    every(bearerAuth({ token }), myRateLimit({ limit: 100 }))
  )
)
```

The 'some' function runs the provided middleware until one of them does not throw an error. In this case, it first checks if the client is in the local network. If it is, the 'every' function is not executed.

The 'every' function runs all the provided middleware in order and stops if any of them throw an error. In this case, it applies the 'bearerAuth' and 'myRateLimit' middleware.

- The order of middleware in the 'every' function matters. If the 'bearerAuth' middleware throws an error, the 'myRateLimit' middleware will not run.

- [Hono documentation](https://hono.bjss.com/docs)

- Conditionally applying middleware based on the result of a check function
- Controlling the order and execution of middleware

**Reasoning:** This rule is important as it demonstrates how to use the 'some' and 'every' functions from Hono's 'combine' module to control the execution of middleware. It shows how to conditionally apply middleware based on the result of a check function. This is useful for applying different middleware under different conditions, improving the flexibility and control of the application.

*Source: docs/middleware/builtin/combine.md*

### Excluding Routes from Middleware Application in Hono

This code snippet demonstrates how to use the 'except' function from Hono's 'combine' module to exclude certain routes from middleware application. In this case, it's used to bypass authentication for public API routes.

```ts
import { except } from 'hono/combine'
import { bearerAuth } from 'hono/bearer-auth'

// If client is accessing public API, skip authentication.
// Otherwise, require a valid token.
app.use('/api/*', except('/api/public/*', bearerAuth({ token })))
```

The 'except' function takes two arguments: a condition and a middleware function. If the condition is met (in this case, if the route matches '/api/public/*'), the middleware function is not applied. This allows for selective application of middleware based on the route.

- The condition can be a string or a function.
- If multiple targets need to be matched, pass them as an array.

- [Hono documentation](https://hono.bouzuya.net/)

- Bypassing authentication for public API routes
- Applying specific middleware only to certain routes

**Reasoning:** This rule is important as it demonstrates how to use the 'except' function from Hono's 'combine' module to exclude certain routes from middleware application. In this case, it's used to bypass authentication for public API routes. This is a common use case in web development where certain routes are public and do not require authentication, while others do.

*Source: docs/middleware/builtin/combine.md*

### Implementing CORS in Hono using Middleware

This code snippet demonstrates how to implement Cross-Origin Resource Sharing (CORS) in Hono using middleware.

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS should be called before the route
app.use('/api/*', cors())
app.use(
  '/api2/*',
  cors({
    origin: 'http://example.com',
    allowHeaders: ['X-Custom-Header']
  })
)
```

1. Import the necessary modules from Hono.
2. Create a new Hono application.
3. Use the `app.use()` function to apply the CORS middleware to specific routes.

- The CORS middleware should be called before defining the route.
- You can customize the CORS configuration by passing an options object to the `cors()` function.

- [Hono Documentation](https://hono.beyondco.de/)

- Building APIs that need to be accessed from different origins.
- Implementing web security measures in your Hono application.

**Reasoning:** This rule is important as it demonstrates how to implement Cross-Origin Resource Sharing (CORS) in Hono using middleware. CORS is a mechanism that allows many resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from another domain outside the domain from which the resource originated. It's a crucial aspect of web security and is necessary when building APIs that are accessed from different origins.

*Source: docs/middleware/builtin/cors.md*

### Implementing CORS in Hono

This code snippet demonstrates how to implement Cross-Origin Resource Sharing (CORS) in Hono using middleware.

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS should be called before the route
app.use('/api/*', cors())
app.use(
  '/api2/*',
  cors({
    origin: 'http://example.com',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
)

app.all('/api/abc', (c) => {
  return c.json({ success: true })
})
app.all('/api2/abc', (c) => {
  return c.json({ success: true })
})
```

The `cors()` function is used as middleware in the application. It should be called before the route that needs to implement CORS. The function takes an optional configuration object where you can specify the origin, allowed headers, allowed methods, exposed headers, max age for the preflight request, and whether credentials are included in the requests.

- The `cors()` function should be called before the route.
- The configuration object passed to the `cors()` function is optional.

- [Hono Documentation](https://hono.beyondx.io/docs)

- Implementing CORS in APIs that are accessed from different origins.

**Reasoning:** This rule is important as it demonstrates how to implement Cross-Origin Resource Sharing (CORS) in Hono using middleware. CORS is a mechanism that allows many resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from another domain outside the domain from which the resource originated. It's a crucial aspect of web security and is necessary when building APIs that are accessed from different origins.

*Source: docs/middleware/builtin/cors.md*

### Setting Up CORS in Hono

This code snippet demonstrates how to set up Cross-Origin Resource Sharing (CORS) in Hono.

```ts
app.use(
  '/api3/*',
  cors({
    origin: ['https://example.com', 'https://example.com'],
  })
)

// Or you can use "function"
app.use(
  '/api4/*',
  cors({
    // `c` is a `Context` object
    origin: (origin, c) => {
      return origin.endsWith('.example.com')
        ? origin
        : 'http://example.com'
    },
  })
)
```

The `app.use` function is used to set up middleware functions in Hono. In this case, it's being used to set up CORS. The `cors` function takes an options object, which can include an `origin` property. This property can be a string, an array of strings, or a function that returns a string. The value(s) represent the domain(s) that are allowed to access the server's resources.

- The `origin` function receives two arguments: the origin of the request and the context object. You can use this function to dynamically determine the allowed origin.

- [Hono Documentation](https://hono.bayrell.org/en/latest/)

- Allowing specific trusted domains to access your server's resources.
- Dynamically determining the allowed origin based on the request.

**Reasoning:** This rule is important as it demonstrates how to set up Cross-Origin Resource Sharing (CORS) in Hono. CORS is a mechanism that allows many resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from another domain outside the domain from which the resource originated. It's a crucial aspect of web security and is essential for any server serving resources to clients on different domains.

*Source: docs/middleware/builtin/cors.md*

### Using CORS Middleware in Hono

This code snippet demonstrates how to use CORS middleware in Hono framework. CORS (Cross-Origin Resource Sharing) is a mechanism that allows many resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from another domain outside the domain from which the resource originated.

```ts
app.use('*', async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.env.CORS_ORIGIN,
  })
  return corsMiddlewareHandler(c, next)
})
```

The `app.use` function is used to apply the CORS middleware to every route (`*`). The middleware is configured with an origin that is retrieved from the environment variables (`c.env.CORS_ORIGIN`). This allows for flexibility as the origin can be easily changed depending on the environment the application is running in.

- The CORS middleware should be applied before any other middleware that needs to be protected.
- The origin should be a trusted domain to prevent potential security risks.

- [CORS on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

- Protecting routes that serve sensitive data.
- Allowing cross-origin requests in development environment.

**Reasoning:** This rule is important as it demonstrates how to use CORS middleware in Hono framework. CORS (Cross-Origin Resource Sharing) is a mechanism that allows many resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from another domain outside the domain from which the resource originated. It's a crucial aspect of web security and should be properly implemented in any web application.

*Source: docs/middleware/builtin/cors.md*

### Using CSRF Protection Middleware in Hono

This code demonstrates how to use the CSRF protection middleware in Hono.

```ts
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'

const app = new Hono()

app.use(csrf())

// Specifying origins with using `origin` option
// string
app.use(csrf({ origin: 'myapp.example.com' }))

// string[]
app.use(
  csrf({
```

1. Import the 'Hono' and 'csrf' modules.
2. Create a new Hono application.
3. Use the 'csrf' middleware in the application.
4. Specify the origins using the 'origin' option if necessary.

- In environments where browsers do not send 'Origin' headers, or environments that use reverse proxies to remove 'Origin' headers, use the 'origin' option to specify the origins.

- [Hono CSRF Middleware](https://hono.beyondco.de/middleware/csrf.html)

- Protecting your Hono application from CSRF attacks.
- Specifying origins in environments where 'Origin' headers are not sent or removed.

**Reasoning:** This rule is important as it demonstrates how to use the CSRF protection middleware in the Hono framework. CSRF (Cross-Site Request Forgery) is a type of attack that tricks the victim into submitting a malicious request. It uses the identity and privileges of the victim to perform an undesired function on their behalf. In Hono, CSRF protection can be added to the application by using the 'csrf' middleware. This rule also shows how to specify origins using the 'origin' option, which is useful in environments where browsers do not send 'Origin' headers, or environments that use reverse proxies to remove 'Origin' headers.

*Source: docs/middleware/builtin/csrf.md*

### Using CSRF Protection in Hono

In Hono, you can use CSRF protection middleware to protect your application from Cross-Site Request Forgery attacks. Here is how you can do it:

```ts
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'

const app = new Hono()

app.use(csrf())

// Specifying origins with using `origin` option
// string
app.use(csrf({ origin: 'myapp.example.com' }))

// string[]
app.use(
  csrf({
    origin: ['myapp.example.com', 'development.myapp.example.com'],
  })
)

// Function
// It is strongly recommended that the protocol be verified to ensure a match to `$`.
// You should *never* do a forward match.
app.use(
  '*',
  csrf({
    origin: (origin) =>
      /https://(\w+.)?myapp.example.com$/.test(origin),
  })
)
```

The `csrf()` function is a middleware that adds CSRF protection to your application. You can specify the origins that are allowed to make requests to your application using the `origin` option. The `origin` option can be a string, an array of strings, or a function that returns a boolean.

- It is strongly recommended to verify the protocol in the function form of the `origin` option to ensure a match to `$`. You should never do a forward match.

- [Hono CSRF middleware](https://hono.com/docs/csrf)

- Protecting your application from CSRF attacks
- Restricting the origins that can make requests to your application

**Reasoning:** This rule is important as it demonstrates how to use CSRF protection in Hono framework. CSRF (Cross-Site Request Forgery) is a type of attack that tricks the victim into submitting a malicious request. It uses the identity and privileges of the victim to perform an undesired function on their behalf. The rule shows how to import and use the CSRF middleware, and how to specify origins using the `origin` option in different ways: as a string, as an array of strings, or as a function.

*Source: docs/middleware/builtin/csrf.md*

### Using 'jwk' Middleware for Authentication in Hono

This code demonstrates how to import and use the 'jwk' middleware in Hono for handling JSON Web Key Set (JWKS) for authentication.

```ts
import { Hono } from 'hono'
import { jwk } from 'hono/jwk'

const app = new Hono()

app.use(
  '/auth/*',
  jwk({
    jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authenticated')
})
```

1. The 'jwk' middleware is imported from 'hono/jwk'.
2. A new Hono application is created.
3. The 'jwk' middleware is used on all routes starting with '/auth/'. The middleware is configured with the URI of the JWKS.
4. When a GET request is made to '/auth/page', if the request is authenticated, a text response 'You are authenticated' is returned.

- The 'jwk' middleware requires a valid JWKS URI to function correctly.

- [Hono Documentation](https://hono.beyondnlp.com)

- Securing routes in a Hono application with JWT authentication.

**Reasoning:** This rule is important as it demonstrates how to use the 'jwk' middleware in Hono framework to handle JSON Web Key Set (JWKS) for authentication. This is a common practice in securing routes in a Hono application.

*Source: docs/middleware/builtin/jwk.md*

### Using 'jwk' Middleware for Authentication in Hono Framework

This code demonstrates how to use the 'jwk' middleware in the Hono framework for authentication. The 'jwk' middleware is used to validate JSON Web Tokens (JWTs) from a JSON Web Key Set (JWKS) endpoint.

```ts
import { Hono } from 'hono'
import { jwk } from 'hono/jwk'

const app = new Hono()

app.use(
  '/auth/*',
  jwk({
    jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})
```

1. The 'jwk' middleware is imported from 'hono/jwk'.
2. A new Hono application is created.
3. The 'jwk' middleware is used on all routes starting with '/auth'. It validates JWTs using the JWKS endpoint specified.
4. If the JWT is valid, the user is authorized and can access the '/auth/page' route.

- The 'jwk' middleware requires a JWKS endpoint to validate JWTs.
- The JWKS endpoint is usually provided by the authentication server.

- [Hono Documentation](https://hono.bevry.me/)

- Securing routes in a web application with JWT authentication.

**Reasoning:** This rule is important as it demonstrates how to use the 'jwk' middleware in the Hono framework for authentication. The 'jwk' middleware is used to validate JSON Web Tokens (JWTs) from a JSON Web Key Set (JWKS) endpoint. This is a common practice in securing routes in a web application.

*Source: docs/middleware/builtin/jwk.md*

### Using jwk Middleware for Authentication and JWT Payload Extraction in Hono

This code snippet demonstrates how to use the jwk middleware in Hono to authenticate routes and extract JWT payload. The jwk middleware is used to secure the '/auth/*' route. The middleware is configured with the URI of the JSON Web Key Set (JWKS) which contains the public keys used to verify any JSON Web Token (JWT) issued by the authorization server.

```ts
const app = new Hono()

app.use(
  '/auth/*',
  jwk({
    jwks_uri: `https://${backendServer}/.well-known/jwks.json`,
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload) // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
})
```

In the '/auth/page' route handler, the JWT payload is retrieved from the context object using the 'get' method and returned as a JSON response.

- The jwk middleware must be configured with the correct JWKS URI.
- The JWT payload can be retrieved from the context object in the route handler.

- [Hono Documentation](https://hono.bevry.me/)

- Securing routes with JWT authentication.
- Extracting JWT payload for user identification or authorization.

**Reasoning:** This rule is important as it demonstrates how to use the jwk middleware in Hono to authenticate routes and extract JWT payload. It shows how to secure a route and how to retrieve the JWT payload from the context object.

*Source: docs/middleware/builtin/jwk.md*

### Importing and Using Context Storage in Hono

This code snippet demonstrates how to import and use context storage in Hono.

```ts
import { Hono } from 'hono'
import { contextStorage, getContext } from 'hono/context-storage'
```

1. The `Hono` object is imported from the `hono` package.
2. The `contextStorage` and `getContext` functions are imported from `hono/context-storage`.

- The `getContext()` function will return the current Context object if the `contextStorage()` is applied as a middleware.

- [Hono Documentation](https://hono.bespokejs.com)

- Storing and retrieving state across different middleware or routes.

**Reasoning:** This rule is important as it demonstrates how to import and use context storage in Hono. Context storage is a crucial feature in Hono that allows developers to store and retrieve context data across different parts of their application. This is especially useful in scenarios where state needs to be shared across different middleware or routes.

*Source: docs/middleware/builtin/context-storage.md*

### Using contextStorage to Store and Retrieve Data in Hono

The `contextStorage` middleware in Hono allows you to store and retrieve context-specific data. This can be useful when you need to pass data between different parts of your application without directly linking them.

Here is an example of how to use it:

```ts
type Env = {
  Variables: {
    message: string
  }
}

const app = new Hono<Env>()

app.use(contextStorage())

app.use(async (c, next) => {
  c.set('message', 'Hello!')
  await next()
})

// You can access the variable outside the handler.
const getMessage = () => {
  return getContext<Env>().var.message
}

app.get('/', (c) => {
  return c.text(getMessage())
})
```

In this example, we first define an environment type `Env` with a `message` variable. We then create a new Hono application and use the `contextStorage` middleware. In the next middleware, we set the `message` variable in the context to 'Hello!'. Finally, we define a function `getMessage` that retrieves the `message` variable from the context and use it in a route handler.

- The `contextStorage` middleware must be used before any middleware that wants to use the context storage.
- The `getContext` function can be used to retrieve the current context object.

- [Hono documentation](https://hono.bayrell.org/en/)

- Passing data between middleware and route handlers
- Storing request-specific data

**Reasoning:** This rule is important as it demonstrates how to use the contextStorage middleware in Hono to store and retrieve context-specific data. It shows how to set a variable in the context and how to retrieve it later, even outside of the handler. This is useful in scenarios where you need to pass data between different parts of your application without directly linking them.

*Source: docs/middleware/builtin/context-storage.md*

### Accessing Bindings Outside the Handler in Hono

In Hono, you can use context storage to access bindings outside the handler. This is particularly useful in Cloudflare Workers where you may need to access and manipulate bindings such as KV storage.

Here is a code snippet demonstrating this:

```ts
type Env = {
  Bindings: {
    KV: KVNamespace
  }
}

const app = new Hono<Env>()

app.use(contextStorage())

const setKV = (value: string) => {
  return getContext<Env>().env.KV.put('key', value)
}
```

In this code:

1. We define a type `Env` that includes a `Bindings` property with a `KV` property of type `KVNamespace`.
2. We create a new Hono app with the `Env` type.
3. We use the `contextStorage` middleware.
4. We define a `setKV` function that uses `getContext` to access the `KV` binding and put a value.

- `contextStorage` is a middleware provided by Hono that allows you to access the context outside the handler.
- `getContext` is a function provided by Hono that allows you to access the context.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Storing and retrieving data in KV storage in Cloudflare Workers.

**Reasoning:** This rule is important as it demonstrates how to use context storage in Hono to access bindings outside the handler. This is useful in Cloudflare Workers where you may need to access and manipulate bindings such as KV storage.

*Source: docs/middleware/builtin/context-storage.md*

### Importing and Using Cache in Hono

This rule demonstrates how to import and use the cache module from the Hono framework.

```ts
import { Hono } from 'hono'
import { cache } from 'hono/cache'
ts
app.get(
  '*',
  cache({
    cacheName: 'my-app',
    cacheControl: 'max-age=3600',
  })
)
```

In this example, the cache name is 'my-app' and the cache control directive is 'max-age=3600', which means the cached data will be considered fresh for 3600 seconds.

- Deno does not respect headers, so if you need to update the cache, you will need to implement your own mechanism.

- [Hono Documentation](https://hono.bsd.ac/docs)

- Caching responses for frequently accessed routes
- Storing the result of expensive computations to improve performance

#### Code Snippet

```typescript

After importing the necessary modules, you can use the `cache` function in your application routes. The `cache` function takes an object as an argument, where you can specify the cache name and cache control directives.

```

**Reasoning:** This rule is important as it demonstrates how to import and use the cache module from the Hono framework. Caching can significantly improve the performance of an application by storing the result of expensive computations or frequently accessed data. In this context, the rule shows how to set up caching in a Hono application, which is a crucial aspect of optimizing web applications.

*Source: docs/middleware/builtin/cache.md*

### Managing Request Timeouts in Hono

This code demonstrates how to manage request timeouts in a Hono application. It shows how to set a maximum duration for requests and how to use the timeout middleware with both default and custom settings.

```ts
import { Hono } from 'hono'
import { timeout } from 'hono/timeout'

const app = new Hono()

// Applying a 5-second timeout
app.use('/api', timeout(5000))
```

The `timeout` function from 'hono/timeout' is used as a middleware in the Hono application. It is applied to the '/api' route and sets a maximum duration of 5 seconds for any request to this route.

- The timeout value is specified in milliseconds.

- Hono Documentation: [Managing Request Timeouts](https://hono.bespoken.io/docs/managing-request-timeouts/)

- Ensuring that requests to certain routes do not exceed a specified duration to maintain the performance and responsiveness of the application.

**Reasoning:** This rule is important as it demonstrates how to manage request timeouts in a Hono application. It shows how to set a maximum duration for requests and how to use the timeout middleware with both default and custom settings. This is crucial in maintaining the performance and responsiveness of the application.

*Source: docs/middleware/builtin/timeout.md*

### Applying Timeout Middleware in Hono

This code demonstrates how to apply a timeout middleware to a specific route in Hono. This is useful in managing server resources and preventing long-running requests from consuming too much server time.

```ts
const app = new Hono()

// Applying a 5-second timeout
app.use('/api', timeout(5000))

// Handling a route
app.get('/api/data', async (c) => {
  // Your route handler logic
  return c.json({ data: 'Your data here' })
})
```

The `timeout` function from 'hono/timeout' is used as a middleware for the '/api' route. This function will automatically end any request to '/api' that takes longer than 5000 milliseconds (5 seconds) to complete.

- The timeout middleware should be applied before the route handler to ensure it takes effect.

- [Hono Documentation](https://hono.bespokejs.com)

- Applying a timeout to resource-intensive API endpoints to prevent server overload.

**Reasoning:** This rule is important as it demonstrates how to apply a timeout middleware to a specific route in Hono. This is crucial in managing server resources and preventing long-running requests from consuming too much server time.

*Source: docs/middleware/builtin/timeout.md*

### Setting a Timeout and Handling Timeout Exception in Hono

In Hono, you can set a timeout for a specific route using the `timeout` middleware. If the specified duration is exceeded, the middleware will automatically reject the promise and potentially throw an error. You can also customize the exception that is thrown when a timeout occurs.

Here is an example of how to do this:

```ts
import { HTTPException } from 'hono/http-exception'

// Custom exception factory function
const customTimeoutException = (context) =>
  new HTTPException(408, {
    message: `Request timeout after waiting ${context.req.headers.get(
      'Duration'
    )} seconds. Please try again later.`,
  })

// for Static Exception Message
// const customTimeoutException = new HTTPException(408, {
//   message: 'Operation timed out. Please try again later.'
// });

// Applying a 1-minute timeout with a custom exception
app.use('/api/long-process', timeout(60000, customTimeoutException))

app.get('/api/long-process', async (c) => {
  // Simulate a long process
  await new Promise((resolve) => setTimeout(resolve, 61000))
  return c.json({ data: 'This usually takes longer' })
})
```

The `timeout` middleware is applied to the `/api/long-process` route with a duration of 60000 milliseconds (1 minute). If the process takes longer than this, a custom `HTTPException` is thrown with a status code of 408 (Request Timeout) and a custom message.

- The duration for the timeout can be specified in milliseconds.
- You can customize the exception that is thrown when a timeout occurs by providing a factory function or a static exception message.

- [Hono Documentation](https://hono.bespokejs.com)

- Long running processes that may potentially exceed a reasonable response time.
- Routes that need to enforce a strict response time limit.

**Reasoning:** This rule is important as it demonstrates how to set a timeout for a specific route and handle the timeout exception in Hono. This is crucial in managing long running processes and ensuring that the server does not get stuck waiting for a response that may never come.

*Source: docs/middleware/builtin/timeout.md*

### Handling Timeouts in Hono with Streaming Server-Sent Events (SSE)

The following code snippet demonstrates how to handle timeouts in Hono with streaming Server-Sent Events (SSE).

```ts
app.get('/sse', async (c) => {
  let id = 0
  let running = true
  let timer: number | undefined

  return streamSSE(c, async (stream) => {
    timer = setTimeout(() => {
      console.log('Stream timeout reached, closing stream')
      stream.close()
    }, 3000) as unknown as number

    stream.onAbort(async () => {
      console.log('Client closed connection')
      running = false
      clearTimeout(timer)
    })

    while (running) {
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

1. A timeout is set for the stream using `setTimeout`. If the timeout is reached, the stream is closed.
2. The `onAbort` event handler is set for the stream. If the client closes the connection, the `running` flag is set to false and the timeout is cleared.
3. While the `running` flag is true, the server sends a Server-Sent Event to the client every second.

- The timeout middleware cannot be used with streams. Thus, use `stream.close` and `setTimeout` together.
- Be cautious about the order of middleware, especially when using error-handling or other timing-related middleware, as it might affect the behavior of this timeout middleware.

- [Hono Documentation](https://hono.bike/)

- Real-time applications that require server-client communication with a timeout.

**Reasoning:** This rule is important as it demonstrates how to handle timeouts in Hono with streaming Server-Sent Events (SSE). It shows how to set a timeout for a stream, close the stream when the timeout is reached, and handle the event when a client closes the connection. This is crucial for maintaining efficient and responsive server-client communication.

*Source: docs/middleware/builtin/timeout.md*

### Using Logger Middleware in Hono

This code demonstrates how to use the logger middleware in Hono.

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())
app.get('/', (c) => c.text('Hello Hono!'))
```

1. Import the Hono framework and the logger middleware.
2. Create a new Hono application.
3. Use the logger middleware in your application with `app.use(logger())`.
4. Define a route for your application. In this case, a GET request to the root URL will return 'Hello Hono!'.

- The logger middleware logs the details of each request, which can be useful for debugging and monitoring purposes.

- [Hono Documentation](https://hono.bayfront.cloud/)

- Use the logger middleware in your Hono application to log details of each request for debugging and monitoring purposes.

**Reasoning:** This rule is important as it demonstrates how to use the logger middleware in the Hono web framework. Logger middleware is crucial for tracking and debugging the flow of requests and responses in your application. It logs details of each request, which can be useful for debugging and monitoring purposes.

*Source: docs/middleware/builtin/logger.md*

### Setting Up a Custom Logger in Hono

This code snippet demonstrates how to set up a custom logger function in Hono. The logger function takes a message and an arbitrary number of additional string arguments, which are then printed to the console.

```ts
export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest)
}

app.use(logger(customLogger))
```

The `customLogger` function is defined with two parameters: `message` and `...rest`. The `message` parameter is the main log message, while `...rest` is an array of additional string arguments. These arguments are spread into the `console.log` function, allowing for multiple arguments to be logged at once.

The `customLogger` function is then passed to the `app.use` method, which adds it as a middleware to the application. This means that the `customLogger` function will be called for every request to the application, allowing for comprehensive logging.

- The `...rest` parameter uses the rest parameter syntax, which allows for an arbitrary number of arguments to be passed to the function.
- The `customLogger` function is added as a middleware using the `app.use` method. This means that it will be called for every request to the application.

- [Hono documentation](https://hono.bayrell.org/en/)

- Debugging: Custom loggers can be used to log specific information about requests, which can be useful for debugging purposes.
- Monitoring: Custom loggers can also be used to monitor the state of the application, such as the number of requests or the response times.

**Reasoning:** This rule is important as it demonstrates how to set up a custom logger function in Hono. Custom loggers can be used to format and display log messages in a way that suits the specific needs of the application. This can be particularly useful for debugging and monitoring purposes.

*Source: docs/middleware/builtin/logger.md*

### Implementing a Custom Logger in Hono

This code demonstrates how to implement a custom logger in Hono. Logging is a critical part of any application for debugging and tracking purposes. By creating a custom logger, developers can control what information gets logged and how it is formatted.

```ts
export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest)
}

app.use(logger(customLogger))
ts
app.post('/blog', (c) => {
  // Routing logic

  customLogger('Blog saved:', `Path: ${blog.url},`, `ID: ${blog.id}`)
  // Output
  // <-- POST /blog
  // Blog saved: Path: /blog/example, ID: 1
  // --> POST /blog 201 93ms

  // Return Context
})
```

The `customLogger` function is defined to log a message along with any additional arguments. It is then used as a middleware in the Hono application using `app.use()`. In the route, the `customLogger` is used to log information about the blog post.

- The `customLogger` can be used in any part of the application where logging is required.

- [Hono Documentation](https://hono.bike/)

- Logging request and response data
- Debugging application errors

#### Code Snippet

```typescript

In the route:

```

**Reasoning:** This rule is important as it demonstrates how to implement a custom logger in Hono. Logging is a critical part of any application for debugging and tracking purposes. By creating a custom logger, developers can control what information gets logged and how it is formatted.

*Source: docs/middleware/builtin/logger.md*

### Using ETag Middleware in Hono

This code demonstrates how to use the ETag middleware in Hono.

```ts
import { Hono } from 'hono'
import { etag } from 'hono/etag'

const app = new Hono()

app.use('/etag/*', etag())
app.get('/etag/abc', (c) => {
  return c.text('Hono is cool')
})
```

1. Import the Hono and etag modules.
2. Create a new Hono application.
3. Use the etag middleware for any routes that match '/etag/*'.
4. Define a GET route '/etag/abc' that returns a text response.

- The ETag middleware automatically generates an ETag for the response based on the response body.
- If the client sends an 'If-None-Match' request header with the same ETag, the server will respond with a 304 Not Modified status and no body.

- [Hono Documentation](https://hono.bjubnes.com/docs)

- Use the ETag middleware when you want to enable client-side caching and save bandwidth.

**Reasoning:** This rule is important as it demonstrates how to use the ETag middleware in Hono. ETag headers are part of HTTP, the web protocol. They are used to determine whether the client's cached version of the content is the same as that of the server. If the ETag received from the server matches the one the client has, the content is not downloaded again, saving bandwidth.

*Source: docs/middleware/builtin/etag.md*

### Importing and Using 'secureHeaders' Middleware in Hono

This code demonstrates how to import and use the 'secureHeaders' middleware in Hono to simplify the setup of security headers.

```ts
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
ts
const app = new Hono()
app.use(secureHeaders())
```

You can also suppress unnecessary headers by setting them to false.

This middleware is inspired in part by the capabilities of Helmet, and it allows you to control the activation and deactivation of specific security headers. This is crucial for enhancing the security of your web applications.

- Always ensure to import the necessary modules before using them.
- Use the middleware with the default settings unless there's a need to suppress some headers.

- [Hono Documentation](https://hono.bespoken.io/)

- Enhancing the security of web applications by controlling the activation and deactivation of specific security headers.

#### Code Snippet

```typescript

You can use the middleware with the optimal settings by default.

```

**Reasoning:** This rule is important as it demonstrates how to use the 'secureHeaders' middleware in the Hono framework to simplify the setup of security headers. It shows how to import the necessary modules, use the middleware with default settings, and how to suppress unnecessary headers by setting them to false. This is crucial for enhancing the security of web applications by controlling the activation and deactivation of specific security headers.

*Source: docs/middleware/builtin/secure-headers.md*

### Activating Specific Security Headers in Hono

This code demonstrates how to activate specific security headers in Hono. Security headers are a crucial part of web security and can make your application more resistant to common web vulnerabilities.

```ts
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()
app.use(secureHeaders())
ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    xFrameOptions: false,
    xXssProtection: false,
  })
)
```

- [Hono Documentation](https://hono.bevry.me/)

- Enhancing the security of your web application by activating specific security headers.
- Suppressing unnecessary headers for a more streamlined application.

#### Code Snippet

```typescript

### How it Works

The `secureHeaders()` function is imported from the 'hono/secure-headers' module and used as middleware in the Hono application. By default, it applies optimal settings for security headers.

### Important Notes

You can suppress unnecessary headers by setting them to false, as shown below:

```

**Reasoning:** This rule is important as it demonstrates how to activate specific security headers in Hono. Security headers are a fundamental part of web security. When set correctly, they can make your application more resistant to common web vulnerabilities. By setting them to false, you can suppress unnecessary headers, providing a more streamlined and secure application.

*Source: docs/middleware/builtin/secure-headers.md*

### Using Secure Headers Middleware in Hono

This code demonstrates how to use the secure-headers middleware in Hono to manage HTTP headers for security.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    xFrameOptions: false,
    xXssProtection: false,
  })
)
```

In this code snippet, the `secureHeaders` function is used as a middleware in the Hono application. The function is called with an object as an argument, which specifies the HTTP headers to be suppressed (set to false).

- The `secureHeaders` function can be used to set, suppress, or modify HTTP headers for security.
- The headers are set globally for all routes in the application (indicated by the '*' wildcard).

- [Hono Documentation](https://hono.bryntum.com/docs)

- Suppressing unnecessary HTTP headers for security or performance optimization in a Hono application.

**Reasoning:** This rule is important as it demonstrates how to use the secure-headers middleware in Hono to manage HTTP headers for security. It shows how to suppress unnecessary headers by setting them to false, which can be crucial for optimizing security settings and performance in a Hono application.

*Source: docs/middleware/builtin/secure-headers.md*

### Setting Secure Headers in Hono

This code demonstrates how to set secure headers in Hono. Secure headers help to protect your application from certain types of attacks and vulnerabilities.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    strictTransportSecurity:
      'max-age=63072000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xXssProtection: '1',
  })
)
```

In this example, the `strictTransportSecurity`, `xFrameOptions`, and `xXssProtection` headers are set. These headers can help to prevent clickjacking attacks, cross-site scripting attacks, and enforce secure (HTTPS) connections.

The `app.use` function is used to apply middleware to the Hono application. The `secureHeaders` function is a middleware function that sets the specified headers.

- The `secureHeaders` function takes an object as an argument. Each property in this object corresponds to a header that should be set.
- The value of each property can be a boolean or a string. If the value is `false`, the header will not be set. If the value is a string, the header will be set with that value.

- [Hono Documentation](https://hono.bespokejs.com)

- Setting secure headers to protect your application from attacks and vulnerabilities.

**Reasoning:** This rule is important as it demonstrates how to set secure headers in Hono. Secure headers help to protect your application from certain types of attacks and vulnerabilities. The rule shows how to override default header values using a string, which can be useful for customizing security settings.

*Source: docs/middleware/builtin/secure-headers.md*

### Middleware Order Matters in Hono

In Hono, the order in which middleware is specified can affect the final outcome of the headers. This is especially important when dealing with middleware that manipulates the same header.

Consider the following examples:

```ts
const app = new Hono()
app.use(secureHeaders())
app.use(poweredBy())
ts
const app = new Hono()
app.use(poweredBy())
app.use(secureHeaders())
```

In this case, poweredBy() operates first and the 'x-powered-by' header is added.

This demonstrates that the order of middleware usage can have significant implications on the security and functionality of the application. Therefore, it's crucial to be cautious about the order of specification when dealing with middleware in Hono.

- [Hono Documentation](https://hono.bespokejs.com)

- Setting up security headers in a Hono application
- Manipulating headers in a Hono application

#### Code Snippet

```typescript

In this case, secureHeaders() operates first and the 'x-powered-by' header is removed.

```

**Reasoning:** The order of middleware specification in Hono can affect the final outcome of the headers. This rule is important because it demonstrates how the order of middleware usage can manipulate the same header differently. In the given example, when secureHeaders() is used before poweredBy(), the 'x-powered-by' header is removed. But when poweredBy() is used before secureHeaders(), the 'x-powered-by' header is added. This can have significant implications on the security and functionality of the application.

*Source: docs/middleware/builtin/secure-headers.md*

### Middleware Order in Hono

In Hono, the order of middleware usage is significant and can affect the final outcome. This is demonstrated in the following code snippets:

```ts
const app = new Hono()
app.use(secureHeaders())
app.use(poweredBy())
ts
const app = new Hono()
app.use(poweredBy())
app.use(secureHeaders())
```

In this case, the 'poweredBy()' middleware operates first and adds the 'x-powered-by' header. Then, the 'secureHeaders()' middleware operates but does not remove the 'x-powered-by' header as it has already been added.

In Hono, middleware functions are executed in the order they are used in the application. Therefore, the order of middleware usage can affect the final outcome.

- The order of middleware usage is significant in Hono.
- The 'secureHeaders()' middleware removes the 'x-powered-by' header.
- The 'poweredBy()' middleware adds the 'x-powered-by' header.

- [Hono Documentation](https://hono.bespoken.io/)

- Configuring headers in a Hono application.
- Understanding the order of middleware execution in Hono.

#### Code Snippet

```typescript

In the above case, the 'secureHeaders()' middleware operates first and removes the 'x-powered-by' header. Then, the 'poweredBy()' middleware operates but does not add the 'x-powered-by' header as it has already been removed.

```

**Reasoning:** This rule is important as it demonstrates the order of middleware usage in Hono and how it affects the final outcome. In this case, the order of using 'secureHeaders()' and 'poweredBy()' middleware determines whether the 'x-powered-by' header is included or not.

*Source: docs/middleware/builtin/secure-headers.md*

### Adding a Nonce to a Script or Style Element in Hono

This code snippet demonstrates how to add a nonce to a `script` or `style` element in Hono. The nonce is imported from `hono/secure-headers` and added to a `scriptSrc` or `styleSrc`. The nonce value can be predefined or generated by a function. The nonce value is then retrieved using `c.get('secureHeadersNonce')`.

Code Snippet:
```tsx
import { secureHeaders, NONCE } from 'hono/secure-headers'
import type { SecureHeadersVariables } from 'hono/secure-headers'

type Variables = SecureHeadersVariables

const app = new Hono<{ Variables: Variables }>()

app.get(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      scriptSrc: [NONCE, 'https://allowed1.example.com'],
    },
  })
)

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        {/** contents */}
        <script
          src='/js/client.js'
          nonce={c.get('secureHeadersNonce')}
        />
      </body>
    </html>
  )
})
```

This works by setting the nonce value to `scriptSrc` in the `secureHeaders` function. The nonce value is then retrieved in the `c.get('secureHeadersNonce')` function. This ensures that only scripts and styles with the specific nonce value can be executed or applied, enhancing the security of the web application.

Important Note: Always ensure that the nonce value is unique and random for each request to prevent potential security vulnerabilities.

References: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce

Common Use Cases: This is commonly used in web applications that need to enhance their security by preventing XSS attacks.

**Reasoning:** This rule is important as it demonstrates how to add a nonce (a random string that can only be used once) to a `script` or `style` element in Hono. This is a crucial aspect of Content Security Policy (CSP) which helps to prevent Cross-Site Scripting (XSS) attacks by allowing only scripts and styles that have a specific nonce value to be executed or applied.

*Source: docs/middleware/builtin/secure-headers.md*

### Generating and Using Nonce for Secure Headers in Hono

In Hono, you can generate and use a nonce value for secure headers. This is particularly useful for providing an additional layer of security by preventing replay attacks. Here's how you can do it:

```tsx
const app = new Hono<{ Variables: { myNonce: string } }>()

const myNonceGenerator: ContentSecurityPolicyOptionHandler = (c) => {
  const nonce = Math.random().toString(36).slice(2)
  c.set('myNonce', nonce)
  return `'nonce-${nonce}'`
}

app.get('*', secureHeaders({ contentSecurityPolicy: { scriptSrc: [myNonceGenerator, 'https://allowed1.example.com'], }, }))

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        <script src='/js/client.js' nonce={c.get('myNonce')} />
      </body>
    </html>
  )
})
```

1. A new Hono app is created with a variable for the nonce.
2. A nonce generator function is defined. This function is called on every request, generating a new nonce value and setting it in the context.
3. The nonce generator is used in the Content Security Policy for a script source in the secure headers middleware.
4. The nonce value is retrieved from the context and used in a script tag in the response.

- The nonce value should be unpredictable and generated anew for each request to prevent replay attacks.

- [Hono Documentation](https://hono.boutique/docs/)

- Use this pattern when you need to add an additional layer of security to your scripts by ensuring they can only be executed once per request.

**Reasoning:** This rule is important as it demonstrates how to generate and use a nonce value for secure headers in Hono. Nonce values are used to provide a layer of security that helps prevent replay attacks. In this example, a nonce value is generated for each request and used in the Content Security Policy for a script source. This ensures that the script can only be executed once, providing an additional layer of security.

*Source: docs/middleware/builtin/secure-headers.md*

### Setting Permission-Policy Header in Hono

The code snippet demonstrates how to set the Permission-Policy header in Hono. This header allows you to control which features and APIs can be used in the browser.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    permissionsPolicy: {
      fullscreen: ['self'],
      bluetooth: ['none'],
      payment: ['self', 'https://example.com'],
      syncXhr: [],
      camera: false,
      microphone: true,
      geolocation: ['*'],
      usb: ['self', 'https://a.example.com', 'https://b.example.com'],
      accelerometer: ['https://*.example.com'],
      gyroscope: ['src'],
      magnetometer: [
        'https://a.example.com',
        'https://b.example.com',
      ],
    },
  })
)
```

The `secureHeaders` middleware is used to set the headers. The `permissionsPolicy` object is passed as an argument, where each key-value pair represents a feature and its allowed sources.

- The values can be a string, a boolean, or an array of strings.
- The `self` keyword refers to the origin from which the document was served.
- The `none` keyword means that the feature is disabled.

- [MDN Web Docs - Feature Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy)

- Limiting the capabilities of certain APIs for security reasons.
- Controlling the features that can be used in the browser.

**Reasoning:** This rule is important as it demonstrates how to set the Permission-Policy header in Hono. The Permission-Policy header allows you to control which features and APIs can be used in the browser. This is crucial for security and privacy reasons, as it allows the developer to limit the capabilities of certain APIs, thereby reducing the potential attack surface.

*Source: docs/middleware/builtin/secure-headers.md*

### Handling Trailing Slashes in URLs with Hono

In Hono, you can use the `appendTrailingSlash` and `trimTrailingSlash` functions to manage trailing slashes in URLs. This is useful for URL normalization and can help avoid issues related to content duplication and SEO.

```ts
import { Hono } from 'hono'
import {
  appendTrailingSlash,
  trimTrailingSlash,
} from 'hono/trailing-slash'
ts
import { Hono } from 'hono'
import { appendTrailingSlash } from 'hono/trailing-slash'

const app = new Hono()

app.get('/about/me', appendTrailingSlash())
```

In this example, a GET request to `/about/me` will be redirected to `/about/me/`.

- These functions should be used carefully as improper use can lead to issues such as infinite redirects.

- [Hono Documentation](https://hono.bevry.me/)

- URL normalization
- Preventing content duplication

#### Code Snippet

```typescript

### Usage

You can use `appendTrailingSlash` to add a trailing slash to a URL if the content was not found. Similarly, `trimTrailingSlash` can be used to remove the trailing slash.

```

**Reasoning:** This rule is important as it demonstrates how to handle trailing slashes in URLs using Hono's built-in functions `appendTrailingSlash` and `trimTrailingSlash`. This is crucial for URL normalization and can prevent potential issues related to content duplication and SEO.

*Source: docs/middleware/builtin/trailing-slash.md*

### Handling Trailing Slashes in Hono

This code demonstrates how to append or trim trailing slashes in URLs using Hono web framework.

```ts
import { Hono } from 'hono'
import { appendTrailingSlash } from 'hono/trailing-slash'

const app = new Hono({ strict: true })

app.use(appendTrailingSlash())
app.get('/about/me/', (c) => c.text('With Trailing Slash'))
```

The `appendTrailingSlash` function from 'hono/trailing-slash' is used as a middleware in the Hono application. This function appends a trailing slash to the URL if it doesn't already have one.

- The `strict` option in the Hono constructor must be set to `true` for the trailing slash functions to work.

- [Hono Documentation](https://hono.beyondnlp.com)

- Ensuring consistent URL structure for SEO
- Redirecting users to the correct URL

**Reasoning:** This rule is important because it demonstrates how to handle trailing slashes in URLs using Hono web framework. It shows how to append or trim trailing slashes from URLs which is crucial for consistent routing and SEO.

*Source: docs/middleware/builtin/trailing-slash.md*

### Using Method Override Middleware in Hono

This code demonstrates how to use the `methodOverride` middleware in Hono to override the HTTP method of a request.

```ts
import { Hono } from 'hono'
import { methodOverride } from 'hono/method-override'

const app = new Hono()

// If no options are specified, the value of `_method` in the form,
// e.g. DELETE, is used as the method.
app.use('/posts', methodOverride({ app }))
```

The `methodOverride` middleware checks for a `_method` field in the request. If found, it changes the HTTP method of the request to the value of the `_method` field.

- This is useful when the client doesn't support certain HTTP methods, like DELETE or PUT, and instead sends a POST request with the intended method specified in a `_method` field.

- [Hono Documentation](https://hono.beyondco.de/docs/getting-started)

- RESTful APIs where the client may not support all HTTP methods.

**Reasoning:** This rule is important as it demonstrates how to use the methodOverride middleware in Hono to override the HTTP method of a request. This is useful when the client doesn't support certain HTTP methods, like DELETE or PUT, and instead sends a POST request with the intended method specified in a `_method` field.

*Source: docs/middleware/builtin/method-override.md*

### Using methodOverride Middleware in Hono

This code snippet demonstrates how to use the `methodOverride` middleware in Hono. This middleware allows you to use HTTP verbs such as DELETE or PUT in places where the client doesn't support it.

```ts
const app = new Hono()

// If no options are specified, the value of `_method` in the form,
// e.g. DELETE, is used as the method.
app.use('/posts', methodOverride({ app }))

app.delete('/posts', (c) => {
  // ....
})
```

The `methodOverride` middleware checks for the presence of a `_method` property in the form data. If it exists, it overrides the original HTTP method with the value of `_method`. In this example, if a form submits a POST request with `_method` set to DELETE, the middleware will change the request to a DELETE request.

- The `methodOverride` middleware should be used before any middleware that needs to know the method of the request.

- [Hono documentation](https://hono.beyondco.de/docs/getting-started)

- Handling form submissions that need to use HTTP verbs other than GET and POST.

**Reasoning:** This rule is important as it demonstrates how to use the methodOverride middleware in Hono. This middleware allows you to use HTTP verbs such as DELETE or PUT in places where the client doesn't support it. This is particularly useful when dealing with HTML forms, which only support GET and POST methods.

*Source: docs/middleware/builtin/method-override.md*

### Using Method Override in Hono

Since HTML forms cannot send a DELETE method, you can put the value `DELETE` in the property named `_method` and send it. And the handler for `app.delete()` will be executed.

Here is an example of how to do it:

```html
<form action="/posts" method="POST">
  <input type="hidden" name="_method" value="DELETE" />
  <input type="text" name="id" />
</form>
ts
import { methodOverride } from 'hono/method-override'

const app = new Hono()
app.use('/posts', methodOverride({ app }))

app.delete('/posts', () => {
  // ...
})
```

This works by using a hidden input field with the name `_method` in your HTML form. When the form is submitted, Hono will check for this field and if it exists, it will override the method of the request with its value.

This is a common use case when you need to perform actions like deleting a resource from a server, which requires a DELETE method.

References:
- [Hono Documentation](https://hono.bouzuya.net/)

#### Code Snippet

```typescript

And in your Hono application:

```

**Reasoning:** This rule is important as it demonstrates how to use the method override feature in Hono to handle HTTP methods like DELETE which are not supported by HTML forms. This is a common workaround in web development to overcome the limitations of HTML forms.

*Source: docs/middleware/builtin/method-override.md*

### Method Override in Hono

In Hono, you can override methods using different options. This can be useful when you want to change the default behavior of a method or use a different method based on certain conditions.

Here is a code snippet demonstrating this:

```ts
app.use('/posts', methodOverride({ app, form: '_custom_name' }))
app.use('/posts', methodOverride({ app, header: 'X-METHOD-OVERRIDE' }))
app.use('/posts', methodOverride({ app, query: '_method' }))
```

In the above code:

- `app` is the instance of `Hono` used in your application.
- `form` is an optional key with a value that overrides the default method.
- `header` is another optional key that can be used to override the method.
- `query` is yet another optional key that can be used for method overriding.

- The `app` option is required while the `form`, `header`, and `query` options are optional.
- The `form`, `header`, and `query` options can be used to customize the method overriding behavior based on your application's requirements.

- [Hono Documentation](https://hono.bespokejs.com)

- Changing the default behavior of a method based on certain conditions.
- Using a different method based on the request's form data, headers, or query parameters.

**Reasoning:** This rule is important as it demonstrates how to override methods in Hono using different options such as form, header, and query. This is useful when you want to change the default behavior of a method or use a different method based on certain conditions.

*Source: docs/middleware/builtin/method-override.md*