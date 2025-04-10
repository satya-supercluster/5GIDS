from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain.llms import LlamaCpp
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import guardrails as gr

llm= None
MODEL_PATH= "D:/Intrusion_det/Healing Service/Phi-3-mini-4k-instruct-q4.gguf"

if os.path.exists(MODEL_PATH):
    try:
        # Load Phi-3 Model
        llm = LlamaCpp(
            model_path=MODEL_PATH,
            n_gpu_layers=-1,
            max_tokens=500,
            n_ctx=2048,
            seed=42,
            verbose=True  # Set to True for debugging, can be False in production
        )
    except Exception as e:
        print(f"Failed to load model: {str(e)}")    
        
else:
    print("Model file not found")



# Define Prompt Template
template = """<s><|user|>

You are an AI expert in 5G network security and intrusion detection.
Based on the observed 5G network traffic anomaly provided below, suggest one appropriate mitigation strategy.

Available strategies: 
1. Automated Traffic Blocking (Block IP)
2. Rate Limiting and Throttling
3. Sandbox Execution
4. Zero Trust Network Access

The anomaly traffic data is: 
[Seq,Dur,sHops,dHops,SrcPkts,TotBytes,SrcBytes,Offset,sMeanPktSz,dMeanPktSz,TcpRtt,AckDat,sTtl_,dTtl_,Proto_tcp,Proto_udp,Cause_Status,State_INT]

{anomaly}

Please only respond with the best suitable mitigation strategy from the list.

<|assistant|>"""
title_prompt = PromptTemplate(template=template, input_variables=["anomaly"])
title_chain = LLMChain(llm=llm, prompt=title_prompt, output_key="heal") if llm else None

# Define Guardrails RailSpec
rail_spec = """
<rail version="0.1">
    <output>
        <string 
            name="mitigation_strategy"
            description="The best-suited strategy for handling the anomaly."
            format="one_of"
            options="['Automated Traffic Blocking (Block IP)', 'Rate Limiting and Throttling', 'Sandbox Execution', 'Zero Trust Network Access']"
        />
    </output>
</rail>
"""

guard = gr.Guard.for_rail_string(rail_spec)

# Initialize FastAPI App
app = FastAPI()

# Add CORS Middleware for Cross-Origin Requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "LLM Healing Server Running"}

@app.get("/heal")
async def heal(anomaly: str = Query(..., description="Observed 5G anomaly traffic data")):
    if title_chain is None:
        return {"error": "LLM model failed to load. Please check the model path."}
    
    try:
        response = title_chain.invoke(input=anomaly)
        response_send= response["heal"]
        validated_response = guard.parse({"mitigation_strategy": response_send})
        return {"mitigation_strategy": validated_response.strip()}
    
    except gr.exceptions.ValidationError as ve:
        return {"error": "LLM returned an invalid response", "details": str(ve)}
    
    except Exception as e:
        return {"error": f"LLM processing failed: {str(e)}"}

# Run using: uvicorn server:app --host 0.0.0.0 --port 8080 --reload