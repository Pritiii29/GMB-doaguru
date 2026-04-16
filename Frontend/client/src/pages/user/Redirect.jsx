import React, { useEffect, useState, useRef } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const RedirectPage = () => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  
  const reviewText = "Had an amazing experience! The service was outstanding and I highly recommend it.";
  const googleReviewLink = "https://search.google.com/local/writereview?placeid=ChIJT-5eGRaxgTkRxyMc7_psGWI";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = googleReviewLink;
    }, 10000);
    return () => clearTimeout(timer);
  }, [googleReviewLink]);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(containerRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.loader-spin', {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.5)'
    }, "-=0.2")
    .from('.stagger-content', {
      y: 15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, "-=0.1");

    // Continuous spin animation
    gsap.to('.loader-spin-inner', {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'linear'
    });
  }, { scope: containerRef });

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRedirect = () => {
    window.location.href = googleReviewLink;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-slate-200 font-sans">
      <div 
        ref={containerRef}
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 text-center ring-1 ring-slate-100"
      >
        <div className="flex justify-center mb-8 loader-spin">
          <div className="loader-spin-inner w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full"></div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 stagger-content">
          Redirecting to Google...
        </h1>
        <p className="text-slate-500 text-base leading-relaxed stagger-content">
          Thank you for the positive rating! Please share your experience on our Google Reviews page to help others find us.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl mt-8 mb-8 text-left overflow-hidden stagger-content shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-100 border-b border-slate-200">
             <span className="text-sm font-semibold text-slate-500">Your Review (Optional)</span>
             <button 
               onClick={handleCopy} 
               className="flex items-center gap-1 text-primary text-sm font-semibold transition-colors hover:text-primary-hover focus:outline-none"
             >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
             </button>
          </div>
          <div className="p-4 text-[0.95rem] text-slate-800 leading-relaxed italic">
            {reviewText}
          </div>
        </div>

        <button 
          onClick={handleManualRedirect} 
          className="stagger-content w-full inline-flex items-center justify-center gap-2 py-4 px-6 text-lg font-semibold rounded-xl text-white bg-gradient-to-br from-primary to-secondary shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/20"
        >
          <span>Go to Google Reviews now</span>
          <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
};

export default RedirectPage;
