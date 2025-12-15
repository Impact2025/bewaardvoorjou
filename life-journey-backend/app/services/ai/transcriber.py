"""
AI Transcription Service - Transcribes audio/video using Whisper via OpenRouter
"""
from typing import BinaryIO
from openai import OpenAI
from loguru import logger

from app.core.config import settings


def transcribe_audio(audio_file: BinaryIO, filename: str) -> str:
    """
    Transcribe audio file using Whisper via OpenRouter

    Args:
        audio_file: Binary file object containing audio data
        filename: Original filename for the audio file

    Returns:
        Transcribed text in Dutch

    Raises:
        Exception: If transcription fails
    """
    if not settings.openai_api_key:
        logger.error("OpenAI/OpenRouter API key not configured for transcription")
        raise ValueError("Transcription service not configured")

    try:
        # Initialize OpenAI client (works with OpenRouter)
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        logger.info(f"Starting transcription for {filename} using {settings.whisper_model}")

        # Call Whisper API via OpenRouter
        # Note: OpenRouter supports Whisper via the audio/transcriptions endpoint
        response = client.audio.transcriptions.create(
            model=settings.whisper_model,
            file=(filename, audio_file),
            language="nl",  # Dutch
            response_format="text",
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        # Response is a string when response_format="text"
        transcribed_text = response if isinstance(response, str) else response.text

        logger.info(f"Successfully transcribed {filename}, length: {len(transcribed_text)} characters")
        return transcribed_text

    except Exception as e:
        logger.error(f"Failed to transcribe audio {filename}: {e}")
        raise


def split_into_segments(text: str, max_words_per_segment: int = 50) -> list[dict]:
    """
    Split transcribed text into segments for storage

    Args:
        text: Full transcribed text
        max_words_per_segment: Maximum words per segment

    Returns:
        List of segment dictionaries with text and estimated timing
    """
    words = text.split()
    segments = []

    # Estimate timing (rough approximation: 150 words per minute)
    words_per_second = 150 / 60

    current_segment = []
    current_start_ms = 0

    for i, word in enumerate(words):
        current_segment.append(word)

        if len(current_segment) >= max_words_per_segment or i == len(words) - 1:
            segment_text = " ".join(current_segment)
            duration_seconds = len(current_segment) / words_per_second
            end_ms = current_start_ms + int(duration_seconds * 1000)

            segments.append({
                "text": segment_text,
                "start_ms": current_start_ms,
                "end_ms": end_ms,
            })

            current_start_ms = end_ms
            current_segment = []

    return segments
