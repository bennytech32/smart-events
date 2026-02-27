import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // 👈 Tunaita Supabase
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en'); // Default lugha ni English
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Lugha na Maneno (Translations)
  const t = lang === 'en' ? {
    title: "Welcome Back",
    subtitle: "Sign in to manage your events and guests",
    emailLabel: "Email Address",
    passLabel: "Password",
    btn: "Sign In",
    loadingBtn: "Signing in...",
    footer: "Don't have an account?",
    register: "Register Here",
    success: "Login Successful! Welcome back.",
    error: "Invalid email or password."
  } : {
    title: "Karibu Tena",
    subtitle: "Ingia ili kusimamia matukio na wageni wako",
    emailLabel: "Barua Pepe",
    passLabel: "Nywila (Password)",
    btn: "Ingia Ndani",
    loadingBtn: "Inaingia...",
    footer: "Huna akaunti?",
    register: "Jisajili Hapa",
    success: "Umefanikiwa Kuingia! Karibu sana.",
    error: "Barua pepe au nywila si sahihi."
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // MAGIKI YA SUPABASE LOGIN INAFANYIKA HAPA
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        alert(t.error + " (" + error.message + ")");
      } else {
        alert(t.success);
        // Tukishafanikiwa, tunampeleka kwenye Dashboard (Tutaigengeneza hivi punde)
        navigate('/dashboard'); 
      }
    } catch (err) {
      alert("Kosa la kimtandao limetokea. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-layout">
      {/* Background decoration */}
      <div className="auth-bg-gradient"></div>

      <div className="auth-card animated-fade-in">
        <div className="auth-header">
          <div className="auth-logo" onClick={() => navigate('/')}>✨ SMART EVENTS</div>
          <button className="lang-mini-toggle" onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}>
            {lang === 'en' ? '🇹🇿 SW' : '🇬🇧 EN'}
          </button>
        </div>

        <h2>{t.title}</h2>
        <p className="auth-subtitle">{t.subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label>{t.emailLabel}</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              placeholder="name@email.com" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="auth-input-group">
            <label>{t.passLabel}</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              placeholder="••••••••" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn pulse-glow" disabled={loading}>
            {loading ? t.loadingBtn : t.btn}
          </button>
        </form>

        <p className="auth-footer-text">
          {t.footer} <span onClick={() => navigate('/register')}>{t.register}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;