"""
Quick test script to verify OpenRouter/Claude integration in interviewer.py
"""
import sys
import io
sys.path.insert(0, 'D:\\memories\\life-journey-backend')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.services.ai.interviewer import build_prompt_with_ai
from app.schemas.common import ChapterId

# Test with multiple chapters
print("Testing AI prompt generation with OpenRouter/Claude...")
print("=" * 60)
print()

chapters = [ChapterId.roots, ChapterId.music, ChapterId.lessons]
follow_up_history = []

for chapter in chapters:
    try:
        print(f"Testing {chapter.value} chapter...")
        prompt = build_prompt_with_ai(chapter, follow_up_history)
        print(f"  SUCCESS! Generated: \"{prompt}\"")
        print()
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        print()

print("=" * 60)
print("OpenRouter/Claude integration test complete!")
