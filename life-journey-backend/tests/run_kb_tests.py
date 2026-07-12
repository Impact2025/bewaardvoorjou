"""Minimale test-runner (geen pytest nodig) voor de KB-injector.

    cd life-journey-backend && ./.venv/Scripts/python.exe tests/run_kb_tests.py
"""
import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import tests.test_kb_internal_links as tmod

FUNCS = [v for k, v in vars(tmod).items() if k.startswith("test_") and callable(v)]

passed = 0
failed = 0
for fn in FUNCS:
    try:
        fn()
        passed += 1
        print(f"  ok   {fn.__name__}")
    except Exception as e:  # noqa: BLE001
        failed += 1
        print(f"  FAIL {fn.__name__}: {e}")
        traceback.print_exc()

print(f"\n{passed} passed, {failed} failed, {len(FUNCS)} total")
sys.exit(1 if failed else 0)
