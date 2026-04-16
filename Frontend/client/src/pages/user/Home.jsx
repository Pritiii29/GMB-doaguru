import React, { useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useParams } from 'react-router-dom';
import ReviewForm from '../../components/ReviewForm';

const Home = () => {
  const { clientId } = useParams();
  const containerRef = useRef(null);
  const [currentRating, setCurrentRating] = useState({ rating: 0, hoverRating: 0 });

  const handleRatingChange = useCallback((rating, hoverRating) => {
    setCurrentRating({ rating, hoverRating });
  }, []);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.emoji-pop', {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      delay: 0.2,
      ease: 'back.out(1.7)'
    });
  }, { scope: containerRef });

  const getEmoji = () => {
    if (currentRating.hoverRating === 0 && currentRating.rating === 0) return '👋';
    const current = currentRating.hoverRating || currentRating.rating;
    switch (current) {
      case 1: return '😞'; case 2: return '😕'; case 3: return '😐';
      case 4: return '🙂'; case 5: return '🤩'; default: return '👋';
    }
  };

  const getGreeting = () => {
    if (currentRating.rating === 0) return "How was your experience?";
    if (currentRating.rating <= 3) return "We're sorry to hear that. How can we improve?";
    return "Awesome! Thanks for the love.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-50 text-slate-900 font-sans">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center ring-1 ring-slate-100"
      >
        <div className="mb-6 flex justify-center emoji-pop">
          <span className="text-7xl leading-none select-none block" role="img" aria-label="mood">
            {getEmoji()}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">
          {getGreeting()}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Your feedback helps us provide a better experience for everyone.
        </p>

        <ReviewForm onRatingChange={handleRatingChange} clientId={clientId} />
      </div>
    </div>
  );
};

export default Home;
