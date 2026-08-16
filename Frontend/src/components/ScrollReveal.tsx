import React, { useEffect } from 'react';

export const useScrollReveal = (dependencies: React.DependencyList = []) => {
  useEffect(() => {
    // Wait a brief moment for the DOM to update
    const timer = setTimeout(() => {
      // Legacy reveal elements
      const revealEls = document.querySelectorAll('.reveal');
      // New Taj-inspired fade-reveal elements
      const fadeRevealEls = document.querySelectorAll('.fade-reveal');

      if (revealEls.length === 0 && fadeRevealEls.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target.classList.contains('fade-reveal')) {
                entry.target.classList.add('is-visible');
              } else {
                entry.target.classList.add('revealed');
              }
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      revealEls.forEach((el) => observer.observe(el));
      fadeRevealEls.forEach((el) => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, dependencies);
};

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

export const ScrollRevealWrapper: React.FC<ScrollRevealWrapperProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const dirClass = direction === 'left' ? 'from-left' : direction === 'right' ? 'from-right' : '';
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div className={`reveal ${dirClass} ${delayClass} ${className}`}>
      {children}
    </div>
  );
};
