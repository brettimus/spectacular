# Go Fund Yourself Specification

This document outlines the design and implementation plan for a Comedic Crowdfunding API called "Go Fund Yourself". The API allows users to register with their name, email, and password; and then create a crowdfunding goal that only they can contribute to. The idea is humorous in that you're essentially funding your own dreams.

## 1. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based API Framework)
- **Database:** Cloudflare D1 (serverless SQLite edge database)
- **ORM:** Drizzle (for type-safe SQL queries and schema management)
- **Authentication:** Custom email/password authentication (credentials stored in D1, with proper password hashing)

## 2. Database Schema Design

We will use two primary tables: one for users and one for crowdfunding goals.

### 2.1. Users Table

- id (INTEGER, Primary Key, Auto Increment)
- name (TEXT, required)
- email (TEXT, required, unique)
- password (TEXT, required, store hashed password)
- created_at (DATETIME, default current time)

### 2.2. Goals Table

- id (INTEGER, Primary Key, Auto Increment)
- user_id (INTEGER, Foreign Key referencing Users(id))
- title (TEXT, required)
- description (TEXT)
- target_amount (INTEGER, required) - representing the fundraising target (e.g. in cents/dollars)
- deadline (DATETIME, optional) - the end date for the goal
- current_amount (INTEGER, default 0) - tracks progress
- created_at (DATETIME, default current time)

## 3. API Endpoints

We will group our endpoints into authentication endpoints and crowdfunding goal endpoints. All endpoints dealing with goals will require authentication using a simple email/password mechanism.

### 3.1. Authentication Endpoints

#### POST /auth/register
- **Description:** Register a new user.
- **Expected Payload:**
  ```
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "plaintextpassword"
  }
  ```
- **Process:**
  1. Validate payload and ensure all required fields are provided.
  2. Hash the password using a secure hashing algorithm.
  3. Save the user to the Users table.

#### POST /auth/login
- **Description:** Authenticate a user and initiate a session.
- **Expected Payload:**
  ```
  {
    "email": "user@example.com",
    "password": "plaintextpassword"
  }
  ```
- **Process:**
  1. Retrieve the user by email from the Users table.
  2. Validate the provided password against the hashed password stored in the database.
  3. On success, return an authentication token (JWT or similar) or set an authenticated session cookie.

### 3.2. Crowdfunding Goal Endpoints

Note: Ensure that the authenticated user's id is used to tie the goal to the user.

#### GET /goals
- **Description:** Retrieve a list of crowdfunding goals for the authenticated user.
- **Query Params:** Optional filtering parameters (e.g. status, deadline range) may be added later.
- **Response:** A list of goals belonging to the user.

#### POST /goals
- **Description:** Create a new crowdfunding goal.
- **Expected Payload:**
  ```
  {
    "title": "My Amazing Goal",
    "description": "A hilarious description of my personal crowdfunding goal.",
    "target_amount": 10000, 
    "deadline": "2023-12-31T23:59:59Z"  
  }
  ```
- **Process:**
  1. Validate that the title, target_amount, and optionally deadline are provided.
  2. Insert the new goal into the Goals table with the current user as the owner.

#### PUT /goals/:goalId
- **Description:** Update an existing goal (e.g., change title, description, target, or deadline).
- **Expected Payload:** (Similar to POST /goals with whichever fields need updating)
- **Process:**
  1. Verify that the goal belongs to the authenticated user.
  2. Validate payload and update the corresponding record in the Goals table.

#### DELETE /goals/:goalId
- **Description:** Delete a goal.
- **Process:**
  1. Verify the goal belongs to the authenticated user.
  2. Perform a deletion operation in the database.

#### POST /goals/:goalId/fund
- **Description:** Contribute funds to your own goal (simulate a funding action).
- **Expected Payload:**
  ```
  {
    "amount": 500
  }
  ```
- **Process:**
  1. Ensure the authenticated user is the owner of the goal.
  2. Verify that the amount is positive and does not exceed the target amount if desired (or simply allow overfunding as part of the humor).
  3. Update the current_amount in the Goals table accordingly.

## 4. Additional Integrations

- Email Notifications: Consider integrating with Resend for sending humorous or progress update emails to the user when certain events occur (e.g., goal funded, deadline approaching).
- Password Hashing: Use a standard bcrypt library or equivalent secure hash function for storing passwords.

## 5. Additional Notes

- All endpoints (except registration and login) require simple session management. Given the simplicity of the project, tokens can be used (JWT style) or sessions can be managed via Cookies. Choose a secure method.
- Use Hono's middleware capabilities to implement authentication checks on protected routes.
- Ensure proper error handling and validation on all endpoints.

## 6. Future Considerations

- Social sharing: Although the concept is self-funding, you could have fun with social media integrations for users to celebrate funding their own goals.
- Analytics: Track user behaviors and funding progress to generate funny insights.
- Rate limiting: Considering Cloudflare Workers, implement rate limiting to prevent abuse.
- Optional integration with Cloudflare R2 for storing user-uploaded images if you expand the goals to have media attachments.
- Testing: Create integration tests for endpoints to ensure consistent behavior on the edge.
- Expand the funding process with a simulated payment gateway process for additional humor and authenticity in the crowdfunding experience.

## 7. Further Reading

- Hono.js Documentation
- Cloudflare Workers Documentation
- Cloudflare D1 & Drizzle ORM Guides
- Example projects: https://github.com/fiberplane/create-honc-app/tree/main/templates/d1

This detailed plan should provide enough high-level guidance for an experienced developer to begin implementation of the "Go Fund Yourself" comedic crowdfunding API using the Hono-stack. Enjoy building and bringing humor to the world of self-funding!
