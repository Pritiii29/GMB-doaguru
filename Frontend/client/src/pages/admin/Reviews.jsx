import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Star, Download } from 'lucide-react';
import { reviewService, clientService, authService } from '../../services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ReviewsPage = () => {
  const { register, watch } = useForm({
    defaultValues: {
      searchTerm: ''
    }
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const containerRef = useRef(null);

  const searchTerm = watch("searchTerm");

  useEffect(() => {
    setCurrentPage(1);
  }, [emailFilter]);

  // Debouncing logic for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setEmailFilter(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        const auth = await authService.verifyAuth();
        const role = auth.user?.role;

        let data;
        if (role === 'client') {
          data = await clientService.getClientReviews();
        } else {
          // Fallback to admin/all
          data = await reviewService.getAllReviews();
        }

        if (Array.isArray(data)) {
          setReviews(data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewsData();
  }, []);

  useGSAP(() => {
    gsap.from('.reviews-anim', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  // Filtering reviews by name or email
  const filteredReviews = reviews.filter(res =>
  (res.fullName?.toLowerCase().includes(emailFilter.toLowerCase()) ||
    res.email?.toLowerCase().includes(emailFilter.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Rating', 'Review', 'Date', 'Time'];
    const csvContent = reviews.map(r => {
      const dateObj = r.createdAt ? new Date(r.createdAt) : null;
      const date = dateObj ? dateObj.toLocaleDateString() : '';
      const time = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      return [
        `"${r.fullName}"`,
        `"${r.email}"`,
        `"${r.mobile}"`,
        r.rating,
        `"${r.review || ''}"`,
        `"${date}"`,
        `"${time}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...csvContent].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-8 pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 reviews-anim">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Reviews</h1>
          <p className="text-slate-500 font-medium">Browse, search, and export feedback from your customers.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl py-6 shadow-sm border border-slate-200 reviews-anim overflow-hidden">
        <div className="px-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">Customer Feedback</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              {...register("searchTerm")}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentReviews.length > 0 ? currentReviews.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{r.fullName}</span>
                      <span className="text-xs text-slate-500 font-medium">{r.email}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">{r.mobile}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg w-fit">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold">{r.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-slate-600 font-medium italic">
                      "{r.review || 'No written feedback'}"
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-slate-700 font-bold">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      <span className="text-xs text-slate-400 font-medium">{r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500 font-medium">No reviews found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredReviews.length)}</span> of <span className="font-bold text-slate-900">{filteredReviews.length}</span> results
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
