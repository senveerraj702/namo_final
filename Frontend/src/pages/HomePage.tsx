import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { CinematicHero } from '../components/CinematicHero';
import { PropertiesCarousel } from '../components/PropertiesCarousel';
import { HotelGlobe } from '../components/HotelGlobe';
import { ContactForm } from '../components/ContactForm';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { HOTELS_DATA, EXPERIENCES_DATA, DESTINATIONS_DATA } from '../data/hotels';

type LenisWindow = Window & { __lenis?: { scrollTo: (target: string | HTMLElement | number, options?: object) => void } };

const GALLERY_IMAGES = [
  { url: '/images/gallery/gallery-1.jpg', alt: 'The Kushal Bagh Palace — Udaipur' },
  { url: '/images/gallery/gallery-2.jpg', alt: 'Namo Desert Camp — Jaisalmer Tents' },
  { url: '/images/gallery/gallery-3.jpg', alt: 'Namo Adventure Camp — Jawai Wilderness' },
  { url: '/images/gallery/gallery-4.jpg', alt: 'Pushkar Dhani — Village Resort' },
  { url: '/images/gallery/gallery-5.jpg', alt: 'Sun Hill Resort — Kumbhalgarh View' },
  { url: '/images/gallery/gallery-6.jpg', alt: 'Palace Courtyard & Pool — Udaipur' },
  { url: '/images/gallery/gallery-7.jpg', alt: 'Starlit Bonfire & Dunes — Jaisalmer' },
  { url: '/images/gallery/gallery-8.jpg', alt: 'Jawai Granite Hills & Safaris' },
];

const scrollToId = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  const lenis = (window as LenisWindow).__lenis;
  if (lenis) lenis.scrollTo(element, { offset: -70 });
  else element.scrollIntoView({ behavior: 'smooth' });
};

export const HomePage: React.FC = () => {
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', alt: '' });
  const [activeExperience, setActiveExperience] = useState(0);
  const revealRef = useRef<HTMLElement>(null);

  const featuredExperience = EXPERIENCES_DATA[activeExperience] || EXPERIENCES_DATA[0];

  const portfolioStats = useMemo(() => [
    { value: `${HOTELS_DATA.length}+`, label: 'Properties' },
    { value: '10k+', label: 'Happy Guests' },
    { value: '15+', label: 'Years Excellence' },
    { value: '5★', label: 'Premium Service' },
  ], []);

  // Simple IntersectionObserver for fade-in reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    const targets = document.querySelectorAll('.fade-reveal');
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={revealRef} className="taj-site">
      {/* ── HERO: Full-bleed image carousel ── */}
      <CinematicHero />

      {/* ── PROPERTIES CAROUSEL ── */}
      <PropertiesCarousel />

      {/* ── INTERACTIVE GLOBE ── */}
      <HotelGlobe />

      {/* ── ABOUT ── */}
      <section className="taj-section taj-about" id="about" aria-labelledby="about-heading">
        <div className="container">
          <div className="taj-split">
            <div className="taj-split__copy fade-reveal">
              <p className="taj-kicker">About NAMO</p>
              <h2 id="about-heading">A Legacy of Royal Hospitality in Rajasthan</h2>
              <div className="taj-rule" aria-hidden="true" />
              <p>
                NAMO Hotel & Travel is a distinguished multi-property hospitality group rooted in
                the timeless grandeur of Rajasthan. From Udaipur palaces to Jaisalmer dunes and
                Jawai wilderness, we curate stays that connect guests with the soul of India's royal heartland.
              </p>
              <div className="taj-stats fade-reveal fade-reveal--delay-1">
                {portfolioStats.map(stat => (
                  <div key={stat.label} className="taj-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <figure className="taj-split__media fade-reveal fade-reveal--delay-1">
              <img
                src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80"
                alt="Palace corridor with royal arches"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES ── */}
      <section className="taj-section taj-experiences" id="experiences" aria-labelledby="experiences-heading">
        <div className="container">
          <div className="taj-section-header fade-reveal">
            <p className="taj-kicker">Experiences</p>
            <h2 id="experiences-heading">Crafted to Be Remembered</h2>
            <div className="taj-rule taj-rule--center" aria-hidden="true" />
          </div>

          <div className="taj-exp-stage">
            {/* Tab selectors */}
            <div className="taj-exp-tabs fade-reveal">
              {EXPERIENCES_DATA.map((exp, idx) => (
                <button
                  key={exp.id}
                  className={`taj-exp-tab${idx === activeExperience ? ' taj-exp-tab--active' : ''}`}
                  onClick={() => setActiveExperience(idx)}
                  aria-label={exp.title}
                  id={`exp-tab-${idx}`}
                >
                  <i className={exp.icon} />
                  <span>{exp.category}</span>
                </button>
              ))}
            </div>

            <div className="taj-exp-content fade-reveal fade-reveal--delay-1">
              <figure className="taj-exp-media">
                <img
                  key={featuredExperience.id}
                  src={featuredExperience.image}
                  alt={featuredExperience.title}
                />
              </figure>
              <div className="taj-exp-copy">
                <p className="taj-kicker">{featuredExperience.category}</p>
                <h3>{featuredExperience.title}</h3>
                <div className="taj-rule" aria-hidden="true" />
                <p>{featuredExperience.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="taj-section taj-destinations" aria-labelledby="destinations-heading">
        <div className="container">
          <div className="taj-section-header fade-reveal">
            <p className="taj-kicker">Destination Path</p>
            <h2 id="destinations-heading">Explore Royal Rajasthan</h2>
            <div className="taj-rule taj-rule--center" aria-hidden="true" />
            <p>From lake city romance to desert horizons — every NAMO stay becomes part of one journey.</p>
          </div>
          <div className="taj-dest-grid fade-reveal">
            {DESTINATIONS_DATA.map((destination) => (
              <article key={destination.id} className="taj-dest-card">
                <figure className="taj-dest-card__media">
                  <img src={destination.image} alt={destination.name} loading="lazy" />
                </figure>
                <div className="taj-dest-card__body">
                  <h3>{destination.name}</h3>
                  <p>{destination.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="taj-section taj-gallery" id="gallery" aria-labelledby="gallery-heading">
        <div className="container">
          <div className="taj-section-header fade-reveal">
            <p className="taj-kicker">Gallery</p>
            <h2 id="gallery-heading">Moments Captured</h2>
            <div className="taj-rule taj-rule--center" aria-hidden="true" />
            <p>Palaces, pools, dunes, safaris and the warmth of Rajasthani hospitality.</p>
          </div>
          <div className="taj-gallery-grid fade-reveal">
            {GALLERY_IMAGES.map((image, index) => (
              <button
                key={image.url}
                className="taj-gallery-item"
                onClick={() => setLightbox({ isOpen: true, src: image.url, alt: image.alt })}
                aria-label={`View: ${image.alt}`}
                id={`gallery-item-${index}`}
              >
                <img src={image.url} alt={image.alt} loading="lazy" />
                <div className="taj-gallery-item__overlay" aria-hidden="true">
                  <i className="fa-solid fa-magnifying-glass-plus" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="taj-section taj-events" id="events" aria-labelledby="events-heading">
        <div className="container">
          <div className="taj-split">
            <div className="taj-split__copy fade-reveal">
              <p className="taj-kicker">Events & Conferences</p>
              <h2 id="events-heading">Celebrate Life's Greatest Moments With Royal Grandeur</h2>
              <div className="taj-rule" aria-hidden="true" />
              <p>
                Our properties offer unforgettable backdrops for destination weddings, corporate
                meetings, family functions, conferences and private celebrations.
              </p>
              <div className="taj-event-tags fade-reveal fade-reveal--delay-1">
                {['Destination Weddings', 'Corporate Meetings', 'Family Functions', 'Private Celebrations'].map(label => (
                  <span key={label} className="taj-tag">{label}</span>
                ))}
              </div>
              <button
                className="taj-btn taj-btn--gold"
                onClick={() => scrollToId('contact')}
                style={{ marginTop: '2rem' }}
              >
                Enquire Now
              </button>
            </div>
            <figure className="taj-split__media fade-reveal fade-reveal--delay-1">
              <img
                src="/images/wedding.png"
                alt="Royal wedding celebration"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="taj-section taj-contact" id="contact" aria-labelledby="contact-heading">
        <div className="container">
          <div className="taj-split">
            <div className="taj-split__copy fade-reveal">
              <p className="taj-kicker">Get In Touch</p>
              <h2 id="contact-heading">Your Rajasthan Story Begins Here</h2>
              <div className="taj-rule" aria-hidden="true" />
              <p>
                Reach our reservations team for stays, events, destination weddings
                and custom Rajasthan travel experiences.
              </p>
              <div className="taj-contact-pods fade-reveal fade-reveal--delay-1">
                <a href="tel:+918690278979" className="taj-contact-pod">
                  <i className="fa-solid fa-phone" />
                  <span>+91 86902 78979</span>
                </a>
                <a href="mailto:namohotelandtravel@gmail.com" className="taj-contact-pod">
                  <i className="fa-solid fa-envelope" />
                  <span>namohotelandtravel@gmail.com</span>
                </a>
                <div className="taj-contact-pod">
                  <i className="fa-solid fa-location-dot" />
                  <span>02, Surya Nagar, Savina, Udaipur, Rajasthan</span>
                </div>
              </div>
            </div>
            <div className="taj-contact-form fade-reveal fade-reveal--delay-1">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <GalleryLightbox
        isOpen={lightbox.isOpen}
        imageSrc={lightbox.src}
        imageAlt={lightbox.alt}
        onClose={() => setLightbox({ isOpen: false, src: '', alt: '' })}
      />
    </main>
  );
};
