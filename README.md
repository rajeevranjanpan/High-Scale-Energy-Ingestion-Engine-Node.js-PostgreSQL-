# High-Scale Energy Ingestion Engine (Node.js + PostgreSQL)

## Overview

This project implements the core ingestion layer for a high-scale Fleet platform managing 10,000+ Smart Meters and EV Fleets. The system consumes two independent telemetry streams arriving every 60 seconds, persists them using a hot/cold PostgreSQL storage strategy, correlates the streams using a mapping table, and exposes a fast analytics endpoint for 24-hour performance insights.

Although the assignment mentions NestJS (TypeScript), this implementation is built using Node.js (Express) to match the developer’s current skill set while maintaining a clean layered architecture similar to NestJS (routes → controllers → services → validators).

A Postman collection is included for easy API testing.

---

## Domain Context

The system ingests telemetry from two hardware sources:

### Smart Meter (Grid Side)
- Measures AC (Alternating Current) pulled from the grid.
- Reports `kwhConsumedAc`, representing total energy billed to the fleet owner.

Payload format:
```json
{
  "meterId": "m-101",
  "kwhConsumedAc": 10.5,
  "voltage": 229.2,
  "timestamp": "2026-02-09T10:20:00Z"
}
````

### EV + Charger (Vehicle Side)

* Charger converts AC to DC for the battery.
* Vehicle reports `kwhDeliveredDc` (energy stored) and `soc` (battery percentage).

Payload format:

```json
{
  "vehicleId": "v-900",
  "soc": 55,
  "kwhDeliveredDc": 8.9,
  "batteryTemp": 35.2,
  "timestamp": "2026-02-09T10:20:00Z"
}
```

### Power Loss Thesis

AC consumed is always higher than DC delivered due to conversion losses. A drop in efficiency (for example below 85%) may indicate hardware faults or energy leakage.

This project calculates efficiency using:

```
efficiency = totalDcDelivered / totalAcConsumed
```

---

## Functional Requirements Coverage

### 1. Polymorphic Ingestion

A single ingestion endpoint is implemented:

* `POST /v1/telemetry`

The ingestion controller automatically detects telemetry type:

* If payload contains `meterId`, it is treated as meter telemetry.
* If payload contains `vehicleId`, it is treated as vehicle telemetry.

Both payload types are validated using manual validation (no external validation library).

---

### 2. Data Strategy (PostgreSQL Hot vs Cold)

The database schema follows the required hot/cold separation.

#### Cold Store (Historical Tables)

Append-only storage optimized for long-term reporting and audit trails:

* `meter_telemetry`
* `vehicle_telemetry`

These tables store every 60-second reading.

#### Hot Store (Operational Tables)

Up-to-date current state optimized for dashboards and fast reads:

* `meter_live_status`
* `vehicle_live_status`

These tables store only the latest state per device.

---

### 3. Persistence Logic: Insert vs Upsert

The project uses correct write strategies based on data temperature:

#### History Path (Cold)

* Uses `INSERT` (append-only)
* Stores every telemetry event for reporting

#### Live Path (Hot)

* Uses `UPSERT` (`INSERT ... ON CONFLICT DO UPDATE`)
* Stores only the latest state for each meter/vehicle
* Prevents scanning historical tables for "latest status"

---

### 4. Vehicle ↔ Meter Correlation (Mapping)

A dedicated mapping table is implemented:

* `fleet_links`

This stores the relationship between a vehicle and its meter.

APIs included:

* `POST /v1/links` (create/upsert mapping)
* `GET /v1/links/:vehicleId` (get mapping for a vehicle)
* `GET /v1/links` (list all mappings)

This mapping is required for analytics because meter telemetry and vehicle telemetry arrive independently.

---

### 5. Analytical Endpoint

Implemented endpoint:

* `GET /v1/analytics/performance/:vehicleId`

It returns a 24-hour summary including:

* Total AC energy consumed
* Total DC energy delivered
* Efficiency ratio (DC/AC)
* Average battery temperature

The analytics query correlates data using:

* Vehicle telemetry (DC delivered, battery temperature)
* Meter telemetry (AC consumed)
* Mapping table (`fleet_links`) to find the correct meterId for the vehicleId

---

## Performance Considerations

### High-Scale Assumption

With 10,000 devices sending telemetry every minute:

* 10,000 * 60 * 24 = 14.4 million records per day

### Why This Design Scales

1. Historical tables are append-only

   * Inserts are fast in PostgreSQL
   * No heavy updates on large tables

2. Live tables remain small

   * One row per meter
   * One row per vehicle
   * Dashboard reads are constant time

3. Analytics is time-bounded

   * Queries are restricted to the last 24 hours
   * Prevents full table scans of long-term history

4. Correlation is efficient

   * Uses a direct vehicleId → meterId mapping table
   * Avoids expensive joins across unrelated devices

---

## Technology Stack

* Node.js (Express)
* PostgreSQL
* Docker + Docker Compose
* Jest + Supertest for API tests

---

## Running the Project

### 1. Start the system

```bash
docker-compose up --build
```

### 2. Run tests

```bash
npm test
```

---

## API Summary

### Health

* `GET /health`

### Telemetry Ingestion

* `POST /v1/telemetry`

### Vehicle ↔ Meter Mapping

* `POST /v1/links`
* `GET /v1/links/:vehicleId`
* `GET /v1/links`

### Analytics

* `GET /v1/analytics/performance/:vehicleId`

---

## Postman Collection

A Postman collection is included in the repository to test all APIs easily, including:

* Health check
* Link creation
* Meter telemetry ingestion
* Vehicle telemetry ingestion
* Analytics performance query

---

## Notes

This implementation intentionally avoids external validation libraries and uses manual validation to keep the ingestion layer explicit and easy to understand. The project structure follows a clean service-based backend architecture, making it easy to migrate to NestJS/TypeScript if required.


## Author
```
Rajeev Ranjan Pan
```
