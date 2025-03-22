# Pokemon Naming Service Implementation Plan

This document outlines the implementation details for the Pokemon Naming Service—a platform where users can submit names for Pokémon and vote on their favorites. No user authentication is required.

## Architecture and Technology Stack

- **Framework**: Hono (TypeScript API framework similar to Express.js)
- **Edge Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (serverless SQLite on the edge) with Drizzle as a type-safe SQL query builder and ORM

## Data Model

We will need two main entities:

### 1. Pokemon

- **id**: Primary key (number or UUID)
- **name**: The name/species of the Pokémon (e.g., "Pikachu")
- **description** (optional): Additional details about the Pokémon
- **createdAt**: Timestamp for when the entry was created

### 2. NameSubmission

- **id**: Primary key
- **pokemonId**: Foreign key that references the associated Pokemon
- **nameSuggestion**: The submitted name (string)
- **votes**: Number (default is 0) that tracks the current vote count
- **createdAt**: Timestamp for when the suggestion was submitted

> NOTE: While we could track individual votes for accountability (e.g. one record per vote), since there is no authentication, the design simply increments a vote count on the submission. In production, you might consider measures to prevent vote manipulation (e.g., rate limiting based on IP address).

## API Endpoints

### 1. List All Pokemon

- **Method**: GET
- **Route**: `/pokemon`
- **Description**: Returns a list of Pokémon. Can be used to display available Pokémon species that names can be submitted for.

### 2. Get Pokemon Details

- **Method**: GET
- **Route**: `/pokemon/:id`
- **Description**: Returns details for a specific Pokémon along with all name submissions (sorted, for instance, by vote count in descending order).

### 3. Submit a Name for a Pokemon

- **Method**: POST
- **Route**: `/pokemon/:id/submissions`
- **Payload**:
  - `nameSuggestion` (string): The name submitted by the user.
- **Description**: Creates a new name submission for the given Pokémon.

### 4. Vote on a Name Submission

- **Method**: POST
- **Route**: `/submissions/:id/vote`
- **Description**: Increments the vote count for the provided submission ID. Consider implementing basic rate limiting to avoid abuse.

## Implementation Details

### 1. Setting Up the Project

- Initialize a new TypeScript project targeting Cloudflare Workers.
- Add Hono as the server framework.
- Set up the Cloudflare D1 database and integrate it with Drizzle ORM. Create migrations to build the `Pokemon` and `NameSubmission` tables.

### 2. Database Schema with Drizzle

Define migration files to create the following tables:

- **pokemon** table: id (primary key), name, description, createdAt
- **name_submission** table: id (primary key), pokemonId (foreign key references pokemon.id), nameSuggestion, votes (integer, default 0), createdAt

### 3. Routing and Handlers

Using Hono, create route handlers as follows:

- **GET /pokemon**: Fetch all Pokemon entries from the database. Return a JSON array of Pokemon objects.

- **GET /pokemon/:id**: 
  - Fetch the Pokémon by ID from the database. If not found, return a 404 error.
  - Fetch all related name submissions ordered by votes descending.
  - Return a JSON object with the Pokémon details and an array of submissions.

- **POST /pokemon/:id/submissions**:
  - Validate the input payload to ensure `nameSuggestion` is provided and is a valid string.
  - Verify the Pokémon exists using the provided pokemon ID.
  - Insert the new submission into `name_submission` with a vote count of 0 and record the current timestamp.
  - Return a success message along with the created submission object.

- **POST /submissions/:id/vote**:
  - Validate that the submission exists.
  - Increment the vote count using an atomic database update. (Note: With Cloudflare D1 and Drizzle, ensure the update is performed safely.)
  - Return the updated submission object in the response.

### 4. Error Handling

- Ensure that for non-existent Pokemon or submissions, the API returns a proper 404 error with a clarifying message.
- Validate payloads and ensure appropriate error messages in case of invalid input.

### 5. Testing

- Write unit tests for each endpoint using your preferred testing framework (e.g., Jest) in a simulated Cloudflare Workers environment.
- Ensure edge cases such as invalid IDs and missing fields in the payloads are handled gracefully.

### 6. Deployment

- Configure deployment scripts for Cloudflare Workers.
- Ensure the D1 database is bound correctly to your Worker.
- Deploy to the Cloudflare Edge.

## Additional Considerations

- Rate Limit Votes: Since there’s no auth, consider rate limiting the vote endpoint to avoid abuse (e.g., limit votes per IP per minute).
- Frontend: If there is a separate frontend, ensure that CORS headers are set appropriately on the API responses.
- Logging and Monitoring: Set up logging for debugging and monitoring API usage to monitor vote anomalies.

## Future Enhancements

- Admin Interface: Consider creating an admin endpoint to manage Pokémon entries.
- Improved Submissions: Allow editing of submissions or reporting, if needed.
- Real-time Updates: Incorporate Cloudflare Durable Objects for real-time vote updates on the frontend side.

## Summary

This implementation plan covers the creation of a lightweight API using Hono on Cloudflare Workers, leveraging Cloudflare D1 and Drizzle ORM for managing the data. The primary focus is on enabling users to submit name suggestions for Pokémon and vote on them, with endpoints to list Pokémon, view details along with submissions, add new submissions, and vote for existing ones. Follow the plan closely to implement and deploy the service.

Happy coding!