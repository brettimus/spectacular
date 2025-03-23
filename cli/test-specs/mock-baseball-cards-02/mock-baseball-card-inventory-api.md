# Overview

This project is a simple CRUD API for a baseball card inventory, built using Hono on Cloudflare Workers. The purpose of this API is to handle basic CRUD operations (Create, Read, Update, Delete) for baseball cards, returning mock data. Each baseball card will include attributes such as player name, team, year, and condition.

# Technology Stack

- API Framework: Hono (a lightweight TypeScript framework similar to Express.js)
- Serverless Platform: Cloudflare Workers
- (Mock Data): Data will be maintained in-memory, as no persistent storage is required for mock data

# Data Model

Each baseball card will include the following attributes:

- id (string, UUID format) - Unique identifier for the card
- playerName (string) - Name of the player
- team (string) - Name of the team
- year (number) - The year the card was produced
- condition (string) - Condition of the card (e.g., "Mint", "Good", "Fair")

# API Endpoints

1. GET /cards
   - Description: Retrieve a list of all baseball cards
   - Response: Array of baseball card objects

2. GET /cards/:id
   - Description: Retrieve details of a specific baseball card by its id
   - Response: A single baseball card object

3. POST /cards
   - Description: Add a new baseball card to the inventory
   - Request Body: Object containing playerName, team, year, and condition; the API will generate a unique id
   - Response: Newly created baseball card object

4. PUT /cards/:id
   - Description: Update details of an existing baseball card
   - Request Body: Object that may contain any or all of playerName, team, year, and condition
   - Response: Updated baseball card object

5. DELETE /cards/:id
   - Description: Remove a baseball card from the inventory
   - Response: Confirmation message of deletion

# Implementation Details

## 1. Project Setup

- Initialize a project with TypeScript support.
- Install Hono via npm.
- Setup the Cloudflare Worker environment (using Wrangler) for deployment.

## 2. In-memory Data Store

- Create an in-memory array to store the baseball cards. This array will simulate a database for the duration of the worker's execution.
- Optionally, use a mock UUID generator for generating unique ids (e.g., by using a simple npm package or a custom utility function).

## 3. Routing and Handlers

- Define routes for each endpoint using Hono’s routing mechanism.
- For each endpoint:
  - GET /cards: Return the entire in-memory array of cards.
  - GET /cards/:id: Find the card with the matching id and return it (or return a 404 error if not found).
  - POST /cards: Validate request body, assign a unique id, push the new card into the array, and return the created object.
  - PUT /cards/:id: Find the card by id, update fields with provided values, and return the updated card, or return a 404 error if the card does not exist.
  - DELETE /cards/:id: Remove the card from the array, and return a success message or a 404 error if not found.

## 4. Validation and Error Handling

- Validate the request body on POST and PUT requests, ensuring required fields (playerName, team, year, and condition) are provided in the correct format.
- Implement standardized error responses (e.g., with proper status codes like 400 for bad requests and 404 for not found).
- Optionally, use middleware in Hono for centralized error handling.

## 5. Testing and Development Iteration

- Use local development tooling (provided by Wrangler and Hono) to test the API routes.
- Build a few unit tests, possibly using a testing framework such as Jest, to confirm that each endpoint behaves as expected with various inputs.
- Test scenarios for successful CRUD operations and edge cases (e.g., attempting to update or delete a non-existent card).

## 6. Documentation

- Provide an API documentation file (e.g., README.md) that outlines how to use the API endpoints along with sample requests and responses.

# Deployment

- Use Wrangler to publish the Cloudflare Worker to the edge.
- Document any deployment steps, including installation of Wrangler and authentication with Cloudflare if this is a new setup.

# Future Enhancements

- Integrate Cloudflare D1 and Drizzle if persistent storage becomes necessary in the future.
- Add authentication using Clerk if you want to restrict access to the API endpoints.
- Implement rate limiting and caching strategies using Cloudflare Worker features to optimize API performance.

This handoff document should provide clear instructions on how to implement the mock baseball card inventory API using Hono and Cloudflare Workers. Each step is designed to facilitate a smooth development process leading from simple mock data handling to potential future production-grade enhancements.