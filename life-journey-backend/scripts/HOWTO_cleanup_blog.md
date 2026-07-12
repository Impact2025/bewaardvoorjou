"""
HOE DE LIVE BLOG-CLEANUP DRAAIEN (bewaardvoorjou.nl/blog)

De code ligt klaar in scripts/cleanup_blog_production_issues.py (commit
85f5aec). Hij is idempotent en heeft een --dry modus. Je hebt alleen een
DATABASE_URL naar de productie-Postgres (Neon) nodig.

Optie A — lokaal met de echte .env
-------------------------------------
1. Zet de productie-creds in life-journey-backend/.env
   (DATABASE_URL=postgresql+psycopg://...neon.tech/neondb?sslmode=require)
2. cd life-journey-backend
3. ./.venv/Scripts/python.exe scripts/cleanup_blog_production_issues.py --dry
4. Controleer de output (test-artikel verwijderd, excerpts hersteld,
   prijsvergelijking €2.00->€2.000).
5. Zonder --dry voor de echte uitvoering.
6. Frontend revalidate: de /blog-pagina ververst (of wacht op ISR-window).

Optie B — op Railway (backend deploy)
--------------------------------------
1. railway login && railway link (project bewaardvoorjou backend)
2. railway run --service backend "python scripts/cleanup_blog_production_issues.py --dry"
3. Zonder --dry voor echt.

Optie C — éénmalig via de API (zonder script)
------------------------------------------------
Het test-artikel en de lekke excerpts zijn ook via de bestaande publish/API
te herstellen, maar het script is de veilige, idempotente weg.

Wat wordt er precies gedaan
---------------------------
- Verwijdert slug "test-agent-os-connectie" (het live test-artikel).
- Herstelt elke excerpt die met `, ```, 'html' of '>' begint, via dezelfde
  _clean_excerpt() als de publish-route (geen markup-lek meer).
- "prijsvergelijking": titel -> "Prijsvergelijking", content €2.00 -> €2.000.

Na de run: controleer bewaardvoorjou.nl/blog en herlaad (Ctrl+Shift+R).
"""
