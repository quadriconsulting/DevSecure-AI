// Author: Jeremy Quadri
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AIConcierge from './components/AIConcierge';

export default function App() {
  return (
    <div className="relative min-h-screen bg-obsidian text-white selection:bg-champagne/30">
      <Navbar />
      <Hero />

      <Features />
      <Footer />
      <AIConcierge />
    </div>
  );
}
