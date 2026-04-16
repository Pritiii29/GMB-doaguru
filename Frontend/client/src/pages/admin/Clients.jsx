import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Search, MapPin, Building, Mail, Phone, CheckCircle, XCircle, Loader2, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useClientContext } from '../../context/ClientContext';
import { QRCodeSVG } from 'qrcode.react';

const Clients = () => {
  const containerRef = useRef(null);
  const { clients, loading, error, createClient, toggleClientStatus } = useClientContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form handling
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useGSAP(() => {
    if (!loading && clients.length > 0) {
      gsap.from('.client-card', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out'
      });
    }
  }, { scope: containerRef, dependencies: [loading, clients] });

  const handleToggleStatus = async (clientId, currentStatus) => {
    try {
      await toggleClientStatus(clientId, currentStatus);
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createClient(data, logoFile, setUploadingLogo);
      setIsModalOpen(false);
      reset();
      setLogoFile(null);
    } catch (err) {
      alert("Failed to create client: " + err.message);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Client Management</h1>
          <p className="text-slate-500">Add and manage active client accounts for the funnel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Create Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, business, or client ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 font-medium"
        />
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
         </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 font-medium">
          {error}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
           <Building className="mx-auto text-slate-300 mb-4 w-12 h-12" />
           <h3 className="text-lg font-bold text-slate-700 mb-1">No Clients Found</h3>
           <p className="text-slate-500">Try adjusting your search or add a new client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.clientId} className="client-card bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6 border-b border-slate-100 relative">
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${client.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
                <h3 className="font-bold text-lg text-slate-900 truncate pr-6">{client.businessName || "No Business Name"}</h3>
                <p className="text-sm font-medium text-slate-500 truncate">{client.name}</p>
                <div className="mt-4 inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-semibold truncate max-w-full">
                  ID: {client.clientId}
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 truncate">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 truncate">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 truncate">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.placeId || "No Place ID"}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                     <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                       <QrCode size={14} /> Client Scanner
                     </p>
                     <p className="text-[11px] text-slate-400 w-32 truncate" title={`${window.location.origin}/review/${client.clientId}`}>
                       {window.location.origin}/review/{client.clientId}
                     </p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 relative group cursor-pointer hover:border-primary transition-colors">
                     <QRCodeSVG value={`${window.location.origin}/review/${client.clientId}`} size={60} level="M" />
                     {/* Tooltip */}
                     <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] w-[140px] text-center p-2 rounded shadow-xl -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-10 font-medium">
                       Scan to open review page
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
                <button
                  onClick={() => handleToggleStatus(client.clientId, client.isActive)}
                  className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    client.isActive 
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {client.isActive ? (
                    <><XCircle size={18} /> Deactivate Client</>
                  ) : (
                    <><CheckCircle size={18} /> Activate Client</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-900">Create New Client</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                type="button"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contact Name</label>
                  <input {...register("name", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="John Doe" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                  <input {...register("businessName", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="Acme Corp" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input type="email" {...register("email", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="john@example.com" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mobile</label>
                  <input type="tel" {...register("mobile", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="9876543210" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <input type="password" {...register("password", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="••••••••" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Google Place ID</label>
                  <input {...register("placeId", { required: true })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium" placeholder="ChIJ..." />
                </div>
                
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Client Logo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                  />
                  {logoFile && <span className="text-xs text-green-600 font-medium ml-1">Selected: {logoFile.name}</span>}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploadingLogo}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                  {(isSubmitting || uploadingLogo) ? <><Loader2 className="animate-spin w-5 h-5" /> Processing...</> : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
