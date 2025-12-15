"""
Direct test van transcriptie zonder Celery/Redis
Test met een dummy audio file
"""
import sys
import uuid
from pathlib import Path

sys.path.insert(0, 'D:\\memories\\life-journey-backend')

from app.db.session import SessionLocal
from app.models.media import MediaAsset
from app.services.media.local_storage import local_storage
from app.services.ai.transcriber import transcribe_audio, split_into_segments
from app.services.ai.highlight_detector import detect_highlights, find_text_position, validate_highlight_label
from app.models.sharing import Highlight as HighlightModel
from app.db import crud

def test_transcription_flow():
    """Test de volledige transcriptie flow"""

    print("=" * 60)
    print("Life Journey - Transcriptie Flow Test")
    print("=" * 60)
    print()

    # Stap 1: Gebruik bestaande journey
    print("Step 1: Finding existing journey...")
    db = SessionLocal()

    try:
        from app.models.journey import Journey

        # Haal een bestaande journey op
        existing_journey = db.query(Journey).first()
        if not existing_journey:
            print("ERROR: No journey found. Please create a journey first via the frontend.")
            return

        journey_id = existing_journey.id
        print(f"Found journey: {existing_journey.title} ({journey_id})")
        print()

        print("Step 2: Creating test media asset...")
        asset_id = str(uuid.uuid4())

        # Maak test asset
        test_asset = MediaAsset(
            id=asset_id,
            journey_id=journey_id,
            chapter_id="roots",
            modality="audio",
            object_key="test/test-audio.mp3",
            original_filename="test-audio.mp3",
            duration_seconds=30,
            size_bytes=500000,
            storage_state="uploaded"
        )
        db.add(test_asset)
        db.commit()

        print(f"✓ Test asset created: {asset_id}")
        print()

        # Stap 3: Test met dummy tekst (want we hebben geen echte audio file)
        print("Step 3: Testing transcription with dummy text...")
        print("(In productie zou Whisper hier de audio transcriberen)")

        dummy_transcript = """
        Ik groeide op in een klein dorp in Noord-Brabant.
        Mijn jeugd was heel bijzonder, vooral omdat we een grote tuin hadden waar ik urenlang kon spelen.
        Mijn opa vertelde altijd de mooiste verhalen over zijn jeugd tijdens de oorlog.
        Het was een tijd van onschuld en vrijheid die ik nooit zal vergeten.
        We lachten veel en hadden het niet breed, maar waren gelukkig met wat we hadden.
        Die eenvoud heeft me geleerd wat echt belangrijk is in het leven.
        """

        print(f"✓ Dummy transcript: {len(dummy_transcript)} characters")
        print()

        # Stap 4: Maak segments
        print("Step 4: Creating transcript segments...")
        segments = split_into_segments(dummy_transcript)

        for segment_data in segments:
            crud.create_transcript_segment(
                db=db,
                media_asset_id=asset_id,
                text=segment_data["text"],
                start_ms=segment_data["start_ms"],
                end_ms=segment_data["end_ms"],
            )

        db.commit()
        print(f"✓ Created {len(segments)} transcript segments")
        print()

        # Stap 5: Detecteer highlights met AI
        print("Step 5: Detecting highlights with Claude AI...")
        print("(Dit gebruikt OpenRouter API)")

        highlights = detect_highlights(dummy_transcript, "roots")

        if highlights:
            print(f"✓ Detected {len(highlights)} highlights:")
            print()

            for i, highlight_data in enumerate(highlights, 1):
                label = validate_highlight_label(highlight_data.get("label", ""))
                if not label:
                    continue

                highlight_text = highlight_data.get("text", "")
                reason = highlight_data.get("reason", "")

                print(f"  Highlight {i}: [{label.value}]")
                print(f"    Text: {highlight_text[:80]}...")
                print(f"    Reason: {reason}")
                print()

                # Find position
                start_ms, end_ms = find_text_position(dummy_transcript, highlight_text)

                # Create highlight in database
                highlight = HighlightModel(
                    id=str(uuid.uuid4()),
                    journey_id=journey_id,
                    media_asset_id=asset_id,
                    chapter_id="roots",
                    label=label.value,
                    start_ms=start_ms,
                    end_ms=end_ms,
                    created_by="ai",
                )
                db.add(highlight)

            db.commit()
            print(f"✓ Saved {len(highlights)} highlights to database")
        else:
            print("⚠ No highlights detected")

        print()
        print("=" * 60)
        print("✓ TRANSCRIPTION FLOW TEST COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Database records created:")
        print(f"  - 1 MediaAsset")
        print(f"  - {len(segments)} TranscriptSegments")
        print(f"  - {len(highlights)} Highlights")
        print()

    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_transcription_flow()
