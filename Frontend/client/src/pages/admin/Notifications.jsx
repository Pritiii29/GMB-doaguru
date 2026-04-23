import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Trash2, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { adminService, clientService, authService } from '../../services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread
    const [user, setUser] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const auth = await authService.verifyAuth();
            setUser(auth.user);
            fetchNotifications(auth.user);
        };
        init();
    }, []);

    const fetchNotifications = async (currentUser) => {
        try {
            setLoading(true);
            const data = currentUser.role === 'admin' 
                ? await adminService.getNotifications() 
                : await clientService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            if (user.role === 'admin') {
                await adminService.markNotificationRead(id);
            } else {
                await clientService.markNotificationRead(id);
            }
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    useGSAP(() => {
        gsap.from('.notif-anim', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
        });
    }, { scope: containerRef, dependencies: [loading, filter] });

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 notif-anim">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage your alerts and renewal reminders.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Unread
                        {notifications.filter(n => !n.is_read).length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {notifications.filter(n => !n.is_read).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm notif-anim">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">You're all caught up! New alerts will appear here when they arrive.</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div 
                            key={notif.id}
                            className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-md notif-anim ${!notif.is_read ? 'border-primary/20 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}
                        >
                            <div className="p-5 md:p-6 flex gap-4 md:gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${!notif.is_read ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                    <Bell size={24} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${notif.type === 'renewal_reminder' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {notif.type.replace('_', ' ')}
                                            </span>
                                            {!notif.is_read && (
                                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                            <Clock size={14} />
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    
                                    <p className={`text-base md:text-lg mb-4 ${!notif.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                        {notif.message}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <User size={16} className="text-slate-400" />
                                            <span className="font-medium">Client ID: {notif.clientId}</span>
                                        </div>
                                        
                                        {!notif.is_read && (
                                            <button 
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="flex items-center gap-1.5 text-primary font-bold hover:underline ml-auto"
                                            >
                                                <CheckCircle size={16} />
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
