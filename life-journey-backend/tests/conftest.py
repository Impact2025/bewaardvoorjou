import sys
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

import pytest
from starlette.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

# Import all models so SQLAlchemy can resolve all mapper relationships
import app.db.base  # noqa: F401, E402


@pytest.fixture(scope="module")
def test_client():
    from app.main import app
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client


@dataclass
class FakeQuery:
    data: list

    def filter_by(self, **kwargs):
        filtered = [item for item in self.data if all(getattr(item, k) == v for k, v in kwargs.items())]
        return FakeQuery(filtered)

    def first(self):
        return self.data[0] if self.data else None


@dataclass
class FakeSession:
    users: list = field(default_factory=list)

    def query(self, model):
        from app.models.user import User
        if model is not User:
            raise ValueError("FakeSession only supports User model queries")
        return FakeQuery(self.users)

    def add(self, obj):
        from app.models.user import User
        if isinstance(obj, User) and obj not in self.users:
            if not obj.id:
                obj.id = str(uuid4())
            self.users.append(obj)

    def commit(self):
        return None

    def refresh(self, obj):
        return None


@pytest.fixture
def fake_session():
    return FakeSession()
