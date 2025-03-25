import { randomUUID } from "node:crypto";
import { evalite } from "evalite";
import { TypeScriptValidity } from "./scorers/typescript-validity";

// Real-world TypeScript code examples from a web application
const testSamples = [
  {
    id: randomUUID(),
    name: "Valid React Component",
    code: `
import { useState, useEffect } from 'react';

interface UserProps {
  userId: string;
  onUserUpdate?: (user: User) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  lastLogin?: Date;
}

export function UserProfile({ userId, onUserUpdate }: UserProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData: User = await response.json();
        setUser(userData);
        if (onUserUpdate) {
          onUserUpdate(userData);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId, onUserUpdate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {user.lastLogin && (
        <p>Last login: {user.lastLogin.toLocaleDateString()}</p>
      )}
    </div>
  );
}
`
  },
  {
    id: randomUUID(),
    name: "Invalid React Component - Type Error",
    code: `
import { useState, useEffect } from 'react';

interface UserProps {
  userId: string;
  onUserUpdate?: (user: User) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  lastLogin?: Date;
}

export function UserProfile({ userId, onUserUpdate }: UserProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Type error: initializing Error with a string
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData: User = await response.json();
        setUser(userData);
        if (onUserUpdate) {
          onUserUpdate(userData);
        }
      } catch (err) {
        // Type error: assigning to a string when Error is expected
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId, onUserUpdate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {user.lastLogin && (
        // Type error: toLocaleDateString may not exist on Date
        <p>Last login: {user.lastLogin.toISOString()}</p>
      )}
    </div>
  );
}
`
  },
  {
    id: randomUUID(),
    name: "Invalid TypeScript - Property Access Error",
    code: `
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const json = await response.json();
  return {
    data: json.data,
    status: response.status,
    message: json.message
  };
}

interface User {
  id: string;
  username: string;
  email: string;
}

async function getUserById(id: string): Promise<User> {
  // Property access error: accessing properties that don't exist
  const response = await fetchData<User>(\`/api/users/\${id}\`);
  
  // Error: Property 'username' doesn't exist on 'response', it should be response.data.username
  return {
    id: response.id,
    username: response.username,
    email: response.email
  };
}

// Usage
getUserById('123').then(user => {
  console.log(user.username);
});
`
  }
];

evalite("Advanced TypeScript Validity Evaluation", {
  // A function that returns an array of test data
  data: async () => {
    return testSamples.map(sample => ({
      input: {
        code: sample.code,
        id: sample.id
      },
      expected: null,
      metadata: {
        name: sample.name
      }
    }));
  },
  // The task to perform - in this case, we're not modifying the code
  // we're just validating the existing code
  task: async (input) => {
    return input.code;
  },
  // The scoring methods for the eval
  scorers: [TypeScriptValidity],
}); 