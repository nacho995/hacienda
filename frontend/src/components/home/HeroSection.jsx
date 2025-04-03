"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaAngleLeft, FaAngleRight, FaPlay } from 'react-icons/fa';

// Datos de carrusel mejorados
const carouselData = [
  {
    type: 'image',
    src: '/imagendron.jpg',
    alt: 'Hacienda San Carlos - Vista aérea principal',
    title: 'ELEGANCIA & TRADICIÓN',
    subtitle: 'Un espacio donde la historia cobra vida',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">El</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">ARTE DE CELEBRAR</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Momentos</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">INOLVIDABLES</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Donde cada evento se convierte en un </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">RECUERDO ETERNO</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">envuelto en la más exquisita elegancia.</span>',
    cta: 'Conocer Más'
  },
  {
    type: 'image',
    src: '/imagendron2.jpg',
    alt: 'Hacienda San Carlos - Vista aérea panorámica',
    title: 'EVENTOS & CELEBRACIONES',
    subtitle: 'Momentos inolvidables en un entorno único',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Tu</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">BODA PERFECTA</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Merece un</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">LUGAR ÚNICO</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Creamos </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">EXPERIENCIAS A MEDIDA</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">para que tu día especial sea exactamente como lo imaginaste.</span>',
    cta: 'Ver Bodas'
  },
  {
    type: 'image',
    src: '/imagendron3.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de jardines',
    title: 'NATURALEZA & ARMONÍA',
    subtitle: 'Jardines exuberantes para su deleite',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">ESPACIOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">ÚNICOS</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Para</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">CADA</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Ocasión</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Nuestros </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">JARDINES Y SALONES</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">se adaptan a tu visión y estilo para crear el ambiente perfecto.</span>',
    cta: 'Espacios'
  },
  {
    type: 'image',
    src: '/imagendron4.jpg',
    alt: 'Hacienda San Carlos - Vista aérea completa',
    title: 'EXPLORA & DESCUBRE',
    subtitle: 'Recorre virtualmente nuestras instalaciones',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">TRADICIÓN</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">y</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">ELEGANCIA</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">En</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">CADA DETALLE</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">La perfecta combinación entre </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">HISTORIA Y MODERNIDAD</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">para eventos que trascienden el tiempo.</span>',
    cta: 'Galería'
  },
  {
    type: 'image',
    src: '/imagendron5.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de piscina y áreas verdes',
    title: 'RELAX & CONFORT',
    subtitle: 'Disfruta de nuestras áreas de descanso',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">EVENTOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">CORPORATIVOS</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">De</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">ALTO NIVEL</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">El entorno perfecto para </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">REUNIONES EJECUTIVAS</span><span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">, conferencias y eventos empresariales exclusivos.</span>',
    cta: 'Eventos'
  },
  {
    type: 'image',
    src: '/imagendron6.JPG',
    alt: 'Hacienda San Carlos - Vista aérea jardines traseros',
    title: 'JARDINES & ESPACIOS',
    subtitle: 'Áreas exclusivas para tu celebración',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">CELEBRACIONES</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">Familiares</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">MEMORABLES</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">El escenario ideal para reunir a tus </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-primary); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">SERES QUERIDOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB; transform: translateZ(20px); display: inline-block;">en ocasiones especiales inolvidables.</span>',
    cta: 'Contacto'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('next');
  const [loadedSlides, setLoadedSlides] = useState([0]);
  const sliderRef = useRef(null);
  const medallionRef = useRef(null);
  const slideInterval = 7000; // 7 segundos
  
  // Precarga de imágenes para transiciones suaves
  useEffect(() => {
    const slidesToLoad = carouselData.map((_, index) => index);
    setLoadedSlides(slidesToLoad);
  }, []);
  
  // Carrusel automático
  useEffect(() => {
    if (!isPlaying || isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationDirection('next');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }, 500);
    }, slideInterval);
    
    return () => clearInterval(interval);
  }, [isPlaying, isAnimating, carouselData.length]);
  
  const handlePrevSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection('prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [isAnimating, carouselData.length]);
  
  const handleNextSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection('next');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [isAnimating, carouselData.length]);
  
  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    
    setIsPlaying(false);
    setAnimationDirection(index > currentSlide ? 'next' : 'prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide(index);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 500);
  }, [currentSlide, isAnimating]);
  
  // Efecto de teclado para navegar entre diapositivas
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevSlide, handleNextSlide]);
  
  // Efecto de parallax para el fondo
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sliderRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX / innerWidth - 0.5) * 20; // Movimiento horizontal
      const moveY = (clientY / innerHeight - 0.5) * 20; // Movimiento vertical
      
      const slides = sliderRef.current.querySelectorAll('.slide-image');
      
      slides.forEach((slide) => {
        slide.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      
      // Mover el medallón en dirección opuesta para efecto de parallax
      if (medallionRef.current) {
        medallionRef.current.style.transform = `translate(${-moveX * 0.5}px, ${-moveY * 0.5}px) rotate(${moveX * 0.03}deg)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Efecto de parallax al hacer scroll para el medallón
  useEffect(() => {
    const handleScroll = () => {
      if (medallionRef.current) {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.02; // Rotación suave al hacer scroll
        const scale = 1 - (scrollY * 0.0005); // Reducción de escala al hacer scroll
        const opacity = Math.max(1 - (scrollY * 0.003), 0);
        
        medallionRef.current.style.transform = `
          translateY(${scrollY * 0.15}px)
          rotate(${rotation}deg)
          scale(${Math.max(scale, 0.6)})
        `;
        medallionRef.current.style.opacity = opacity;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const current = carouselData[currentSlide];

  return (
    <section className="relative h-[90vh] min-h-[650px] md:min-h-[700px] lg:min-h-[750px] w-full overflow-hidden">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/30 to-[var(--color-accent)]/50 z-10"></div>
      
      {/* Carrusel de fondo */}
      <div 
        ref={sliderRef}
        className="relative h-full overflow-hidden"
      >
        {loadedSlides.map((index) => (
          <div 
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full overflow-hidden">
              <div className="slide-image absolute inset-0 transition-transform duration-1000 ease-out will-change-transform">
                <Image
                  src={carouselData[index].src}
                  alt={carouselData[index].alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className={`object-cover transition-transform duration-7000 ease-out transform scale-[1.15] ${
                    index === currentSlide ? 'animate-ken-burns' : ''
                  }`}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-accent)]/60 to-black/50"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Medallón decorativo central con efecto de parallax */}
      <div 
        ref={medallionRef}
        className="absolute top-[160px] md:top-[180px] lg:top-[220px] left-[10px] md:left-[40px] lg:left-[100px] transform z-20 pointer-events-none w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] hidden sm:block"
        style={{ 
          transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
        }}
      >
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Definiciones para filtros */}
          <defs>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.8" />
            </filter>
          </defs>
          
          {/* Fondo semitransparente del medallón */}
          <circle cx="250" cy="250" r="225" fill="rgba(0,0,0,0.3)" />
          
          {/* Círculos decorativos externos */}
          <circle cx="250" cy="250" r="245" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
          <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
          
          {/* Forma de medallón radiante */}
          <path d="M250,30 
                   C330,30 400,90 430,170
                   C460,250 440,350 370,410
                   C300,470 200,470 130,410
                   C60,350 40,250 70,170
                   C100,90 170,30 250,30 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.5" />
          
          {/* Adorno medallón interno */}
          <circle cx="250" cy="250" r="150" fill="none" stroke="#800020" strokeWidth="1" opacity="0.3" />
          <circle cx="250" cy="250" r="120" fill="none" stroke="#800020" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
          
          {/* Rayos decorativos */}
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * 30) * Math.PI / 180;
            const x1 = Math.round((250 + 150 * Math.cos(angle)) * 100) / 100;
            const y1 = Math.round((250 + 150 * Math.sin(angle)) * 100) / 100;
            const x2 = Math.round((250 + 220 * Math.cos(angle)) * 100) / 100;
            const y2 = Math.round((250 + 220 * Math.sin(angle)) * 100) / 100;
            return (
              <line 
                key={index}
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#800020" 
                strokeWidth="1" 
                opacity={0.3 + (index % 3) * 0.2}
              />
            );
          })}
          
          {/* Elementos decorativos de celebración */}
          {/* Copa de champagne izquierda */}
          <path d="M180,150 C200,170 200,200 190,220 L170,250 L210,250 L190,220 C180,200 180,170 200,150 Z" 
                fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          <line x1="190" y1="250" x2="190" y2="270" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          
          {/* Copa de champagne derecha */}
          <path d="M320,150 C340,170 340,200 330,220 L310,250 L350,250 L330,220 C320,200 320,170 340,150 Z" 
                fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          <line x1="330" y1="250" x2="330" y2="270" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.7" />
          
          {/* Anillos de boda entrelazados */}
          <circle cx="230" cy="320" r="25" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.8" />
          <circle cx="270" cy="320" r="25" fill="none" stroke="#FFFAF0" strokeWidth="2" opacity="0.8" />
          
          {/* Corazón decorativo */}
          <path d="M250,180 
                   C270,150 310,150 310,180 
                   C310,210 250,240 250,240 
                   C250,240 190,210 190,180 
                   C190,150 230,150 250,180 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.6" />
          
          {/* Líneas decorativas */}
          <path d="M230,320 C230,270 250,250 290,250 M270,320 C270,270 250,250 210,250" 
                stroke="#FFFAF0" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          
          {/* Texto elegante en el centro - "CELEBRA" */}
          <g transform="translate(250, 250)" className="events-text">
            <text textAnchor="middle" fontFamily="serif" fontSize="30" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="4" filter="url(#textShadow)">
              CELEBRA
            </text>
            <text textAnchor="middle" fontFamily="serif" fontSize="18" fill="#FFFAF0" fontWeight="light" opacity="0.9" letterSpacing="2" y="30">
              MOMENTOS ÚNICOS
            </text>
          </g>
          
          {/* Elementos decorativos - estrellas */}
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index * 45 + 22.5) * Math.PI / 180;
            const distance = 180;
            const x = Math.round((250 + distance * Math.cos(angle)) * 100) / 100;
            const y = Math.round((250 + distance * Math.sin(angle)) * 100) / 100;
            const size = 5 + (index % 3) * 2;
            
            return (
              <g key={`star-${index}`} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r={size / 2} fill="none" stroke="#FFFAF0" strokeWidth="1" opacity="0.6" />
                <path d={`M0,-${size} L${Math.round(size/4 * 100) / 100},-${Math.round(size/4 * 100) / 100} L${size},0 L${Math.round(size/4 * 100) / 100},${Math.round(size/4 * 100) / 100} L0,${size} L-${Math.round(size/4 * 100) / 100},${Math.round(size/4 * 100) / 100} L-${size},0 L-${Math.round(size/4 * 100) / 100},-${Math.round(size/4 * 100) / 100} Z`} 
                      fill="none" stroke="#FFFAF0" strokeWidth="0.5" opacity="0.4" />
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Overlay decorativo */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
      </div>
      
      {/* Contenido principal */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            {/* Slider de contenido - bajado para que no se tape con navbar */}
            <div className="relative overflow-hidden h-[300px] md:h-[350px] lg:h-[380px] mt-20 md:mt-28 lg:mt-32 perspective-[1000px]">
              {carouselData.map((slide, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 transform ${
                    index === currentSlide && !isAnimating
                      ? 'translate-x-0 opacity-100'
                      : index === currentSlide && isAnimating
                        ? animationDirection === 'next'
                          ? 'translate-x-[100px] opacity-0'
                          : 'translate-x-[-100px] opacity-0'
                        : animationDirection === 'next' && (currentSlide === 0 ? index === carouselData.length - 1 : index === currentSlide - 1)
                          ? 'translate-x-[-100px] opacity-0'
                          : animationDirection === 'prev' && (currentSlide === carouselData.length - 1 ? index === 0 : index === currentSlide + 1)
                            ? 'translate-x-[100px] opacity-0'
                            : 'translate-x-0 opacity-0'
                  }`}
                >
                  {/* Decorador superior elegante */}
                  <div className="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 animate-delay-100 pt-0">
                    <div className="w-20 md:w-24 lg:w-32 h-[1px] bg-[var(--color-primary)] mx-auto mb-2"></div>
                    <div className="relative inline-block mb-1">
                      <span className="block text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-extrabold z-10 transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "#FFFFFF", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                        {slide.title}
                      </span>
                      <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
                    </div>
                    <div className="relative inline-block">
                      <span className="block text-sm md:text-base font-[var(--font-display)] text-white tracking-wide drop-shadow-[0_0_3px_rgba(110,70,20,0.9)] z-10">
                        {slide.subtitle}
                      </span>
                      <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -8px -6px round 6px)' }}></div>
                    </div>
                    <div className="w-20 md:w-24 lg:w-32 h-[1px] bg-[var(--color-primary)] mx-auto mt-2 mb-4"></div>
                  </div>
                  
                  {/* Layout nuevo para mostrar el heading primero - unificando estilos de letra */}
                  <div className="flex flex-col items-center justify-center gap-2 md:gap-3 text-center perspective-[1000px] transform-style-preserve-3d">
                    <div className="relative z-10">
                      <div className="relative transform-style-preserve-3d">
                        <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-[var(--font-display)] leading-tight tracking-tight inline-block transform-style-preserve-3d">
                          <span dangerouslySetInnerHTML={{ __html: slide.heading.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif") }} />
                        </h1>
                        <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
                      </div>
                    </div>
                    
                    {slide.secondHeading && (
                      <div className="relative z-10">
                        <div className="relative transform-style-preserve-3d">
                          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-[var(--font-display)] font-normal leading-tight tracking-tight inline-block mt-0 transform-style-preserve-3d">
                            <span dangerouslySetInnerHTML={{ __html: slide.secondHeading.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif") }} />
                          </h2>
                          <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative z-10 mt-3 md:mt-4">
                      <div className="relative transform-style-preserve-3d">
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-[var(--font-display)] font-normal max-w-3xl mx-auto text-white transform-style-preserve-3d">
                          <span dangerouslySetInnerHTML={{ __html: slide.description.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif") }} />
                        </p>
                        <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Controles del carrusel */}
        <div className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 md:space-x-6 z-30">
          <button
            onClick={handlePrevSlide}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-primary)]/20 transition-all duration-300"
            aria-label="Diapositiva anterior"
          >
            <FaAngleLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-[3px] transition-all duration-500 ${
                  index === currentSlide 
                    ? 'w-8 bg-[var(--color-primary)]' 
                    : 'w-4 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNextSlide}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-primary)]/20 transition-all duration-300"
            aria-label="Siguiente diapositiva"
          >
            <FaAngleRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
} 