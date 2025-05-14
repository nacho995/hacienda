"use client";

import React from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import EventosHero from './EventosHero';
import EventosMain from './EventosMain';
import EventSchema from '../structured-data/EventSchema';

export function EventosClientPage() {
  return (
    <>
      <EventSchema eventType="general" eventName="Eventos en Hacienda San Carlos Borromeo" />
      <Navbar />
      <main>
        <EventosHero />
        <EventosMain />
      </main>
      <Footer />
    </>
  );
}
