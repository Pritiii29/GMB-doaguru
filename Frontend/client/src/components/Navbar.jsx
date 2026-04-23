import React, { useRef, useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, Settings, LogOut, Menu, X, Users, MessageSquare, CreditCard, Bell } from 'lucide-react';
import { authService, adminService } from '../services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import logo from '../assets/logo.jpeg';

const Navbar = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const auth = await authService.verifyAuth();
      if (auth.isAuthenticated) {
        // Fallback to admin if role is missing in older tokens
        const currentUser = auth.user || {};
        if (!currentUser.role) currentUser.role = 'admin';
        setUser(currentUser);
      } else {
        navigate('/admin/login');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchNotifications = async () => {
        try {
          const data = await adminService.getNotifications();
          setNotifications(data);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotifications();
      // Poll every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      if (user.role === 'admin') {
        await adminService.markNotificationRead(id);
      } else {
        await clientService.markNotificationRead(id);
      }
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSignOut = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/admin/login');
    }
  };

  useGSAP(() => {
    // Slight entry animation for the sidebar
    gsap.from(sidebarRef.current, {
      x: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.nav-item-anim', {
      x: -20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.2,
      ease: 'power2.out'
    });
  }, { scope: sidebarRef });

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
    ...(user?.role === 'admin' ? [
      { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
      { name: 'Clients', path: '/admin/clients', icon: <Users size={20} /> },
      { name: 'Subscriptions', path: '/admin/subscriptions', icon: <CreditCard size={20} /> }
    ] : []),
    { name: 'QR Codes', path: '/admin/qrcode', icon: <QrCode size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`bg-white border-r border-slate-200 flex flex-col fixed h-screen z-50 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]'} 
          md:translate-x-0 ${isDesktopSidebarOpen ? 'md:w-[260px]' : 'md:w-[80px]'}`}
      >
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center h-20">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isDesktopSidebarOpen ? 'w-auto opacity-100' : 'md:w-0 md:opacity-0'}`}>
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm shrink-0"></span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">ReviewFlow</h2>
          </div>

          <div className="flex items-center shrink-0">
            {/* Mobile Close Button */}
            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>

            {/* Desktop Toggle Button (visible when collapsed or at right edge when open) */}
            <button
              type="button"
              className={`hidden md:flex p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors ${isDesktopSidebarOpen ? '-mr-2' : 'mx-auto'}`}
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item-anim">
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all text-base whitespace-nowrap overflow-hidden ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  title={!isDesktopSidebarOpen ? item.name : ""}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0'}`}>{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 nav-item-anim">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all w-full text-left text-slate-500 hover:bg-red-50 hover:text-danger whitespace-nowrap overflow-hidden"
            title={!isDesktopSidebarOpen ? "Sign Out" : ""}
          >
            <div className="shrink-0"><LogOut size={20} /></div>
            <span className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isDesktopSidebarOpen ? 'md:ml-[260px]' : 'md:ml-[80px]'} ml-0`}>
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-20 shadow-sm">

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">ReviewFlow</h2>
          </div>

          <div className="flex items-center gap-3 font-medium text-slate-700">
            {user?.role === 'client' && user?.logo ? (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                <img src={`http://localhost:5000${user.logo}`} alt="Client Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 text-primary flex items-center justify-center font-semibold border border-slate-200 overflow-hidden shrink-0">
                <img src={logo} alt="Admin Logo" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="hidden sm:block">{user?.role === 'admin' ? 'Admin' : (user?.businessName || 'Client')}</span>
          </div>

          {user?.role === 'admin' && (
            <div className="relative mr-4" ref={notificationRef}>
              <button
                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifyOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                          onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="flex-1">
                              <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                {n.message}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 text-center border-t border-slate-100">
                      <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Navbar;
