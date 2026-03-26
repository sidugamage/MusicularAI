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
RUN pip install bgutil-ytdlp-pot-provider

# Build the bgutil server scripts that yt-dlp needs
RUN mkdir -p /root/bgutil-ytdlp-pot-provider && \
    pip show bgutil-ytdlp-pot-provider | grep Location | \
    awk '{print $2"/bgutil_ytdlp_pot_provider/server"}' | \
    xargs -I{} cp -r {} /root/bgutil-ytdlp-pot-provider/server && \
    cd /root/bgutil-ytdlp-pot-provider/server && \
    npm install && npm run build

COPY . .

RUN mkdir -p app/temp_uploads
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"