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

      {/* Chat is the product — inline, full-width, centered below the hero */}
      <section id="chat" className="py-16 px-4 sm:px-6 bg-obsidianLight">
        <div className="max-w-2xl mx-auto">
          <AIConcierge inline />
        </div>
      </section>

      <Features />
      <Footer />
    </div>
  );
}
