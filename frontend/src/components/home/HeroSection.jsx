"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaAngleLeft, FaAngleRight, FaPlay } from 'react-icons/fa';

// Datos de carrusel mejorados
const carouselData = [
  {
    type: 'image',
    src: '/images/imagendron.jpg',
    alt: 'Hacienda San Carlos - Vista aérea principal',
    title: 'ELEGANCIA & TRADICIÓN',
    subtitle: 'Un espacio donde la historia cobra vida',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">El</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">ARTE DE CELEBRAR</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Momentos</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">INOLVIDABLES</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Donde cada evento se convierte en un </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">RECUERDO ETERNO</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">envuelto en la más exquisita elegancia.</span>',
    cta: 'Conocer Más'
  },
  {
    type: 'image',
    src: '/images/imagendron2.jpg',
    alt: 'Hacienda San Carlos - Vista aérea panorámica',
    title: 'EVENTOS & CELEBRACIONES',
    subtitle: 'Momentos inolvidables en un entorno único',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Tu</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">BODA PERFECTA</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Merece un</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">LUGAR ÚNICO</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Creamos </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">EXPERIENCIAS A MEDIDA</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">para que tu día especial sea exactamente como lo imaginaste.</span>',
    cta: 'Ver Bodas'
  },
  {
    type: 'image',
    src: '/images/imagendron3.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de jardines',
    title: 'NATURALEZA & ARMONÍA',
    subtitle: 'Jardines exuberantes para su deleite',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">ESPACIOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">ÚNICOS</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Para</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">CADA</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Ocasión</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Nuestros </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">JARDINES Y SALONES</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">se adaptan a tu visión y estilo para crear el ambiente perfecto.</span>',
    cta: 'Espacios'
  },
  {
    type: 'image',
    src: '/images/imagendron4.jpg',
    alt: 'Hacienda San Carlos - Vista aérea completa',
    title: 'EXPLORA & DESCUBRE',
    subtitle: 'Recorre virtualmente nuestras instalaciones',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">TRADICIÓN</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Y</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">ELEGANCIA</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">En</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">CADA DETALLE</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">La perfecta combinación entre </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">HISTORIA Y MODERNIDAD</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">para eventos que trascienden el tiempo.</span>',
    cta: 'Galería'
  },
  {
    type: 'image',
    src: '/images/imagendron5.jpg',
    alt: 'Hacienda San Carlos - Vista aérea de piscina y áreas verdes',
    title: 'RELAX & CONFORT',
    subtitle: 'Disfruta de nuestras áreas de descanso',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">EVENTOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">CORPORATIVOS</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">De</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">ALTO NIVEL</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">El entorno perfecto para </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">REUNIONES EJECUTIVAS</span><span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">, conferencias y eventos empresariales exclusivos.</span>',
    cta: 'Eventos'
  },
  {
    type: 'image',
    src: '/images/imagendron6.JPG',
    alt: 'Hacienda San Carlos - Vista aérea jardines traseros',
    title: 'JARDINES & ESPACIOS',
    subtitle: 'Áreas exclusivas para tu celebración',
    heading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">CELEBRACIONES</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">Familiares</span>',
    secondHeading: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">MEMORABLES</span>',
    description: '<span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">El escenario ideal para reunir a tus </span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: var(--color-brown-medium); font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">SERES QUERIDOS</span> <span style="font-family: \'Trajan Pro\', \'Cinzel\', \'Didot\', serif; color: #FFFFFF; font-weight: 900; text-shadow: 0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px var(--color-brown-dark), -1px -1px 0px var(--color-brown-light); transform: translateZ(20px); display: inline-block;">en ocasiones especiales inolvidables.</span>',
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
    <section className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* Fondo con degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gradient-primary)] to-[var(--gradient-secondary)] opacity-90 z-0" />
      
      {/* Overlay con patrón */}
      <div className="absolute inset-0 bg-brown-pattern opacity-10 z-10" />
      
      <div className="relative h-full w-full">
        <div className="absolute inset-0">
          {carouselData.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Imagen de fondo */}
              <div className="absolute inset-0">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Contenido del slide */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                {/* Medallón y texto */}
                <div className="relative z-10 transform -translate-y-20">
                  {/* Medallón */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <Image
                      src="/logo.svg"
                      alt="Hacienda San Carlos"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Título principal */}
                  {slide.heading && (
                    <div className="relative z-10">
                      <div className="relative transform-style-preserve-3d">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[var(--font-display)] leading-tight tracking-tight inline-block transform-style-preserve-3d text-white">
                          <span dangerouslySetInnerHTML={{ __html: slide.heading.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif").replace('var\(--color-primary\)', 'var(--color-brown-medium)').replace('#8B0000', 'var(--color-brown-dark)').replace('#FFDBDB', 'var(--color-brown-light)') }} />
                        </h1>
                        <div className="absolute inset-0 filter blur-[8px] bg-[var(--color-brown-medium)]/20 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Segundo título */}
                  {slide.secondHeading && (
                    <div className="relative z-10 mt-4">
                      <div className="relative transform-style-preserve-3d">
                        <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-[var(--font-display)] leading-tight tracking-tight inline-block transform-style-preserve-3d text-white">
                          <span dangerouslySetInnerHTML={{ __html: slide.secondHeading.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif").replace('var\(--color-primary\)', 'var(--color-brown-medium)').replace('#8B0000', 'var(--color-brown-dark)').replace('#FFDBDB', 'var(--color-brown-light)') }} />
                        </h2>
                        <div className="absolute inset-0 filter blur-[8px] bg-[var(--color-brown-medium)]/20 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="relative z-10 mt-6">
                    <div className="relative transform-style-preserve-3d">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-[var(--font-display)] max-w-3xl mx-auto text-white transform-style-preserve-3d">
                        <span dangerouslySetInnerHTML={{ __html: slide.description.replace(/font-family: '.*?'/, "font-family: 'Trajan Pro', 'Cinzel', 'Didot', serif").replace('var\(--color-primary\)', 'var(--color-brown-medium)').replace('#8B0000', 'var(--color-brown-dark)').replace('#FFDBDB', 'var(--color-brown-light)') }} />
                      </p>
                      <div className="absolute inset-0 filter blur-[6px] bg-[var(--color-brown-medium)]/20 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
                    </div>
                  </div>

                  {/* Botón CTA */}
                  <div className="mt-8">
                    <Link
                      href={
                        slide.cta === 'Conocer Más' ? '/contact' : 
                        slide.cta === 'Ver Bodas' ? '/servicios' : 
                        slide.cta === 'Espacios' ? '/servicios' : 
                        slide.cta === 'Galería' ? '#gallery' : 
                        slide.cta === 'Eventos' ? '/servicios' : 
                        '/contact'
                      }
                      className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-brown-medium)] hover:bg-[var(--color-brown-dark)] text-black font-bold text-lg rounded-lg transition-all duration-300 group"
                    >
                      {slide.cta}
                      <FaChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Controles del carrusel */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 md:space-x-6 z-30">
        <button
          onClick={handlePrevSlide}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-brown-medium)]/20 transition-all duration-300"
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
                  ? 'w-8 bg-[var(--color-brown-medium)]' 
                  : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Ir a diapositiva ${index + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNextSlide}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-brown-medium)]/20 transition-all duration-300"
          aria-label="Siguiente diapositiva"
        >
          <FaAngleRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
} 