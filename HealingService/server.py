from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain.llms import LlamaCpp
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import guardrails as gr
import json
import ast

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


llm= None
MODEL_PATH= "./Phi-3-mini-4k-instruct-q4.gguf"

if os.path.exists(MODEL_PATH):
    try:
        llm = LlamaCpp(
            model_path=MODEL_PATH,
            n_gpu_layers=-1,
            max_tokens=500,
            n_ctx=2048,
            seed=42,
            verbose=True
        )
    except Exception as e:
        print(f"Failed to load model: {str(e)}")    
        
else:
    print("Model file not found")

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



@app.get("/")
async def root():
    return {"message": "LLM Healing Server Running"}

@app.get("/heal")
async def heal(anomaly: str = Query(..., description="Observed 5G anomaly traffic data")):
    if title_chain is None:
        return {"error": "LLM model failed to load. Please check the model path."}

    try:
        llm_response = title_chain.invoke(input=anomaly)
        raw = llm_response.get("heal")
        try:
            if isinstance(raw, dict):
                data = raw
            elif isinstance(raw, str):
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    data = ast.literal_eval(raw)
            else:
                raise TypeError(f"Unexpected type: {type(raw)}")

        except Exception as parse_err:
            return {
                "raw_output": raw,
            }

        mitigation_str = data.get("mitigation_strategy")
        if not isinstance(mitigation_str, str):
            return {"error": "mitigation_strategy field is missing or not a string", "data": data}

        validated = guard.parse({"llm_output": mitigation_str})
        return {"mitigation_strategy": validated.llm_output.strip()}

    except Exception as e:
        return {"error": f"LLM processing failed: {str(e)}"}


# Run using: uvicorn server:app --host 0.0.0.0 --port 8080 --reload