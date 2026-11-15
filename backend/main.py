from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/questions")
def get_questions():
    try:
        with open("questions.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.post("/api/submit")
async def submit_quiz(request: Request):
    data = await request.json()
    name = data.get("name", "Unknown")
    domain = data.get("domain", "Unknown Domain")
    score = data.get("score", 0)
    total = data.get("total", 0)
    
    log_entry = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Name: {name} | Domain: {domain} | Score: {score}/{total}\n"
    
    with open("quiz_logs.txt", "a") as f:
        f.write(log_entry)
        
    return {"status": "success"}
