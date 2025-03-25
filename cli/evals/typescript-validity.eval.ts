import { randomUUID } from "node:crypto";
import { evalite } from "evalite";
import { TypeScriptValidity } from "./scorers/typescript-validity";

// Sample TypeScript code to test
const testSamples = [
  {
    id: randomUUID(),
    name: "Valid TypeScript code",
    code: `
interface User {
  id: string;
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user: User = {
  id: "123",
  name: "John",
  age: 30
};

console.log(greetUser(user));
`,
  },
  {
    id: randomUUID(),
    name: "Invalid TypeScript code - type error",
    code: `
interface User {
  id: string;
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user = {
  id: "123",
  name: "John",
  // Missing age property
};

console.log(greetUser(user));
`,
  },
  {
    id: randomUUID(),
    name: "Invalid TypeScript code - non-existent property",
    code: `
interface User {
  id: string;
  name: string;
  age: number;
}

function greetUser(user: User): string {
  // Using non-existent property
  return \`Hello, \${user.fullName}! You are \${user.age} years old.\`;
}

const user: User = {
  id: "123",
  name: "John",
  age: 30
};

console.log(greetUser(user));
`,
  },
];

evalite("TypeScript Validity Evaluation", {
  // A function that returns an array of test data
  data: async () => {
    return testSamples.map((sample) => ({
      input: {
        code: sample.code,
        id: sample.id,
      },
      expected: null,
      metadata: {
        name: sample.name,
      },
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
