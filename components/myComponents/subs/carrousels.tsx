
import React, { useEffect, useState } from 'react';

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
  }
  export const TextCarousel: React.FC<TextCarouselProps> = ({
    text = 'INPUT YOUR CAROUSEL TEXT HERE',
    speed = 3000,
    image = false,
    imageUrl = 'https://res.cloudinary.com/dc5khnuiu/image/upload/v1751682480/inhqujbmn3pxu9nefbuj.jpg',
  }) => {
    const texts = [...text]; 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotationAngle, setRotationAngle] = useState(0);

  
    useEffect(() => {
        const intervalId = setInterval(() => {
          setRotationAngle((prevAngle) => prevAngle + 7.2);
        }, speed);
      
        return () => clearInterval(intervalId);
      }, [speed]);
      
  
    return (
      <div 
        className="relative h-[400px] flex flex-col justify-center items-center overflow-clip"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          transform: 'rotateX(16deg)',
        }}
        >
        <div className="absolute w-full h-full bg-secondary z-10"></div>
        {image && (
          <img
            src={imageUrl}
            alt="Carousel Image"
            className="h-full transform /-translate-x-1/2 /-translate-y-1/2 z-10"
          />
        )}
      {texts.map((text, index) => (
        <div
          key={index}
          className={`absolute self-center transform-3d /-translate-x-1/2 /-translate-y-1/2 /translate-z-[150px] text-accent text-center transform-3d ${`rotate-y-${index * 7.2}`} transition-transform duration-1000`}
          style={{
            transform: `rotateY(${index * (360 / texts.length) + rotationAngle}deg) translateZ(190px)`,
            zIndex: Math.round(Math.cos((index * (360 / texts.length) + rotationAngle) * Math.PI / 180) * 2) * 10,
          }}                
        >
          <h2 className="text-5xl font-bold">{text}</h2>
        </div>
      ))}
    </div>
  );
};


  