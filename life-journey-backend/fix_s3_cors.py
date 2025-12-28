"""
Fix S3 CORS Configuration for Audio/Video Playback

This script configures the S3 bucket to allow proper audio and video
playback in the browser by setting the correct CORS rules.
"""
import boto3
from app.core.config import settings

def fix_s3_cors():
    """Update S3 bucket CORS configuration for media playback"""

    if not all([settings.s3_bucket, settings.aws_access_key_id, settings.aws_secret_access_key]):
        print("[ERROR] S3 credentials not configured")
        return

    # Create S3 client
    endpoint_url = settings.s3_endpoint_url
    if not endpoint_url and settings.s3_region:
        endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"

    s3_client = boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )

    # Define CORS configuration optimized for media playback
    cors_configuration = {
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "HEAD"],
                "AllowedOrigins": [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "https://bewaardvoorjou.vercel.app",
                    "https://*.vercel.app",
                ],
                "ExposeHeaders": [
                    "Content-Length",
                    "Content-Type",
                    "Content-Range",
                    "Accept-Ranges",
                    "ETag",
                ],
                "MaxAgeSeconds": 3600,
            }
        ]
    }

    try:
        # Get current CORS configuration
        try:
            current_cors = s3_client.get_bucket_cors(Bucket=settings.s3_bucket)
            print(f"[INFO] Current CORS configuration:")
            print(current_cors.get("CORSRules", []))
        except s3_client.exceptions.NoSuchCORSConfiguration:
            print("[INFO] No CORS configuration found")

        # Set new CORS configuration
        s3_client.put_bucket_cors(
            Bucket=settings.s3_bucket,
            CORSConfiguration=cors_configuration
        )

        print(f"\n[SUCCESS] CORS configuration updated for bucket: {settings.s3_bucket}")
        print("\n[INFO] New CORS rules:")
        print(f"  - Allowed Origins: localhost:3000, localhost:3001, bewaardvoorjou.vercel.app, *.vercel.app")
        print(f"  - Allowed Methods: GET, HEAD")
        print(f"  - Exposed Headers: Content-Length, Content-Type, Content-Range, Accept-Ranges, ETag")
        print(f"  - Max Age: 3600 seconds")

    except Exception as e:
        print(f"\n[ERROR] Failed to update CORS configuration: {e}")
        print("\nMake sure your AWS credentials have the following permissions:")
        print("  - s3:GetBucketCors")
        print("  - s3:PutBucketCors")

if __name__ == "__main__":
    print("Fixing S3 CORS Configuration for Audio/Video Playback\n")
    fix_s3_cors()
