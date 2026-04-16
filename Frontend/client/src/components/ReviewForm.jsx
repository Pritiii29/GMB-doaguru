import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Star } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { reviewService } from '../services/api';

const ReviewForm = ({ onRatingChange, clientId }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      rating: 0,
      name: '',
      email: '',
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
    if (rating > 0 && rating < 4) {
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
        email: data.email,
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
        <div className="flex flex-col gap-5 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium`}
              placeholder="Enter Full Name"
            />
            {errors.name && <span className="text-red-500 text-[11px] font-bold ml-1 uppercase">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
              })}
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="text-red-500 text-[11px] font-bold ml-1 uppercase">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
            <input
              type="tel"
              {...register("phone", {
                required: "Phone is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" }
              })}
              maxLength={10}
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium`}
              placeholder="9876543210"
            />
            {errors.phone && <span className="text-red-500 text-[11px] font-bold ml-1 uppercase">{errors.phone.message}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8 items-center">
          <label className="text-xs font-bold text-slate-400 uppercase mb-1">Rate your experience</label>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-${star} p-1 transition-all rounded-full ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-200'}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={42}
                  fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {rating === 0 && <span className="text-slate-400 text-[10px] font-bold uppercase mt-1">Please select a rating</span>}
        </div>

        <div className="feedback-section h-0 opacity-0 overflow-hidden">
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Your Message</label>
            <textarea
              {...register("review", {
                required: "Message is required",
                pattern: { message: "Invalid message format" }
              })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all min-h-[100px] resize-none font-medium"
              placeholder="Tell us what went wrong..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:transform-none"
          disabled={rating === 0}
        >
          Submit Feedback
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
