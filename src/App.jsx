import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// === IMPORT KURASA ZOTE HAPA ===
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import Login from './Login';
import Register from './Register';
import ContactPage from './ContactPage';
import Scanner from './Scanner';
import BuyTicket from './BuyTicket';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. Kurasa za Wazi (Public Routes) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* 2. Kurasa za Kuingia na Kujisajili (Auth Routes) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 3. Kurasa za Ndani za Mfumo (Protected/App Routes) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          
          {/* 4. Kurasa ya Mgeni Kununua Tiketi (Dynamic Route yenye ID ya Tukio) */}
          <Route path="/ticket/:eventId" element={<BuyTicket />} />

          {/* 5. Ukurasa Usiojulikana (Fallback) - Mtu akiandika link ya uongo inamrudisha Mwanzo */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;