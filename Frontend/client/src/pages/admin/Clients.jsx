import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Search, MapPin, Building, Mail, Phone, Edit2, Loader2, QrCode, XCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useClientContext } from '../../context/ClientContext';
import { QRCodeSVG } from 'qrcode.react';

const Clients = () => {
  const containerRef = useRef(null);
  const { clients, loading, error, createClient, updateClient, toggleClientStatus } = useClientContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form handling
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useGSAP(() => {
    if (!loading && clients.length > 0) {
      gsap.fromTo('.client-card', 
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, { scope: containerRef, dependencies: [loading, clients] });

  const handleToggleStatus = async (clientId, currentStatus) => {
    try {
      await toggleClientStatus(clientId, currentStatus);
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    reset({ name: '', businessName: '', email: '', mobile: '', password: '', placeId: '', logo: '' });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      businessName: client.businessName,
      email: client.email,
      mobile: client.mobile,
      password: '', // Leave empty to not change password
      placeId: client.placeId,
      logo: client.logo
    });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.clientId, data, logoFile, setUploadingLogo);
      } else {
        await createClient(data, logoFile, setUploadingLogo);
      }
      setIsModalOpen(false);
      reset();
      setLogoFile(null);
      setEditingClient(null);
    } catch (err) {
      alert(`Failed to ${editingClient ? 'update' : 'create'} client: ` + err.message);
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
          <p className="text-slate-500">Manage client accounts, adjust details, and toggle access.</p>
        </div>
        <button 
          onClick={openCreateModal}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map(client => (
            <div 
              key={client.clientId} 
              className={`client-card group flex flex-col bg-white rounded-[1.5rem] border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden relative ${!client.isActive && 'grayscale-[40%] opacity-90'}`}
            >
              
              {/* Top Banner Area */}
              <div className={`p-5 relative overflow-hidden transition-colors duration-500 min-h-[110px] shrink-0 ${client.isActive ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-28 h-28 bg-white opacity-10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-20 h-20 bg-black opacity-10 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div className="pr-10">
                    <h3 className="font-extrabold text-xl text-white tracking-tight drop-shadow-sm truncate">{client.businessName || "No Business Name"}</h3>
                    <p className="text-white/90 font-medium text-xs truncate mt-1 flex items-center gap-1">
                       <Building size={12} className="opacity-80"/> {client.name}
                    </p>
                  </div>
                  
                  <div className="absolute top-0 right-0 flex flex-col gap-2">
                    <button 
                      onClick={() => openEditModal(client)} 
                      className="text-white/90 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all p-2 rounded-xl shadow-sm border border-white/20 hover:scale-110"
                      title="Edit Client"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>

                {/* ID Tag */}
                <div className="mt-4 relative z-10">
                  <span className="inline-flex items-center px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg text-[10px] font-mono font-bold shadow-sm">
                    ID: {client.clientId}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col gap-4 bg-white flex-1 relative">
                {/* Active Toggle overlapping the sections */}
                <div className="absolute -top-6 right-5 z-20">
                  <label className="relative inline-flex items-center cursor-pointer drop-shadow-sm hover:scale-105 transition-transform" title={client.isActive ? 'Deactivate Client' : 'Activate Client'}>
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={client.isActive === 1 || client.isActive === true} 
                      onChange={() => handleToggleStatus(client.clientId, client.isActive)} 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-emerald-400 peer-checked:to-teal-500 border border-slate-300 peer-checked:border-emerald-500 shadow-inner"></div>
                  </label>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 mt-1">
                  <div className="group/item flex items-center gap-3 p-2.5 rounded-2xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                    <div className="bg-blue-100/50 text-blue-600 p-2 rounded-xl group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors shadow-none group-hover/item:shadow-sm"><Mail size={16} /></div>
                    <span className="text-xs font-semibold text-slate-700 truncate">{client.email}</span>
                  </div>
                  <div className="group/item flex items-center gap-3 p-2.5 rounded-2xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-100">
                    <div className="bg-purple-100/50 text-purple-600 p-2 rounded-xl group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors shadow-none group-hover/item:shadow-sm"><Phone size={16} /></div>
                    <span className="text-xs font-semibold text-slate-700 truncate">{client.mobile}</span>
                  </div>
                  <div className="group/item flex items-center gap-3 p-2.5 rounded-2xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                    <div className="bg-orange-100/50 text-orange-600 p-2 rounded-xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-colors shadow-none group-hover/item:shadow-sm"><MapPin size={16} /></div>
                    <span className="text-xs font-semibold text-slate-700 truncate">{client.placeId || "No Place ID"}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <QrCode size={10} className="text-indigo-500" /> Review Link
                      </p>
                      <a href={`${window.location.origin}/review/${client.clientId}`} target="_blank" rel="noreferrer" className="text-[11px] text-slate-600 font-medium hover:text-indigo-600 hover:underline inline-block w-32 truncate transition-colors">
                        {window.location.origin}/review/{client.clientId}
                      </a>
                    </div>
                    
                    <div className="relative group/qr cursor-pointer hover:scale-105 transition-transform origin-bottom-right">
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover/qr:border-indigo-400 group-hover/qr:shadow-md transition-all flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/qr:opacity-100 transition-opacity"></div>
                        <QRCodeSVG value={`${window.location.origin}/review/${client.clientId}`} size={36} level="M" className="relative z-10" />
                      </div>
                      <div className="absolute opacity-0 group-hover/qr:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] w-24 text-center px-2 py-1 rounded-lg shadow-xl -top-9 left-1/2 -translate-x-1/2 pointer-events-none z-10 font-bold tracking-wide">
                        View Code
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-slate-100">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{editingClient ? 'Edit Client' : 'Create New Client'}</h2>
                <p className="text-slate-500 text-sm mt-1">{editingClient ? 'Update client details and credentials' : 'Set up a new client account for the funnel'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-colors shrink-0"
                type="button"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contact Name</label>
                  <input {...register("name", { required: true })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="John Doe" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Business Name</label>
                  <input {...register("businessName", { required: true })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="Acme Corp" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                  <input type="email" {...register("email", { required: true })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="john@example.com" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mobile</label>
                  <input type="tel" {...register("mobile", { required: true })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="9876543210" />
                </div>

                <div className="flex flex-col gap-2 text-primary">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Password {editingClient && <span className="text-primary normal-case ml-1 font-semibold">(Leave empty to keep current)</span>}
                  </label>
                  <input type="password" {...register("password", { required: !editingClient })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="••••••••" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Google Place ID</label>
                  <input {...register("placeId", { required: true })} className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium transition-all" placeholder="ChIJ..." />
                </div>
                
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Client Logo</label>
                  <div className="flex items-center gap-4 p-4 border border-slate-200 border-dashed rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="w-full font-medium text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors" 
                    />
                    {editingClient && editingClient.logo && !logoFile && (
                      <div className="shrink-0">
                        <img src={`http://localhost:5000${editingClient.logo}`} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="Current Logo" />
                      </div>
                    )}
                  </div>
                  {logoFile && <span className="text-xs text-emerald-600 font-bold ml-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Selected: {logoFile.name}</span>}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
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
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
                >
                  {(isSubmitting || uploadingLogo) ? <><Loader2 className="animate-spin w-5 h-5" /> Saving...</> : editingClient ? 'Save Changes' : 'Create Client'}
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
