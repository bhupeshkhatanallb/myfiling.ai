"""
Detector registry.

Detectors self-register with :func:`register`. The processor asks the registry
for the set it needs by ``kind`` ("page" / "conditional" / "validator"), so
wiring a new detector is a single decorator line. Registration order is preserved
to keep output stable and reviewable.
"""

from __future__ import annotations

from typing import List, Type

from .base import Detector

_REGISTRY: List[Type[Detector]] = []


def register(cls: Type[Detector]) -> Type[Detector]:
    """Class decorator: add a Detector subclass to the global registry."""
    if cls not in _REGISTRY:
        _REGISTRY.append(cls)
    return cls


def all_detectors() -> List[Type[Detector]]:
    """All registered detector classes, in registration order."""
    return list(_REGISTRY)


def detectors_of_kind(kind: str) -> List[Type[Detector]]:
    """Registered detectors whose ``kind`` matches (page/conditional/validator)."""
    return [c for c in _REGISTRY if getattr(c, "kind", "page") == kind]


def clear() -> None:
    """Test helper: empty the registry."""
    _REGISTRY.clear()
