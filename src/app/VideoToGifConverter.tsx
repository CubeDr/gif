'use client';

import React, { useState, useRef, useEffect } from 'react';
import convertVideoToGif from './convert'; // Adjust path if necessary

const VideoToGifConverter: React.FC = () => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showConvertButton, setShowConvertButton] = useState<boolean>(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [totalFrames, setTotalFrames] = useState<number>(50); // Initial value
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortConversionRef = useRef<() => void>(() => { });

  useEffect(() => {
    if (videoSource && videoRef.current) {
      videoRef.current.src = videoSource;
      setShowConvertButton(true);
    }
  }, [videoSource]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target) {
          setVideoSource(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      setLoading(false);
      setProgress(0);
      setError(null);
      setGifUrl(null);
    }
  };

  const handleConvert = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setLoading(true);
      setProgress(0);
      setError(null);
      setGifUrl(null);

      abortConversionRef.current = convertVideoToGif({
        videoFile: file,
        totalFrames: totalFrames,
        onSuccess: (url) => {
          setGifUrl(url);
          setLoading(false);
        },
        onError: (errorMessage) => {
          setError(errorMessage);
          setLoading(false);
        },
        onProgress: (p) => {
          setProgress(p);
        },
      });
    }
  };

  const handleAbort = () => {
    if (abortConversionRef.current) {
      abortConversionRef.current();
      setLoading(false);
      setProgress(0);
      setError('Conversion aborted.');
    }
  };

  const handleTotalFramesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTotalFrames(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      {videoSource && (
        <video
          ref={videoRef}
          width="320"
          controls
          style={{ display: 'block' }}
          onEnded={() => setShowConvertButton(false)}
        />
      )}

      <div>
        <label htmlFor="totalFrames">Total Frames:</label>
        <input
          type="range"
          id="totalFrames"
          min="10"
          max="100"
          value={totalFrames}
          onChange={handleTotalFramesChange}
        />
        <span>{totalFrames}</span>
      </div>

      {showConvertButton && (
        <button onClick={handleConvert} disabled={loading}>
          Convert to GIF
        </button>
      )}

      {loading && (
        <div>
          <p>Converting... {progress}%</p>
          <progress value={progress} max="100" />
          <button onClick={handleAbort}>Abort</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {gifUrl && (
        <div>
          <img src={gifUrl} alt="Generated GIF" />
          <a href={gifUrl} download="generated.gif">
            Download GIF
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoToGifConverter;