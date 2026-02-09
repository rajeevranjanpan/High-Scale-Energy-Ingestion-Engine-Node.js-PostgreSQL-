-- Mapping between vehicle and meter
CREATE TABLE IF NOT EXISTS fleet_links (
  vehicle_id TEXT PRIMARY KEY,
  meter_id TEXT NOT NULL UNIQUE
);

-- HOT tables (Operational Store)
CREATE TABLE IF NOT EXISTS vehicle_live_status (
  vehicle_id TEXT PRIMARY KEY,
  soc INT NOT NULL,
  kwh_delivered_dc NUMERIC(12, 4) NOT NULL,
  battery_temp NUMERIC(6, 2) NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS meter_live_status (
  meter_id TEXT PRIMARY KEY,
  kwh_consumed_ac NUMERIC(12, 4) NOT NULL,
  voltage NUMERIC(8, 2) NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL
);

-- COLD tables (History Store)
CREATE TABLE IF NOT EXISTS vehicle_telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  soc INT NOT NULL,
  kwh_delivered_dc NUMERIC(12, 4) NOT NULL,
  battery_temp NUMERIC(6, 2) NOT NULL,
  ts TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS meter_telemetry (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  kwh_consumed_ac NUMERIC(12, 4) NOT NULL,
  voltage NUMERIC(8, 2) NOT NULL,
  ts TIMESTAMPTZ NOT NULL
);

-- Indexes for fast analytics (NO full scan)
CREATE INDEX IF NOT EXISTS idx_vehicle_telemetry_vehicle_ts
  ON vehicle_telemetry(vehicle_id, ts DESC);

CREATE INDEX IF NOT EXISTS idx_meter_telemetry_meter_ts
  ON meter_telemetry(meter_id, ts DESC);

-- Optional: idempotency (avoid duplicates per minute)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vehicle_minute
  ON vehicle_telemetry(vehicle_id, ts);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_meter_minute
  ON meter_telemetry(meter_id, ts);
