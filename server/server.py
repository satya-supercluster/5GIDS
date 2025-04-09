from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import asyncio
import random
from datetime import datetime

# Load Model and Scaler
model = tf.keras.models.load_model("./neural_net_model.keras")
scaler = joblib.load("./scaler.pkl")

# Load Test Data
df = pd.read_csv("../dataset/TestData2.csv")
X_test = df.iloc[:, 1:-1].values
y_test = df.iloc[:, -1].values

# Feature names
feature_names = [
    "Seq", "Dur", "sHops", "dHops", "SrcPkts", "TotBytes", 
    "SrcBytes", "Offset", "sMeanPktSz", "dMeanPktSz", "TcpRtt", 
    "AckDat", "sTtl_", "dTtl_", "Proto_tcp", "Proto_udp", 
    "Cause_Status", "State_INT"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections = set()

@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            sample = random.choice(X_test[y_test == 0])
            scaled = scaler.transform(sample.reshape(1, -1))
            prediction = model.predict(scaled)[0][0]
            
            await websocket.send_json({
                "timestamp": datetime.now().isoformat(),
                "probability": float(prediction),
                "anomaly": float(prediction > 0.9),
                "sample": sample.tolist(),
                "features": dict(zip(feature_names, sample))
            })
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        active_connections.discard(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.discard(websocket)

@app.post("/introduce_anomaly")
async def introduce_anomaly():
    anomaly_indices = np.where(y_test == 1)[0]
    if not anomaly_indices.size:
        return {"error": "No anomalies found"}
    
    sample = X_test[random.choice(anomaly_indices)]
    scaled = scaler.transform(sample.reshape(1, -1))
    prediction = model.predict(scaled)[0][0]
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "probability": float(prediction),
        "anomaly": 1.0,
        "sample": sample.tolist(),
        "features": dict(zip(feature_names, sample))
    }
    
    for conn in active_connections:
        await conn.send_json(result)
    return result