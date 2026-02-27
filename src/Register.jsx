import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // 👈 Hapa tunaita Supabase
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en'); // Default lugha ni English
  const [accountType, setAccountType] = useState('individual');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Lugha na Maneno (Translations)
  const t = lang === 'en' ? {
    title: "Create Account",
    subtitle: "Join the most powerful event platform in Tanzania",
    individual: "Individual",
    company: "Company",
    nameLabel: accountType === 'company' ? "Company Name" : "Full Name",
    emailLabel: "Email Address",
    passLabel: "Password",
    confirmLabel: "Confirm Password",
    btn: "Register Now",
    footer: "Already have an account?",
    login: "Login Here",
    success: "Registration Successful! Check your email to verify (if required).",
    passMismatch: "Passwords do not match!",
    fillAll: "Please fill in all fields."
  } : {
    title: "Tengeneza Akaunti",
    subtitle: "Jiunge na mfumo bora wa matukio nchini Tanzania",
    individual: "Binafsi",
    company: "Kampuni",
    nameLabel: accountType === 'company' ? "Jina la Kampuni" : "Jina Kamili",
    emailLabel: "Barua Pepe",
    passLabel: "Nywila (Password)",
    confirmLabel: "Thibitisha Nywila",
    btn: "Jisajili Sasa",
    footer: "Tayari una akaunti?",
    login: "Ingia Hapa",
    success: "Usajili Umefanikiwa Kishua! 🎉",
    passMismatch: "Nywila hazilingani!",
    fillAll: "Tafadhali jaza taarifa zote."
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Hakikisha password zinafanana
    if (formData.password !== formData.confirmPassword) {
      alert(t.passMismatch);
      return;
    }

    setLoading(true);

    try {
      // 2. Tuma data Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            account_type: accountType,
          }
        }
      });

      // 3. Kama kuna kosa (Mfano email ishatumika)
      if (error) {
        alert("Kosa: " + error.message);
      } else {
        // 4. Kama imekubali kishua
        alert(t.success);
        
        // Mpeleke kwenye Company Setup kama ni kampuni, au Login kama ni mtu binafsi
        navigate(accountType === 'company' ? '/company-setup' : '/login');
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

        {/* Account Type Switcher */}
        <div className="account-type-grid">
          <div 
            className={`type-tab ${accountType === 'individual' ? 'active' : ''}`}
            onClick={() => setAccountType('individual')}
          >
            👤 {t.individual}
          </div>
          <div 
            className={`type-tab ${accountType === 'company' ? 'active' : ''}`}
            onClick={() => setAccountType('company')}
          >
            🏢 {t.company}
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label>{t.nameLabel}</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name}
              placeholder={accountType === 'company' ? "Smart Events Ltd" : "e.g. John Doe"} 
              onChange={handleChange} 
              required 
            />
          </div>

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
              minLength="6"
            />
          </div>

          <div className="auth-input-group">
            <label>{t.confirmLabel}</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              placeholder="••••••••" 
              onChange={handleChange} 
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="auth-submit-btn pulse-glow" disabled={loading}>
            {loading ? "Inasajili... (Please wait)" : t.btn}
          </button>
        </form>

        <p className="auth-footer-text">
          {t.footer} <span onClick={() => navigate('/login')}>{t.login}</span>
        </p>
      </div>
    </div>
  );
};

export default Register;