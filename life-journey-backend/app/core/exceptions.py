from fastapi import HTTPException


class AppError(HTTPException):
    """HTTPException with an additional machine-readable `code` field."""

    def __init__(self, status_code: int, detail: str, code: str):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


EMAIL_NOT_VERIFIED = AppError(
    status_code=403,
    detail="E-mailadres nog niet bevestigd. Controleer je inbox voor de verificatielink.",
    code="EMAIL_NOT_VERIFIED",
)
