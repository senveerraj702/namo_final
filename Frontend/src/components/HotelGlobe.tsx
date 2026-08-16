/**
 * HotelGlobe.tsx — Three.js interactive 3D globe
 * - Scroll wheel to zoom in/out
 * - Drag to rotate
 * - Accurate orthographic pin placement via latLngTo3D
 * - Glowing saffron pins with pulse animation
 * - Golden lat/lng grid lines
 * - Click a pin → navigate to hotel page
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// ── Hotel data ─────────────────────────────────────────────────────────────────

interface HotelPin {
  id: string;
  name: string;
  city: string;
  type: string;
  lat: number;
  lng: number;
  slug: string;
  stemH: number;
  image: string;
  desc: string;
}

const HOTEL_PINS: HotelPin[] = [
  {
    id: 'kushal-bagh-palace',
    name: 'The Kushal Bagh Palace',
    city: 'Udaipur',
    type: 'Heritage Palace',
    lat: 23.9000,
    lng: 74.3000,
    slug: 'kushal-bagh-palace',
    stemH: 1.080,
    image: '/images/kushal-bagh-palace.jpg',
    desc: 'Regal Rajputana palace in the City of Lakes near Lake Pichola.',
  },
  {
    id: 'sun-hill-resort',
    name: 'Sun Hill Resort',
    city: 'Kumbhalgarh',
    type: 'Hill Resort',
    lat: 25.7000,
    lng: 73.7000,
    slug: 'sun-hill-resort',
    stemH: 1.095,
    image: '/images/sun-hill-resort.jpg',
    desc: 'Panoramics of Panther Point & the Great Wall of Kumbhalgarh.',
  },
  {
    id: 'pushkar-dhani',
    name: 'Pushkar Dhani',
    city: 'Pushkar',
    type: 'Cultural Dhani',
    lat: 26.8000,
    lng: 75.3000,
    slug: 'pushkar-dhani',
    stemH: 1.070,
    image: '/images/pushkar-dhani.png',
    desc: 'Cultural haven immersed in sacred Pushkar heritage & dunes.',
  },
  {
    id: 'namo-desert-camp',
    name: 'Namo Desert Camp',
    city: 'Jaisalmer',
    type: 'Desert Camp',
    lat: 27.5000,
    lng: 70.2000,
    slug: 'namo-desert-camp',
    stemH: 1.085,
    image: '/images/namo-desert-camp.jpg',
    desc: 'Luxury glamping at Sam Sand Dunes with folk music & safari.',
  },
  {
    id: 'namo-adventure-camp',
    name: 'Namo Adventure Camp',
    city: 'Jawai',
    type: 'Wildlife Camp',
    lat: 24.8000,
    lng: 72.5000,
    slug: 'namo-adventure-camp',
    stemH: 1.055,
    image: '/images/namo-adventure-camp.png',
    desc: 'Wild leopard wilderness & granite hill terrain in Jawai.',
  },
];

// ── Accurate lat/lng → 3D vector (standard geographic convention) ──────────────

function latLngTo3D(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);  // colatitude
  const theta = (lng + 180) * (Math.PI / 180); // azimuth
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export const HotelGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate  = useNavigate();
  const [hoveredPin, setHoveredPin] = useState<HotelPin | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth  || 600;
    const H = mount.clientHeight || 520;

    // ── Scene ──────────────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();

    // ── Camera ─────────────────────────────────────────────────────────────────
    // Zoomed in directly towards Rajasthan for spacious pin distribution
    const DEFAULT_ZOOM = 1.95;
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.05, 100);
    camera.position.set(0, 0, DEFAULT_ZOOM);

    // ── Renderer ───────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'width:100%;height:auto;display:block;cursor:grab;border-radius:6px;';
    mount.appendChild(renderer.domElement);

    // ── Globe group (India facing front by default with slight tilt) ─────────────
    const DEFAULT_ROT_Y = -2.88; // Places ~75°E (India) facing front (+Z)
    const DEFAULT_ROT_X = 0.38;  // Tilts Northern hemisphere ~22° to center Rajasthan
    const group = new THREE.Group();
    group.rotation.y = DEFAULT_ROT_Y;
    group.rotation.x = DEFAULT_ROT_X;
    scene.add(group);

    // ── Earth sphere ───────────────────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat  = new THREE.MeshPhongMaterial({
      color: 0x1b2a3b,
      emissive: 0x060d18,
      shininess: 10,
      specular: new THREE.Color(0x1a3050),
    });
    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    group.add(earthMesh);

    // Load NASA texture asynchronously
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-day.jpg',
      (tex) => {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        earthMat.map   = tex;
        earthMat.color.set(0xffffff);
        earthMat.needsUpdate = true;
      },
    );

    // ── Atmosphere rim ─────────────────────────────────────────────────────────
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x3388ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.14,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.065, 32, 32), atmMat));

    // ── Golden grid lines (lat every 30°, lng every 30°) ──────────────────────
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.22,
    });

    // Latitude circles
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = -180; lng <= 181; lng += 2) pts.push(latLngTo3D(lat, lng, 1.004));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    // Longitude lines
    for (let lng = -180; lng < 180; lng += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -88; lat <= 88; lat += 2) pts.push(latLngTo3D(lat, lng, 1.004));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // ── Lighting ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(4, 3, 4);
    scene.add(sun);

    // ── Taj Hotel Pins (Slender Golden Needle Stems + Radiant Micro Jewels) ─────
    const pinGeo     = new THREE.SphereGeometry(0.008, 16, 16);
    const baseGeo    = new THREE.SphereGeometry(0.004, 12, 12);
    const ringGeo    = new THREE.RingGeometry(0.010, 0.018, 24);
    const pinMeshes: THREE.Mesh[]  = [];
    const ringMeshes: THREE.Mesh[] = [];

    for (const hotel of HOTEL_PINS) {
      const basePos = latLngTo3D(hotel.lat, hotel.lng, 1.002);
      const tipPos  = latLngTo3D(hotel.lat, hotel.lng, hotel.stemH);
      const normal  = basePos.clone().normalize();

      // 1. Vertical golden needle stem line
      const stemGeo = new THREE.BufferGeometry().setFromPoints([basePos, tipPos]);
      const stemMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.85,
      });
      const stemLine = new THREE.Line(stemGeo, stemMat);
      group.add(stemLine);

      // 2. Surface anchor dot (Gold)
      const baseDotMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
      const baseDot    = new THREE.Mesh(baseGeo, baseDotMat);
      baseDot.position.copy(basePos);
      group.add(baseDot);

      // 3. Radiant micro jewel head at tip of needle
      const isSaffron = hotel.id.includes('desert') || hotel.id.includes('sun');
      const jewelColor = isSaffron ? 0xe65512 : 0xd4af37;
      const pinMat = new THREE.MeshPhongMaterial({
        color: jewelColor,
        emissive: isSaffron ? 0x5a1800 : 0x5a4800,
        shininess: 90,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(tipPos);
      pin.userData = hotel;
      group.add(pin);
      pinMeshes.push(pin);

      // 4. Delicate pulse halo ring around tip
      const ringMat = new THREE.MeshBasicMaterial({
        color: jewelColor,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(tipPos);
      const up   = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      ring.setRotationFromQuaternion(quat);
      ring.userData = { phase: Math.random() * Math.PI * 2 };
      group.add(ring);
      ringMeshes.push(ring);
    }

    // ── Interaction state & Smooth Lerp Targets ────────────────────────────────
    let isDragging = false;
    let dragDelta  = 0;
    let prevX = 0, prevY = 0;
    let currentHoverId: string | null = null;

    let targetZ    = DEFAULT_ZOOM;
    let targetRotX = DEFAULT_ROT_X;
    let targetRotY = DEFAULT_ROT_Y;

    // Smooth Nearest-Pin Hover calculation in 2D Screen Space (zero overlapping flickering)
    const checkHover = (clientMouseX: number, clientMouseY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = clientMouseX - rect.left;
      const mouseY = clientMouseY - rect.top;

      let closestPin: HotelPin | null = null;
      let minDistanceSq = 38 * 38; // 38px smooth hover radius

      const tempPos = new THREE.Vector3();

      for (const pinMesh of pinMeshes) {
        pinMesh.getWorldPosition(tempPos);
        const proj = tempPos.clone().project(camera);

        // Check if pin is on front-side facing camera
        if (proj.z < 1.0) {
          const screenX = (proj.x * 0.5 + 0.5) * rect.width;
          const screenY = (-proj.y * 0.5 + 0.5) * rect.height;
          const dx = mouseX - screenX;
          const dy = mouseY - screenY;
          const distSq = dx * dx + dy * dy;

          if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestPin = pinMesh.userData as HotelPin;
          }
        }
      }

      if (closestPin) {
        if (closestPin.id !== currentHoverId) {
          currentHoverId = closestPin.id;
          setHoveredPin(closestPin);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else if (currentHoverId !== null) {
        currentHoverId = null;
        setHoveredPin(null);
        setHoverPos(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDelta  = 0;
      prevX = e.clientX;
      prevY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        dragDelta  += Math.abs(dx) + Math.abs(dy);
        targetRotY += dx * 0.0035;
        targetRotX  = THREE.MathUtils.clamp(
          targetRotX + dy * 0.0035,
          -Math.PI / 2.5,
          Math.PI / 2.5,
        );
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        checkHover(e.clientX, e.clientY);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
      if (dragDelta < 6) {
        // Click: navigate if hovering a pin
        if (currentHoverId && hoveredPin) {
          navigate(`/hotels/${hoveredPin.slug}`);
        }
      }
      dragDelta = 0;
    };

    // Scroll to zoom (smooth target interpolation, prevent page scroll)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      targetZ = THREE.MathUtils.clamp(
        targetZ + e.deltaY * 0.0018,
        1.25,   // max zoom-in
        3.20,   // max zoom-out
      );
    };

    // Touch
    let touchStartX = 0, touchStartY = 0;
    let touchDragDelta = 0;
    let lastPinchDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchDragDelta = 0;
      }
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchDragDelta += Math.abs(dx) + Math.abs(dy);
        targetRotY += dx * 0.0045;
        targetRotX  = THREE.MathUtils.clamp(
          targetRotX + dy * 0.0045,
          -Math.PI / 2.5,
          Math.PI / 2.5,
        );
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
      // Pinch-to-zoom
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const delta = lastPinchDist - dist;
        targetZ = THREE.MathUtils.clamp(
          targetZ + delta * 0.004,
          1.25, 3.20,
        );
        lastPinchDist = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchDragDelta < 8 && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        checkHover(t.clientX, t.clientY);
        if (currentHoverId && hoveredPin) {
          navigate(`/hotels/${hoveredPin.slug}`);
        }
      }
      touchDragDelta = 0;
    };

    const el = renderer.domElement;
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true  });

    // ── Render loop ────────────────────────────────────────────────────────────
    const tempVec = new THREE.Vector3();
    let rafId: number;
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate);

      // Smooth lerp damping for camera position (zoom) and globe rotation
      camera.position.z += (targetZ - camera.position.z) * 0.08;
      group.rotation.y  += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x  += (targetRotX - group.rotation.x) * 0.08;

      // Pulse rings and scale active pin
      ringMeshes.forEach((ring, idx) => {
        const pin = pinMeshes[idx];
        const isHovered = pin.userData.id === currentHoverId;
        const phase = ring.userData.phase as number;
        const s = isHovered ? 1.4 + 0.3 * Math.sin(t * 0.003 + phase) : 1 + 0.22 * Math.sin(t * 0.0018 + phase);
        ring.scale.setScalar(s);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = isHovered ? 0.9 : (0.55 - 0.3 * Math.abs(Math.sin(t * 0.0018 + phase)));

        pin.scale.setScalar(isHovered ? 1.6 : 1.0);
      });

      // Update 2D hover position for pin tooltip badge
      if (currentHoverId) {
        const targetPin = pinMeshes.find(p => (p.userData as HotelPin).id === currentHoverId);
        if (targetPin) {
          targetPin.getWorldPosition(tempVec);
          tempVec.project(camera);
          const screenX = (tempVec.x * 0.5 + 0.5) * mount.clientWidth;
          const screenY = (-tempVec.y * 0.5 + 0.5) * mount.clientHeight;
          const isVis = tempVec.z < 1.0 && tempVec.x >= -1.15 && tempVec.x <= 1.15 && tempVec.y >= -1.15 && tempVec.y <= 1.15;
          setHoverPos({ x: screenX, y: screenY, visible: isVis });
        }
      }

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    // ── Resize ─────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth  || 600;
      const h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('wheel', onWheel);
      mount.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, [navigate]);

  return (
    <section className="globe-section" id="our-locations" aria-labelledby="globe-heading">
      <div className="container">
        {/* Heading */}
        <div className="taj-section-header fade-reveal">
          <p className="taj-kicker">Our Locations</p>
          <h2 id="globe-heading">Where Royal Rajasthan Awaits</h2>
          <div className="taj-rule taj-rule--center" aria-hidden="true" />
          <p>
            <i className="fa-solid fa-scroll" style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }} />{' '}
            Scroll to zoom &nbsp;·&nbsp;
            <i className="fa-solid fa-hand" style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }} />{' '}
            Drag to rotate &nbsp;·&nbsp;
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }} />{' '}
            Tap a pin to explore
          </p>
        </div>

        {/* Stage */}
        <div className="globe-stage fade-reveal">
          {/* 3D Canvas mount */}
          <div
            ref={mountRef}
            className="globe-mount"
            aria-label="Interactive 3D globe of NAMO hotel locations"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
          >
            {/* Three.js renders a <canvas> into this div */}
            {hoveredPin && hoverPos && hoverPos.visible && (
              <div
                className="globe-pin-tooltip"
                style={{
                  left: `${hoverPos.x}px`,
                  top: `${hoverPos.y}px`,
                }}
              >
                <div className="globe-pin-tooltip__icon">
                  <i className="fa-solid fa-crown" />
                </div>
                <div className="globe-pin-tooltip__info">
                  <span className="globe-pin-tooltip__name">{hoveredPin.name}</span>
                  <span className="globe-pin-tooltip__city">{hoveredPin.city}, RAJASTHAN</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Taj Royal Property Card on Hover/Click */}
        {hoveredPin ? (
          <div className="taj-globe-card" aria-live="polite">
            <div className="taj-globe-card__media">
              <img
                src={hoveredPin.image}
                alt={hoveredPin.name}
              />
              <span className="taj-globe-card__badge">
                <i className="fa-solid fa-crown" /> {hoveredPin.type}
              </span>
            </div>
            <div className="taj-globe-card__content">
              <p className="taj-globe-card__kicker">
                <i className="fa-solid fa-location-dot" /> {hoveredPin.city.toUpperCase()}, RAJASTHAN
              </p>
              <h3 className="taj-globe-card__title">{hoveredPin.name}</h3>
              <p className="taj-globe-card__desc">{hoveredPin.desc}</p>
              <button
                className="taj-globe-card__btn"
                onClick={() => navigate(`/hotels/${hoveredPin.slug}`)}
              >
                <span>Explore Property</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        ) : (
          <div className="taj-globe-hint">
            <i className="fa-solid fa-compass" />
            <span>Hover or tap any royal golden pin on the globe to preview NAMO destinations</span>
          </div>
        )}
      </div>
    </section>
  );
};
