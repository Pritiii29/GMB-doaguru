import React, { useState, useEffect, useRef } from 'react';
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

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(null);
  const [selectedClient, setSelectedClient] = useState('all');
  const [clients, setClients] = useState([]);
  const itemsPerPage = 8;
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
          data = await clientService.getClientReviews();
        } else {
          data = await reviewService.getAllReviews(selectedClient);
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
  }, [userRole, selectedClient]);

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
  const filteredData = reviews.filter(r => selectedClient === 'all' || r.clientId === selectedClient);

  // Stats calculation using filtered data
  const stats = [
    { label: 'Total Reviews', value: filteredData.length, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+12%', up: true },
    { label: 'Positive', value: filteredData.filter(r => r.rating >= 4).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '85%', up: true },
    { label: 'Negative', value: filteredData.filter(r => r.rating < 4).length, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', trend: '15%', up: false },
    { label: 'Avg Rating', value: (filteredData.reduce((acc, curr) => acc + curr.rating, 0) / (filteredData.length || 1)).toFixed(1), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', trend: '+0.2', up: true },
  ];

  // Group reviews by date for trend chart
  const trendData = (() => {
    const grouped = {};
    filteredData.forEach(r => {
      const dateKey = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'Unknown';
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          displayDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Unknown',
          count: 0
        };
      }
      grouped[dateKey].count++;
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({ name: item.displayDate, reviews: item.count }));
  })();

  // Final trend data
  const sortedTrendData = trendData;

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

        {userRole === 'admin' && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             <Filter size={18} className="text-slate-400 ml-2" />
             <select 
               value={selectedClient}
               onChange={(e) => setSelectedClient(e.target.value)}
               className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 pr-8 cursor-pointer"
             >
               <option value="all">Global View (All Clients)</option>
               <option value="admin">DOAGuru Reviews</option>
               {clients.map(c => (
                 <option key={c.clientId} value={c.clientId}>{c.businessName}</option>
               ))}
             </select>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dashboard-anim">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
                {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Analytics Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dashboard-anim overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h3 className="text-lg font-bold text-slate-900">Review Trends</h3>
          </div>
          <div className="h-[280px] md:h-[360px] w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div style={{ minWidth: Math.max(sortedTrendData.length * 60, 500) + 'px', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    angle={-40}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={35}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value, 'Reviews']}
                  />
                  <Area
                    type="monotone"
                    dataKey="reviews"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReviews)"
                    dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
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
