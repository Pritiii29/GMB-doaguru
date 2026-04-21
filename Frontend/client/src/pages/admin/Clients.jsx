import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Search, MapPin, Building, Mail, Phone, Edit2, Loader2, QrCode, XCircle, CheckCircle, User, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useClientContext } from '../../context/ClientContext';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

const Clients = () => {
  const containerRef = useRef(null);
  const { clients, loading, error, createClient, updateClient, toggleClientStatus } = useClientContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedQrClient, setSelectedQrClient] = useState(null);
  const qrRef = useRef(null);

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    const name = selectedQrClient.businessName || selectedQrClient.clientId || 'client';
    downloadLink.download = `${name.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Form handling
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useGSAP(() => {
    if (!loading && clients.length > 0) {
      gsap.fromTo('.client-row', 
        { y: 15, opacity: 0 },
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide">Business Info</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide">Contact Details</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide">Place ID</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-center">Review Link</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                  <tr 
                    key={client.clientId} 
                    className={`client-row hover:bg-slate-50/80 transition-colors ${!client.isActive ? 'bg-slate-50/50 grayscale-[30%] opacity-80' : ''}`}
                  >
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-sm border border-slate-200/50 ${client.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-slate-400'}`}>
                          {client.logo ? <img src={`http://localhost:5000${client.logo}`} alt="logo" className="w-full h-full rounded-xl object-cover" /> : client.businessName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <p className="font-bold text-[15px] text-slate-900 truncate max-w-[200px]" title={client.businessName}>{client.businessName || "No Business Name"}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-mono text-[10px] font-bold">
                              ID: {client.clientId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <p className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                          <User size={14} className="text-indigo-400" /> {client.name}
                        </p>
                        <p className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" /> {client.email}
                        </p>
                        <p className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {client.mobile}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-2 pt-0.5">
                        <MapPin size={16} className="text-orange-400 block shrink-0 mt-0.5" />
                        <span className="text-[13px] font-semibold text-slate-600 block min-w-[120px] whitespace-normal break-all max-w-[200px]" title={client.placeId}>
                          {client.placeId || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-center pt-5">
                      <label className="relative inline-flex items-center cursor-pointer hover:scale-110 transition-transform" title={client.isActive ? 'Deactivate Client' : 'Activate Client'}>
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={client.isActive === 1 || client.isActive === true} 
                          onChange={() => handleToggleStatus(client.clientId, client.isActive)} 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-emerald-400 peer-checked:to-teal-500 border border-slate-300 peer-checked:border-emerald-500 shadow-inner"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      <div className="flex flex-col items-center gap-2 pt-0.5">
                        <div 
                          onClick={() => setSelectedQrClient(client)}
                          className="relative group/qr cursor-pointer hover:scale-105 transition-transform origin-center"
                        >
                         <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 flex items-center justify-center transition-colors">
                           <QRCodeSVG value={`${window.location.origin}/review/${client.clientId}`} size={32} level="M" />
                         </div>
                         <div className="absolute opacity-0 group-hover/qr:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] w-24 text-center px-2 py-1.5 rounded-lg shadow-xl -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-10 font-bold tracking-wide">
                            View QR Code
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                          </div>
                        </div>
                        <a href={`${window.location.origin}/review/${client.clientId}`} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md hover:bg-indigo-100 transition-colors">
                          <QrCode size={12} /> Open Link
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right pt-5">
                      <button 
                        onClick={() => openEditModal(client)} 
                        className="inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 shadow-sm transition-all p-2.5 rounded-xl"
                        title="Edit Client"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* View QR Code Modal */}
      {selectedQrClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 z-[110]">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden flex flex-col items-center p-8 relative">
            <button 
              onClick={() => setSelectedQrClient(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-colors shrink-0"
            >
              <XCircle size={24} />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold text-slate-900 truncate px-2 w-[280px]" title={selectedQrClient.businessName}>
                {selectedQrClient.businessName}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-mono font-bold bg-slate-100 inline-block px-3 py-1 rounded-lg border border-slate-200">ID: {selectedQrClient.clientId}</p>
            </div>

            <div 
              ref={qrRef} 
              className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm mb-8 relative group"
            >
              <QRCodeCanvas 
                value={`${window.location.origin}/review/${selectedQrClient.clientId}`} 
                size={220} 
                level="M" 
                includeMargin={true}
              />
            </div>

            <button 
              onClick={downloadQR}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
