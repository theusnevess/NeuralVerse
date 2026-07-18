"""Lifecycle state management."""

from __future__ import annotations

from enum import Enum


class LifecycleState(Enum):
    """Standard lifecycle states for domain entities."""

    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    RETIRED = "retired"
    ARCHIVED = "archived"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ContentLifecycleState(Enum):
    """Content-specific lifecycle states."""

    DRAFT = "draft"
    IN_REVIEW = "in_review"
    REVIEWED = "reviewed"
    PUBLISHED = "published"
    CORRECTION_REQUESTED = "correction_requested"
    CORRECTED = "corrected"
    RETIRED = "retired"


class PublicationStatus(Enum):
    """Publication lifecycle states."""

    PENDING = "pending"
    RELEASED = "released"
    WITHDRAWN = "withdrawn"
