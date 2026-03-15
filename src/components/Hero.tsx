// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title-word', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power4.out'
      })

      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power3.out'
      })

      gsap.from('.hero-cta', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 1.3,
        ease: 'back.out(1.7)'
      })

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!prefersReducedMotion && heroBgRef.current) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches
        const maxY = isMobile ? 6 : 12

        gsap.to(heroBgRef.current, {
          y: -maxY,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.4,
            invalidateOnRefresh: true
          }
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[75vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background — server room, fitting for a security product */}
      <div
        ref={heroBgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80&fm=jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
          pointerEvents: 'none'
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/80 to-obsidian"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
          <span className="hero-title-word inline-block">DevSecure</span>{' '}
          <span className="hero-title-word inline-block text-champagne">AppSec Concierge</span>
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Autonomous SAST remediation and multi-agent security orchestration.
          Ask the AI anything about our platform.
        </p>

        <a
          href="#chat"
          className="hero-cta inline-block magnetic-btn bg-champagne text-obsidian px-10 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-opacity"
        >
          Ask the AI
        </a>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-champagne rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-champagne rounded-full"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
