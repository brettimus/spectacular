import { randomUUID } from "node:crypto";
import { evalite } from "evalite";
import { TypeScriptValidity } from "./scorers/typescript-validity";

// Common TypeScript errors to check for
const testSamples = [
  {
    id: randomUUID(),
    name: "Undefined Variable",
    code: `
function greet(name: string) {
  return \`Hello, \${username}!\`; // Error: 'username' is not defined
}
`,
  },
  {
    id: randomUUID(),
    name: "Type Incompatibility",
    code: `
function add(a: number, b: number): number {
  return a + b;
}

const result: string = add(1, 2); // Error: Type 'number' is not assignable to type 'string'
`,
  },
  {
    id: randomUUID(),
    name: "Missing Property",
    code: `
interface Person {
  name: string;
  age: number;
  email: string;
}

const person: Person = {
  name: "John Doe",
  age: 30
  // Error: Property 'email' is missing in type '{ name: string; age: number; }' but required in type 'Person'
};
`,
  },
  {
    id: randomUUID(),
    name: "Excess Property",
    code: `
interface Config {
  endpoint: string;
  timeout: number;
}

const config: Config = {
  endpoint: "https://api.example.com",
  timeout: 5000,
  retries: 3 // Error: Object literal may only specify known properties, and 'retries' does not exist in type 'Config'
};
`,
  },
  {
    id: randomUUID(),
    name: "Non-existent Method",
    code: `
const arr = [1, 2, 3];
arr.push(4); // Valid
arr.pop(); // Valid
arr.remove(2); // Error: Property 'remove' does not exist on type 'number[]'
`,
  },
  {
    id: randomUUID(),
    name: "Incorrect Function Call",
    code: `
function createUser(name: string, age: number, isAdmin: boolean) {
  return { name, age, isAdmin };
}

createUser("John"); // Error: Expected 3 arguments, but got 1
`,
  },
  {
    id: randomUUID(),
    name: "Invalid Assignment",
    code: `
let count: number = 5;
count = "ten"; // Error: Type 'string' is not assignable to type 'number'
`,
  },
  {
    id: randomUUID(),
    name: "Null Safety",
    code: `
function getLength(text: string | null): number {
  return text.length; // Error: Object is possibly 'null'
}
`,
  },
];

evalite("Common TypeScript Errors Evaluation", {
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
  task: async (input) => {
    return input.code;
  },
  scorers: [TypeScriptValidity],
});
