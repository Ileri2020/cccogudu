
import React, { useEffect, useState, useRef } from 'react';

interface CarouselProps {
  numCards: number;
}

export const CoverCarousel: React.FC<CarouselProps> = ({ numCards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = Array.from({ length: numCards }, (_, i) => (
    <div
      key={i}
      className={`absolute w-full h-full bg-white rounded-lg shadow-lg transform-3d ${
        i === currentIndex ? 'translate-z-0' : 'translate-z-[-100px]'
      } ${i < currentIndex ? '-rotate-y-45' : i > currentIndex ? 'rotate-y-45' : ''}`}
    >
      Card {i + 1}
    </div>
  ));

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + numCards) % numCards);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % numCards);
  };

  return (
    <div className="relative w-full h-[400px] perspective-[1000px]">
      <div className="absolute w-full h-full transform-3d rotate-y-0 transition-transform duration-1000">
        {cards}
      </div>
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
      >
        Prev
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
      >
        Next
      </button>
    </div>
  );
};





interface TextCarouselProps {
  text?: string;
  speed?: number;
  image?: boolean;
  imageUrl?: string;
  direction?: "left" | "right";
  className?: string;
}

export const TextCarousel: React.FC<TextCarouselProps> = ({
  text = 'INPUT YOUR CAROUSEL TEXT HERE',
  speed = 3000,
  image = false,
  imageUrl = '/crown.webp',
  direction = "left",
  className = ""
}) => {
  const texts = [...text]; 
  const charRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animId: number;
    let angle = 0;
    let lastTime = performance.now();
    // Constant velocity: continuous, seamless circular motion without any pause (~22 deg/sec)
    const degPerMs = direction === 'right' ? 0.022 : -0.022;
    const totalChars = texts.length;
    const step = 360 / totalChars;

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      angle = (angle + degPerMs * delta) % 360;

      for (let i = 0; i < totalChars; i++) {
        const el = charRefs.current[i];
        if (!el) continue;
        const charAngle = (i * step + angle) % 360;
        const rad = (charAngle * Math.PI) / 180;
        const cosVal = Math.cos(rad);

        // Perspective scaling: text in front (cosVal = 1) is larger (1.25x), text at the back (cosVal = -1) is smaller (0.7x)
        const scale = 0.7 + 0.55 * ((cosVal + 1) / 2);

        // Front half (cosVal >= 0) circles IN FRONT of the image (zIndex: 25 > 15)
        // Back half (cosVal < 0) circles BEHIND the image (zIndex: 5 < 15)
        el.style.transform = `rotateY(${charAngle}deg) translateZ(220px) scale(${scale})`;
        el.style.zIndex = cosVal >= 0 ? "25" : "5";
        el.style.opacity = cosVal >= 0 ? "1" : "0.4";
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [direction, texts.length]);

  return (
    <div 
      className={`relative w-full max-w-[100vw] h-[420px] mx-auto flex items-center justify-center select-none overflow-visible ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '800px',
      }}
    >
      {/* Co-located Crown and 3D Ring Container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {image && (
          <img
            src={imageUrl}
            alt="Cathedral Crown"
            className="h-[270px] sm:h-[300px] md:h-[330px] w-auto max-w-[85vw] pointer-events-none object-contain select-none drop-shadow-2xl"
            style={{
              position: 'relative',
              zIndex: 15,
              transform: 'translateZ(0px)',
            }}
          />
        )}

        {/* 3D Ring anchored precisely across the lower 1/3rd of the crown image */}
        <div
          className="absolute top-[72%] left-1/2 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
          }}
        >
          {texts.map((char, index) => (
            <div
              key={index}
              ref={(el) => {
                charRefs.current[index] = el;
              }}
              className="absolute flex items-center justify-center select-none"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                marginLeft: '-1.25rem',
                marginTop: '-1.25rem',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${index * (360 / texts.length)}deg) translateZ(210px)`,
                backfaceVisibility: 'visible',
              }}                
            >
              <h2 className="text-3xl md:text-5xl font-bold text-outline-primary text-accent select-none drop-shadow-sm">
                {char}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


  