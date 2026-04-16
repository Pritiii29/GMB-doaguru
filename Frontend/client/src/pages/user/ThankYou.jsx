import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(containerRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out'
    })
    .from('.success-icon', {
      scale: 0,
      rotation: -180,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.5)'
    }, "-=0.4")
    .from('.text-content', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    }, "-=0.2");
  }, { scope: containerRef });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50 font-sans">
      <div 
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center ring-1 ring-slate-100"
      >
        <div className="flex justify-center mb-8">
          <CheckCircle size={72} className="success-icon text-success" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 text-content">
          Thank you for your feedback!
        </h1>
        
        <p className="text-slate-500 text-base leading-relaxed mb-10 text-content">
          We appreciate you taking the time to share your perspective. 
          Our team is reviewing your response to help us improve our services.
        </p>

        <button 
          onClick={() => navigate('/')} 
          className="text-content min-w-[160px] inline-flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-all bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
