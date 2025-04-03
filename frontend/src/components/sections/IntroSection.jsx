"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { GiCastle } from 'react-icons/gi';
import { FaHeart, FaGift, FaPlayCircle, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaQuoteLeft, FaChevronDown } from 'react-icons/fa';
import { MdReplay10, MdForward10, MdSubtitles, MdSubtitlesOff } from 'react-icons/md';
import Image from 'next/image';

export default function IntroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [logoVisible, setLogoVisible] = useState(false);
  
  // ID del video de YouTube
  const youtubeVideoId = 'Xn8RQw-AvcA';
  
  // Estado para video y controles
  const [showControls, setShowControls] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [player, setPlayer] = useState(null);
  const playerContainerRef = useRef(null);
  
  // Cargar la API de YouTube
  useEffect(() => {
    // Función global que YouTube llamará cuando el API esté listo
    window.onYouTubeIframeAPIReady = () => {
      if (!showYouTubePlayer || !playerContainerRef.current) return;
      
      try {
        const newPlayer = new window.YT.Player('youtube-player', {
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            mute: 1,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            cc_load_policy: 0, // Por defecto sin subtítulos
            cc_lang_pref: 'es' // Preferencia de idioma español
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: (e) => console.error("Error en YouTube Player:", e)
          }
        });
        
        setPlayer(newPlayer);
      } catch (error) {
        console.error("Error al crear el reproductor de YouTube:", error);
      }
    };
    
    // Cargar el script de la API de YouTube
    const loadYouTubeAPI = () => {
      try {
        const existingScript = document.getElementById('youtube-api');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.id = 'youtube-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.async = true;
          document.head.appendChild(tag);
        } else if (window.YT && window.YT.Player && showYouTubePlayer && playerContainerRef.current) {
          window.onYouTubeIframeAPIReady();
        }
      } catch (error) {
        console.error("Error en loadYouTubeAPI:", error);
      }
    };
    
    if (showYouTubePlayer) {
      loadYouTubeAPI();
    }
    
    return () => {
      // Limpieza al desmontar
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (error) {
          console.error("Error al destruir el reproductor:", error);
        }
      }
    };
  }, [showYouTubePlayer, youtubeVideoId]);
  
  const onPlayerReady = (event) => {
    try {
      const player = event.target;
      // Inicializar duración
      const duration = player.getDuration();
      
      setVideoDuration(duration);
      player.playVideo();
      setIsVideoPlaying(true);
      
      // Asegurar que el progreso se inicie desde cero
      setVideoProgress(0);
    } catch (error) {
      console.error("Error en onPlayerReady:", error);
    }
  };
  
  const onPlayerStateChange = (event) => {
    try {
      const newState = event.data;
      
      setIsVideoPlaying(newState === window.YT.PlayerState.PLAYING);
      
      // Actualizar duración si no está definida
      if (videoDuration <= 0 && event.target.getDuration) {
        const duration = event.target.getDuration();
        if (duration > 0) {
          setVideoDuration(duration);
        }
      }
      
      // Si está reproduciendo, comenzar a actualizar el tiempo actual
      if (newState === window.YT.PlayerState.PLAYING) {
        // Actualizar tiempo inmediatamente
        if (event.target.getCurrentTime) {
          const currentTime = event.target.getCurrentTime();
          setVideoProgress(currentTime);
        }
      }
    } catch (error) {
      console.error("Error en onPlayerStateChange:", error);
    }
  };
  
  // Efecto para manejar el monitoreo del tiempo y limpiar recursos
  useEffect(() => {
    let timeMonitoringInterval;
    
    if (player && isVideoPlaying) {
      try {
        // Iniciar temporizador solo si el video está reproduciéndose
        timeMonitoringInterval = setInterval(() => {
          try {
            if (player && typeof player.getCurrentTime === 'function') {
              const currentTime = player.getCurrentTime();
              const duration = player.getDuration(); // Actualizar duración regularmente
              
              // Actualizar duración si es mayor que la almacenada
              if (duration > videoDuration) {
                setVideoDuration(duration);
              }
              
              setVideoProgress(currentTime);
            }
          } catch (error) {
            console.error("Error actualizando tiempo:", error);
          }
        }, 500); // Intervalo más largo para mejor rendimiento
      } catch (error) {
        console.error("Error al inicializar monitoreo de tiempo:", error);
      }
    }
    
    return () => {
      if (timeMonitoringInterval) {
        clearInterval(timeMonitoringInterval);
      }
    };
  }, [player, isVideoPlaying, videoDuration]);
  
  // Iniciar reproducción de YouTube
  const startPlayback = () => {
    setShowYouTubePlayer(true);
  };
  
  // Control de reproducción
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    
    if (!showYouTubePlayer) {
      startPlayback();
      return;
    }
    
    if (player && typeof player.getPlayerState === 'function') {
      try {
        const playerState = player.getPlayerState();
        if (playerState === window.YT.PlayerState.PLAYING) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      } catch (error) {
        console.error("Error al cambiar estado de reproducción:", error);
      }
    }
  };
  
  // Control de mute
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    
    if (player) {
      try {
        if (isMuted) {
          player.unMute();
          player.setVolume(volume);
        } else {
          player.mute();
        }
        setIsMuted(!isMuted);
        setShowVolumeSlider(!showVolumeSlider);
      } catch (error) {
        console.error("Error al cambiar estado de mute:", error);
      }
    }
  };
  
  // Control de volumen
  const handleVolumeChange = (e) => {
    if (e) e.stopPropagation();
    
    if (player) {
      try {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        
        player.setVolume(newVolume);
        
        // Si el volumen es 0, silenciar; de lo contrario, asegurar que no está silenciado
        if (newVolume === 0) {
          player.mute();
          setIsMuted(true);
        } else if (isMuted) {
          player.unMute();
          setIsMuted(false);
        }
      } catch (error) {
        console.error("Error al cambiar volumen:", error);
      }
    }
  };
  
  // Mostrar/ocultar control de volumen
  const toggleVolumeSlider = (e) => {
    if (e) e.stopPropagation();
    setShowVolumeSlider(!showVolumeSlider);
  };
  
  // Saltar adelante 10 segundos
  const seekForward = (e) => {
    if (e) e.stopPropagation();
    
    if (player && typeof player.seekTo === 'function' && typeof player.getCurrentTime === 'function') {
      try {
        const currentTime = player.getCurrentTime();
        const newTime = Math.min(currentTime + 10, videoDuration);
        player.seekTo(newTime, true);
      } catch (error) {
        console.error("Error al avanzar:", error);
      }
    }
  };
  
  // Saltar atrás 10 segundos
  const seekBackward = (e) => {
    if (e) e.stopPropagation();
    
    if (player && typeof player.seekTo === 'function' && typeof player.getCurrentTime === 'function') {
      try {
        const currentTime = player.getCurrentTime();
        const newTime = Math.max(currentTime - 10, 0);
        player.seekTo(newTime, true);
      } catch (error) {
        console.error("Error al retroceder:", error);
      }
    }
  };
  
  // Estado para manejar el arrastre de la barra de progreso
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);
  
  // Iniciar arrastre
  const startDrag = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    handleProgressBarInteraction(e);
    
    // Añadir listeners para movimiento y finalización
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', endDrag);
  };
  
  // Durante el arrastre
  const handleDrag = useCallback((e) => {
    if (isDragging) {
      handleProgressBarInteraction(e);
    }
  }, [isDragging]);
  
  // Finalizar arrastre
  const endDrag = useCallback((e) => {
    if (isDragging) {
      handleProgressBarInteraction(e);
      setIsDragging(false);
      
      // Eliminar listeners
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', endDrag);
    }
  }, [isDragging, handleDrag]);
  
  // Limpiar eventos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', endDrag);
    };
  }, [handleDrag, endDrag]);
  
  // Manejar interacción con la barra de progreso (clic o arrastre)
  const handleProgressBarInteraction = (e) => {
    if (!progressBarRef.current || !player || !videoDuration) return;
    
    try {
      let clientX;
      
      // Manejar tanto eventos de mouse como touch
      if (e.type.startsWith('touch')) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
      } else {
        clientX = e.clientX;
      }
      
      const rect = progressBarRef.current.getBoundingClientRect();
      const position = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, position / rect.width));
      const seekTime = percentage * videoDuration;
      
      // Actualizar visualmente de inmediato para mejor UX
      setVideoProgress(seekTime);
      
      // Solo enviar al video cuando se termine de arrastrar o en un clic
      if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'click') {
        if (player && typeof player.seekTo === 'function') {
          player.seekTo(seekTime, true);
        }
      }
    } catch (error) {
      console.error("Error en handleProgressBarInteraction:", error);
    }
  };
  
  // Click en la barra de progreso
  const handleProgressBarClick = (e) => {
    e.stopPropagation();
    if (!player || !videoDuration) return;
    
    handleProgressBarInteraction(e);
  };
  
  // Formatear tiempo en formato mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) return "0:00";
    seconds = Math.max(0, seconds);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Activar pantalla completa  
  const toggleFullScreen = (e) => {
    e.stopPropagation();
    const container = playerContainerRef.current;
    
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error al intentar mostrar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Renderizado de la barra de progreso
  const renderProgressBar = () => {
    const progressPercentage = videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0;
    
    return (
      <div 
        ref={progressBarRef}
        className="w-full h-3 bg-white/30 rounded-full mb-4 relative overflow-visible cursor-pointer group py-4"
        onClick={handleProgressBarClick}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-3 bg-[var(--color-primary)] rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 h-6 w-6 bg-[var(--color-primary)] rounded-full shadow-md border-2 border-white transition-transform ${isDragging ? 'scale-125' : 'group-hover:scale-110'}`}
          style={{ left: `calc(${progressPercentage}% - 12px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            startDrag(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            startDrag(e);
          }}
        ></div>
      </div>
    );
  };
  
  // Control de subtítulos
  const toggleSubtitles = (e) => {
    if (e) e.stopPropagation();
    
    if (player) {
      try {
        if (!subtitlesEnabled) {
          player.loadModule('captions');
          player.setOption('captions', 'track', {'languageCode': 'es'});
          player.setOption('captions', 'displaySettings', {'background': '#00000066'});
        } else {
          player.unloadModule('captions');
        }
        setSubtitlesEnabled(!subtitlesEnabled);
      } catch (error) {
        console.error("Error al cambiar estado de subtítulos:", error);
      }
    }
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Efecto para mostrar el logo con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoVisible(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative pt-16 pb-24 bg-white overflow-hidden"
    >
      {/* Logo elegante en la esquina superior */}
      <div className="absolute top-4 lg:top-8 left-4 lg:left-8 z-20 transform transition-all duration-1000" style={{ opacity: logoVisible ? 1 : 0, transform: logoVisible ? 'translateY(0)' : 'translateY(-20px)' }}>
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-white/70 backdrop-blur-md -z-10 shadow-xl"></div>
          <div className="absolute inset-0 rounded-xl border border-[var(--color-primary-light)]/30 -z-10"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary-light)]/0 via-[var(--color-primary-light)]/30 to-[var(--color-primary-light)]/0 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-20"></div>
          <div className="p-2.5">
            <Image 
              src="/logo.png"
              alt="Hacienda San Carlos"
              width={250}
              height={175}
              className="object-contain filter drop-shadow-[0_0_5px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="container-custom">
        <div className="text-center mb-20">
          <h2 className="elegant-title centered fade-in text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Un <span className="text-[var(--color-primary)] font-semibold">Legado</span> de Distinción
          </h2>
          <div className="gold-divider fade-in animate-delay-100"></div>
          <p className="text-xl md:text-2xl font-light fade-in animate-delay-200 mt-10 max-w-4xl mx-auto leading-relaxed">
            Hacienda San Carlos Borromeo no es solo un lugar, es la <span className="italic text-[var(--color-primary)]">manifestación de la elegancia clásica mexicana</span> donde los momentos especiales cobran vida en un entorno de incomparable belleza.
          </p>
        </div>
        
        {/* Video de YouTube con controles personalizados */}
        <div className="my-20 fade-in animate-delay-200">
          <div 
            className="relative overflow-hidden rounded-lg shadow-2xl aspect-video cursor-pointer"
            ref={playerContainerRef}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={togglePlay}
          >
            {/* Imagen de previsualización */}
            {!showYouTubePlayer && (
              <div className="absolute inset-0 z-10">
                <div className="relative w-full h-full">
                  <img 
                    src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                    alt="Video de Hacienda San Carlos Borromeo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      className="w-20 h-20 bg-[var(--color-primary)]/90 hover:bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPlayback();
                      }}
                      aria-label="Reproducir video"
                    >
                      <FaPlayCircle className="w-10 h-10" />
                    </button>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center text-white text-xl font-semibold drop-shadow-lg">
                    Hacienda San Carlos Borromeo - Espacios
                  </div>
                </div>
              </div>
            )}
            
            {/* Contenedor para el reproductor de YouTube */}
            {showYouTubePlayer && (
              <div className="absolute inset-0 z-0">
                <div id="youtube-player" className="w-full h-full"></div>
              </div>
            )}
            
            {/* Controles personalizados */}
            {showYouTubePlayer && (
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 flex flex-col justify-end p-4 transition-opacity duration-300 z-20 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Barra de progreso */}
                {renderProgressBar()}
                
                {/* Controles de reproducción */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={seekBackward}
                      className="text-white hover:text-[var(--color-primary)] transition-colors p-2"
                      aria-label="Retroceder 10 segundos"
                    >
                      <MdReplay10 className="w-6 h-6" />
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110"
                      aria-label={isVideoPlaying ? "Pausar" : "Reproducir"}
                    >
                      {isVideoPlaying ? <FaPause className="w-4 h-4" /> : <FaPlayCircle className="w-5 h-5" />}
                    </button>
                    
                    <button 
                      onClick={seekForward}
                      className="text-white hover:text-[var(--color-primary)] transition-colors p-2"
                      aria-label="Avanzar 10 segundos"
                    >
                      <MdForward10 className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleSubtitles}
                      className="text-white hover:text-[var(--color-primary)] transition-colors p-2"
                      aria-label={subtitlesEnabled ? "Desactivar subtítulos" : "Activar subtítulos"}
                      title={subtitlesEnabled ? "Desactivar subtítulos" : "Activar subtítulos"}
                    >
                      {subtitlesEnabled ? <MdSubtitles className="w-5 h-5" /> : <MdSubtitlesOff className="w-5 h-5" />}
                    </button>
                    
                    <div className="relative flex items-center">
                      <button 
                        onClick={toggleVolumeSlider}
                        className="text-white hover:text-[var(--color-primary)] transition-colors p-2"
                        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                      >
                        {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                      </button>
                      
                      {showVolumeSlider && (
                        <div className="absolute bottom-full left-0 mb-2 bg-black/80 p-2 rounded-lg w-32">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={volume} 
                            onChange={handleVolumeChange}
                            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            style={{
                              accentColor: 'var(--color-primary)'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <span className="text-white text-sm hidden sm:inline-block">
                      {formatTime(videoProgress)} / {formatTime(videoDuration)}
                    </span>
                    
                    <button 
                      onClick={toggleFullScreen}
                      className="text-white hover:text-[var(--color-primary)] transition-colors p-2"
                      aria-label="Pantalla completa"
                    >
                      <FaExpand className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Cita destacada */}
        <div className="my-16 px-8 py-10 bg-[var(--color-primary)]/5 rounded-lg border-l-4 border-[var(--color-primary)] fade-in animate-delay-300">
          <div className="flex">
            <FaQuoteLeft className="text-[var(--color-primary)] w-8 h-8 mr-4 flex-shrink-0" />
            <p className="text-xl md:text-2xl italic font-light text-[var(--color-accent-dark)]">
              "Cada piedra de esta hacienda cuenta una historia, cada rincón guarda un recuerdo, y ahora, ustedes pueden ser parte de este legado centenario de elegancia y tradición."
            </p>
          </div>
        </div>
        
        {/* Historia de la Hacienda - Formato renovado */}
        <div className="my-20 fade-in animate-delay-300">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-6 font-semibold perspective-[1000px] transform-style-preserve-3d">
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB"}}>
                Historia y Tradición
              </span>
            </h3>
            <div className="w-32 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Primera columna con imagen y texto */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg shadow-md">
                <img 
                  src="/imagenintro.JPG" 
                  alt="Hacienda San Carlos Borromeo" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-white/80 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3 perspective-[1000px] transform-style-preserve-3d">
                  <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 2px rgba(0,0,0,0.7), 0px 0px 4px rgba(0,0,0,0.5), 1px 1px 0px #8B0000, -0.5px -0.5px 0px #FFDBDB"}}>
                    Orígenes Virreinales
                  </span>
                </h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Fundada durante la época virreinal del siglo XVII, esta joya arquitectónica fue originalmente establecida como una hacienda productora de caña de azúcar y pulque. Sus gruesos muros de cantera, patios con fuentes ornamentales y elegantes arcos fusionan perfectamente la arquitectura colonial española con elementos indígenas locales.
                </p>
              </div>
              
              <div className="bg-[var(--color-primary-light)]/5 p-6 rounded-lg shadow-sm border border-[var(--color-primary)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3 perspective-[1000px] transform-style-preserve-3d">
                  <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 2px rgba(0,0,0,0.7), 0px 0px 4px rgba(0,0,0,0.5), 1px 1px 0px #8B0000, -0.5px -0.5px 0px #FFDBDB"}}>
                    Testigo de la Independencia
                  </span>
                </h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Durante la Guerra de Independencia, la hacienda sirvió como refugio temporal para insurgentes. Sus paredes fueron testigos de conversaciones secretas y planes que ayudaron a forjar el México libre que conocemos hoy.
                </p>
              </div>
            </div>
            
            {/* Segunda columna con texto e imagen */}
            <div className="space-y-6">
              <div className="bg-[var(--color-accent-light)]/5 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3 perspective-[1000px] transform-style-preserve-3d">
                  <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 2px rgba(0,0,0,0.7), 0px 0px 4px rgba(0,0,0,0.5), 1px 1px 0px #8B0000, -0.5px -0.5px 0px #FFDBDB"}}>
                    Época Revolucionaria
                  </span>
                </h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  En la época revolucionaria, la hacienda fue escenario de reuniones clandestinas que determinarían el rumbo del país. Figuras históricas recorrieron estos pasillos, dejando su huella imborrable en cada rincón de este monumento histórico.
                </p>
              </div>
              
              <div className="overflow-hidden rounded-lg shadow-md">
                <img 
                  src="/imagenintro2.JPG" 
                  alt="Restauración de la Hacienda San Carlos Borromeo" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="bg-white/80 p-6 rounded-lg shadow-sm border border-[var(--color-accent)]/10">
                <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-3 perspective-[1000px] transform-style-preserve-3d">
                  <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 2px rgba(0,0,0,0.7), 0px 0px 4px rgba(0,0,0,0.5), 1px 1px 0px #8B0000, -0.5px -0.5px 0px #FFDBDB"}}>
                    Renacimiento Cultural
                  </span>
                </h4>
                <p className="leading-relaxed text-[var(--color-accent-dark)]">
                  Tras un cuidadoso proceso de restauración, la hacienda ha recuperado su esplendor original, convirtiéndose en un símbolo de preservación del patrimonio histórico y cultural de México.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legado Actual */}
        <div className="my-20 fade-in animate-delay-400 bg-gradient-to-r from-[var(--color-cream)] to-[var(--color-cream-light)] p-8 rounded-lg shadow-inner">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-[var(--font-display)] text-[var(--color-accent-dark)] mb-4 font-semibold">
              Legado Actual
            </h3>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          </div>
          
          <div className="space-y-4 text-lg leading-relaxed max-w-4xl mx-auto">
            <p>
              Hoy, la <span className="font-semibold perspective-[1000px] transform-style-preserve-3d inline-block" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#A52A2A", textShadow: "0px 0px 2px rgba(0,0,0,0.7), 0px 0px 4px rgba(0,0,0,0.5), 1px 1px 0px #8B0000, -0.5px -0.5px 0px #FFDBDB"}}>Hacienda San Carlos Borromeo</span> se alza como un símbolo de elegancia atemporal y preservación cultural. Sus jardines centenarios, con árboles que han sido testigos silenciosos de la historia, crean un ambiente de serenidad mágica inigualable.
            </p>
            <p>
              Cada celebración que tiene lugar entre sus muros continúa la tradición de momentos significativos que han definido a esta hacienda a lo largo de los siglos, permitiendo a sus visitantes:
            </p>
            
            <ul className="list-none space-y-3 pl-4 mt-4">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Ser parte de un legado histórico único en México</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Escribir su propio capítulo en esta majestuosa propiedad</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Experimentar la fusión perfecta entre historia y modernidad</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 mr-3"></span>
                <span>Disfrutar de un entorno donde cada detalle tiene significado</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Características destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-100 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Arquitectura Colonial
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Muros centenarios e impecables jardines que traen a la vida la esencia atemporal de las haciendas mexicanas, creando un telón de fondo incomparable para su evento.
              </p>
            </div>
          </div>
          
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-200 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Servicio Personalizado
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Cada detalle es tratado con la dedicación que merece. Nuestro equipo trabaja incansablemente para convertir su visión en una celebración excepcional.
              </p>
            </div>
          </div>
          
          <div className="relative group elegant-card p-8 md:p-10 text-center fade-in animate-delay-300 overflow-hidden border border-[var(--color-primary-20)] rounded-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-5)] via-transparent to-[var(--color-primary-10)] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-6 flex flex-col items-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-20)] to-[var(--color-primary-5)] text-[var(--color-primary)] border border-[var(--color-primary-30)] shadow-inner group-hover:shadow-[var(--color-primary-20)] transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-[var(--color-primary)] relative">
                  Experiencia Memorable
                  <span className="block h-1 w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></span>
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-accent-dark)]">
                Combinamos la calidez de la hospitalidad mexicana con un servicio cinco estrellas para crear recuerdos que perdurarán para toda la vida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 