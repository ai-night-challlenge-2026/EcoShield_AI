import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import redis from "./redis";
import type {
  sensorData,
  processedSensorData,
  sensorDataBatch,
  sensorGroup,
  optimizerInput,
  optimizerOutput,
} from "./types";

const OPTIMIZER_API_URL =
  process.env.OPTIMIZER_API_URL || "http://localhost:8002";

const REDIS_KEY = "sensor:buffer";
const BUFFER_SIZE = 25; // 5 ticks × 5 sensors
const GROUP_SIZE = 5;   // sensors per tick

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
}

function timeOfDay(hour: number): string {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Step 1: Generate 5 sensorData objects for the current tick ────────────────

function generateSensorData(): sensorData[] {
  const timestamp = new Date().toISOString();
  return Array.from({ length: GROUP_SIZE }, () => ({
    id: uuidv4(),
    timestamp,
    pressure:    rand(2.0, 5.0),
    flow_rate:   rand(10.0, 25.0),
    temperature: rand(18.0, 35.0),
    pump_power:  rand(20.0, 90.0),
  }));
}

// ── Step 2: Enrich sensorData → processedSensorData ──────────────────────────

function enrich(data: sensorData): processedSensorData {
  const date = new Date(data.timestamp);
  return {
    ...data,
    time_of_day: timeOfDay(date.getHours()),
    day_of_week: DAYS[date.getDay()],
    month:       MONTHS[date.getMonth()],
  };
}

// ── Step 3: Push enriched readings into Redis buffer ─────────────────────────

async function pushToRedis(readings: processedSensorData[]): Promise<void> {
  const pipeline = redis.pipeline();
  for (const r of readings) {
    pipeline.rpush(REDIS_KEY, JSON.stringify(r));
  }
  await pipeline.exec();
}

// ── Step 4: Try to build optimizerInput from the buffer ──────────────────────

async function buildOptimizerInput(): Promise<optimizerInput | null> {
  const len = await redis.llen(REDIS_KEY);
  if (len < BUFFER_SIZE) {
    console.log(`[pipeline] buffer at ${len}/${BUFFER_SIZE} — waiting`);
    return null;
  }

  // Read the latest 25 readings
  const raw = await redis.lrange(REDIS_KEY, 0, BUFFER_SIZE - 1);

  // Slide: drop the oldest GROUP_SIZE entries so next tick we read fresh window
  await redis.ltrim(REDIS_KEY, GROUP_SIZE, -1);

  const readings: processedSensorData[] = raw.map((r) => JSON.parse(r));

  // Group into 5 chunks of 5 (each chunk = one tick / one sensorGroup)
  const groups: processedSensorData[][] = [];
  for (let i = 0; i < BUFFER_SIZE; i += GROUP_SIZE) {
    groups.push(readings.slice(i, i + GROUP_SIZE));
  }

  // Build 5 sensorGroups
  const sensorGroups = groups.map((group): sensorGroup => {
    const pressures = group.map((r) => r.pressure);
    const mean = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const variance =
      pressures.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      pressures.length;

    const batches = group.map((r): sensorDataBatch => ({
      ...r,
      pressure_mean: parseFloat(mean.toFixed(6)),
      pressure_var:  parseFloat(variance.toFixed(6)),
    }));

    return batches as unknown as sensorGroup;
  });

  return sensorGroups as unknown as optimizerInput;
}

// ── Step 5: Call the optimizer model ─────────────────────────────────────────

async function callOptimizer(input: optimizerInput): Promise<optimizerOutput> {
  const response = await axios.post<optimizerOutput>(
    `${OPTIMIZER_API_URL}/predict`,
    input,
    { timeout: 5000 }
  );
  return response.data;
}

// ── Main pipeline entry point ─────────────────────────────────────────────────

export async function runPipeline(): Promise<void> {
  try {
    // 1. Generate raw sensor readings
    const raw = generateSensorData();
    console.log(`[pipeline] generated ${raw.length} sensor readings at ${raw[0].timestamp}`);

    // 2. Enrich to processedSensorData
    const enriched = raw.map(enrich);

    // 3. Push to Redis buffer
    await pushToRedis(enriched);

    // 4. Try to build optimizer input (returns null if buffer < 25)
    const input = await buildOptimizerInput();
    if (!input) return;

    console.log("[pipeline] buffer ready — calling optimizer...");

    // 5. Call optimizer
    const result = await callOptimizer(input);
    console.log(`[pipeline] optimizer result → pump_power_optimized: ${result.pump_power_optimized} kW`);

  } catch (err: any) {
    console.error("[pipeline] error:", err?.message ?? err);
  }
}
