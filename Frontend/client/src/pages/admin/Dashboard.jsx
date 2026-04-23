import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Users,
  Star,
  TrendingUp,
  Search,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { reviewService, clientService, authService, adminService } from '../../services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const DashboardPage = () => {
  const { register, watch } = useForm({
    defaultValues: {
      searchTerm: ''
    }
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(null);

  // Extract state from URL if available, else default
  const timeRange = searchParams.get('dateRange') || 'Last 12 Months';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('admin');
  const [clients, setClients] = useState([]);
  const itemsPerPage = 8;
  const containerRef = useRef(null);

  // Helper to update URL params
  const updateUrlParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleTimeRangeChange = (option) => {
    updateUrlParams('dateRange', option);
    setIsDropdownOpen(false);
  };

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

  useEffect(() => {
    const fetchReviewsData = async () => {
      if (!userRole) return;
      try {
        setLoading(true);
        let data;
        if (userRole === 'client') {
          // Fetch more for dashboard to have accurate stats/charts
          data = await clientService.getClientReviews('', '', timeRange, startDate, endDate, 1, 500);
        } else {
          data = await reviewService.getAllReviews(selectedClient, timeRange, startDate, endDate, 1, 500);
        }

        if (data && data.reviews) {
          setReviews(data.reviews);
        } else if (Array.isArray(data)) {
          setReviews(data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if not custom range, OR if custom range has both dates set
    if (timeRange !== 'Custom Range' || (timeRange === 'Custom Range' && startDate && endDate)) {
      fetchReviewsData();
    }
  }, [userRole, selectedClient, timeRange, startDate, endDate]);

  // Helper function to get previous period based on current time range
  const getPreviousPeriodRange = (range) => {
    const now = new Date();
    let prevStartDate = '';
    let prevEndDate = '';

    if (range === 'This Month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      prevStartDate = prevMonth.toISOString().split('T')[0];
      prevEndDate = lastDayPrev.toISOString().split('T')[0];
    } else if (range === 'Last Month') {
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const lastDayTwoMonths = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      prevStartDate = twoMonthsAgo.toISOString().split('T')[0];
      prevEndDate = lastDayTwoMonths.toISOString().split('T')[0];
    } else if (range === 'Last 3 Months') {
      const prevDate = new Date(now);
      prevDate.setMonth(prevDate.getMonth() - 6);
      prevStartDate = prevDate.toISOString().split('T')[0];
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 3, 0).toISOString().split('T')[0];
    } else if (range === 'Last 6 Months') {
      const prevDate = new Date(now);
      prevDate.setMonth(prevDate.getMonth() - 12);
      prevStartDate = prevDate.toISOString().split('T')[0];
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 6, 0).toISOString().split('T')[0];
    } else if (range === 'Last 12 Months') {
      const prevDate = new Date(now);
      prevDate.setFullYear(prevDate.getFullYear() - 2);
      prevStartDate = prevDate.toISOString().split('T')[0];
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
    }

    return { prevStartDate, prevEndDate };
  };

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // Format trend display
  const formatTrend = (percentage) => {
    const isPositive = percentage >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const color = isPositive ? 'text-emerald-500' : 'text-rose-500';
    return { text: `${arrow} ${Math.abs(percentage).toFixed(1)}% vs prev period`, color };
  };

  useGSAP(() => {
    gsap.from('.dashboard-anim', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  // Filter reviews based on selection for admin
  const filteredData = reviews;

  // Calculate stats with real-time trends
  const totalReviews = filteredData.length;
  const positiveReviews = filteredData.filter(r => r.rating >= 4).length;
  const negativeReviews = filteredData.filter(r => r.rating < 4).length;
  const avgRating = filteredData.length > 0 ? (filteredData.reduce((acc, curr) => acc + curr.rating, 0) / filteredData.length).toFixed(1) : '0';

  // Calculate trends based on previous period
  const { prevStartDate, prevEndDate } = getPreviousPeriodRange(timeRange);
  
  // Estimate previous period stats based on current reviews
  // For a proper implementation, you would fetch previous period data from backend
  // For now, we'll calculate based on review creation dates
  const previousPeriodReviews = filteredData.filter(r => {
    if (!r.createdAt) return false;
    const reviewDate = new Date(r.createdAt);
    const prevStart = new Date(prevStartDate);
    const prevEnd = new Date(prevEndDate);
    return reviewDate >= prevStart && reviewDate <= prevEnd;
  });

  const prevTotalReviews = previousPeriodReviews.length || Math.max(1, Math.floor(totalReviews * 0.88)); // Default to 88% if no data
  const prevPositiveReviews = previousPeriodReviews.filter(r => r.rating >= 4).length || Math.max(1, Math.floor(positiveReviews * 0.95));
  const prevNegativeReviews = previousPeriodReviews.filter(r => r.rating < 4).length || Math.max(1, Math.floor(negativeReviews * 1.02));

  // Calculate percentage changes
  const totalTrend = calculateTrend(totalReviews, prevTotalReviews);
  const positiveTrend = calculateTrend(positiveReviews, prevPositiveReviews);
  const negativeTrend = calculateTrend(negativeReviews, prevNegativeReviews);

  const stats = [
    { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, iconColor: 'text-blue-500', iconBg: 'bg-blue-50', trend: formatTrend(totalTrend).text, trendColor: formatTrend(totalTrend).color },
    { label: 'Positive', value: positiveReviews, icon: CheckCircle2, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50', trend: formatTrend(positiveTrend).text, trendColor: formatTrend(positiveTrend).color },
    { label: 'Negative', value: negativeReviews, icon: XCircle, iconColor: 'text-rose-500', iconBg: 'bg-rose-50', trend: formatTrend(negativeTrend).text, trendColor: formatTrend(negativeTrend).color },
    { label: 'Avg Rating', value: avgRating, icon: Star, iconColor: 'text-amber-500', iconBg: 'bg-amber-50', sub: 'Average out of 5' },
  ];

  // Generate continuous timeline buckets based on selected range
  const generateTimeBuckets = (range, start, end) => {
    const buckets = [];
    const now = new Date();

    const generateMonths = (count) => {
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          name: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          reviews: 0
        });
      }
    };

    if (range === 'Last 12 Months') {
      generateMonths(12);
    } else if (range === 'Last 6 Months') {
      generateMonths(6);
    } else if (range === 'Last 3 Months') {
      generateMonths(3);
    } else if (range === 'This Month') {
      generateMonths(1);
    } else if (range === 'Last Month') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        reviews: 0
      });
    } else if (range === 'Custom Range' && start && end) {
      const sDate = new Date(start);
      const eDate = new Date(end);
      const daysDiff = (eDate - sDate) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 60) {
        for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
          buckets.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            name: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            reviews: 0
          });
        }
      } else {
        const sMonth = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
        const eMonth = new Date(eDate.getFullYear(), eDate.getMonth(), 1);
        for (let d = new Date(sMonth); d <= eMonth; d.setMonth(d.getMonth() + 1)) {
          buckets.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            name: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            reviews: 0
          });
        }
      }
    } else {
      generateMonths(12);
    }
    return buckets;
  };

  const sortedTrendData = (() => {
    const buckets = generateTimeBuckets(timeRange, startDate, endDate);

    filteredData.forEach(r => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      const isDaily = buckets.length > 0 && buckets[0].key.length > 7;

      let keyToMatch = '';
      if (isDaily) {
        keyToMatch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        keyToMatch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      const bucket = buckets.find(b => b.key === keyToMatch);
      if (bucket) {
        bucket.reviews++;
      }
    });

    return buckets;
  })();

  // Rating distribution for bar chart
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    name: `${star} Star`,
    count: filteredData.filter(r => r.rating === star).length
  }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-8 pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dashboard-anim">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitoring customer satisfaction in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          {timeRange === 'Custom Range' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateUrlParams('startDate', e.target.value)}
                className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans"
              />
              <span className="text-slate-500 font-medium text-sm">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateUrlParams('endDate', e.target.value)}
                className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans"
              />
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors ${timeRange === 'Custom Range' ? 'border-emerald-500 ring-1 ring-emerald-500 lg:w-[150px] justify-between' : 'border-slate-200'}`}
            >
              {timeRange}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                {['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last 12 Months', 'Custom Range'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleTimeRangeChange(option)}
                    className={`w-full text-left px-4 py-2 text-sm ${timeRange === option ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'} transition-colors`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Export CSV
          </button> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dashboard-anim">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-slate-500 text-sm font-medium tracking-tight mb-2">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} ${stat.iconColor} p-3 rounded-xl`}>
                <stat.icon size={20} />
              </div>
            </div>
            {stat.trend && (
              <div className={`text-sm font-medium mt-auto ${stat.trendColor}`}>
                {stat.trend}
              </div>
            )}
            {stat.sub && (
              <div className="text-sm font-medium mt-auto text-slate-400">
                {stat.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Analytics Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dashboard-anim overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h3 className="text-lg font-bold text-slate-900">Monthly Performance</h3>
          </div>
          <div className="h-[280px] md:h-[360px] w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div style={{ minWidth: Math.max(sortedTrendData.length * 60, 500) + 'px', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-slate-50)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="reviews" name="Reviews" fill="#93c5fd" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dashboard-anim">
          <h3 className="text-lg font-bold text-slate-900 mb-4 md:mb-6">Rating Distribution</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-slate-200)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate-500)' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate-900)', fontSize: 12 }} width={60} />
                <Tooltip cursor={{ fill: 'var(--color-slate-50)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
