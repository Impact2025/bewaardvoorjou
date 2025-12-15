"""
Local file storage fallback for development (when S3 is not configured)
"""
import os
import shutil
from pathlib import Path
from typing import BinaryIO
from uuid import uuid4

from app.core.config import settings


class LocalStorageService:
    """Local file storage for development"""

    def __init__(self):
        self.base_path = Path("media_storage")
        self.base_path.mkdir(exist_ok=True)

    def generate_upload_url(
        self,
        journey_id: str,
        chapter_id: str,
        filename: str,
    ) -> tuple[str, str]:
        """
        Generate a local upload URL and object key

        Returns:
            tuple: (upload_url, object_key)
        """
        # Generate object key
        file_ext = Path(filename).suffix
        object_key = f"{journey_id}/{chapter_id}/{uuid4()}{file_ext}"

        # Create directory structure
        file_path = self.base_path / object_key
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Return a "mock" upload URL (in real usage, this would be a presigned S3 URL)
        # For local storage, we'll use a special endpoint
        upload_url = f"http://localhost:8000/api/v1/media/local-upload/{object_key}"

        return upload_url, object_key

    def save_file(self, object_key: str, file_data: BinaryIO) -> str:
        """
        Save file data to local storage

        Returns:
            str: The object key where the file was saved
        """
        file_path = self.base_path / object_key
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, "wb") as f:
            shutil.copyfileobj(file_data, f)

        return object_key

    def get_file_url(self, object_key: str) -> str:
        """
        Get public URL for a file (for development, returns a local endpoint)

        Returns:
            str: URL to access the file
        """
        return f"http://localhost:8000/api/v1/media/local-file/{object_key}"

    def get_file_path(self, object_key: str) -> Path:
        """Get the local file path for an object key"""
        return self.base_path / object_key

    def delete_file(self, object_key: str) -> bool:
        """Delete a file from local storage"""
        file_path = self.base_path / object_key
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def file_exists(self, object_key: str) -> bool:
        """Check if a file exists in local storage"""
        return (self.base_path / object_key).exists()


# Singleton instance
local_storage = LocalStorageService()
