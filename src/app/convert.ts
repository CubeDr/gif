import GIF from 'gif.js';

interface ConvertVideoToGifOptions {
  videoFile: File;
  totalFrames: number;
  onSuccess: (gifUrl: string) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
}

function convertVideoToGif({
  videoFile,
  totalFrames,
  onSuccess,
  onError,
  onProgress,
}: ConvertVideoToGifOptions): () => void {
  let gif: GIF | null = null;

  if (!window.Worker || !window.URL || !window.FileReader) {
    onError(
      'Your browser does not support the required features for GIF conversion.'
    );
    return () => {};
  }

  if (!videoFile.type.startsWith('video/')) {
    onError('Please select a video file.');
    return () => {};
  }

  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const video = document.createElement('video');
    video.src = e.target?.result as string;
    video.style.display = 'none';
    document.body.appendChild(video);

    video.onloadeddata = () => {
      gif = new GIF({
        workers: 2,
        quality: 10,
        width: video.videoWidth,
        height: video.videoHeight,
        workerScript: '/gif.worker.js',
        debug: true,
      });

      const videoDuration = video.duration;
      const timeIncrement = videoDuration / totalFrames;

      let currentFrame = 0;
      video.currentTime = 0;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        onError('Canvas context is not available.');
        document.body.removeChild(video);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const captureFrame = () => {
        if (gif == null) return;

        if (currentFrame < totalFrames) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx, { copy: true, delay: timeIncrement * 1000 });

          video.currentTime += timeIncrement;
          currentFrame++;
          const addFrameProgress = Math.round(
            (currentFrame / totalFrames) * 50
          );
          if (onProgress) {
            onProgress(addFrameProgress);
          }
          requestAnimationFrame(captureFrame);
        } else {
          gif.render();
        }
      };

      gif.on('finished', (blob: Blob) => {
        const gifUrl = URL.createObjectURL(blob);
        onSuccess(gifUrl);
        document.body.removeChild(video);
        gif = null;
      });

      gif.on('progress', (p: number) => {
        const renderProgress = 50 + Math.round(p * 50);
        if (onProgress) {
          onProgress(renderProgress);
        }
      });

      gif.on('abort', () => {
        onError('GIF conversion aborted.');
        document.body.removeChild(video);
        gif = null;
      });

      gif.on('error', (err: string) => {
        onError('Error during conversion: ' + err);
        document.body.removeChild(video);
        gif = null;
      });

      captureFrame();
    };
  };

  reader.readAsDataURL(videoFile);

  return () => {
    if (gif) {
      gif.abort();
    }
  };
}

export default convertVideoToGif;
