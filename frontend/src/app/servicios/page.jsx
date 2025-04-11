"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { FaHeart, FaGlassCheers, FaCamera, FaMusic, FaUtensils, FaCalendarAlt } from 'react-icons/fa';

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de servicios
const BodasSection = dynamic(() => import('@/components/servicios/BodasSection'), { ssr: false });
const PaquetesSection = dynamic(() => import('@/components/servicios/PaquetesSection'), { ssr: false });
const FotoVideoSection = dynamic(() => import('@/components/servicios/FotoVideoSection'), { ssr: false });
const BanquetesSection = dynamic(() => import('@/components/servicios/BanquetesSection'), { ssr: false });
const AdicionalesSection = dynamic(() => import('@/components/servicios/AdicionalesSection'), { ssr: false });
const CoctelBrunchSection = dynamic(() => import('@/components/servicios/CoctelBrunchSection'), { ssr: false });

export default function ServiciosPage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Categorías de servicios
  const categorias = [
    { nombre: 'Bodas', icono: <FaHeart className="w-5 h-5" /> },
    { nombre: 'Paquetes', icono: <FaGlassCheers className="w-5 h-5" /> },
    { nombre: 'Foto y Video', icono: <FaCamera className="w-5 h-5" /> },
    { nombre: 'Banquetes', icono: <FaUtensils className="w-5 h-5" /> },
    { nombre: 'Adicionales', icono: <FaMusic className="w-5 h-5" /> },
    { nombre: 'Cóctel y Brunch', icono: <FaCalendarAlt className="w-5 h-5" /> }
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="/platopresentacion.JPG" 
              alt="Servicios en Hacienda San Carlos" 
              layout="fill"
              objectFit="cover"
              priority
              className="object-center"
            />
          </div>
          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-script mb-6"
            >
              Nuestros <span style={{ color: 'var(--color-brown-medium)' }}>Servicios</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl max-w-3xl font-light"
            >
              Unir su vida para iniciar una nueva familia es crear felicidad y nos sentimos honrados que nos dejen ser parte de ese momento.
            </motion.p>
          </div>
        </section>

        {/* Tabs de Servicios */}
        <section className="py-16 bg-[var(--color-cream-light)]">
          <div className="container mx-auto px-4">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex flex-wrap justify-center space-x-1 rounded-xl bg-[var(--color-brown-light-10)] p-1 mb-12">
                {categorias.map((categoria, index) => (
                  <Tab
                    key={index}
                    className={({ selected }) =>
                      `w-full sm:w-auto whitespace-nowrap rounded-lg py-3 px-6 text-sm font-medium leading-5 transition-all duration-300 flex items-center justify-center space-x-2
                      ${selected 
                        ? 'bg-[var(--color-brown-medium)] text-black shadow'
                        : 'text-[var(--color-brown-dark)] hover:bg-[var(--color-brown-light-20)] hover:text-[var(--color-brown-dark)]'
                      }`
                    }
                  >
                    <span>{categoria.icono}</span>
                    <span>{categoria.nombre}</span>
                  </Tab>
                ))}
              </Tab.List>
              
              <Tab.Panels className="mt-2">
                <Tab.Panel>
                  <BodasSection />
                </Tab.Panel>
                <Tab.Panel>
                  <PaquetesSection />
                </Tab.Panel>
                <Tab.Panel>
                  <FotoVideoSection />
                </Tab.Panel>
                <Tab.Panel>
                  <BanquetesSection />
                </Tab.Panel>
                <Tab.Panel>
                  <AdicionalesSection />
                </Tab.Panel>
                <Tab.Panel>
                  <CoctelBrunchSection />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
