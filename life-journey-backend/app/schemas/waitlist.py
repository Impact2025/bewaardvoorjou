from pydantic import BaseModel, EmailStr
from typing import Literal

WaitlistPackage = Literal["ERFGOED", "VOOR_ALTIJD"]


class WaitlistJoinRequest(BaseModel):
    email: EmailStr
    package_type: WaitlistPackage


class WaitlistJoinResponse(BaseModel):
    message: str
    already_registered: bool
