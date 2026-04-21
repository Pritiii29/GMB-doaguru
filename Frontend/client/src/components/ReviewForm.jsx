import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Star, User, Phone, MessageSquare, Send } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { reviewService } from '../services/api';

const ReviewForm = ({ onRatingChange, clientId }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      rating: 0,
      name: '',
      phone: '',
      review: ''
    }
  });

  const rating = watch("rating");
  const [hoverRating, setHoverRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useGSAP(() => {
    if (rating > 0) {
      gsap.to('.feedback-section', {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        marginBottom: '1.5rem',
      });
    } else {
      gsap.to('.feedback-section', {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        marginBottom: 0,
      });
    }

    if (onRatingChange) {
      onRatingChange(rating, hoverRating);
    }
  }, [rating, hoverRating]);

  const handleRatingClick = (num) => {
    setValue("rating", num);
    gsap.fromTo(`.star-${num}`,
      { scale: 1.3 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
  };

  const onSubmit = async (data) => {
    if (data.rating === 0) return;

    try {
      const result = await reviewService.submitReview({
        clientId: clientId, // Include clientId here
        fullName: data.name,
        mobile: data.phone,
        rating: data.rating,
        review: data.review
      });

      if (result.redirect === "google") {
        navigate('/redirect');
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      if (data.rating >= 4) {
        navigate('/redirect');
      } else {
        setShowModal(true);
      }
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="w-full text-left">
        <div className="flex flex-col gap-6 mb-8 mt-2">
          {/* Name Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors z-10">
              <User size={22} strokeWidth={2} />
            </div>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className={`w-full pl-12 pr-4 py-4 bg-slate-50/70 hover:bg-slate-50 border-2 ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-100 hover:border-slate-200 focus:border-primary focus:ring-primary/20'} rounded-2xl text-[15px] outline-none focus:ring-4 transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium shadow-sm`}
              placeholder="Your Full Name"
            />
            {errors.name && <p className="absolute -bottom-5 left-2 text-red-500 text-[11px] font-bold tracking-wide">{errors.name.message}</p>}
          </div>

          {/* Phone Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors z-10">
              <Phone size={22} strokeWidth={2} />
            </div>
            <input
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" }
              })}
              maxLength={10}
              className={`w-full pl-12 pr-4 py-4 bg-slate-50/70 hover:bg-slate-50 border-2 ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-100 hover:border-slate-200 focus:border-primary focus:ring-primary/20'} rounded-2xl text-[15px] outline-none focus:ring-4 transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium shadow-sm`}
              placeholder="Your Phone Number"
            />
            {errors.phone && <p className="absolute -bottom-5 left-2 text-red-500 text-[11px] font-bold tracking-wide">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Rating Section */}
        <div className="flex flex-col gap-3 mb-8 items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Rate your experience</label>
          <div className="flex justify-center gap-2 relative z-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-${star} p-1.5 transition-all rounded-full hover:scale-110 ${star <= (hoverRating || rating) ? 'text-amber-400 drop-shadow-md' : 'text-slate-200 hover:text-slate-300'}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={44}
                  fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                  strokeWidth={star <= (hoverRating || rating) ? 0 : 2}
                />
              </button>
            ))}
          </div>
          {rating === 0 && <span className="text-slate-400 text-[11px] font-bold mt-1">Please select a rating</span>}
        </div>

        {/* Feedback Textarea */}
        <div className="feedback-section h-0 opacity-0 overflow-hidden">
          <div className="relative group mb-8 mt-2">
            <div className="absolute top-4 left-4 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors z-10">
              <MessageSquare size={22} strokeWidth={2} />
            </div>
            <textarea
              {...register("review", {
                required: "Message is required"
              })}
              className={`w-full pl-12 pr-4 py-4 bg-slate-50/70 hover:bg-slate-50 border-2 border-slate-100 hover:border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-2xl text-[15px] outline-none transition-all min-h-[120px] resize-none font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium shadow-sm leading-relaxed ${errors.review ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              placeholder="Tell us about your experience..."
            />
            {errors.review && <p className="absolute -bottom-5 left-2 text-red-500 text-[11px] font-bold tracking-wide">{errors.review.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 text-[17px] font-bold rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
          disabled={rating === 0}
        >
          <span>Submit Feedback</span>
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white popup-modal rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative ring-1 ring-slate-100 transform transition-all">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-500 mb-8 font-medium">
              We appreciate your feedback. Our team will review your comments to help improve our services.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 text-lg font-bold rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewForm;
