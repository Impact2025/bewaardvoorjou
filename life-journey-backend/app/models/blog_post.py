"""BlogPost model — blog en kennisbank voor bewaardvoorjou.nl."""
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, DateTime, String, Text

from app.models.base import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid():
    return str(uuid4())


class BlogPost(Base):
    """
    Blog post of kennisbank-artikel.

    section: "blog" | "knowledge"
    status: "draft" | "published"
    header_type: "color" | "image"
    """
    __tablename__ = "blogpost"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    author_id = Column(String(36), nullable=False, index=True)

    # "blog" or "knowledge"
    section = Column(String(20), nullable=False, default="blog", index=True)

    # Content
    title = Column(String(300), nullable=False)
    slug = Column(String(300), nullable=False, unique=True, index=True)
    content = Column(Text, nullable=False, default="")
    excerpt = Column(String(500), nullable=True)

    # Header settings
    header_type = Column(String(20), nullable=False, default="color")
    header_color = Column(String(50), nullable=True)
    header_text_color = Column(String(50), nullable=True)
    header_image_url = Column(String(512), nullable=True)

    # SEO
    meta_title = Column(String(70), nullable=True)
    meta_description = Column(String(160), nullable=True)
    og_image = Column(String(512), nullable=True)
    keywords = Column(String(500), nullable=True)
    tags = Column(String(500), nullable=True)

    # Status
    status = Column(String(20), nullable=False, default="draft", index=True)
    published_at = Column(DateTime, nullable=True, index=True)

    # Lifecycle
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "author_id": self.author_id,
            "section": self.section,
            "title": self.title,
            "slug": self.slug,
            "content": self.content,
            "excerpt": self.excerpt,
            "header_type": self.header_type,
            "header_color": self.header_color,
            "header_text_color": self.header_text_color,
            "header_image_url": self.header_image_url,
            "meta_title": self.meta_title,
            "meta_description": self.meta_description,
            "og_image": self.og_image,
            "keywords": self.keywords,
            "tags": self.tags,
            "status": self.status,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
