import sys
from pathlib import Path

# Add project root to sys.path
root_path = str(Path(__file__).resolve().parent.parent)
if root_path not in sys.path:
    sys.path.insert(0, root_path)

import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from backend.config import settings
    from backend.database import db_manager
    from backend.seed import seed_database
    from backend.agent import agent_orchestrator, AgentRunRequest, AgentRunResponse, RemediationRequest
except ImportError:
    from config import settings
    from database import db_manager
    from seed import seed_database
    from agent import agent_orchestrator, AgentRunRequest, AgentRunResponse, RemediationRequest

logger = logging.getLogger("backlot.main")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize schema and ensure sample data exists
    logger.info("Starting up Backlot Backend...")
    db_manager.init_schema()
    
    # Check if database has records; if not, seed automatically
    existing_logs = db_manager.get_all_logs(limit=5)
    if not existing_logs:
        logger.info("No render logs found in database. Automatically generating initial seed dataset...")
        seed_database(clear_existing=False)
    else:
        logger.info(f"Database contains existing records ({len(existing_logs)}+ checked). Ready.")
    
    yield
    logger.info("Shutting down Backlot Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Agentic Workflow Engine for Media Production & Render Farms powered by Gemini and ClickHouse",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "project": "Backlot OS",
        "purpose": "Autonomous Agentic AI Workflow for Media & Entertainment Render Farms",
        "hackathon": "Google Cloud Summer Blockbuster Hackathon",
        "powered_by": ["Google Gemini", "Google Cloud", "ClickHouse"],
        "status": "ONLINE",
        "version": settings.VERSION,
        "endpoints": {
            "health": "/api/health",
            "telemetry_stats": "/api/telemetry/stats",
            "scene_breakdown": "/api/telemetry/scenes",
            "render_logs": "/api/telemetry/logs",
            "seed_data": "POST /api/telemetry/seed",
            "run_agent": "POST /api/agent/run"
        }
    }


@app.get("/api/health")
async def health_check():
    all_logs = db_manager.get_all_logs(limit=1)
    return {
        "status": "HEALTHY",
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key"),
            "model": agent_orchestrator.model_name or settings.GEMINI_MODEL,
            "mode": "LIVE_API" if agent_orchestrator.client else "DETERMINISTIC_ENGINE"
        },
        "clickhouse": {
            "is_connected_to_remote": db_manager.is_connected_to_remote,
            "host": settings.CLICKHOUSE_HOST,
            "port": settings.CLICKHOUSE_PORT,
            "database": settings.CLICKHOUSE_DATABASE,
            "mode": "CLICKHOUSE_CLOUD_NATIVE" if db_manager.is_connected_to_remote else "IN_MEMORY_SIMULATION"
        },
        "database_ready": True,
        "has_records": len(all_logs) > 0
    }


@app.get("/api/telemetry/stats")
async def get_telemetry_stats():
    """Aggregated stats from ClickHouse (Total Frames Rendered, Average Render Time, Total Cost, Failure Rate)."""
    sql = """
    SELECT 
        count(*) as total_frames,
        avg(render_time_ms) as avg_render_time_ms,
        sum(cost_usd) as total_cost_usd,
        countIf(status = 'HIGH_LATENCY' OR status = 'BOTTLENECK' OR render_time_ms > 25000) as high_latency_frames,
        countIf(status = 'FAILED') as failed_frames
    FROM render_logs
    """
    res = db_manager.execute_query(sql)
    
    if res.get("rows") and len(res["rows"]) > 0:
        row = res["rows"][0]
        total_frames = int(row[0]) if row[0] else 0
        avg_render_ms = float(row[1]) if row[1] else 0.0
        total_cost = float(row[2]) if row[2] else 0.0
        high_latency = int(row[3]) if row[3] else 0
        failed = int(row[4]) if row[4] else 0
    else:
        total_frames, avg_render_ms, total_cost, high_latency, failed = 0, 0.0, 0.0, 0, 0

    failure_rate_pct = round((failed / max(total_frames, 1)) * 100, 2)
    latency_anomaly_rate = round((high_latency / max(total_frames, 1)) * 100, 2)

    return {
        "total_frames": total_frames,
        "avg_render_time_ms": round(avg_render_ms, 1),
        "avg_render_time_sec": round(avg_render_ms / 1000.0, 2),
        "total_cost_usd": round(total_cost, 2),
        "high_latency_frames": high_latency,
        "failed_frames": failed,
        "failure_rate_pct": failure_rate_pct,
        "anomaly_rate_pct": latency_anomaly_rate,
        "active_worker_nodes": 12,
        "query_metadata": {
            "engine": res.get("engine"),
            "latency_ms": res.get("execution_time_ms")
        }
    }


@app.get("/api/telemetry/scenes")
async def get_scene_telemetry():
    """Returns scene-by-scene telemetry analytics from ClickHouse."""
    sql = """
    SELECT 
        scene_name,
        count(*) as total_frames,
        avg(render_time_ms) as avg_render_time_ms,
        sum(cost_usd) as total_cost_usd,
        countIf(status = 'HIGH_LATENCY' OR status = 'BOTTLENECK' OR render_time_ms > 25000) as high_latency_count
    FROM render_logs
    GROUP BY scene_name
    """
    res = db_manager.execute_query(sql)
    scenes = []
    for r in res.get("rows", []):
        scenes.append({
            "scene_name": r[0],
            "total_frames": int(r[1]),
            "avg_render_time_ms": round(float(r[2]), 1),
            "avg_render_time_sec": round(float(r[2]) / 1000.0, 2),
            "total_cost_usd": round(float(r[3]), 2),
            "high_latency_count": int(r[4]),
            "status": "CRITICAL_BOTTLENECK" if int(r[4]) > 15 else ("MODERATE_LATENCY" if int(r[4]) > 5 else "OPTIMAL")
        })
    return {"scenes": scenes, "query_metadata": {"engine": res.get("engine"), "latency_ms": res.get("execution_time_ms")}}


@app.get("/api/telemetry/logs")
async def get_render_logs(
    limit: int = Query(50, ge=1, le=500),
    scene: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Retrieves live render logs for data exploration grid."""
    logs = db_manager.get_all_logs(limit=limit, scene_filter=scene, status_filter=status)
    return {"total": len(logs), "logs": logs}


@app.post("/api/telemetry/seed")
async def seed_data():
    """Trigger manual re-seeding of ClickHouse render logs."""
    count = seed_database(clear_existing=True)
    return {
        "status": "SUCCESS",
        "message": f"Successfully initialized schema and seeded {count} VFX render logs.",
        "records_count": count
    }


@app.post("/api/agent/run", response_model=AgentRunResponse)
async def run_agent(request: AgentRunRequest):
    """Dispatches the Multi-Step Gemini + ClickHouse Autonomous Agent workflow."""
    try:
        response = agent_orchestrator.run_workflow(
            prompt=request.prompt,
            scene_filter=request.scene_filter,
            episode_filter=request.episode_filter
        )
        return response
    except Exception as e:
        logger.exception("Agent run error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/remediate")
async def remediate_directive(request: RemediationRequest):
    """Dispatches automated one-click remediation to ClickHouse and GCP cluster."""
    try:
        result = agent_orchestrator.execute_remediation(request)
        return result
    except Exception as e:
        logger.exception("Remediation execution error")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
