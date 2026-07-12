"""
HOE DE LIVE BLOG-CLEANUP DRAAIEN (bewaardvoorjou.nl/blog)

De code ligt klaar (commit 85f5aec + runbook 8f587dc). Idempotent, --dry-veilig.
Het script laadt .env automatisch, dus je hoeft niets te exporteren.

=== ÉÉN COMMANDO (lokaal, met .env) ===
1. Zet de productie-DATABASE_URL in life-journey-backend/.env
2. cd life-journey-backend
3. ./.venv/Scripts/python.exe scripts/cleanup_blog_production_issues.py --dry
4. Controleer output (test-artikel verwijderd, excerpts hersteld,
   prijsvergelijking €2.00->€2.000)
5. Zonder --dry voor de echte uitvoering
6. Frontend verversen:
   curl -X POST https://bewaardvoorjou.nl/api/revalidate -H "Content-Type: application/json" -d '{"section":"blog"}'
   (of Ctrl+Shift+R in de browser na de ISR-window)

=== Make (deploy-machine / Railway) ===
make blog-cleanup-dry
make blog-cleanup

=== Railway ===
railway login && railway link
railway run --service backend "python scripts/cleanup_blog_production_issues.py --dry"

WAT WORDT ER GEDAAN
- Verwijdert slug "test-agent-os-connectie" (het live test-artikel).
- Herstelt elke excerpt die met `, ```, 'html' of '>' begint, via dezelfde
  _clean_excerpt() als de publish-route (geen markup-lek meer).
- "prijsvergelijking": titel -> "Prijsvergelijking", content €2.00 -> €2.000.
"""
