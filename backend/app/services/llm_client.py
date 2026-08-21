import httpx

from app.config import settings


def generate_ollama_reply(prompt: str) -> str | None:
    base = settings.ollama_base_url.rstrip("/")
    url = f"{base}/api/generate"
    try:
        with httpx.Client(timeout=60.0) as client:
            r = client.post(
                url,
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
        if r.status_code != 200:
            return None
        data = r.json()
        text = (data.get("response") or "").strip()
        return text or None
    except (httpx.HTTPError, ValueError, OSError):
        return None
