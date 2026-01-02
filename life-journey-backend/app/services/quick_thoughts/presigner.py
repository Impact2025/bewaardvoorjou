"""
Presigned URL generation for quick thought uploads.
"""
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from loguru import logger

from app.core.config import settings
from app.schemas.quick_thought import QuickThoughtPresignResponse


def build_quick_thought_presigned_upload(
    journey_id: str,
    modality: str,
    filename: str,
) -> QuickThoughtPresignResponse:
    """
    Generate a presigned URL for uploading a quick thought.

    Args:
        journey_id: The journey ID
        modality: "audio" or "video"
        filename: Original filename

    Returns:
        QuickThoughtPresignResponse with upload URL and metadata
    """
    thought_id = str(uuid4())

    # Use a dedicated prefix for quick thoughts
    object_key = f"quick-thoughts/{journey_id}/{thought_id}/{filename}"

    # Try S3 first if configured
    if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
        try:
            endpoint_url = settings.s3_endpoint_url
            if not endpoint_url and settings.s3_region:
                endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"

            client = boto3.client(
                "s3",
                region_name=settings.s3_region,
                endpoint_url=endpoint_url,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
            )

            # Determine content type based on modality
            content_type = "video/webm" if modality == "video" else "audio/webm"

            presigned = client.generate_presigned_post(
                Bucket=settings.s3_bucket,
                Key=object_key,
                Fields={"Content-Type": content_type},
                Conditions=[{"Content-Type": content_type}],
                ExpiresIn=900,  # 15 minutes
            )

            logger.info(f"Generated S3 presigned URL for quick thought {thought_id}")

            return QuickThoughtPresignResponse(
                thought_id=thought_id,
                upload_url=presigned["url"],
                upload_method="POST",
                object_key=object_key,
                expires_in=900,
            )

        except (BotoCoreError, NoCredentialsError) as exc:
            logger.warning(f"S3 not configured, falling back to local: {exc}")
        except Exception as exc:
            logger.warning(f"S3 error, falling back to local: {exc}")

    # Fallback to local storage
    logger.info(f"Using local storage for quick thought {thought_id}")

    upload_url = f"{settings.api_base_url}/api/v1/quick-thoughts/local-upload/{object_key}"

    return QuickThoughtPresignResponse(
        thought_id=thought_id,
        upload_url=upload_url,
        upload_method="PUT",
        object_key=object_key,
        expires_in=900,
    )
