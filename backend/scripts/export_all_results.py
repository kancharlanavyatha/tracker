"""
Convenience backend proxy for exporting all model results.
"""
from pathlib import Path
import runpy

TARGET = Path(__file__).resolve().parent.parent.parent / "scripts" / "export_all_results.py"
runpy.run_path(str(TARGET), run_name="__main__")
