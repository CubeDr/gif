'use client';

import React, { useState, useRef } from 'react';
import convertVideoToGif from './convert';

const VideoToGifConverter: React.FC = () => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortConversionRef = useRef<() => void>(() => { });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setProgress(0);
      setError(null);
      setGifUrl(null);

      abortConversionRef.current = convertVideoToGif({
        videoFile: file,
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

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {fileInputRef.current?.files?.[0]
          ? 'Change Video'
          : 'Upload Video'}
      </button>

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