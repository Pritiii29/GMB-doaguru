import React, { createContext, useState, useEffect, useContext } from 'react';
import { adminService } from '../services/api';

const ClientContext = createContext();

export const useClientContext = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await adminService.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch initial clients when mounted
  useEffect(() => {
    fetchClients();
  }, []);

  const createClient = async (clientData, logoFile, setUploadingLogo) => {
    try {
      let logoUrl = null;
      if (logoFile) {
        if (setUploadingLogo) setUploadingLogo(true);
        const uploadRes = await adminService.uploadLogo(logoFile);
        logoUrl = uploadRes.url;
        if (setUploadingLogo) setUploadingLogo(false);
      }
      
      const newClient = await adminService.createClient({
        ...clientData,
        logo: logoUrl
      });
      // Refresh list to maintain consistency
      await fetchClients();
      return newClient;
    } catch (err) {
      if (setUploadingLogo) setUploadingLogo(false);
      throw err;
    }
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    try {
      await adminService.toggleClientStatus(clientId, !currentStatus);
      // Update local state directly for responsive UI
      setClients(prevClients => prevClients.map(client => 
        client.clientId === clientId ? { ...client, isActive: !currentStatus ? 1 : 0 } : client
      ));
    } catch (err) {
      throw err;
    }
  };

  const updateClient = async (clientId, clientData, logoFile, setUploadingLogo) => {
    try {
      let logoUrl = clientData.logo;
      if (logoFile) {
        if (setUploadingLogo) setUploadingLogo(true);
        const uploadRes = await adminService.uploadLogo(logoFile);
        logoUrl = uploadRes.url;
        if (setUploadingLogo) setUploadingLogo(false);
      }
      
      const updatedClient = await adminService.updateClient(clientId, {
        ...clientData,
        logo: logoUrl
      });
      await fetchClients();
      return updatedClient;
    } catch (err) {
      if (setUploadingLogo) setUploadingLogo(false);
      throw err;
    }
  };

  return (
    <ClientContext.Provider value={{
      clients,
      loading,
      error,
      fetchClients,
      createClient,
      updateClient,
      toggleClientStatus
    }}>
      {children}
    </ClientContext.Provider>
  );
};
