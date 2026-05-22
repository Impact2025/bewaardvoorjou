"""Pydantic schemas voor BlogPost."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    slug: str = Field(..., min_length=1, max_length=300, pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    content: str = Field(default="")
    excerpt: Optional[str] = Field(None, max_length=500)
    section: str = Field(default="blog")
    header_type: str = Field(default="color")
    header_color: Optional[str] = Field(None, max_length=50)
    header_text_color: Optional[str] = Field(None, max_length=50)
    header_image_url: Optional[str] = Field(None, max_length=512)
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    og_image: Optional[str] = Field(None, max_length=512)
    keywords: Optional[str] = Field(None, max_length=500)
    tags: Optional[str] = Field(None, max_length=500)
    published_at: Optional[datetime] = None


class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    slug: Optional[str] = Field(None, min_length=1, max_length=300, pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    content: Optional[str] = None
    excerpt: Optional[str] = Field(None, max_length=500)
    section: Optional[str] = None
    header_type: Optional[str] = None
    header_color: Optional[str] = Field(None, max_length=50)
    header_text_color: Optional[str] = Field(None, max_length=50)
    header_image_url: Optional[str] = Field(None, max_length=512)
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    og_image: Optional[str] = Field(None, max_length=512)
    keywords: Optional[str] = Field(None, max_length=500)
    tags: Optional[str] = Field(None, max_length=500)
    published_at: Optional[datetime] = None


class BlogPostResponse(BaseModel):
    id: str
    author_id: str
    section: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    header_type: str = "color"
    header_color: Optional[str] = None
    header_text_color: Optional[str] = None
    header_image_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None
    keywords: Optional[str] = None
    tags: Optional[str] = None
    view_count: int = 0
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BlogPostListItem(BaseModel):
    id: str
    section: str
    title: str
    slug: str
    excerpt: Optional[str] = None
    tags: Optional[str] = None
    header_color: Optional[str] = None
    header_text_color: Optional[str] = None
    view_count: int = 0
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SeoOptimizeRequest(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    existing_keywords: Optional[str] = None
    existing_posts: Optional[List[dict]] = None  # [{slug, title}] voor interne links


class InternalLinkSuggestion(BaseModel):
    slug: str
    title: str
    reason: str


class ExternalLinkSuggestion(BaseModel):
    url: str
    title: str
    reason: str


class SeoOptimizeResponse(BaseModel):
    meta_title: str
    meta_description: str
    keywords: str
    tags: str
    excerpt: str
    slug: str
    internal_links: List[InternalLinkSuggestion] = []
    external_links: List[ExternalLinkSuggestion] = []


class EnhanceContentRequest(BaseModel):
    title: str
    content: str
    section: str = "blog"
    internal_links: List[dict] = []   # [{slug, title}]
    external_links: List[dict] = []   # [{url, title}]


class ImageUploadResponse(BaseModel):
    url: str
