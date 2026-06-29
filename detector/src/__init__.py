"""
myfiling.ai PDF Detector Engine

A Python package for analyzing legal PDFs and detecting filing defects.
Uses OCR, text extraction, and rule matching to identify issues.

Version: 0.1.0
"""

__version__ = "0.1.0"
__author__ = "myfiling.ai"

from .main import analyze_pdf

__all__ = ["analyze_pdf"]
