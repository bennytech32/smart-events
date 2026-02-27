import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './LandingPage';
import Register from './Register';
import Login from './Login';
import ContactPage from './ContactPage';
import CompanySetup from './CompanySetup'; 
import Dashboard from './Dashboard'; // 👈 Import Dashboard Mpya

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/company-setup" element={<CompanySetup />} />
        
        {/* Njia Rasmi ya Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;