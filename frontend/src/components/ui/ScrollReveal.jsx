import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small delay if provided, otherwise show immediately
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            // Once visible, we can unobserve if we only want it to animate once
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '10px', // Strict boundary so it doesn't trigger on page load if off-screen
        threshold: 0.1, // Triggers immediately when 1% of it enters the screen
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
