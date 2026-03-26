FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    nodejs \
    npm \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install bgutil-ytdlp-pot-provider

# Clone and build the bgutil server scripts
RUN git clone https://github.com/brainbotdev/bgutil-ytdlp-pot-provider.git \
    /root/bgutil-ytdlp-pot-provider && \
    cd /root/bgutil-ytdlp-pot-provider/server && \
    npm install && npm run build

COPY . .

RUN mkdir -p app/temp_uploads
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"