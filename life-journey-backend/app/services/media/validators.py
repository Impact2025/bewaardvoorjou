"""
Media upload validation utilities
"""
from pathlib import Path
from fastapi import HTTPException, UploadFile


# Magic byte signatures per extension.
# Each extension maps to a list of valid signatures.
# A signature is a list of (offset, expected_bytes) — ALL must match (AND).
# Multiple signatures per extension = alternatives (OR).
_MAGIC_SIGNATURES: dict[str, list[list[tuple[int, bytes]]]] = {
    ".webm": [[(0, b"\x1a\x45\xdf\xa3")]],
    ".mp4":  [[(4, b"ftyp")]],
    ".m4a":  [[(4, b"ftyp")]],
    ".mov":  [[(4, b"ftyp")]],
    ".wav":  [[(0, b"RIFF"), (8, b"WAVE")]],
    ".avi":  [[(0, b"RIFF"), (8, b"AVI ")]],
    ".ogg":  [[(0, b"OggS")]],
    ".flac": [[(0, b"fLaC")]],
    ".mp3":  [
        [(0, b"\x49\x44\x33")],   # ID3 tag
        [(0, b"\xff\xfb")],        # MPEG sync, Layer III, no CRC
        [(0, b"\xff\xf3")],        # MPEG sync, Layer III, CRC
        [(0, b"\xff\xf2")],        # MPEG sync, Layer III, CRC (variant)
    ],
}

_MAGIC_READ_BYTES = 16


def validate_magic_bytes(file: UploadFile, extension: str) -> None:
    """Validate that the file's magic bytes match the expected extension."""
    signatures = _MAGIC_SIGNATURES.get(extension)
    if not signatures:
        return  # No magic check for text files

    header = file.file.read(_MAGIC_READ_BYTES)
    file.file.seek(0)

    for signature in signatures:
        if all(header[offset:offset + len(expected)] == expected for offset, expected in signature):
            return

    raise HTTPException(
        status_code=400,
        detail=f"Bestandsinhoud klopt niet met de verwachte extensie '{extension}'"
    )


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

    # Validate MIME type (client-provided header)
    validate_mime_type(file, extension)

    # Validate actual file content via magic bytes
    validate_magic_bytes(file, extension)

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
