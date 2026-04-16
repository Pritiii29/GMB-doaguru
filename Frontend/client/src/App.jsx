import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ClientProvider } from './context/ClientContext';

function App() {
  return (
    <ClientProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClientProvider>
  );
}

export default App;
