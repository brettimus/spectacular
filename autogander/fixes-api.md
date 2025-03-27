# Fixes API Specification

This document outlines the design and implementation plan for the Fixes API. The API will handle the receipt of "fixes" events for a given session and provide a way to list these fixes using various query parameters, including filtering by type and pagination.

## 1. Project Description

The Fixes API will expose two main endpoints:

- POST /sessions/:id/fixes: Receive a new fix event for a specific session.
- GET /sessions/:id/fixes: Retrieve and list fixes for a specific session, with support for filtering by fix type and pagination (default page size of 100).

Each fix event contains the following properties:

- type (string): The type/category of the fix.
- originalCode (string): The original code before applying the fix.
- errors (JSON): A JSON blob detailing the errors encountered.
- analysis (string): The analysis output derived from examining the fix.
- fix (string): The code or solution generated to address the errors.

Additionally, each fix event can be associated with many RULES. RULES are to be created later as part of a background job, but the related table and schema should be planned for in the database design.

## 2. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js
- **Database:** Cloudflare D1 (SQLite) as the serverless relational database
- **ORM/Query Builder:** Drizzle ORM

## 3. Database Schema Design

The design includes two tables: one for fixes and one for the fix-related RULES (even though RULES insertion will be implemented later).

### 3.1. fixes Table

This table stores all fix events. The proposed schema is as follows:

- id: INTEGER, Primary Key, Auto Increment
- session_id: STRING, to track which session the fix belongs to
- type: STRING, fix category/type
- originalCode: STRING, the code prior to the fix
- errors: JSON (or TEXT if JSON is not natively supported), the error payload
- analysis: STRING, analysis output
- fix: STRING, the actual fix provided
- created_at: TIMESTAMP, defaults to current time for sorting & pagination

### 3.2. fix_rules Table

This table will hold the RULES which are associated with a fix. Even if the RULE creation is deferred to background processes, the schema is defined as follows:

- id: INTEGER, Primary Key, Auto Increment
- fix_id: INTEGER, Foreign Key referencing fixes.id
- rule: STRING, details or identifier for the rule
- additional_data: JSON (if additional rule-related data is needed)
- created_at: TIMESTAMP, defaults to current time

## 4. API Endpoints

The API endpoints are designed to both create and retrieve fix events, grouped logically by session.

### 4.1. POST /sessions/:id/fixes

- **Description:** Insert a new fix event for the session specified by the `:id` parameter.
- **URL Parameter:**
  - id: The session identifier for which the fix event is being recorded.
- **Payload:**

  ```json
  {
    "type": "errorType",
    "originalCode": "// original code snippet",
    "errors": { "error_key": "error_value" },
    "analysis": "Detailed analysis...",
    "fix": "Corrected code snippet"
  }
  ```

- **Implementation Details:**
  - Validate the session id parameter.
  - Validate incoming JSON payload for required fields. (Additional validation may be added, such as JSON schema validation.)
  - Insert the record into the `fixes` table with the current timestamp.
  - Return a success response with the created fix record’s details.

### 4.2. GET /sessions/:id/fixes

- **Description:** List and paginate fix events for a given session, with optional filtering by `type`.
- **URL Parameter:**
  - id: The session identifier whose fixes should be retrieved.
- **Query Parameters:**
  - type: (optional) Filter fixes by a specific type.
  - page: (optional) The page number, defaulting to 1 if not provided.
  - pageSize: (optional) The number of records per page, defaults to 100.

- **Response:**

  ```json
  {
    "page": 1,
    "pageSize": 100,
    "total": 250,
    "fixes": [
      {
        "id": 1,
        "session_id": "abc123",
        "type": "errorType",
        "originalCode": "...",
        "errors": { "error_key": "error_value" },
        "analysis": "Detailed analysis...",
        "fix": "Corrected code snippet",
        "created_at": "2023-10-10T12:00:00Z"
      }
    ]
  }
  ```

- **Implementation Details:**
  - Validate the session id parameter.
  - Read and apply pagination and filter parameters.
  - Query the `fixes` table using Drizzle ORM, filtering by session_id and type if provided.
  - Order the list by `created_at` descending (if preferred) and return the paginated results.

## 5. Additional Integrations

- **Database Access:** Use Drizzle ORM for type-safe access to Cloudflare D1.
- **Background Jobs (Future):** Prepare for later integration of background jobs to process fixes and generate RULES. This could later be implemented using Cloudflare Durable Objects or other background processing services.

## 6. Future Considerations

- DEVELOP RULES: Implement the background job to analyze fix events and generate corresponding RULES that will be inserted into the `fix_rules` table.
- ERROR HANDLING: Enhance error handling, logging, and validation for production use.
- METRICS: Incorporate logging and metrics to monitor the number of fixes processed per session.
- SECURITY: Even though no authentication is required initially, consider integrating Clerk for user authentication if access control is needed in the future.

## 7. Further Reading

For inspiration and project structure guidelines, review the template available at: https://github.com/fiberplane/create-honc-app/tree/main/templates/d1

---

This specification provides the necessary details for an experienced developer to implement the Fixes API using Cloudflare Workers, Hono.js, Cloudflare D1 with Drizzle ORM. Any adjustments or enhancements can be applied as the project evolves.