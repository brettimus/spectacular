# Drizzle SQLite Rules

## Establishing an SQLite Connection with Drizzle ORM and Expo

This code snippet demonstrates how to establish a connection to an SQLite database using Drizzle ORM and Expo in a React Native environment.

- `import { drizzle } from "drizzle-orm/expo-sqlite";`: This imports the `drizzle` function from the Drizzle ORM package, which is tailored to work with Expo.
- `import { openDatabaseSync } from "expo-sqlite/next";`: This line imports the `openDatabaseSync` function from the `expo-sqlite` package, allowing for synchronous database connection creation.
- `const expo = openDatabaseSync("db.db");`: This initializes a connection to the local SQLite database named `db.db`. It establishes a bridge between the React Native app and the database.
- `const db = drizzle(expo);`: This wraps the SQLite connection with Drizzle ORM, enabling the use of ORM functionalities for managing the database.

- Ensure that the `drizzle-orm` and `expo-sqlite` packages are installed and properly configured in your project.
- This pattern is specific to environments where Expo is used as part of React Native applications.

- [Drizzle ORM Documentation](https://drizzle.zhcndoc.com/docs/connect-overview)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)

- Setting up a new project that requires data persistence with SQLite in a React Native application.
- Migrating existing SQLite querying logic to use ORM patterns with Drizzle for better maintainability and scalability.
- Developing offline-first mobile applications that need efficient local data storage.

### Code Snippet

```typescript
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";

const expo = openDatabaseSync("db.db");
const db = drizzle(expo);
```

**Reasoning:** This rule demonstrates how to establish a connection to an SQLite database using the Drizzle ORM with Expo. Understanding how to set up this connection is crucial for developers who need to interact with a local SQLite database in a React Native application. This pattern simplifies database operations, facilitating efficient data management and retrieval.