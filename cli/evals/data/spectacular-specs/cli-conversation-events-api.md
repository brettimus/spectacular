# CLI Conversation Events API Specification

This document outlines the design and implementation plan for an API that accepts and manages events generated from CLI executions. The events are related to conversations (with artifacts) with an LLM, and include human-feedback-requiring events such as "assistant_response", "spec_created", "schema_created", and "api_file_created". The API will record all events and provide endpoints to submit human feedback.

## 1. Project Description

The API is designed to capture a trace of events from a CLI that runs conversations with an LLM. Every event is associated with a conversation identifier and is stored as a record in a database.

Key aspects:
- Log every event from a conversation as an independent record with a conversation (trace) id.
- Certain event types require human evaluation (these events are later marked by feedback).
- Provide endpoints for both event logging and submission/retrieval of human feedback.

## 2. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based lightweight framework)
- **Database:** Cloudflare D1 (SQLite based, edge relational database)
- **ORM / Query Builder:** Drizzle (Type-safe SQL query builder and ORM)

Other integrations (as required in the future):
- If authentication is needed, integrate Clerk.
- If email notifications are needed for human feedback processes, integrate Resend.
- For any blob/artifact storage, consider Cloudflare R2.

## 3. Database Schema Design

The storage model consists of two primary tables: one for events and one for human feedback.

### 3.1. Events Table

This table will store every event captured from a CLI run.

- id: INTEGER, Primary Key, Auto Increment
- conversation_id: TEXT, not null (serves as a trace id across events)
- event_type: TEXT, not null (e.g., "assistant_response", "spec_created", etc.)
- timestamp: DATETIME, not null
- data: JSON or TEXT, optional (to store additional metadata/artifacts associated with the event)

### 3.2. Feedback Table

This table stores feedback for events that require human evaluation.

- id: INTEGER, Primary Key, Auto Increment
- event_id: INTEGER, foreign key to events(id), not null
- feedback_message: TEXT, not null
- submitted_at: DATETIME, not null
- status: TEXT, not null (e.g., "pending", "approved", "rejected")

## 4. API Endpoints

The API endpoints are grouped based on their functionality: event logging and human feedback submission/retrieval.

### 4.1. Event Endpoints

#### POST /api/events
- Description: Accepts and records an event from the CLI with data regarding the conversation, event type, and additional artifacts.
- Expected Payload:
  {
    "conversation_id": "<unique-trace-id>",
    "event_type": "assistant_response" | "spec_created" | "schema_created" | "api_file_created" | "other_event",
    "timestamp": "<ISO-8601 timestamp>",
    "data": { /* arbitrary key-value data */ }
  }

#### GET /api/events
- Description: Retrieve a list of events, optionally filtered by conversation_id or event_type.
- Query Parameters (optional):
  - conversation_id: Filter by conversation trace id
  - event_type: Filter by type of event

### 4.2. Feedback Endpoints

#### POST /api/feedback
- Description: Records human feedback for a given event that requires evaluation.
- Expected Payload:
  {
    "event_id": <event identifier>,
    "feedback_message": "Feedback over the event details",
    "status": "pending" | "approved" | "rejected",
    "submitted_at": "<ISO-8601 timestamp>"
  }

#### GET /api/feedback/pending
- Description: Retrieve events (and associated event data) that require human feedback and are pending evaluation.
- Query Parameters: Can include filters for date ranges or conversation ids as needed.

#### GET /api/feedback?event_id=<id>
- Description: Retrieve the feedback details associated with a specific event.

## 5. Additional Integrations

- Authentication: Although not required at initial setup, consider Clerk in the future if restricted access is needed.
- Email Notifications: Use Resend if there is a need to send notifications when feedback is submitted.
- Blob Storage: If the artifacts in events become large (e.g., files, extensive logs), use Cloudflare R2.

## 6. Future Considerations

- Rate Limiting: Implement rate limiting to manage CLI submissions and avoid abuse.
- Enhanced Query Capabilities: Add support for filtering and sorting events and feedback based on additional criteria.
- Analytics: Generate aggregated metrics from the stored events for insights into CLI behavior.
- Security Improvements: Enforce API key verification or token-based access if the API is exposed publicly.
- Schema Versioning: Allow versioning of event data in case there are changes in event structures in future iterations.

## 7. Further Reading & References

- Cloudflare Workers documentation
- Hono.js API framework docs
- Cloudflare D1 and Drizzle ORM docs

This specification provides an implementation blueprint for an API that logs CLI event data and handles human feedback submissions. The provided endpoints and database schema will allow for robust handling of conversation trace events, permitting future scalability and integration with additional services as needed.