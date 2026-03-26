FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install yt-dlp PO Token provider for YouTube bot bypass
RUN pip install bgutil-ytdlp-pot-provider

COPY . .

RUN mkdir -p app/temp_uploads
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"