import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HOTELS_DATA } from '../data/hotels';

type Hotel = typeof HOTELS_DATA[number];

const getImage = (hotel: Hotel) =>
  hotel.slug === 'pushkar-dhani' ? hotel.aboutImage : hotel.heroImage;

export const PropertiesCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = HOTELS_DATA.length;

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive(prev =>
        dir === 'next' ? (prev + 1) % total : (prev - 1 + total) % total
      );
      setAnimating(false);
    }, 420);
  }, [animating, total]);

  const goTo = useCallback((index: number) => {
    if (index === active || animating) return;
    setDirection(index > active ? 'next' : 'prev');
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive(index);
      setAnimating(false);
    }, 420);
  }, [active, animating]);

  const hotel = HOTELS_DATA[active];
  const prevIdx = (active - 1 + total) % total;
  const nextIdx = (active + 1) % total;
  const prevHotel = HOTELS_DATA[prevIdx];
  const nextHotel = HOTELS_DATA[nextIdx];

  return (
    <section
      className="prop-carousel"
      id="hotels"
      aria-labelledby="prop-carousel-heading"
    >
      {/* Section header */}
      <div className="prop-carousel__header">
        <p className="prop-carousel__kicker">Our Properties</p>
        <h2 id="prop-carousel-heading">Extraordinary Destinations</h2>
        <div className="prop-carousel__rule" aria-hidden="true" />
        <p className="prop-carousel__sub">
          Five exceptional stays across the royal heartland of Rajasthan,
          each curated to immerse you in a different world.
        </p>
      </div>

      {/* Carousel stage */}
      <div className="prop-carousel__stage" aria-label="Property carousel">
        {/* Prev arrow */}
        <button
          className="prop-carousel__arrow prop-carousel__arrow--prev"
          onClick={() => navigate('prev')}
          aria-label="Previous property"
          id="prop-carousel-prev"
        >
          <i className="fa-solid fa-chevron-left" />
        </button>

        {/* Cards layout: prev | main | next */}
        <div className="prop-carousel__track">
          {/* Prev card */}
          <button
            className="prop-carousel__side-card prop-carousel__side-card--prev"
            onClick={() => navigate('prev')}
            aria-label={`View ${prevHotel.name}`}
          >
            <img src={getImage(prevHotel)} alt={prevHotel.name} draggable={false} />
            <div className="prop-carousel__side-overlay">
              <span>{prevHotel.name}</span>
            </div>
          </button>

          {/* Main card */}
          <div
            className={`prop-carousel__main${animating ? ` prop-carousel__main--${direction}` : ''}`}
          >
            <div className="prop-carousel__main-img-wrap">
              <img
                src={getImage(hotel)}
                alt={hotel.name}
                className="prop-carousel__main-img"
                draggable={false}
              />
            </div>
            <div className="prop-carousel__main-info">
              <p className="prop-carousel__type">{hotel.badge || hotel.propertyType}</p>
              <h3>{hotel.name}</h3>
              <p className="prop-carousel__location">
                <i className="fa-solid fa-location-dot" /> {hotel.location}
              </p>
              <p className="prop-carousel__desc">{hotel.shortDescription}</p>
              <Link
                to={`/hotels/${hotel.slug}`}
                className="prop-carousel__link"
              >
                More <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </div>

          {/* Next card */}
          <button
            className="prop-carousel__side-card prop-carousel__side-card--next"
            onClick={() => navigate('next')}
            aria-label={`View ${nextHotel.name}`}
          >
            <img src={getImage(nextHotel)} alt={nextHotel.name} draggable={false} />
            <div className="prop-carousel__side-overlay">
              <span>{nextHotel.name}</span>
            </div>
          </button>
        </div>

        {/* Next arrow */}
        <button
          className="prop-carousel__arrow prop-carousel__arrow--next"
          onClick={() => navigate('next')}
          aria-label="Next property"
          id="prop-carousel-next"
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>

      {/* Dot navigation */}
      <div className="prop-carousel__dots" role="tablist" aria-label="Select property">
        {HOTELS_DATA.map((h, idx) => (
          <button
            key={h.slug}
            className={`prop-carousel__dot${idx === active ? ' prop-carousel__dot--active' : ''}`}
            role="tab"
            aria-label={h.name}
            aria-selected={idx === active}
            onClick={() => goTo(idx)}
            id={`prop-dot-${idx}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PropertiesCarousel;
