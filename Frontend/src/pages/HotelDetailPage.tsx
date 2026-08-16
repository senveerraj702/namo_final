import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HOTELS_DATA } from '../data/hotels';
import { Hotel } from '../types/hotel';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { ContactForm } from '../components/ContactForm';
import { useScrollReveal } from '../components/ScrollReveal';

export const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: '',
  });

  useScrollReveal([loading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setLoading(true);
    setError(null);

    const foundHotel = HOTELS_DATA.find((h) => h.slug === slug);

    // Simulate brief state transition for smooth rendering
    const timer = setTimeout(() => {
      if (foundHotel) {
        setHotel(foundHotel);
      } else {
        setError(`Hotel property '${slug}' not found.`);
      }
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [slug]);

  const openLightbox = (src: string, alt: string) => {
    setLightboxState({ isOpen: true, src, alt });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, src: '', alt: '' });
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}></i>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--color-text)' }}>Loading Property Details...</h2>
      </div>
    );
  }

  // Error state
  if (error || !hotel) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
        <i className="fa-solid fa-hotel" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}></i>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, marginBottom: '1rem', color: 'var(--color-text)' }}>Property Not Found</h1>
        <p style={{ maxWidth: '500px', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>{error || "The requested property page does not exist."}</p>
        <Link to="/" className="taj-btn taj-btn--outline">Return to Home</Link>
      </div>
    );
  }

  return (
    <main className="taj-detail-page">
      {/* HERO BANNER */}
      <section className="taj-detail-hero" aria-label={`${hotel.name} hero`}>
        <img src={hotel.heroImage} alt={hotel.name} className="taj-detail-hero__img" loading="eager" />
        <div className="taj-detail-hero__overlay"></div>
        <div className="taj-detail-hero__content container">
          
          <nav className="taj-breadcrumb fade-reveal" aria-label="Breadcrumb">
            <Link to="/" className="taj-breadcrumb__item">Home</Link>
            <span className="taj-breadcrumb__sep"><i className="fa-solid fa-chevron-right"></i></span>
            <Link to="/#our-locations" className="taj-breadcrumb__item">Destinations</Link>
            <span className="taj-breadcrumb__sep"><i className="fa-solid fa-chevron-right"></i></span>
            <span className="taj-breadcrumb__item taj-breadcrumb__item--current">{hotel.name}</span>
          </nav>

          <div className="taj-detail-hero__titles fade-reveal">
            <p className="taj-kicker">
              <i className={hotel.propertyTypeIcon}></i> {hotel.propertyType}
            </p>
            <h1 className="taj-detail-hero__title">{hotel.name}</h1>
            <div className="taj-rule" aria-hidden="true"></div>
            <p className="taj-detail-hero__location">
              <i className="fa-solid fa-location-dot"></i> {hotel.address}
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT THE HOTEL */}
      <section className="taj-section taj-about" id="about-hotel">
        <div className="container">
          <div className="taj-split">
            <div className="taj-split__content fade-reveal">
              <p className="taj-kicker">About The Property</p>
              <h2>{hotel.tagline}</h2>
              <div className="taj-rule"></div>
              
              <div className="taj-about-text">
                {hotel.fullDescription.map((pText, i) => (
                  <p key={i}>{pText}</p>
                ))}
              </div>

              <div className="taj-highlights">
                {hotel.highlights.map((hl, i) => (
                  <div key={i} className="taj-highlight">
                    <i className="fa-solid fa-check"></i>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="taj-split__image fade-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="taj-img-frame">
                <img src={hotel.aboutImage} alt={hotel.name} loading="lazy" />
              </div>
              
              {/* Quick Info Box */}
              <div className="taj-quick-info">
                <h4>At a Glance</h4>
                <div className="taj-rule" style={{ margin: '0.8rem 0' }}></div>
                <ul className="taj-quick-list">
                  <li><i className="fa-solid fa-city"></i> <strong>City:</strong> {hotel.city}</li>
                  {hotel.landmark && (
                    <li><i className="fa-solid fa-map-pin"></i> <strong>Near:</strong> {hotel.landmark}</li>
                  )}
                  <li><i className="fa-solid fa-phone"></i> <strong>Phone:</strong> {hotel.phone}</li>
                  <li><i className="fa-solid fa-envelope"></i> <strong>Email:</strong> {hotel.email}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE IMAGE SEPARATOR */}
      <section className="taj-detail-hero" style={{ height: '45vh', minHeight: '320px' }}>
         <img src={hotel.rooms[0]?.image || hotel.heroImage} className="taj-detail-hero__img" style={{ filter: 'brightness(0.5)' }} loading="lazy" alt="Property ambiance" />
         <div className="taj-detail-hero__content container" style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-crown" style={{ fontSize: '2.5rem', color: 'var(--color-gold)', marginBottom: '1rem' }}></i>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, letterSpacing: '0.02em' }}>Experience Unmatched Luxury</h2>
            <div className="taj-rule taj-rule--center"></div>
         </div>
      </section>

      {/* ACCOMMODATION */}
      <section className="taj-section taj-section--light taj-premium-rooms" id="accommodation">
        <div className="container">
          <div className="taj-section-header fade-reveal">
            <p className="taj-kicker">Accommodation</p>
            <h2>Rooms &amp; Suites</h2>
            <div className="taj-rule taj-rule--center"></div>
            <p>Designed for absolute privacy, comfort, and magnificent views.</p>
          </div>

          <div className="taj-grid taj-grid--3">
            {hotel.rooms.map((room, idx) => (
              <div key={room.id} className="taj-premium-card fade-reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="taj-card__img">
                  <img src={room.image} alt={room.name} loading="lazy" />
                </div>
                <div className="taj-premium-card__inner">
                  <h3 className="taj-card__title">{room.name}</h3>
                  <div className="taj-rule"></div>
                  <p className="taj-card__desc">{room.description}</p>
                  
                  <div className="taj-card__amenities">
                    {room.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="taj-room-tag">{tag}</span>
                    ))}
                  </div>
                  
                  <a href="#hotel-contact" className="taj-btn taj-btn--outline" style={{ width: '100%', marginTop: '1.5rem', textAlign: 'center' }}>
                    Enquire Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="taj-section taj-section--light" id="amenities">
        <div className="container">
          <div className="taj-section-header fade-reveal">
            <p className="taj-kicker">Facilities</p>
            <h2>Property Amenities</h2>
            <div className="taj-rule taj-rule--center"></div>
          </div>

          <div className="taj-amenities-grid fade-reveal">
            {hotel.amenities.map((am, idx) => (
              <div key={idx} className="taj-amenity-item">
                <i className={am.icon}></i>
                <h4>{am.title}</h4>
                <p>{am.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {hotel.gallery && hotel.gallery.length > 0 && (
        <section className="taj-section taj-section--light" id="hotel-gallery">
          <div className="container">
            <div className="taj-section-header fade-reveal">
              <p className="taj-kicker">Gallery</p>
              <h2>Photos of {hotel.name}</h2>
              <div className="taj-rule taj-rule--center"></div>
            </div>

            <div className="taj-gallery-grid fade-reveal">
              {hotel.gallery.map((gImg, idx) => (
                <div
                  key={gImg.id}
                  className={`taj-gallery-item ${idx === 0 ? 'taj-gallery-item--large' : ''}`}
                  onClick={() => openLightbox(gImg.url, gImg.alt)}
                >
                  <img src={gImg.url} alt={gImg.alt} loading="lazy" />
                  <div className="taj-gallery-overlay">
                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOCATION & CONTACT */}
      <section className="taj-section taj-section--light" id="hotel-contact">
        <div className="container">
          <div className="taj-split">
            <div className="taj-split__content fade-reveal">
              <p className="taj-kicker">Get In Touch</p>
              <h2>Location &amp; Contact</h2>
              <div className="taj-rule"></div>
              
              <div className="taj-contact-info" style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{hotel.address}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <a href={`tel:${hotel.phone}`} className="taj-contact-link">
                    <i className="fa-solid fa-phone"></i> {hotel.phone}
                  </a>
                  <a href={`mailto:${hotel.email}`} className="taj-contact-link">
                    <i className="fa-solid fa-envelope"></i> {hotel.email}
                  </a>
                </div>

                <div className="taj-map-container">
                  <iframe
                    src={hotel.mapEmbedUrl}
                    title={`${hotel.name} Map`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="taj-split__form fade-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="taj-contact-card">
                <h3>Send Property Enquiry</h3>
                <div className="taj-rule" style={{ margin: '1rem 0 2rem 0' }}></div>
                <ContactForm defaultProperty={`${hotel.name}, ${hotel.city}`} isHotelForm={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <GalleryLightbox
        isOpen={lightboxState.isOpen}
        imageSrc={lightboxState.src}
        imageAlt={lightboxState.alt}
        onClose={closeLightbox}
      />
    </main>
  );
};
