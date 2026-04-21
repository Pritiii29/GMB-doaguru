import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Check, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const RedirectPage = () => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const reviewText = "Had an amazing experience! The service was outstanding and I highly recommend it.";
  const googleReviewLink = "https://search.google.com/local/writereview?placeid=ChIJT-5eGRaxgTkRxyMc7_psGWI";

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(containerRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.stagger-content', {
      y: 15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, "-=0.1");
  }, { scope: containerRef });

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRedirect = () => {
    window.location.href = googleReviewLink;
  };

  const handleCancel = () => {
    // User cancels the redirect, take them back to home
    // In many review flows, bringing them back or closing the tab happens.
    // Navigating home is standard gracefully exiting the review flow.
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-slate-200 font-sans">
      <div 
        ref={containerRef}
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 text-center ring-1 ring-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-white shadow-sm stagger-content">
            <ExternalLink size={32} className="text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3 stagger-content">
          Share your experience?
        </h1>
        <p className="text-slate-500 text-base leading-relaxed stagger-content">
          Thank you for the positive rating! Would you like to share this on our Google Reviews page? Your feedback helps others find us.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl mt-8 mb-8 text-left overflow-hidden stagger-content shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-100 border-b border-slate-200">
             <span className="text-sm font-semibold text-slate-500">Suggested Review</span>
             <button 
               onClick={handleCopy} 
               className="flex items-center gap-1 text-primary text-sm font-semibold transition-colors hover:text-primary/80 focus:outline-none"
             >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                <span className={copied ? "text-green-500" : ""}>{copied ? 'Copied!' : 'Copy to use'}</span>
             </button>
          </div>
          <div className="p-4 text-[0.95rem] text-slate-800 leading-relaxed italic">
            "{reviewText}"
          </div>
        </div>

        <div className="flex flex-col gap-3 stagger-content">
          <button 
            onClick={handleManualRedirect} 
            className="w-full flex items-center justify-center gap-2 py-4 px-6 text-[17px] font-bold rounded-2xl text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <span>Yes, Share on Google</span>
            <ExternalLink size={18} />
          </button>
          
          <button 
            onClick={handleCancel} 
            className="w-full flex items-center justify-center gap-2 py-4 px-6 text-[16px] font-bold rounded-2xl text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:text-slate-700 transition-all duration-300"
          >
            <span>No, Cancel</span>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
