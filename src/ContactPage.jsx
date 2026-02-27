import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Tunatumia CSS ile ile kwa muonekano mmoja

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Hapa tunaweka simulation ya kutuma ujumbe
    setTimeout(() => {
      alert("Asante sana! Ujumbe wako umepokelewa na timu ya Smart Events. Tutakuwasiliana hivi punde.");
      setIsSending(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      navigate('/'); // Rudisha mteja mwanzo
    }, 2000);
  };

  return (
    <div className="landing-layout" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* HEADER NDOGO YA KURUDIA NYUMA */}
      <header className="landing-header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>✨ SMART EVENTS</div>
        <button className="btn-login-nav" onClick={() => navigate('/')}>🏠 Back Home</button>
      </header>

      <main className="contact-page-container animated-fade-in">
        <div className="contact-grid">
          
          {/* INFO PANEL (Kushoto) */}
          <div className="contact-info-panel">
            <h2>Wasiliana Nasi 📞</h2>
            <p>Una tukio? Una swali? Timu yetu ya B-Tech Creations ipo tayari kukusaidia kuanzia mwanzo mpaka mwisho wa sherehe yako.</p>
            
            <div className="info-glass-card" style={{ animationDelay: '0.2s' }}>
              <div className="info-icon">📍</div>
              <div>
                <h4>Ofisi Zetu</h4>
                <p>Dar es Salaam, Tanzania</p>
              </div>
            </div>

            <div className="info-glass-card" style={{ animationDelay: '0.4s' }}>
              <div className="info-icon">📧</div>
              <div>
                <h4>Barua Pepe</h4>
                <p>info@smartevents.co.tz</p>
              </div>
            </div>

            <div className="info-glass-card" style={{ animationDelay: '0.6s' }}>
              <div className="info-icon">📱</div>
              <div>
                <h4>Namba ya Simu</h4>
                <p>+255 700 000 000</p>
              </div>
            </div>
          </div>

          {/* FORM PANEL (Kulia) */}
          <div className="contact-form-glass">
            <h3 className="form-header">Tuandikie Ujumbe</h3>
            <form onSubmit={handleSubmit} className="animated-form">
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="Jina Lako" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Barua Pepe" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <input 
                type="text" 
                placeholder="Mada (Subject)" 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required 
              />
              <textarea 
                rows="6" 
                placeholder="Ujumbe wako kwa kina..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>
              
              <button type="submit" className="btn-get-started pulse-glow" disabled={isSending}>
                {isSending ? "Inatuma..." : "🚀 Tuma Ujumbe Sasa"}
              </button>
            </form>
          </div>

        </div>
      </main>

      <footer className="footer-professional" style={{ marginTop: '100px' }}>
        <div className="footer-bottom">
          <p>© 2026 Smart Events. Designed with ❤️ by B-Tech Creations.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;