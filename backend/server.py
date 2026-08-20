import os
import uuid
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
MODEL_PROVIDER = "openai"
MODEL_NAME = "gpt-5.4"

app = FastAPI(title="CareBridge AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RiskFactor(BaseModel):
    label: str
    points: int


class RiskExplanationReq(BaseModel):
    name: str
    age: int
    condition: str
    risk: int
    careScore: int
    riskFactors: List[RiskFactor] = []
    barriers: List[str] = []


class InterventionReq(BaseModel):
    name: str
    condition: str
    channel: str
    risk: int
    barriers: List[str] = []


class CareInsightReq(BaseModel):
    name: str
    condition: str
    careScore: int
    barriers: List[str] = []
    missedMedicines: int = 0
    pendingTasks: int = 0


async def run_llm(system: str, prompt: str) -> str:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message=system,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)
    try:
        reply = await chat.send_message(UserMessage(text=prompt))
        return reply.strip() if isinstance(reply, str) else str(reply)
    except Exception as e:  # surface a clean error to the client
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")


@app.get("/api/")
async def root():
    return {"status": "ok", "service": "carebridge-ai"}


@app.post("/api/ai/risk-explanation")
async def risk_explanation(req: RiskExplanationReq):
    system = (
        "You are CareBridge AI, a clinical decision-support assistant for hospital care teams. "
        "Explain patient drop-off (disengagement) risk in clear, compassionate, non-alarming language. "
        "Never give a diagnosis or change prescriptions. Frame everything as decision support. "
        "Respond in 2 short paragraphs: (1) why this patient is likely to disengage, "
        "(2) the single best next action for the care team. Keep under 130 words."
    )
    factors = ", ".join(f"{f.label} (+{f.points})" for f in req.riskFactors) or "none recorded"
    barriers = ", ".join(req.barriers) or "none reported"
    prompt = (
        f"Patient: {req.name}, age {req.age}, condition {req.condition}. "
        f"Drop-off risk {req.risk}%. Care continuity score {req.careScore}/100. "
        f"Risk signals: {factors}. Patient-reported barriers: {barriers}."
    )
    return {"text": await run_llm(system, prompt)}


@app.post("/api/ai/intervention-message")
async def intervention_message(req: InterventionReq):
    system = (
        "You are CareBridge AI. Write a warm, concise, personalised outreach message a care team "
        f"would send to a patient over {req.channel}. Address the patient by first name, reference their "
        "condition gently, acknowledge any barrier they reported, and offer a concrete helpful option "
        "(e.g. teleconsultation, reminder, assistance info). Do not give medical advice or change medication. "
        "Keep it under 60 words, friendly and human."
    )
    barriers = ", ".join(req.barriers) or "none reported"
    prompt = (
        f"Patient: {req.name}. Condition: {req.condition}. Channel: {req.channel}. "
        f"Drop-off risk: {req.risk}%. Reported barriers: {barriers}."
    )
    return {"text": await run_llm(system, prompt)}


@app.post("/api/ai/care-insight")
async def care_insight(req: CareInsightReq):
    system = (
        "You are CareBridge AI, speaking directly and kindly to a patient in the first person ('you'). "
        "Based on their care data, gently reflect back what might be making their care plan hard, "
        "then give 2-3 small, encouraging, practical suggestions. Warm and supportive, never clinical or scary. "
        "Do not diagnose or change medication. Under 100 words."
    )
    barriers = ", ".join(req.barriers) or "none you've told us about"
    prompt = (
        f"Patient first name: {req.name}. Condition: {req.condition}. "
        f"Care score: {req.careScore}/100. Missed medicines recently: {req.missedMedicines}. "
        f"Pending care tasks today: {req.pendingTasks}. Barriers reported: {barriers}."
    )
    return {"text": await run_llm(system, prompt)}
