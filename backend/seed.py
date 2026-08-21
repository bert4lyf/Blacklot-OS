import sys
from pathlib import Path

# Add project root to sys.path if not present
root_path = str(Path(__file__).resolve().parent.parent)
if root_path not in sys.path:
    sys.path.insert(0, root_path)

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, TypedDict

try:
    from backend.database import db_manager
except ImportError:
    from database import db_manager

class SceneMeta(TypedDict):
    episode: str
    scene_name: str
    sequence_id: str
    frame_count: int
    base_render_time: int
    variance: int
    anomaly_rate: float
    anomaly_type: str
    worker_pool: List[str]

SCENES_METADATA: List[SceneMeta] = [
    {
        "episode": "Ep 3",
        "scene_name": "Ep3_Sc04_DragonFlight",
        "sequence_id": "SEQ-304",
        "frame_count": 80,
        "base_render_time": 18000,
        "variance": 12000,
        "anomaly_rate": 0.22,
        "anomaly_type": "VOLUMETRIC_PYRO_SPIKE",
        "worker_pool": ["node-gpu-a100-01", "node-gpu-a100-02", "node-gpu-l4-05"]
    },
    {
        "episode": "Ep 3",
        "scene_name": "Ep3_Sc12_DeepSpaceBattle",
        "sequence_id": "SEQ-312",
        "frame_count": 90,
        "base_render_time": 24000,
        "variance": 15000,
        "anomaly_rate": 0.28,
        "anomaly_type": "VRAM_THRASHING_NEBULA",
        "worker_pool": ["node-gpu-h100-01", "node-gpu-a100-03", "node-gpu-a100-04"]
    },
    {
        "episode": "Ep 4",
        "scene_name": "Ep4_Sc01_CyberpunkCity",
        "sequence_id": "SEQ-401",
        "frame_count": 75,
        "base_render_time": 14000,
        "variance": 6000,
        "anomaly_rate": 0.12,
        "anomaly_type": "RAYTRACED_BOUNCE_OVERHEAD",
        "worker_pool": ["node-gpu-l4-01", "node-gpu-l4-02", "node-gpu-l4-03"]
    },
    {
        "episode": "Ep 4",
        "scene_name": "Ep4_Sc07_ExplosionFX",
        "sequence_id": "SEQ-407",
        "frame_count": 65,
        "base_render_time": 32000,
        "variance": 22000,
        "anomaly_rate": 0.35,
        "anomaly_type": "PARTICLE_COLLISION_STALL",
        "worker_pool": ["node-gpu-a100-05", "node-gpu-h100-02"]
    },
    {
        "episode": "Ep 2",
        "scene_name": "Ep2_Sc02_InteriorDialogue",
        "sequence_id": "SEQ-202",
        "frame_count": 50,
        "base_render_time": 4500,
        "variance": 1500,
        "anomaly_rate": 0.04,
        "anomaly_type": "TEXTURE_CACHE_MISS",
        "worker_pool": ["node-gpu-t4-01", "node-gpu-t4-02"]
    }
]

def generate_render_records() -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    base_time = datetime.now() - timedelta(hours=6)
    
    frame_counter = 1000
    for scene in SCENES_METADATA:
        ep = scene["episode"]
        sc_name = scene["scene_name"]
        seq = scene["sequence_id"]
        count: int = scene["frame_count"]
        workers: List[str] = scene["worker_pool"]
        base_render_time: int = scene["base_render_time"]
        variance: int = scene["variance"]
        anomaly_rate: float = scene["anomaly_rate"]
        anomaly_type: str = scene["anomaly_type"]
        
        for _ in range(1, count + 1):
            frame_counter += 1
            frame_id = f"FR-{frame_counter}"
            
            # Anomaly determination
            is_anomaly = random.random() < anomaly_rate
            is_failure = is_anomaly and random.random() < 0.20
            
            if is_failure:
                render_time_ms = random.randint(65000, 95000)
                status = "FAILED"
                tags = ["RENDER_FAILED", "RETRY_QUEUED"]
                error_type = anomaly_type
                gpu_util = round(random.uniform(96.0, 100.0), 1)
                vram_gb = round(random.uniform(76.0, 79.5), 1)
                mem_gb = round(random.uniform(115.0, 128.0), 1)
            elif is_anomaly:
                render_time_ms = base_render_time + random.randint(18000, 45000)
                status = "HIGH_LATENCY"
                tags = ["LATENCY_ANOMALY", "BOTTLENECK_DETECTED"]
                error_type = anomaly_type
                gpu_util = round(random.uniform(92.0, 99.0), 1)
                vram_gb = round(random.uniform(68.0, 78.0), 1)
                mem_gb = round(random.uniform(80.0, 110.0), 1)
            else:
                render_time_ms = max(1800, int(random.gauss(float(base_render_time), float(variance) / 3.0)))
                status = "COMPLETED"
                tags = ["OPTIMAL_PASS"]
                error_type = "NONE"
                gpu_util = round(random.uniform(60.0, 88.0), 1)
                vram_gb = round(random.uniform(18.0, 42.0), 1)
                mem_gb = round(random.uniform(32.0, 64.0), 1)
            
            # Cost calculation ($2.80/hour baseline GPU rate converted to ms)
            first_worker = workers[0] if workers else "node-gpu-a100"
            hourly_rate = 3.50 if "h100" in first_worker else (2.40 if "a100" in first_worker else 1.20)
            cost_usd = round((render_time_ms / 3600000.0) * hourly_rate, 4)
            
            # Timestamp staggered over past 6 hours
            timestamp = base_time + timedelta(seconds=frame_counter * 14 + random.randint(0, 10))
            
            records.append({
                "frame_id": frame_id,
                "scene_name": sc_name,
                "episode": ep,
                "sequence_id": seq,
                "render_time_ms": render_time_ms,
                "cost_usd": cost_usd,
                "status": status,
                "tags": tags,
                "gpu_util_pct": gpu_util,
                "memory_gb": mem_gb,
                "vram_allocated_gb": vram_gb,
                "error_type": error_type,
                "worker_node": random.choice(workers),
                "created_at": timestamp
            })

    return records

def seed_database(clear_existing: bool = True) -> int:
    """Initializes schema and populates render_logs table with mock telemetry."""
    print("Initializing ClickHouse schema...")
    db_manager.init_schema()
    
    if clear_existing:
        db_manager.simulated_engine.clear_render_logs()
        
    records = generate_render_records()
    print(f"Generated {len(records)} realistic render farm log records. Inserting into database...")
    count = db_manager.insert_batch(records)
    print(f"Successfully seeded {count} render logs into database.")
    return count

if __name__ == "__main__":
    seed_database()
