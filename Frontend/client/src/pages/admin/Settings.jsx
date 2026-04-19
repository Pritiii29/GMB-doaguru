import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Store, Link as LinkIcon, Bell } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { clientService, authService } from '../../services/api';

const SettingsPage = () => {
  const containerRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      businessName: '',
      googleReviewLink: '',
      notificationEmail: '',
      threshold: '4',
      name: '',
      mobile: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = await authService.verifyAuth();
        setUserRole(auth.user?.role);
        
        if (auth.user?.role === 'client') {
           const profile = await clientService.getProfile();
           reset({
             businessName: profile.businessName || '',
             googleReviewLink: profile.placeId ? `https://search.google.com/local/writereview?placeid=${profile.placeId}` : '',
             notificationEmail: profile.email || '',
             name: profile.name || '',
             mobile: profile.mobile || '',
             threshold: '4'
           });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const [saving, setSaving] = useState(false);

  useGSAP(() => {
    gsap.from('.settings-anim', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
       if (userRole === 'client') {
          // Extract placeId from googleReviewLink
          let placeId = '';
          try {
             if (data.googleReviewLink.includes('placeid=')) {
                placeId = data.googleReviewLink.split('placeid=')[1];
             }
          } catch(e){}

          await clientService.updateProfile({
             name: data.name || data.businessName,
             businessName: data.businessName,
             mobile: data.mobile || data.notificationEmail,
             placeId: placeId || data.googleReviewLink
          });
          alert("Profile updated successfully!");
       } else {
          alert("Settings saved successfully! (Admin placeholder)");
       }
    } catch(err) {
       console.error(err);
       alert("Error updating profile");
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div ref={containerRef} className="max-w-3xl w-full font-sans">
      <div className="mb-10 settings-anim">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">System Settings</h1>
        <p className="text-slate-500 font-medium">Manage your business profile and routing configuration.</p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm settings-anim">
            <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900 pb-6 border-b border-slate-100 mb-6 font-bold">
              <Store size={22} className="text-primary" />
              General Information
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-tight">Business Name</label>
                <input
                  type="text"
                  {...register("businessName", { required: "Business name is required" })}
                  className={`w-full px-4 py-3 border ${errors.businessName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-300'} rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium`}
                  autoComplete="off"
                />
                {errors.businessName && <span className="text-red-500 text-[11px] font-bold uppercase">{errors.businessName.message}</span>}
                <p className="text-[13px] text-slate-400 mt-1 font-medium italic">This will be displayed on the public review page.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-tight">Google Review Link</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    type="url"
                    {...register("googleReviewLink", { 
                      required: "Review link is required",
                      pattern: { value: /https?:\/\/.+/, message: "Invalid URL" }
                    })}
                    className={`w-full pl-11 pr-4 py-3 border ${errors.googleReviewLink ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-300'} rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium`}
                    placeholder="https://g.page/r/..."
                  />
                </div>
                {errors.googleReviewLink && <span className="text-red-500 text-[11px] font-bold uppercase">{errors.googleReviewLink.message}</span>}
                <p className="text-[13px] text-slate-400 mt-1 font-medium italic">Users who provide positive sentiment will be redirected here.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm settings-anim">
            <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900 pb-6 border-b border-slate-100 mb-6 font-bold">
              <Bell size={22} className="text-secondary" />
              Review Routing Rules
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-tight">Positive Routing Threshold</label>
                <select
                  {...register("threshold")}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="5">5 Stars only</option>
                  <option value="4">4 Stars and above</option>
                  <option value="3">3 Stars and above</option>
                </select>
                <p className="text-[13px] text-slate-400 mt-1 font-medium italic">Ratings equal to or above this value will be sent to Google.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-tight">Internal Feedback Alerts</label>
                <input
                  type="email"
                  {...register("notificationEmail", { 
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                  className={`w-full px-4 py-3 border ${errors.notificationEmail ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-300'} rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium`}
                />
                {errors.notificationEmail && <span className="text-red-500 text-[11px] font-bold uppercase">{errors.notificationEmail.message}</span>}
                <p className="text-[13px] text-slate-400 mt-1 font-medium italic">Email address for receiving negative response alerts.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2 pt-6 border-t border-slate-200 settings-anim">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-secondary hover:shadow-lg text-white font-bold rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary/20 disabled:opacity-75 disabled:transform-none transform hover:-translate-y-0.5"
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
