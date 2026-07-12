# Scripts

Ad-hoc ops-, debug- en seedscripts. Deze horen **niet** bij de applicatie of de
testsuite (`tests/` is de echte suite; de `test_*.py`-bestanden hier zijn
handmatige debugscripts).

Draai ze vanuit de backend-root zodat `import app` werkt:

```bash
cd life-journey-backend
python scripts/seed_kennisbank.py        # lokaal (vereist PYTHONPATH=. als import faalt)
railway run python scripts/debug_email.py  # tegen productie-omgeving
```

| Script | Doel |
|---|---|
| `seed_kennisbank.py` / `update_kennisbank.py` | Kennisbank-content seeden/bijwerken |
| `debug_email.py`, `diagnose_email.py`, `test_*_email*.py`, `test_to_owner.py` | E-mail debugging |
| `diagnose_bleije.py`, `send_buyer_confirmation_once.py` | Eenmalige support-fixes |
| `fix_s3_cors.py`, `fix_text_object_keys.py` | Eenmalige storage-fixes |
| `migrate_chapters.py` | Eenmalige datamigratie hoofdstukken |
| `test_interviewer.py`, `test_transcription.py`, `test_after_change.py` | Handmatige AI-smoketests |
