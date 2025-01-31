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
  const [totalFrames, setTotalFrames] = useState<number>(50);
  const [videoFileName, setVideoFileName] = useState<string>('');
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
      setVideoFileName(file.name);
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
          style={{ display: 'block', margin: '0 auto' }}
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
        <button
          onClick={handleConvert}
          disabled={loading}
          style={{
            backgroundColor: loading
              ? 'var(--color-fill-base-300)'
              : 'var(--color-primary)',
            border: 'none',
            color: 'var(--color-text)',
            padding: '10px 20px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            margin: '8px 2px',
            cursor: loading ? 'default' : 'pointer',
            borderRadius: '8px',
          }}
        >
          Convert to GIF
        </button>
      )}

      {loading && (
        <div>
          <p>Converting... {progress}%</p>
          <progress value={progress} max="100" />
          <button
            onClick={handleAbort}
            style={{
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              color: 'var(--color-text)',
              padding: '10px 20px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              margin: '8px 2px',
              cursor: 'pointer',
              borderRadius: '8px',
            }}
          >
            Abort
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {gifUrl && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <img src={gifUrl} alt="Generated GIF" />
          <br />
          <a
            href={gifUrl}
            download={
              videoFileName
                ? `${videoFileName.substring(
                  0,
                  videoFileName.lastIndexOf('.'),
                )}.gif`
                : 'generated.gif'
            }
            style={{
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              color: 'var(--color-text)',
              padding: '10px 20px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              margin: '8px 2px',
              cursor: 'pointer',
              borderRadius: '8px',
            }}
          >
            Download GIF
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoToGifConverter;