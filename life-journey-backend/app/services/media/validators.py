"""
Media upload validation utilities
"""
from pathlib import Path
from fastapi import HTTPException, UploadFile


# Allowed file extensions and their MIME types
ALLOWED_EXTENSIONS = {
    # Video formats
    ".webm": ["video/webm"],
    ".mp4": ["video/mp4"],
    ".mov": ["video/quicktime"],
    ".avi": ["video/x-msvideo"],

    # Audio formats
    ".wav": ["audio/wav", "audio/x-wav"],
    ".mp3": ["audio/mpeg"],
    ".m4a": ["audio/mp4", "audio/x-m4a"],
    ".ogg": ["audio/ogg"],
    ".flac": ["audio/flac"],

    # Text formats
    ".txt": ["text/plain"],
    ".md": ["text/markdown", "text/plain"],
}

# Maximum file sizes (in bytes)
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_AUDIO_SIZE = 100 * 1024 * 1024  # 100 MB
MAX_TEXT_SIZE = 10 * 1024 * 1024    # 10 MB

# Dangerous file patterns to block
DANGEROUS_PATTERNS = [
    ".exe", ".bat", ".cmd", ".sh", ".ps1", ".jar",
    ".js", ".vbs", ".scr", ".msi", ".app", ".deb", ".rpm",
    ".php", ".py", ".rb", ".pl", ".asp", ".aspx", ".jsp"
]


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other attacks.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename safe for storage
    """
    # Get just the filename, no path components
    filename = Path(filename).name

    # Remove any dangerous characters
    # Allow: letters, numbers, dots, hyphens, underscores
    safe_chars = []
    for char in filename:
        if char.isalnum() or char in ".-_":
            safe_chars.append(char)
        else:
            safe_chars.append("_")

    sanitized = "".join(safe_chars)

    # Prevent empty filenames or filenames starting with dot
    if not sanitized or sanitized[0] == ".":
        sanitized = "file_" + sanitized

    # Limit filename length
    if len(sanitized) > 255:
        # Keep extension
        ext = Path(sanitized).suffix
        name = Path(sanitized).stem[:200]
        sanitized = name + ext

    return sanitized


def validate_file_extension(filename: str) -> str:
    """
    Validate file extension is allowed.

    Args:
        filename: Filename to validate

    Returns:
        Lowercase file extension

    Raises:
        HTTPException: If extension is not allowed
    """
    ext = Path(filename).suffix.lower()

    # Check for dangerous extensions
    for dangerous in DANGEROUS_PATTERNS:
        if dangerous in filename.lower():
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed: {ext}"
            )

    # Check if extension is in allowed list
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(ALLOWED_EXTENSIONS.keys())
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' not allowed. Allowed: {allowed}"
        )

    return ext


def validate_mime_type(file: UploadFile, extension: str) -> None:
    """
    Validate MIME type matches the file extension.

    Args:
        file: Uploaded file
        extension: Expected file extension

    Raises:
        HTTPException: If MIME type doesn't match
    """
    content_type = file.content_type

    if not content_type:
        raise HTTPException(
            status_code=400,
            detail="Missing Content-Type header"
        )

    allowed_types = ALLOWED_EXTENSIONS.get(extension, [])

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Content-Type '{content_type}' for {extension} file. Expected: {', '.join(allowed_types)}"
        )


def validate_file_size(file: UploadFile, extension: str) -> None:
    """
    Validate file size is within limits.

    Args:
        file: Uploaded file
        extension: File extension

    Raises:
        HTTPException: If file is too large
    """
    # Determine max size based on file type
    if extension in [".webm", ".mp4", ".mov", ".avi"]:
        max_size = MAX_VIDEO_SIZE
        file_type = "video"
    elif extension in [".wav", ".mp3", ".m4a", ".ogg", ".flac"]:
        max_size = MAX_AUDIO_SIZE
        file_type = "audio"
    elif extension in [".txt", ".md"]:
        max_size = MAX_TEXT_SIZE
        file_type = "text"
    else:
        max_size = MAX_FILE_SIZE
        file_type = "file"

    # Check file size if available
    if hasattr(file, 'size') and file.size:
        if file.size > max_size:
            max_mb = max_size / (1024 * 1024)
            actual_mb = file.size / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"{file_type.capitalize()} file too large: {actual_mb:.1f}MB. Maximum: {max_mb:.0f}MB"
            )


def validate_upload_file(file: UploadFile) -> tuple[str, str]:
    """
    Comprehensive validation of uploaded file.

    Validates:
    - File extension is allowed
    - MIME type matches extension
    - File size is within limits
    - Filename is sanitized

    Args:
        file: Uploaded file to validate

    Returns:
        Tuple of (sanitized_filename, extension)

    Raises:
        HTTPException: If validation fails
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    # Validate extension
    extension = validate_file_extension(file.filename)

    # Validate MIME type
    validate_mime_type(file, extension)

    # Validate file size
    validate_file_size(file, extension)

    # Sanitize filename
    safe_filename = sanitize_filename(file.filename)

    return safe_filename, extension


def validate_object_key(object_key: str) -> str:
    """
    Validate and sanitize object key to prevent path traversal.

    Args:
        object_key: S3 object key or file path

    Returns:
        Sanitized object key

    Raises:
        HTTPException: If object key is invalid
    """
    # Check for path traversal attempts
    if ".." in object_key or object_key.startswith("/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid object key: path traversal not allowed"
        )

    # Validate format: journey_id/chapter_id/asset_id/filename
    parts = object_key.split("/")
    if len(parts) < 3:
        raise HTTPException(
            status_code=400,
            detail="Invalid object key format"
        )

    # Sanitize each part
    sanitized_parts = [sanitize_filename(part) for part in parts]

    return "/".join(sanitized_parts)
