# BewaardVoorJou backend — convenience targets
# (Vooral handig op de deploy-machine / Railway. Op Windows ook rechtstreeks
#  de ./.venv/Scripts/python.exe scripts/... aanroepen — zie
#  scripts/HOWTO_cleanup_blog.md)

PY ?= ./.venv/Scripts/python.exe

.PHONY: blog-cleanup-dry blog-cleanup

## Toon wat de blog-cleanup zou wijzigen (geen schrijfactie):
blog-cleanup-dry:
	$(PY) scripts/cleanup_blog_production_issues.py --dry

## Voer de blog-cleanup uit (verwijdert test-artikel, herstelt excerpts,
## fixet prijsvergelijking). Vereist DATABASE_URL in .env of omgeving.
blog-cleanup:
	$(PY) scripts/cleanup_blog_production_issues.py
