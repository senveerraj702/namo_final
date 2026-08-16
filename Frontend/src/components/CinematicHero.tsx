import React, { useRef, useEffect, useState, useCallback } from 'react';

const SLIDES = [
  {
    id: 0,
    image: '/images/kushal-bagh-palace.jpg',
    alt: 'The Kushal Bagh Palace — Heritage Palace, Udaipur',
    location: 'The Kushal Bagh Palace',
    sub: 'Udaipur, Rajasthan',
  },
  {
    id: 1,
    image: '/images/namo-desert-camp.jpg',
    alt: 'Namo Desert Camp Talai — Sam Sand Dunes, Jaisalmer',
    location: 'Namo Desert Camp Talai',
    sub: 'Jaisalmer, Rajasthan',
  },
  {
    id: 2,
    image: '/images/sun-hill-resort.jpg',
    alt: 'Sun Hill Resort — Panther Point, Kumbhalgarh',
    location: 'Sun Hill Resort',
    sub: 'Kumbhalgarh, Rajasthan',
  },
];

const INTERVAL_MS = 2000;

export const CinematicHero: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    if (index === current || fading) return;
    setPrev(current);
    setCurrent(index);
    setFading(true);
    setTimeout(() => { setFading(false); setPrev(null); }, 450);
  }, [current, fading]);

  const goNext = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  // Fast continuous auto-cycle
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goNext();
    }, INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [goNext]);

  return (
    <section
      className="taj-hero"
      id="home"
      aria-label="NAMO Hotel & Travel"
    >
      {/* Slides */}
      <div className="taj-hero__slides">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={[
              'taj-hero__slide',
              idx === current ? 'taj-hero__slide--active' : '',
              idx === prev ? 'taj-hero__slide--prev' : '',
            ].join(' ')}
            aria-hidden={idx !== current}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="taj-hero__img"
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Gradient veil at bottom for readability */}
      <div className="taj-hero__veil" aria-hidden="true" />

      {/* Bottom-left property label (Taj style) */}
      <div className="taj-hero__label" aria-live="polite">
        <span className="taj-hero__label-name">{SLIDES[current].location}</span>
        <span className="taj-hero__label-loc">
          <i className="fa-solid fa-location-dot" />
          {SLIDES[current].sub}
        </span>
      </div>

      {/* Navigation dots — bottom center */}
      <nav className="taj-hero__dots" role="tablist" aria-label="Property slides">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            className={`taj-hero__dot${idx === current ? ' taj-hero__dot--active' : ''}`}
            role="tab"
            aria-label={`View ${slide.location}`}
            aria-selected={idx === current}
            onClick={() => goTo(idx)}
          />
        ))}
      </nav>
    </section>
  );
};

export default CinematicHero;
