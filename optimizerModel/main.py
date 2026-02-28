import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="EcoShield Optimizer Model")


# ── Pydantic schemas (mirror of backend/src/lib/types.ts) ────────────────────

# sensorDataBatch — mirrors types.ts sensorDataBatch
class SensorDataBatch(BaseModel):
    id: str
    timestamp: str
    pressure: float
    flow_rate: float
    temperature: float
    pump_power: float
    time_of_day: str
    day_of_week: str
    month: str
    pressure_mean: float
    pressure_var: float


# optimizerOutput — mirrors types.ts optimizerOutput
class OptimizerOutput(BaseModel):
    pump_power_optimized: float


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=OptimizerOutput)
def predict(payload: list[list[SensorDataBatch]]) -> OptimizerOutput:
    """
    Mock pump power optimizer.
    Accepts optimizerInput: a 5x5 array of SensorDataBatch (5 sensorGroups,
    each group being 5 readings). Returns a realistic random optimized pump
    power value — Gaussian(mu=40, sigma=15) clamped to [5.0, 100.0] kW.
    """
    if len(payload) != 5 or any(len(group) != 5 for group in payload):
        raise HTTPException(
            status_code=422,
            detail="Expected exactly 5 sensorGroups each with 5 SensorDataBatch readings",
        )

    optimized = random.gauss(mu=40.0, sigma=15.0)
    optimized = round(max(5.0, min(100.0, optimized)), 2)
    return OptimizerOutput(pump_power_optimized=optimized)
