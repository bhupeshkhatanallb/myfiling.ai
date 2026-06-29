# myfiling.ai - container for Hugging Face Spaces (Docker SDK).
# HF Spaces routes traffic to port 7860 by default; the server reads $PORT.
FROM python:3.11-slim

# System libs PyMuPDF / Pillow / numpy wheels rely on at runtime. (No Tesseract:
# OCR stays off here - the detector skips it gracefully.)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces runs the container as a non-root user (uid 1000). Create it and a
# writable home so caches / the SQLite recents DB have somewhere to live.
RUN useradd -m -u 1000 appuser
ENV HOME=/home/appuser \
    PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    RECENTS_DB_PATH=/home/appuser/recents.db \
    ENABLE_OCR=false \
    ANALYZE_CONCURRENCY=1

WORKDIR /app

# Install deps first (better layer caching).
COPY --chown=appuser:appuser requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the app (the .dockerignore keeps test PDFs / reference code out).
COPY --chown=appuser:appuser . .

USER appuser
EXPOSE 7860

# With 16 GB RAM the aggressive 512 MB caps aren't needed, but a single worker
# keeps it simple and predictable.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT} --workers 1"]
