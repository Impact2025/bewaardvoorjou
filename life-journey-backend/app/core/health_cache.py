"""Gecachete DB-health-check.

Externe monitoring (UptimeRobot, Railway) pingt /healthz en /publish/health
elke paar minuten, en beide deden tot nu toe een échte `SELECT 1` per ping.
Bij een pingfrequentie rond de 5 minuten - Neon's scale-to-zero-drempel - komt
er dan altijd een query binnen vóórdat de database die 5 minuten idle heeft
gehaald, en schaalt hij nooit naar nul (zelfde patroon als het
bridge_sync-incident in D:/apps/agentos, 12 aug 2026, ander domein). Deze
cache zorgt dat er hooguit één échte query per TTL-venster naar Neon gaat,
ongeacht hoe vaak een monitor pingt.

TTL bewust ruim boven de 5-minutendrempel: bij een storing duurt het dus tot
_TTL_SECONDS voordat de monitor het ziet - dat is de bewuste ruil tegen
continue compute-kosten voor een check die zelden faalt.
"""
import time

from sqlalchemy import text
from sqlalchemy.orm import Session

_TTL_SECONDS = 600.0

_cache: dict[str, tuple[float, bool]] = {}


def db_healthy(db: Session, key: str = "default") -> bool:
  now = time.monotonic()
  cached = _cache.get(key)
  if cached is not None and now - cached[0] < _TTL_SECONDS:
    return cached[1]
  try:
    db.execute(text("SELECT 1"))
    ok = True
  except Exception:
    ok = False
  _cache[key] = (now, ok)
  return ok
