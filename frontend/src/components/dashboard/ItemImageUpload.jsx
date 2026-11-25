import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ImageIcon, Trash2, RotateCw, Check, X, AlertTriangle } from './icons';

function fileToDataUrl(file, maxWidth = 1280, maxHeight = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ItemImageUpload({ value, onChange, label = 'Item Photo' }) {
  const [mode, setMode] = useState('idle');
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopStream();
    }
  }, [mode, facingMode]);

  const startCamera = async () => {
    stopStream();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Direct camera feed error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. You can still take a picture via your device camera button below.'
          : 'Could not access camera feed. You can still use your device camera or upload a file.'
      );
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopStream();
    setMode('idle');
    onChange(dataUrl);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
      setMode('idle');
    } catch (err) {
      console.error('Failed to process image file:', err);
    }
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const dataUrl = await fileToDataUrl(file);
        onChange(dataUrl);
        setMode('idle');
      } catch (err) {
        console.error('Failed to process dropped image:', err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    stopStream();
    setMode('idle');
    onChange(null);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} <span className="text-slate-400 font-normal">(Optional but recommended)</span>
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            Photo Attached
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {value && mode !== 'camera' && (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-2xs group">
            <img
              src={value}
              alt="Item preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded">
                Attached
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h4 className="text-xs font-bold text-slate-900">Photo successfully attached</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              This photo will be displayed on your report to assist staff and security in verifying matching campus items.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Different Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('camera')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Retake Picture</span>
              </button>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'camera' && (
        <div className="rounded-2xl border border-blue-200 bg-slate-900 overflow-hidden shadow-lg p-3 text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-blue-400">
              <Camera className="w-4 h-4" />
              Live Camera Capture
            </span>
            <button
              type="button"
              onClick={() => {
                stopStream();
                setMode('idle');
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Cancel Camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {cameraError ? (
            <div className="py-6 px-4 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">{cameraError}</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Open Camera App
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    setMode('idle');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative aspect-video max-h-64 sm:max-h-72 w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    Position item in frame
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Switch Front/Rear Camera"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Flip Camera</span>
                </button>

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer scale-105 active:scale-95"
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  <span>Capture Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    setMode('idle');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!value && mode !== 'camera' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50/80 hover:border-slate-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100 shadow-2xs">
            <ImageIcon className="w-5 h-5" />
          </div>

          <p className="text-xs font-semibold text-slate-800">
            Add an item photo to help identify it faster
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Choose to upload an image from your device or take a picture using your camera
          </p>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Upload Photo</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">or</span>

            <button
              type="button"
              onClick={() => setMode('camera')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Take a Picture</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-2.5">
            Supports JPG, PNG, WEBP up to 10MB • Drag & drop supported
          </p>
        </div>
      )}
    </div>
  );
}
