import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');

  const content = {
    en: {
      logo: "✨ SMART EVENTS",
      navFeatures: "Features",
      navPricing: "Pricing",
      navContact: "Contact",
      loginBtn: "Sign In",
      langBtn: "🇹🇿 SW",
      heroTitle1: "Plan Your Perfect",
      heroTitle2: "Event Seamlessly",
      heroDesc: "The most powerful digital platform in Tanzania for managing Conferences, Weddings, and Concerts. Track contributions, send QR tickets, and manage guests with one click.",
      startBtn: "Get Started (Free)",
      featTitle: "Why Choose Smart Events?",
      features: [
        { icon: "🎫", title: "Smart Ticketing", desc: "Sell tickets online with secure mobile money integration. Manage tiers and early bird offers effortlessly." },
        { icon: "📢", title: "Automated Messaging", desc: "Keep guests engaged with automated SMS, Email, and WhatsApp notifications for event updates." },
        { icon: "🏢", title: "Venue Logistics", desc: "Plan your event timeline and logistics with interactive scheduling tools designed for precision." },
        { icon: "📱", title: "QR Code Check-in", desc: "Eliminate queues! Use our mobile scanner for instant guest verification and live attendance monitoring." },
        { icon: "📊", title: "Advanced Analytics", desc: "Gain insights with comprehensive post-event reports on attendee behavior and ticket sales growth." },
        { icon: "💰", title: "Pledge Tracking", desc: "Perfect for weddings. Manage collected funds, track pending pledges, and monitor expenses in real-time." }
      ],
      pricingTitle: "Flexible Plans for Every Event",
      pricingPackages: [
        { title: "Starter", price: "Free", target: "For small family gatherings.", features: ["Up to 50 Guests", "Digital Invitations", "Email Support"], btnText: "Start Free" },
        { title: "Premium", price: "Custom", target: "For Weddings & Corporate.", features: ["Up to 500 Guests", "WhatsApp Reminders", "QR Check-in", "24/7 Support"], btnText: "Contact Us", popular: true },
        { title: "Enterprise", price: "Custom", target: "For Festivals & Concerts.", features: ["Unlimited Guests", "Custom Domain", "On-site Support"], btnText: "Contact Sales" }
      ],
      footerDesc: "Tanzania's leading digital event solution.",
      footerQuick: "Quick Links",
      footerSocial: "Follow Us"
    },
    sw: {
      logo: "✨ SMART EVENTS",
      navFeatures: "Sifa",
      navPricing: "Bei",
      navContact: "Mawasiliano",
      loginBtn: "Ingia",
      langBtn: "🇬🇧 EN",
      heroTitle1: "Panga na Simamia",
      heroTitle2: "Tukio Lako Kikamilifu",
      heroDesc: "Mfumo bora nchini Tanzania kwa ajili ya Mikutano, Harusi, na Matamasha. Fuatilia michango, tuma tiketi za QR, na dhibiti wageni kwa mbofyo mmoja.",
      startBtn: "Anza Sasa (Bure)",
      featTitle: "Kwanini Uchague Smart Events?",
      features: [
        { icon: "🎫", title: "Usajili na Tiketi", desc: "Uza tiketi mtandaoni kwa malipo ya simu. Simamia aina mbalimbali za kadi kwa urahisi zaidi." },
        { icon: "📢", title: "Mawasiliano Papo hapo", desc: "Wafikie wageni wako kwa SMS na WhatsApp. Tuma mialiko na vikumbusho ili kuhakikisha wanahudhuria." },
        { icon: "🏢", title: "Mipango ya Ukumbi", desc: "Panga ratiba ya tukio lako hatua kwa hatua. Hakikisha kila kitu kinaenda kwa wakati uliopangwa." },
        { icon: "📱", title: "Uhakiki kwa QR Code", desc: "Ondoa foleni mlangoni. Hakiki kadi za wageni kwa sekunde moja kwa kutumia app yetu ya simu." },
        { icon: "📊", title: "Ripoti za Kina", desc: "Pata picha kamili ya tukio lako kupitia ripoti za kisasa za mauzo na idadi ya wageni waliofika." },
        { icon: "💰", title: "Bajeti na Michango", desc: "Maalum kwa harusi. Simamia fedha, fuatilia ahadi zinazodaiwa, na dhibiti matumizi yote." }
      ],
      pricingTitle: "Chagua Kifurushi Kinachokufaa",
      pricingPackages: [
        { title: "Bure", price: "Bure", target: "Kwa vikao vidogo vya familia.", features: ["Hadi Wageni 50", "Mialiko ya Kidijitali", "Msaada wa Email"], btnText: "Anza Bure" },
        { title: "Premium", price: "Maelewano", target: "Kwa Harusi na Semina.", features: ["Hadi Wageni 500", "SMS & WhatsApp", "QR Check-in", "Msaada 24/7"], btnText: "Wasiliana Nasi", popular: true },
        { title: "Enterprise", price: "Maelewano", target: "Kwa Matamasha Makubwa.", features: ["Wageni Bila Kikomo", "Custom Domain", "Meneja Maalum"], btnText: "Wasiliana nasi" }
      ],
      footerDesc: "Suluhisho kuu la kidijitali jijini Dar es Salaam.",
      footerQuick: "Viungo vya Haraka",
      footerSocial: "Tufuate"
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
            <button className="btn-get-started pulse-glow" onClick={() => navigate('/register')}>{t.startBtn}</button>
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
              <div className={`pricing-card ${pkg.popular ? 'popular' : ''}`} key={index}>
                {pkg.popular && <div className="popular-badge">Recommended</div>}
                <h3>{pkg.title}</h3>
                <h2 className="price-tag">{pkg.price}</h2>
                <p className="pkg-target">{pkg.target}</p>
                <ul className="pkg-features">
                  {pkg.features.map((f, i) => <li key={i}><span>✔️</span> {f}</li>)}
                </ul>
                <button className={`btn-pricing ${pkg.popular ? 'btn-popular' : ''}`} onClick={() => navigate('/register')}>
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
            <div className="logo" style={{color: '#fff', marginBottom: '15px'}}>{t.logo}</div>
            <p>{t.footerDesc}</p>
          </div>
          <div className="footer-col">
            <h3>{t.footerQuick}</h3>
            <ul>
              <li><a href="#features">{t.navFeatures}</a></li>
              <li><a href="#pricing">{t.navPricing}</a></li>
              <li><a href="/contact">Mawasiliano</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>B-Tech Creations</h3>
            <p>Empowering organizers through next-gen technology.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Smart Events. Dar es Salaam, Tanzania.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;