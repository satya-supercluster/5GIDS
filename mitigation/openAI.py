from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import requests
import os
from typing import Dict, Any
import uvicorn
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("openAI")

# Initialize FastAPI app
app = FastAPI(title="5G Network Intrusion Mitigation Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get OpenAI API Key
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    logger.warning("OPENAI_API_KEY not found in environment variables.")

def get_ai_mitigation(features: Dict[str, Any]) -> str:
    prompt = f"""
    As a 5G network security expert, analyze the following anomalous network traffic features and recommend mitigation actions:
    
    {json.dumps(features, indent=2)}
    
    Based on these features, provide:
    1. A clear analysis of what type of attack or anomaly this likely represents
    2. Specific countermeasures to mitigate this threat
    3. Steps to prevent similar incidents in the future
    
    Format your response as a concise but detailed technical recommendation.
    """

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a 5G network security expert specializing in intrusion detection and mitigation."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            logger.error(f"API request failed ({response.status_code}): {response.text}")
            return f"Error: OpenAI API returned status {response.status_code}"

    except Exception as e:
        logger.error(f"Exception during mitigation generation: {str(e)}")
        return f"Error: {str(e)}"

@app.get("/heal")
async def get_mitigation(anomaly: str = Query(...)):
    try:
        features = json.loads(anomaly)
        logger.info(f"Received anomaly features: {features}")
        mitigation = get_ai_mitigation(features)
        return mitigation
    except json.JSONDecodeError:
        logger.error("Invalid JSON in 'anomaly' query parameter.")
        return "Error: Invalid anomaly data format"
    except Exception as e:
        logger.error(f"Error handling request: {str(e)}")
        return f"Error: {str(e)}"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("openAI:app", host="0.0.0.0", port=port, reload=True)
