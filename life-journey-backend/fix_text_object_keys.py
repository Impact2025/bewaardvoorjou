"""
Fix object_keys for existing text recordings
"""
from app.db.session import SessionLocal
from app.models.media import MediaAsset

def fix_text_object_keys():
    db = SessionLocal()
    try:
        # Find all text assets with incorrect object_key format
        assets = db.query(MediaAsset).filter(MediaAsset.modality == 'text').all()
        print(f"Found {len(assets)} text assets")

        for asset in assets:
            old_key = asset.object_key

            # Expected format: journey_id/chapter_id/asset_id/filename
            # Current format in DB: journey_id/asset_id/filename
            # Actual file location: journey_id/ChapterId.chapter_id/asset_id/filename

            parts = old_key.split('/')
            if len(parts) == 3:
                # Missing chapter_id in database
                journey_id, asset_id, filename = parts
                new_key = f"{journey_id}/{asset.chapter_id}/{asset_id}/{filename}"

                print(f"\nAsset {asset.id}:")
                print(f"  Old key: {old_key}")
                print(f"  New key: {new_key}")
                print(f"  Chapter: {asset.chapter_id}")

                asset.object_key = new_key
                db.add(asset)
            elif len(parts) == 4:
                print(f"\nAsset {asset.id} already has correct format: {old_key}")

        db.commit()
        print("\n✅ Successfully updated object_keys")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_text_object_keys()
