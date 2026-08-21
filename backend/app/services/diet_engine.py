"""Rule-augmented dietary knowledge base (JSON) merged with phase macros."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

_KB_PATH = Path(__file__).resolve().parent.parent / "knowledge_base" / "diet_phases.json"


@lru_cache
def _load_kb() -> dict[str, Any]:
    with open(_KB_PATH, encoding="utf-8") as f:
        return json.load(f)


def build_dietary_bundle(phase: str, macro_rules: dict[str, Any]) -> dict[str, Any]:
    kb = _load_kb()
    block = kb.get(phase) or kb["unknown"]
    out: dict[str, Any] = dict(macro_rules)
    out["phase"] = phase
    out["hydration_liters"] = float(block.get("hydration_liters", 2.5))
    out["micronutrients"] = list(block.get("micronutrients", []))
    out["meal_templates"] = list(block.get("meal_templates", []))
    out["snacks"] = list(block.get("snacks", []))
    out["kb_source"] = "diet_phases.json"
    return out
