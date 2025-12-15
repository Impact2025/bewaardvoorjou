"""
Migration script to update journey progress from old chapter IDs to new chapter IDs
"""
from app.db.session import SessionLocal
from app.models.journey import Journey

# Mapping of old chapter IDs to new chapter IDs
OLD_TO_NEW_MAPPING = {
    "roots": "intro-reflection",
    "identity": "intro-intention",
    "music": "youth-sounds",
    "milestones": "youth-favorite-place",
    "humor": "bonus-funny",
    "lessons": "love-lessons",
    "people": "love-connection",
    "message": "future-message",
}

# All new chapter IDs with default progress of 0.0
NEW_CHAPTER_PROGRESS = {
    "intro-reflection": 0.0,
    "intro-intention": 0.0,
    "intro-uniqueness": 0.0,
    "youth-favorite-place": 0.0,
    "youth-sounds": 0.0,
    "youth-hero": 0.0,
    "love-connection": 0.0,
    "love-lessons": 0.0,
    "love-symbol": 0.0,
    "work-dream-job": 0.0,
    "work-passion": 0.0,
    "work-challenge": 0.0,
    "future-message": 0.0,
    "future-dream": 0.0,
    "future-gratitude": 0.0,
    "bonus-funny": 0.0,
    "bonus-relive": 0.0,
    "bonus-culture": 0.0,
}

def migrate_journey_chapters():
    db = SessionLocal()
    try:
        journeys = db.query(Journey).all()
        print(f"Found {len(journeys)} journeys to migrate")

        for journey in journeys:
            old_progress = journey.progress or {}
            print(f"\nMigrating journey {journey.id} ('{journey.title}')")
            print(f"  Old progress keys: {list(old_progress.keys())}")

            # Start with the default new chapter structure
            new_progress = NEW_CHAPTER_PROGRESS.copy()

            # Try to map old progress values to new chapter IDs
            for old_key, old_value in old_progress.items():
                if old_key in OLD_TO_NEW_MAPPING:
                    new_key = OLD_TO_NEW_MAPPING[old_key]
                    new_progress[new_key] = old_value
                    print(f"  Mapped {old_key} -> {new_key} (value: {old_value})")
                elif old_key in new_progress:
                    # Already a new chapter ID, keep the value
                    new_progress[old_key] = old_value
                    print(f"  Kept {old_key} (value: {old_value})")
                else:
                    print(f"  WARNING: Unknown chapter ID '{old_key}' - skipping")

            # Update the journey progress
            journey.progress = new_progress
            print(f"  New progress keys: {list(new_progress.keys())}")

        # Commit all changes
        db.commit()
        print(f"\n✅ Successfully migrated {len(journeys)} journeys")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during migration: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_journey_chapters()
