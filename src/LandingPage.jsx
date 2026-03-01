import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  // Lugha Default sasa ni Kiingereza ('en')
  const [lang, setLang] = useState('en');

  const content = {
    en: {
      logo: "✨ SMART EVENTS",
      navFeatures: "Solutions",
      navPricing: "Pricing",
      navContact: "Contact Us",
      loginBtn: "Client Login",
      langBtn: "🇹🇿 SW",
      heroTitle1: "Enterprise Digital Solution for",
      heroTitle2: "Events & Fundraising",
      heroDesc: "The world-class platform for managing charity pledges, wedding invitations, tour bookings, and corporate events with ultimate security and transparency.",
      startBtn: "Start Free Trial",
      salesBtn: "Book a Demo",
      featTitle: "Enterprise-Grade Technology for Your Events",
      features: [
        { icon: "🛡️", title: "Security & Transparency", desc: "All financial data and pledges are highly secured. Generate transparent reports for stakeholders and committees." },
        { icon: "🎫", title: "Digital Ticketing (QR)", desc: "Sell tickets and manage tiers online. Each guest receives a secure QR code ticket to prevent fraud at the gate." },
        { icon: "📢", title: "Automated Communication", desc: "Send automated SMS and WhatsApp messages to all guests. Remind them of their pledges or share tour itineraries." },
        { icon: "📱", title: "High-Speed Gate Check-in", desc: "Use smartphones to scan guest tickets at the entrance. The system logs attendees in real-time." },
        { icon: "🤝", title: "Charity & Pledge Tracking", desc: "Set fundraising targets. Track who has paid, who owes balances, and show live progress to your committee." },
        { icon: "📊", title: "Advanced Analytics", desc: "Download comprehensive Excel reports showing attendance, total collections, and budget deficits instantly." }
      ],
      pricingTitle: "Flexible Plans for Every Scale",
      pricingPackages: [
        { 
          title: "Starter Plan", 
          price: "Free", 
          period: "for small events",
          target: "Perfect for testing the platform.", 
          features: ["Up to 50 Guests", "Digital QR Tickets", "Basic Dashboard", "Email Support"], 
          btnText: "Start Free" 
        },
        { 
          title: "Social Events", 
          price: "Custom", 
          period: "per event",
          target: "For Weddings, Sendoffs & Parties.", 
          features: ["Up to 500 Guests", "Pledge Tracking", "WhatsApp Reminders", "Scanner App"], 
          btnText: "Request Quote" 
        },
        { 
          title: "Corporate & Tours", 
          price: "Custom", 
          period: "per month/event",
          target: "For Tour Operators & Corporate Seminars.", 
          features: ["Unlimited Guests", "SMS Automation", "Staff Management", "Priority Support"], 
          btnText: "Contact Sales", 
          popular: true 
        },
        { 
          title: "Harambee & Special Events", 
          price: "Custom", 
          period: "per project",
          target: "Tailored for Fundraising & Mega Projects.", 
          features: ["Live Pledge Tracking", "Transparency Tools", "Automated Thank You Notes", "Dedicated Manager"], 
          btnText: "Consult Us",
          special: true
        }
      ],
      footerDesc: "Tanzania's leading digital platform revolutionizing event management, tour bookings, and transparent charity fundraising.",
      footerQuick: "Quick Links"
    },
    sw: {
      logo: "✨ SMART EVENTS",
      navFeatures: "Huduma Zetu",
      navPricing: "Vifurushi",
      navContact: "Wasiliana Nasi",
      loginBtn: "Ingia Ndani",
      langBtn: "🇬🇧 EN",
      heroTitle1: "Suluhisho la Kidijitali kwa",
      heroTitle2: "Matukio na Harambee",
      heroDesc: "Mfumo wa kiwango cha kimataifa wa kusimamia michango ya harambee, kadi za harusi, utalii, na tiketi za matamasha kwa uwazi na usalama wa hali ya juu.",
      startBtn: "Anza Sasa Bure",
      salesBtn: "Pata Demo ya Mfumo",
      featTitle: "Teknolojia ya Uhakika kwa Matukio Yako",
      features: [
        { icon: "🛡️", title: "Usalama na Uwazi", desc: "Taarifa zote za fedha na michango zinalindwa kwa usalama wa hali ya juu. Toa ripoti zenye uwazi kwa wanakamati wote." },
        { icon: "🎫", title: "Tiketi za Kidijitali (QR)", desc: "Uza tiketi na dhibiti viwango (Tiers) kwa njia ya mtandao. Kila mgeni anapata kadi yenye QR Code inayozuia udanganyifu mlangoni." },
        { icon: "📢", title: "Mawasiliano ya Pamoja (Bulk)", desc: "Tuma SMS na ujumbe wa WhatsApp kwa wageni wote kwa mkupuo. Wakumbushe kuhusu ahadi zao au wape ratiba ya safari." },
        { icon: "📱", title: "Uhakiki wa Haraka Mlangoni", desc: "Tumia simu janja kuskeni kadi za wageni mlangoni. Mfumo unarekodi na kutofautisha walioingia na ambao bado." },
        { icon: "🤝", title: "Ufuatiliaji wa Harambee", desc: "Weka malengo ya harambee (Target). Fuatilia nani ametoa, nani amebakiza ahadi, na onyesha maendeleo kwa wakati halisi (Live)." },
        { icon: "📊", title: "Ripoti za Kiuchambuzi", desc: "Pakua ripoti kamili za Excel zikionyesha mahudhurio, makusanyo, na baki la bajeti ili kurahisisha mahesabu ya mwisho." }
      ],
      pricingTitle: "Vifurushi Vinavyoendana na Mahitaji Yako",
      pricingPackages: [
        { 
          title: "Kifurushi cha Bure", 
          price: "Bure", 
          period: "kwa matukio madogo",
          target: "Bora kwa kujaribu mfumo.", 
          features: ["Hadi Wageni 50", "Tiketi za QR", "Muhtasari wa Msingi", "Msaada wa Email"], 
          btnText: "Anza Bure" 
        },
        { 
          title: "Sherehe & Harusi", 
          price: "Maelewano", 
          period: "kwa tukio",
          target: "Kwa Harusi, Sendoff na Vikao.", 
          features: ["Hadi Wageni 500", "Kufuatilia Michango", "WhatsApp Reminders", "Scanner App"], 
          btnText: "Omba Bei" 
        },
        { 
          title: "Mikutano & Utalii", 
          price: "Maelewano", 
          period: "kwa mwezi/tukio",
          target: "Kwa Makampuni ya Utalii na Mikutano.", 
          features: ["Wageni Bila Kikomo", "SMS Automation", "Msaada wa 24/7", "Ripoti Kamili"], 
          btnText: "Wasiliana na Mauzo", 
          popular: true 
        },
        { 
          title: "Harambee & Taasisi", 
          price: "Maelewano", 
          period: "kwa mradi",
          target: "Maalum kwa Kamati za Ujenzi na Matibabu.", 
          features: ["Live Pledge Tracking", "Uwazi wa Kifedha", "Ujumbe wa Shukrani", "Meneja Maalum"], 
          btnText: "Pata Ushauri",
          special: true
        }
      ],
      footerDesc: "Mfumo namba moja Tanzania unaoleta mapinduzi kwenye usimamizi wa matukio, utalii, na uchangiaji wa harambee.",
      footerQuick: "Viungo vya Haraka"
    }
  };

  const t = content[lang];

  return (
    <div className="landing-layout">
      <header className="landing-header">
        <div className="logo">{t.logo}</div>
        <nav className="header-nav-links">
          <a href="#features">{t.navFeatures}</a>
          <a href="#pricing">{t.navPricing}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>{t.navContact}</a>
        </nav>
        <div className="header-actions">
          <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}>{t.langBtn}</button>
          <button className="btn-login-nav" onClick={() => navigate('/login')}>{t.loginBtn}</button>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{t.heroTitle1} <br /> <span>{t.heroTitle2}</span></h1>
            <p>{t.heroDesc}</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-get-started pulse-glow" onClick={() => navigate('/register')}>{t.startBtn}</button>
              <button className="btn-get-started" style={{ background: 'transparent', border: '2px solid white', boxShadow: 'none' }} onClick={() => navigate('/contact')}>
                {t.salesBtn}
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="features-section animated-fade-in">
          <h2 className="section-title">{t.featTitle}</h2>
          <div className="features-grid">
            {t.features.map((feat, index) => (
              <div className="feature-card" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feat-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="pricing-section">
          <h2 className="section-title">{t.pricingTitle}</h2>
          <div className="pricing-grid">
            {t.pricingPackages.map((pkg, index) => (
              <div 
                className={`pricing-card ${pkg.popular ? 'popular' : ''} ${pkg.special ? 'special-card' : ''}`} 
                key={index}
                style={pkg.special ? { background: '#0f172a', color: 'white', borderColor: '#0f172a' } : {}}
              >
                {pkg.popular && <div className="popular-badge">{lang === 'en' ? 'Top Choice 🔥' : 'Chaguo Bora 🔥'}</div>}
                {pkg.special && <div className="popular-badge" style={{ background: '#d4af37' }}>{lang === 'en' ? 'Harambee Special 🤝' : 'Maalum Harambee 🤝'}</div>}
                
                <h3 style={pkg.special ? { color: '#f8fafc' } : {}}>{pkg.title}</h3>
                <h2 className="price-tag" style={pkg.special ? { color: '#d4af37' } : {}}>{pkg.price}</h2>
                <span style={{ display: 'block', marginBottom: '15px', color: pkg.special ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>{pkg.period}</span>
                <p className="pkg-target" style={pkg.special ? { color: '#cbd5e1' } : {}}>{pkg.target}</p>
                
                <ul className="pkg-features">
                  {pkg.features.map((f, i) => (
                    <li key={i} style={pkg.special ? { color: '#f1f5f9' } : {}}>
                      <span style={pkg.special ? { color: '#d4af37' } : {}}>✔️</span> {f}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`btn-pricing ${pkg.popular ? 'btn-popular' : ''}`} 
                  style={pkg.special ? { background: '#d4af37', color: '#0f172a', borderColor: '#d4af37' } : {}}
                  onClick={() => navigate(index === 0 ? '/register' : '/contact')}
                >
                  {pkg.btnText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-professional">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo" style={{color: '#fff', margin: '0 0 15px 0', fontSize: '1.2rem'}}>{t.logo}</div>
            <p>{t.footerDesc}</p>
          </div>
          <div className="footer-col">
            <h3>{t.footerQuick}</h3>
            <ul>
              <li><a href="#features">{t.navFeatures}</a></li>
              <li><a href="#pricing">{t.navPricing}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>{t.navContact}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>B-Tech Creations</h3>
            <p>Empowering organizers, committees, and enterprises through next-gen technology.</p>
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: '#cbd5e1', marginBottom: '8px' }}>📍 Dar es Salaam, Tanzania</p>
              {/* EDIT NAMBA YAKO HAPA CHINI 👇 */}
              <p style={{ color: '#cbd5e1', marginBottom: '8px' }}>📞 +255 7XX XXX XXX</p>
              <p style={{ color: '#cbd5e1' }}>📧 info@smartevents.co.tz</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Smart Events by B-Tech Creations. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;