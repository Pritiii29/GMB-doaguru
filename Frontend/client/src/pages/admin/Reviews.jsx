import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Star, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewService, clientService, authService, adminService } from '../../services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ReviewsPage = () => {
  const { register, watch } = useForm({
    defaultValues: {
      searchTerm: ''
    }
  });

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const containerRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedClient, setSelectedClient] = useState('all');
  const [clients, setClients] = useState([]);

  const searchTerm = watch("searchTerm");

  useEffect(() => {
    setCurrentPage(1);
  }, [emailFilter, selectedClient]);

  // Debouncing logic for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setEmailFilter(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const initFetch = async () => {
      try {
        const auth = await authService.verifyAuth();
        const role = auth.user?.role;
        setUserRole(role);

        if (role === 'admin') {
          const clientsData = await adminService.getClients();
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error fetching auth or clients:", error);
      }
    };
    initFetch();
  }, []);

  const fetchReviewsData = async () => {
    if (!userRole) return;
    try {
      setLoading(true);
      let response;
      if (userRole === 'client') {
        // getClientReviews: (type, search, dateRange, startDate, endDate, page, limit)
        response = await clientService.getClientReviews('', emailFilter, '', '', '', currentPage, itemsPerPage);
      } else {
        // getAllReviews: (clientId, dateRange, startDate, endDate, page, limit)
        response = await reviewService.getAllReviews(selectedClient, '', '', '', currentPage, itemsPerPage);
      }

      if (response && response.reviews) {
        setReviews(response.reviews);
        setPagination(response.pagination);
      } else if (Array.isArray(response)) {
        // Fallback for old API format if needed, though we updated it
        setReviews(response);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [userRole, selectedClient, emailFilter, currentPage]);

  useGSAP(() => {
    if (!loading) {
      gsap.fromTo('.reviews-anim', 
        { y: 10, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out',
          clearProps: 'all' 
        }
      );
    }
  }, { scope: containerRef, dependencies: [loading, reviews] });

  // Export to CSV (fetches ALL reviews for export - or we can limit it)
  const handleExport = async () => {
    try {
      // For export, we fetch a larger chunk or all (for simplicity here, we'll export current view or fetch more)
      // Ideally, backend should have an export endpoint, but for now we use the reviews in state
      const headers = ['Name', 'Email', 'Phone', 'Rating', 'Review', 'Date', 'Time', 'Business'];
      const csvContent = reviews.map(r => {
        const dateObj = r.createdAt ? new Date(r.createdAt) : null;
        const date = dateObj ? dateObj.toLocaleDateString() : '';
        const time = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        return [
          `"${r.fullName}"`,
          `"${r.email}"`,
          `"${r.mobile}"`,
          r.rating,
          `"${(r.review || '').replace(/"/g, '""')}"`,
          `"${date}"`,
          `"${time}"`,
          `"${r.businessName || ''}"`
        ].join(',');
      });

      const blob = new Blob([[headers.join(','), ...csvContent].join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviews_page_${currentPage}_${new Date().toLocaleDateString()}.csv`;
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (loading && reviews.length === 0) return (
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

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 reviews-anim overflow-hidden overflow-x-auto">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white sticky left-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <h3 className="text-xl font-bold text-slate-900 shrink-0">Customer Feedback</h3>

            {userRole === 'admin' && (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer hover:border-primary/30"
              >
                <option value="all">All Clients</option>
                <option value="admin">DOAGuru Reviews</option>
                {clients.map(c => (
                  <option key={c.clientId} value={c.clientId}>{c.businessName}</option>
                ))}
              </select>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold shadow-inner"
              {...register("searchTerm")}
            />
          </div>
        </div>

        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Customer</th>
                {userRole === 'admin' && <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Branch/Business</th>}
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Rating</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Feedback</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {reviews.length > 0 ? reviews.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold border border-slate-200 group-hover:border-primary/30 group-hover:bg-white transition-all">
                            {r.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{r.fullName}</span>
                            <span className="text-xs text-slate-400 font-medium">{r.email}</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5">{r.mobile}</span>
                        </div>
                    </div>
                  </td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-black border border-slate-200 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all">
                        {r.businessName || "Unknown"}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl w-fit border border-amber-100/50 shadow-sm group-hover:shadow-amber-100 transition-all">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black">{r.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-md text-sm leading-relaxed text-slate-600 font-medium italic line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                      "{r.review || 'No written feedback'}"
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-slate-700 font-bold tracking-tight">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      <span className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">{r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={userRole === 'admin' ? 5 : 4} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                    {loading ? 'Refreshing reviews...' : 'No reviews found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30 sticky left-0">
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">
              Showing <span className="text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> Results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1.5 mx-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Only show current, first, last, and neighbors
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] h-10 px-2 rounded-xl flex items-center justify-center text-xs font-black transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={i} className="text-slate-300">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
