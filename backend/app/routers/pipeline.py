from datetime import datetime, timezone



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session



from app.database import get_db

from app.models import User

from app.schemas import ChatIn, ChatOut, PredictPhaseIn, PredictPhaseOut, RecommendIn, RecommendOut

from app.services import llm_client, ml_stub, phase_service, recommendation



router = APIRouter(tags=["ml"])





@router.post("/predict-phase", response_model=PredictPhaseOut)

def predict_phase(body: PredictPhaseIn, db: Session = Depends(get_db)) -> PredictPhaseOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    last = ml_stub.last_period_start(db, body.user_id)

    ref = body.reference_date if body.reference_date is not None else datetime.now(timezone.utc).date()

    return phase_service.infer_phase(db, body.user_id, last, ref)





@router.post("/recommend", response_model=RecommendOut)

def recommend(body: RecommendIn, db: Session = Depends(get_db)) -> RecommendOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    out, phase_out = recommendation.build_recommendation(db, body.user_id)

    bundle = {

        "phase": phase_out.model_dump(),

        "recommendation": out.model_dump(),

    }

    ml_stub.persist_recommendation(db, body.user_id, bundle)

    return out





@router.post("/chat", response_model=ChatOut)

def chat(body: ChatIn, db: Session = Depends(get_db)) -> ChatOut:

    if db.get(User, body.user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    last = ml_stub.last_period_start(db, body.user_id)

    ref = datetime.now(timezone.utc).date()

    phase_out = phase_service.infer_phase(db, body.user_id, last, ref)

    ctx = ml_stub.recent_context(db, body.user_id)

    prompt = (

        "You are a concise athletic coach and health educator for women. "

        "Use the structured context; do not invent medical diagnoses. "

        f"Cycle phase (estimate): {phase_out.phase}, day {phase_out.day_in_cycle}. "

        f"Recent context JSON: {ctx}. User message: {body.message}"

    )

    reply = llm_client.generate_ollama_reply(prompt)

    if reply:

        return ChatOut(reply=reply, source="ollama")

    stub = (

        f"[Stub assistant] Phase estimate: {phase_out.phase} (day {phase_out.day_in_cycle}). "

        "Install and run Ollama with the configured model for full local LLM replies. "

        f"You asked: {body.message!r}"

    )

    return ChatOut(reply=stub, source="stub")

