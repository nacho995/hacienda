"use client";

import React, { forwardRef, useEffect, useRef } from 'react';
import { Video } from 'cloudinary-react';

// Configuración de Cloudinary
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tu_cloud_name';

const CloudinaryVideo = forwardRef(({ 
  publicId, 
  className, 
  controls = false, 
  autoPlay = false, 
  muted = true, 
  loop = false,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onVolumeChange
}, ref) => {
  const videoRef = useRef(null);
  
  // Exponer métodos del video a través de la referencia
  useEffect(() => {
    if (!ref) return;
    
    const videoElement = videoRef.current?.videoElement || videoRef.current;
    
    if (videoElement) {
      if (typeof ref === 'function') {
        ref(videoElement);
      } else {
        ref.current = videoElement;
      }
    }
  }, [ref]);
  
  return (
    <div className={className}>
      <Video
        ref={videoRef}
        cloudName={cloudName}
        publicId={publicId}
        controls={controls}
        muted={muted}
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onVolumeChange={onVolumeChange}
        className="w-full h-full object-cover"
      />
    </div>
  );
});

CloudinaryVideo.displayName = 'CloudinaryVideo';

export default CloudinaryVideo; 