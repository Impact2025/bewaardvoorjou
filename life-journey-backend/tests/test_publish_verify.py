"""De sleutelcontrole die de frontend-revalidate gebruikt."""
from unittest.mock import patch


def test_verify_zonder_bearer_is_401(test_client):
    with patch("app.api.v1.routes.publish.settings") as s:
        s.publish_api_key = "geheim-voor-test"
        r = test_client.post("/api/v1/publish/verify")
    assert r.status_code == 401


def test_verify_met_foute_sleutel_is_401(test_client):
    with patch("app.api.v1.routes.publish.settings") as s:
        s.publish_api_key = "geheim-voor-test"
        r = test_client.post("/api/v1/publish/verify", headers={"Authorization": "Bearer fout"})
    assert r.status_code == 401


def test_verify_met_juiste_sleutel_is_200(test_client):
    with patch("app.api.v1.routes.publish.settings") as s:
        s.publish_api_key = "geheim-voor-test"
        r = test_client.post("/api/v1/publish/verify", headers={"Authorization": "Bearer geheim-voor-test"})
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_verify_zonder_geconfigureerde_sleutel_is_401(test_client):
    with patch("app.api.v1.routes.publish.settings") as s:
        s.publish_api_key = None
        r = test_client.post("/api/v1/publish/verify", headers={"Authorization": "Bearer iets"})
    assert r.status_code == 401
