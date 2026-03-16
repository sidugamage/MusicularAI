from pytubefix import YouTube
import os

class ScraperService:
    def get_metadata(self, url: str):
        try:
            yt = YouTube(url)
            return {
                "video_id": yt.video_id,
                "title": yt.title,
                "subscribers": yt.channel_id,
                "duration": yt.length,
                "upload_date": yt.publish_date,
                "yt_object": yt
            }
        except Exception as e:
            raise ValueError(f"Invalid YouTube URL: {str(e)}")