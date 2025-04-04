# Plant Analytics API Specification

This document outlines the design and implementation plan for an API that accepts analytics events from monitored plants. The API is intended to record a variety of events including environmental conditions (temperature, humidity, light intensity, soil moisture, CO2 levels) and plant growth metrics (plant height, leaf count, flower count, fruit count, stem diameter) associated with multiple plants and locations. Additionally, the API will include endpoints to manage metadata for plants and locations. The system will be built on Cloudflare Workers using Hono.js as the API framework, with Cloudflare D1 (using Drizzle ORM) for data persistence. UUIDs will be used for unique identifiers across entities.

---

## 1. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based API framework)
- **Database:** Cloudflare D1 (SQLite-based) with Drizzle ORM for type-safe queries
- **Authentication:** Clerk (to secure metadata management endpoints, if required)

---

## 2. Database Schema Design

We will design three primary tables: Plants, Locations, and Events. Each will use a UUID as a primary key (or unique identifier).

### 2.1. Plants Table

- id (UUID, Primary Key)
- name (TEXT, required)
- description (TEXT, optional)
- created_at (DATETIME, automatically set at insertion)

### 2.2. Locations Table

- id (UUID, Primary Key)
- name (TEXT, required)
- description (TEXT, optional)
- latitude (REAL, optional)
- longitude (REAL, optional)
- created_at (DATETIME, automatically set at insertion)

### 2.3. Events Table

This table records the analytics events from the monitored plants. It includes a type discriminator field (either 'environmental' or 'growth') and nullable columns for metrics that don’t apply to certain event types.

- id (INTEGER, Primary Key, Auto Increment or UUID if preferred)
- timestamp (DATETIME, provided or default to event receipt time)
- plant_id (UUID, Foreign Key referencing Plants.id)
- location_id (UUID, Foreign Key referencing Locations.id)
- event_type (TEXT, ENUM-like value; e.g., 'environmental', 'growth')

-- Metrics for Environmental Conditions (nullable for non-environmental events):
   - temperature (REAL, nullable)
   - humidity (REAL, nullable)
   - light_intensity (REAL, nullable)
   - soil_moisture (REAL, nullable)
   - co2 (REAL, nullable)

-- Metrics for Plant Growth (nullable for non-growth events):
   - plant_height (REAL, nullable)
   - leaf_count (INTEGER, nullable)
   - flower_count (INTEGER, nullable)
   - fruit_count (INTEGER, nullable)
   - stem_diameter (REAL, nullable)

- created_at (DATETIME, automatically set at insertion)

---

## 3. API Endpoints

The API endpoints can be grouped into two main categories: metadata management (for plants and locations) and event ingestion.

### 3.1. Plant Metadata Endpoints

- **POST /plants**
  - Description: Create a new plant record.
  - Expected Payload:
    {
      "id": "[UUID]",  // or auto-generated
      "name": "Plant A",
      "description": "Description about Plant A"
    }

- **GET /plants**
  - Description: Retrieve a list of all plant records. Supports filtering if needed.
  - Query Params: Optional filters (e.g., name)

- **GET /plants/:id**
  - Description: Retrieve detailed information about a single plant.

- **PUT /plants/:id**
  - Description: Update metadata for a given plant.
  - Expected Payload: Fields to update (e.g., name, description).

- **DELETE /plants/:id**
  - Description: Remove a plant record if necessary.

### 3.2. Location Metadata Endpoints

- **POST /locations**
  - Description: Create a new location record.
  - Expected Payload:
    {
      "id": "[UUID]",
      "name": "Greenhouse 1",
      "description": "Main greenhouse location",
      "latitude": 40.7128,
      "longitude": -74.0060
    }

- **GET /locations**
  - Description: Retrieve a list of location records.
  - Query Params: Optional filtering (e.g., name)

- **GET /locations/:id**
  - Description: Retrieve detailed information about a single location.

- **PUT /locations/:id**
  - Description: Update the metadata for a given location.

- **DELETE /locations/:id**
  - Description: Delete a location record if necessary.

### 3.3. Analytics Events Endpoints

- **POST /events**
  - Description: Accept an analytics event from a plant. The endpoint expects a payload including plant_id and location_id as UUIDs, an event_type ("environmental" or "growth"), and the respective metrics.
  - Expected Payload Examples:

    **Environmental Event:**
    {
      "timestamp": "2023-10-10T12:00:00Z",
      "plant_id": "[UUID]",
      "location_id": "[UUID]",
      "event_type": "environmental",
      "temperature": 22.5,
      "humidity": 60,
      "light_intensity": 350,
      "soil_moisture": 45,
      "co2": 400
    }

    **Plant Growth Event:**
    {
      "timestamp": "2023-10-10T12:05:00Z",
      "plant_id": "[UUID]",
      "location_id": "[UUID]",
      "event_type": "growth",
      "plant_height": 15.0,
      "leaf_count": 8,
      "flower_count": 2,
      "fruit_count": 1,
      "stem_diameter": 3.5
    }

- **GET /events**
  - Description: Retrieve a list of events. Supports query parameters for filtering by plant_id, location_id, event_type, and date ranges.
  - Query Params: plant_id, location_id, event_type, start_date, end_date

---

## 4. Integrations

- **Clerk (Authentication):** Secure endpoints for metadata management (create/update/delete for plants and locations) ensuring that only authorized users can modify metadata.

- **Analytics Clients:** External devices or systems will push analytics data (both environmental and growth events) using the event ingestion endpoint.

*(No email, blob storage, or realtime updates integrations are required at this stage.)*

---

## 5. Additional Notes

- The API should perform validation for all incoming data. For example, ensure that numerical fields are within expected ranges and that UUIDs are properly formatted.
- Consider adding middleware in Hono.js for error handling and logging.
- The API might also include pagination for GET endpoints if the volume of data grows large.
- Implement rate limiting to prevent abuse of the event ingestion endpoint.

---

## 6. Future Considerations

- Add more granular permissions based on user roles when using Clerk for metadata changes.
- Implement realtime updates or notifications for particular events using Cloudflare Durable Objects.
- Explore analytics or dashboards to visualize trends in plant health based on the analytics events.
- Consider separating event types into different tables to optimize query performance if data volume becomes very large.
- Future enhancements might include an aggregation layer or scheduled jobs for data summarization.

---

## 7. Further Reading

- Cloudflare Workers Documentation
- Hono.js API Framework Documentation
- Cloudflare D1 & Drizzle ORM Integration Guides
- Clerk Integration for Serverless Environments

This implementation plan provides the necessary high-level guidance to build and deploy the Plant Analytics API. The details provided herein should be sufficient for an experienced developer to get started on the project.