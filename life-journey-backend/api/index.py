import sys
from pathlib import Path

from mangum import Mangum


ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
  sys.path.append(str(ROOT_DIR))


from app.main import app


handler = Mangum(app)
