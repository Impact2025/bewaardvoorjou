"""
Load testing scenarios voor de Life Journey API.

Gebruik:
  locust -f tests/load/locustfile.py --host http://localhost:8001
  locust -f tests/load/locustfile.py --headless -u 50 -r 5 --run-time 60s --host http://localhost:8001
"""

import random
import string
from locust import HttpUser, task, between


def random_email() -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"loadtest-{suffix}@example.com"


class AuthUser(HttpUser):
    """Simuleert een nieuwe gebruiker die registreert en inlogt."""

    wait_time = between(1, 3)

    def on_start(self):
        self.email = random_email()
        self.token = None
        self._register()

    def _register(self):
        resp = self.client.post(
            "/api/v1/auth/register",
            json={
                "display_name": "Load Test User",
                "email": self.email,
                "password": "LoadTest123!",
                "country": "NL",
                "locale": "nl",
                "privacy_level": "private",
            },
            name="/auth/register",
        )
        if resp.status_code == 200:
            self.token = resp.json().get("access_token")

    @task(3)
    def login(self):
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": self.email, "password": "LoadTest123!"},
            name="/auth/login",
        )
        if resp.status_code == 200:
            self.token = resp.json().get("access_token")

    @task(1)
    def health_check(self):
        self.client.get("/healthz", name="/healthz")


class ReadOnlyUser(HttpUser):
    """Simuleert een ingelogde gebruiker die content leest."""

    wait_time = between(2, 5)

    def on_start(self):
        email = random_email()
        reg = self.client.post(
            "/api/v1/auth/register",
            json={
                "display_name": "Reader",
                "email": email,
                "password": "LoadTest123!",
                "country": "NL",
                "locale": "nl",
                "privacy_level": "private",
            },
            name="/auth/register [setup]",
        )
        self.token = reg.json().get("access_token") if reg.status_code == 200 else None
        self.journey_id = None
        if self.token:
            self._get_journey()

    def _get_journey(self):
        resp = self.client.get(
            "/api/v1/journeys/me",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/journeys/me [setup]",
        )
        if resp.status_code == 200:
            data = resp.json()
            if data:
                self.journey_id = data[0].get("id") if isinstance(data, list) else data.get("id")

    def _auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(5)
    def list_chapters(self):
        self.client.get(
            "/api/v1/chapters/",
            headers=self._auth_headers(),
            name="/chapters/",
        )

    @task(2)
    def get_memos(self):
        if self.journey_id:
            self.client.get(
                f"/api/v1/memos/?journey_id={self.journey_id}",
                headers=self._auth_headers(),
                name="/memos/",
            )

    @task(1)
    def get_timeline(self):
        if self.journey_id:
            self.client.get(
                f"/api/v1/timeline/{self.journey_id}",
                headers=self._auth_headers(),
                name="/timeline/{journey_id}",
            )
