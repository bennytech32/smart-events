import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateEvent from './CreateEvent';
import CreateGuest from './CreateGuest';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // States za Menu na Mfumo
  const [activeMenu, setActiveMenu] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  
  // Lugha (Swahili ndio Default)
  const [lang, setLang] = useState(localStorage.getItem('smart_lang') || 'sw');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);

  // States za Tiketi, SMS, na Settings
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const ticketRef = useRef(null);
  const [guestFilter, setGuestFilter] = useState('all');
  const [settingsData, setSettingsData] = useState({ fullName: '', companyName: '', phone: '' });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // ==========================================
  // 1. KAMUSI YA LUGHA (TRANSLATIONS)
  // ==========================================
  const content = {
    sw: {
      menu: { overview: "Muhtasari", events: "Matukio Yangu", guests: "Wageni & Tiketi", budget: "Bajeti & Michango", security: "Security & Ripoti", settings: "Mipangilio" },
      topbar: { search: "Tafuta...", scanner: "📸 Scanner", logout: "Toka" },
      overview: { title: "Muhtasari wa Mfumo", totalEvents: "Jumla ya Matukio", recent: "Matukio ya Hivi Karibuni", eventName: "Jina la Tukio", date: "Tarehe", location: "Ukumbi", action: "Kitendo" },
      guests: { title: "Wageni, Ahadi & Tiketi", desc: "Rekodi michango na toa tiketi za QR wakimaliza.", addGuest: "+ Ongeza Mgeni", name: "Jina la Mgeni", pledge: "Ahadi (TSH)", paid: "Ametoa", balance: "Baki", status: "Hali", addMoney: "➕ Ongeza", pay: "💰 Mchango", ticket: "🎫 Fungua Tiketi" },
      budget: { title: "Bajeti & Michango", desc: "Fuatilia fedha zilizoingia na zinazodaiwa.", setTarget: "🎯 Weka Lengo", target: "Lengo la Bajeti", collected: "Zilizokusanywa", deficit: "Baki la Bajeti", list: "📝 Orodha ya Waliotoa Pesa" },
      security: { title: "Security Mlangoni & Ripoti", expected: "Wageni Wote (Expected)", inside: "Wameingia (Ndani)", outside: "Bado Nje", filterAll: "Wote", filterIn: "Ndani", filterOut: "Nje", dlAll: "📥 Ripoti ya Wote", dlIn: "🖨️ Walioingia Tu" },
      settings: { title: "Mipangilio ya Mfumo", profile: "Taarifa Zako", langPrefs: "Lugha ya Mfumo", save: "💾 Hifadhi Mabadiliko" }
    },
    en: {
      menu: { overview: "Overview", events: "My Events", guests: "Guests & Tickets", budget: "Budget & Pledges", security: "Security & Reports", settings: "Settings" },
      topbar: { search: "Search...", scanner: "📸 Scanner", logout: "Logout" },
      overview: { title: "Dashboard Overview", totalEvents: "Total Events", recent: "Recent Events", eventName: "Event Name", date: "Date", location: "Venue", action: "Action" },
      guests: { title: "Guests, Pledges & Tickets", desc: "Record payments and issue QR tickets.", addGuest: "+ Add Guest", name: "Guest Name", pledge: "Pledge (TSH)", paid: "Paid", balance: "Balance", status: "Status", addMoney: "➕ Top Up", pay: "💰 Pay", ticket: "🎫 Open Ticket" },
      budget: { title: "Budget & Pledges Tracker", desc: "Track incoming funds and deficits.", setTarget: "🎯 Set Goal", target: "Budget Goal", collected: "Total Collected", deficit: "Deficit", list: "📝 List of Contributors" },
      security: { title: "Gate Security & Reports", expected: "Total Expected", inside: "Checked In (Inside)", outside: "Pending (Outside)", filterAll: "All", filterIn: "Inside", filterOut: "Outside", dlAll: "📥 Download All", dlIn: "🖨️ Attended Only" },
      settings: { title: "System Settings", profile: "Profile Details", langPrefs: "System Language", save: "💾 Save Changes" }
    }
  };
  const t = content[lang];

  useEffect(() => {
    localStorage.setItem('smart_lang', lang);
  }, [lang]);

  useEffect(() => {
    const checkUserAndFetchEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        setSettingsData({
          fullName: session.user.user_metadata?.full_name || '',
          companyName: session.user.user_metadata?.company_name || '',
          phone: session.user.user_metadata?.phone || ''
        });
        fetchEvents(session.user.id);
      }
    };
    checkUserAndFetchEvents();
  }, [navigate]);

  useEffect(() => { if (selectedEventId) fetchGuests(selectedEventId); }, [selectedEventId]);

  const fetchEvents = async (userId) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setEvents(data || []);
    if (data && data.length > 0 && !selectedEventId) setSelectedEventId(data[0].id);
  };

  const fetchGuests = async (eventId) => {
    setIsLoadingGuests(true);
    const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
    setGuests(data || []);
    setIsLoadingGuests(false);
  };

  // KAZI ZA KIFEDHA
  const handlePayment = async (guest) => {
    const pledge = Number(guest.pledge_amount) || 0;
    const currentlyPaid = Number(guest.amount_paid) || 0;
    const balance = Math.max(pledge - currentlyPaid, 0);

    const promptText = lang === 'sw' 
      ? `Mchango wa ${guest.full_name}\nAhadi: TSH ${pledge.toLocaleString()}\nBaki: TSH ${balance.toLocaleString()}\n\nIngiza anachotoa sasa:`
      : `Payment for ${guest.full_name}\nPledge: TSH ${pledge.toLocaleString()}\nBalance: TSH ${balance.toLocaleString()}\n\nEnter amount paid now:`;
      
    const amountStr = window.prompt(promptText, balance.toString());
    if (!amountStr) return;
    const currentPayment = parseFloat(amountStr);
    if (isNaN(currentPayment) || currentPayment <= 0) return alert(lang === 'sw' ? "Weka kiasi sahihi." : "Invalid amount.");

    const newTotalPaid = currentlyPaid + currentPayment;
    let newStatus = newTotalPaid >= pledge ? 'Amemaliza' : 'Ametoa Nusu';
    let isFullyPaid = newTotalPaid >= pledge;

    try {
      await supabase.from('guests').update({ is_paid: isFullyPaid, status: newStatus, amount_paid: newTotalPaid }).eq('id', guest.id);
      if (isFullyPaid) {
        alert(lang === 'sw' ? `Mchango umekamilika! Tiketi ipo tayari. 💳` : `Payment Complete! Ticket is ready. 💳`);
        setTicketToPrint({ ...guest, is_paid: true, status: 'Amemaliza', amount_paid: newTotalPaid });
      } else {
        alert(lang === 'sw' ? `Mchango umepokelewa. Bado anadaiwa TSH ${(pledge - newTotalPaid).toLocaleString()}.` : `Payment received. Balance is TSH ${(pledge - newTotalPaid).toLocaleString()}.`);
      }
      fetchGuests(selectedEventId);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleSetBudget = async () => {
    const currentEvent = events.find(e => e.id === selectedEventId);
    const msg = lang === 'sw' ? "Ingiza Lengo la Bajeti:" : "Enter Budget Goal:";
    const newBudget = window.prompt(msg, currentEvent?.budget_goal || 0);
    if (newBudget !== null && !isNaN(newBudget)) {
      try {
        await supabase.from('events').update({ budget_goal: parseFloat(newBudget) }).eq('id', selectedEventId);
        alert(lang === 'sw' ? "Lengo limesasishwa! 🎯" : "Goal Updated! 🎯");
        fetchEvents(user.id);
      } catch (err) { alert("Error: " + err.message); }
    }
  };

  // KAZI ZA KUDOWNLOAD
  const downloadTicketImage = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const image = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `Tiketi_${ticketToPrint.full_name.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
  };

  const exportToExcel = (type = 'all') => {
    let filteredData = guests;
    if (type === 'attended') filteredData = guests.filter(g => g.checked_in);
    if (filteredData.length === 0) return alert(lang === 'sw' ? "Hakuna rekodi." : "No records to download.");
    
    const headers = lang === 'sw' 
      ? ["Jina Kamili", "Simu", "Aina", "Ahadi", "Ametoa", "Mlangoni"]
      : ["Full Name", "Phone", "Type", "Pledge", "Paid", "Gate Status"];
      
    const csvData = filteredData.map(g => `${g.full_name},${g.phone_number},${g.guest_type},${g.pledge_amount},${g.amount_paid},${g.checked_in ? 'In' : 'Out'}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = type === 'attended' ? "Attended_Report.csv" : "Full_Report.csv";
    link.click();
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: settingsData.fullName, company_name: settingsData.companyName, phone: settingsData.phone } });
      alert(lang === 'sw' ? "Mipangilio imehifadhiwa! ✅" : "Settings saved! ✅");
    } catch (err) { alert("Error: " + err.message); } finally { setIsUpdatingSettings(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const displayedSecurityGuests = guests.filter(g => {
    if (guestFilter === 'outside') return !g.checked_in;
    if (guestFilter === 'inside') return g.checked_in;
    return true;
  });

  const menuItems = [
    { id: 'overview', icon: '📊', label: t.menu.overview },
    { id: 'events', icon: '🎫', label: t.menu.events },
    { id: 'guests', icon: '👥', label: t.menu.guests },
    { id: 'budget', icon: '💰', label: t.menu.budget },
    { id: 'security', icon: '🛡️', label: t.menu.security },
    { id: 'settings', icon: '⚙️', label: t.menu.settings }
  ];

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>✨ SMART EVENTS</div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <div key={item.id} className={`nav-item ${activeMenu === item.id && !showCreateForm && !showGuestForm ? 'active' : ''}`} onClick={() => { setActiveMenu(item.id); setShowCreateForm(false); setShowGuestForm(false); }}>
              <span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-search"><input type="text" placeholder={t.topbar.search} /></div>
          <div className="topbar-actions">
            {/* Lugha Toggle kwenye Topbar */}
            <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} style={{ marginRight: '10px' }}>
              {lang === 'en' ? '🇹🇿 SW' : '🇬🇧 EN'}
            </button>
            <button className="btn-create-event" style={{ background: '#0f172a' }} onClick={() => navigate('/scanner')}>{t.topbar.scanner}</button>
            <div className="user-profile"><div className="avatar">👤</div><span>{user?.user_metadata?.full_name || 'Admin'}</span></div>
            <button className="btn-logout" onClick={handleLogout}>{t.topbar.logout}</button>
          </div>
        </header>

        <div className="dashboard-content">
          {showCreateForm ? <CreateEvent eventToEdit={eventToEdit} onClose={() => setShowCreateForm(false)} onSuccess={() => { setShowCreateForm(false); fetchEvents(user.id); setActiveMenu('overview'); }} />
          : showGuestForm ? <CreateGuest selectedEvent={events.find(e => e.id === selectedEventId)} onClose={() => setShowGuestForm(false)} onSuccess={() => { setShowGuestForm(false); fetchGuests(selectedEventId); }} />
          : (
            <>
              {/* === OVERVIEW === */}
              {activeMenu === 'overview' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>{t.overview.title}</h2></div>
                  <div className="stats-grid"><div className="stat-card"><div className="stat-icon" style={{background: '#eef2ff', color: '#6366f1'}}>🎫</div><div className="stat-details"><h3>{t.overview.totalEvents}</h3><h2>{events.length} Active</h2></div></div></div>
                  <div className="recent-section">
                    <h3>{t.overview.recent}</h3>
                    <table className="dashboard-table">
                      <thead><tr><th>{t.overview.eventName}</th><th>{t.overview.date}</th><th>{t.overview.location}</th><th>{t.overview.action}</th></tr></thead>
                      <tbody>{events.map(ev => (<tr key={ev.id}><td><strong>{ev.event_name}</strong></td><td>{new Date(ev.event_date).toLocaleDateString()}</td><td>{ev.location}</td><td><button className="btn-action" onClick={() => { setEventToEdit(ev); setShowCreateForm(true); }}>✏️ Edit</button></td></tr>))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === MATUKIO === */}
              {activeMenu === 'events' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>{t.menu.events}</h2><button className="btn-create-event" onClick={() => setShowCreateForm(true)}>+ New Event</button></div>
                  <table className="dashboard-table"><thead><tr><th>{t.overview.eventName}</th><th>Type</th><th>{t.overview.location}</th><th>{t.overview.action}</th></tr></thead><tbody>{events.map(ev => (<tr key={ev.id}><td><strong>{ev.event_name}</strong></td><td><span className="badge" style={{background:'#f1f5f9'}}>{ev.event_type}</span></td><td>{ev.location}</td><td><button className="btn-action" onClick={() => { setEventToEdit(ev); setShowCreateForm(true); }}>✏️ Edit</button></td></tr>))}</tbody></table>
                </div>
              )}

              {/* === GUESTS & TIKETI === */}
              {activeMenu === 'guests' && (
                <div className="animated-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h2>{t.guests.title}</h2><p>{t.guests.desc}</p></div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <select style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                        {events.length === 0 && <option value="">No Events</option>}
                        {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.event_name}</option>))}
                      </select>
                      <button className="btn-create-event" style={{ background: '#22c55e' }} onClick={() => setShowGuestForm(true)} disabled={events.length === 0}>{t.guests.addGuest}</button>
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead><tr><th>{t.guests.name}</th><th>{t.guests.pledge} & {t.guests.paid}</th><th style={{ textAlign: 'center' }}>{t.overview.action}</th></tr></thead>
                      <tbody>
                        {isLoadingGuests ? <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>⏳ Loading...</td></tr> : guests.map(guest => (
                          <tr key={guest.id}>
                            <td>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>{guest.full_name}</div>
                              <span className="badge" style={{ background: guest.guest_type.includes('VIP') ? '#fef08a' : '#f1f5f9', color: '#1e293b', marginTop: '5px', display: 'inline-block' }}>{guest.guest_type}</span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.9rem' }}>
                                <div style={{ color: '#64748b' }}>{t.guests.pledge}: <strong>{Number(guest.pledge_amount).toLocaleString()}</strong></div>
                                <div style={{ color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>{t.guests.paid}: {Number(guest.amount_paid).toLocaleString()}</div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {!guest.is_paid ? (
                                <button className="btn-action" style={{ background: '#fef3c7', color: '#92400e', width: '150px' }} onClick={() => handlePayment(guest)}>{guest.amount_paid > 0 ? t.guests.addMoney : t.guests.pay}</button>
                              ) : (
                                <button className="btn-action pulse-glow" style={{ background: '#0f172a', color: 'white', width: '150px' }} onClick={() => setTicketToPrint(guest)}>{t.guests.ticket}</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === BUDGET & MICHANGO === */}
              {activeMenu === 'budget' && (
                <div className="animated-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><h2>{t.budget.title}</h2><p>{t.budget.desc}</p></div>
                    <select style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                      {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.event_name}</option>))}
                    </select>
                  </div>
                  {events.length > 0 && selectedEventId && (() => {
                    const currentEv = events.find(e => e.id === selectedEventId);
                    const totalCollected = guests.reduce((sum, g) => sum + (Number(g.amount_paid) || 0), 0);
                    const targetBudget = currentEv?.budget_goal || 0;
                    const progress = targetBudget > 0 ? Math.min((totalCollected / targetBudget) * 100, 100) : 0;
                    const paidGuests = guests.filter(g => g.amount_paid > 0);
                    
                    return (
                      <>
                        <div style={{ background: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#0f172a' }}>{t.menu.budget} Progress</h3>
                            <button className="btn-action" onClick={handleSetBudget}>{t.budget.setTarget}</button>
                          </div>
                          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 250px', background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}><p style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: 'bold' }}>{t.budget.target}</p><h2 style={{ margin: 0, fontSize: '2rem' }}>{targetBudget.toLocaleString()}</h2></div>
                            <div style={{ flex: '1 1 250px', background: '#dcfce7', padding: '25px', borderRadius: '20px', border: '1px solid #bbf7d0' }}><p style={{ margin: '0 0 8px 0', color: '#166534', fontWeight: 'bold' }}>{t.budget.collected} ({paidGuests.length})</p><h2 style={{ margin: 0, color: '#166534', fontSize: '2rem' }}>{totalCollected.toLocaleString()}</h2></div>
                            <div style={{ flex: '1 1 250px', background: '#fee2e2', padding: '25px', borderRadius: '20px', border: '1px solid #fecaca' }}><p style={{ margin: '0 0 8px 0', color: '#991b1b', fontWeight: 'bold' }}>{t.budget.deficit}</p><h2 style={{ margin: 0, color: '#991b1b', fontSize: '2rem' }}>{Math.max(targetBudget - totalCollected, 0).toLocaleString()}</h2></div>
                          </div>
                          <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #22c55e)' }}></div></div>
                        </div>

                        <div style={{ background: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#0f172a' }}>{t.budget.list}</h3>
                          <table className="dashboard-table">
                            <thead><tr><th>{t.guests.name}</th><th>{t.guests.pledge}</th><th>{t.guests.paid}</th></tr></thead>
                            <tbody>{paidGuests.map(g => (<tr key={g.id}><td><strong>{g.full_name}</strong></td><td>{Number(g.pledge_amount).toLocaleString()}</td><td style={{ color: '#166534', fontWeight: 'bold' }}>{Number(g.amount_paid).toLocaleString()}</td></tr>))}</tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* === SECURITY MLANGONI === */}
              {activeMenu === 'security' && (
                <div className="animated-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h2>{t.security.title}</h2></div>
                    <select style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                      {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.event_name}</option>))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 250px', background: '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', color: '#0f172a' }}>{guests.length}</h1>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#64748b' }}>{t.security.expected}</p>
                      <button className="btn-action" style={{ marginTop: '20px', background: '#e2e8f0', color: '#0f172a', width: '100%', fontWeight: 'bold' }} onClick={() => exportToExcel('all')}>{t.security.dlAll}</button>
                    </div>
                    
                    <div style={{ flex: '1 1 250px', background: '#dcfce7', padding: '30px', borderRadius: '24px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', color: '#166534' }}>{guests.filter(g => g.checked_in).length}</h1>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#166534' }}>{t.security.inside}</p>
                      <button className="btn-action" style={{ marginTop: '20px', background: '#22c55e', color: 'white', width: '100%', fontWeight: 'bold' }} onClick={() => exportToExcel('attended')}>{t.security.dlIn}</button>
                    </div>

                    <div style={{ flex: '1 1 250px', background: '#fee2e2', padding: '30px', borderRadius: '24px', border: '1px solid #fecaca', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', color: '#991b1b' }}>{guests.filter(g => !g.checked_in).length}</h1>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#991b1b' }}>{t.security.outside}</p>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div className="filter-tabs" style={{ marginBottom: '25px', display: 'flex', gap: '10px' }}>
                      <button className={`filter-tab ${guestFilter === 'all' ? 'active' : ''}`} onClick={() => setGuestFilter('all')}>{t.security.filterAll}</button>
                      <button className={`filter-tab ${guestFilter === 'outside' ? 'active' : ''}`} onClick={() => setGuestFilter('outside')}>{t.security.filterOut}</button>
                      <button className={`filter-tab ${guestFilter === 'inside' ? 'active' : ''}`} onClick={() => setGuestFilter('inside')}>{t.security.filterIn}</button>
                    </div>

                    <table className="dashboard-table">
                      <thead><tr><th>{t.guests.name}</th><th>{t.guests.status}</th><th style={{ textAlign: 'center' }}>Gate Status</th></tr></thead>
                      <tbody>
                        {displayedSecurityGuests.map(g => (
                          <tr key={g.id} style={{ opacity: g.checked_in ? 0.6 : 1 }}>
                            <td style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{g.full_name}</td>
                            <td><span className="badge" style={{ background: g.is_paid ? '#dcfce7' : '#fee2e2', color: g.is_paid ? '#166534' : '#991b1b' }}>{g.is_paid ? 'Paid ✔️' : 'Unpaid ❌'}</span></td>
                            <td style={{ textAlign: 'center' }}>
                              {g.checked_in ? (
                                <span style={{ fontSize: '0.85rem', color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold' }}>✅ IN</span>
                              ) : (
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#f1f5f9', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold' }}>🚪 OUT</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === SETTINGS (ILOYOBORESHWA SANA) === */}
              {activeMenu === 'settings' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>{t.settings.title}</h2></div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    
                    {/* PROFILE SETTINGS */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                      <h3 style={{ marginBottom: '25px', color: '#0f172a' }}>👤 {t.settings.profile}</h3>
                      <form onSubmit={handleUpdateSettings}>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Full Name</label>
                          <input type="text" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc' }} value={settingsData.fullName} onChange={(e) => setSettingsData({...settingsData, fullName: e.target.value})} required/>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Company / Brand</label>
                          <input type="text" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc' }} value={settingsData.companyName} onChange={(e) => setSettingsData({...settingsData, companyName: e.target.value})}/>
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Phone Number</label>
                          <input type="tel" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc' }} value={settingsData.phone} onChange={(e) => setSettingsData({...settingsData, phone: e.target.value})}/>
                        </div>
                        <button type="submit" className="btn-get-started pulse-glow" style={{ width: '100%', padding: '16px' }} disabled={isUpdatingSettings}>
                          {isUpdatingSettings ? 'Saving...' : t.settings.save}
                        </button>
                      </form>
                    </div>

                    {/* PREFERENCES (LANGUAGE ETC) */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', alignSelf: 'start' }}>
                      <h3 style={{ marginBottom: '25px', color: '#0f172a' }}>🌍 {t.settings.langPrefs}</h3>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                          onClick={() => setLang('sw')} 
                          style={{ flex: 1, padding: '20px', borderRadius: '15px', border: lang === 'sw' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: lang === 'sw' ? '#eef2ff' : 'white', color: lang === 'sw' ? '#6366f1' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                          🇹🇿 Kiswahili
                        </button>
                        <button 
                          onClick={() => setLang('en')} 
                          style={{ flex: 1, padding: '20px', borderRadius: '15px', border: lang === 'en' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: lang === 'en' ? '#eef2ff' : 'white', color: lang === 'en' ? '#6366f1' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                          🇬🇧 English
                        </button>
                      </div>
                      <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {lang === 'sw' ? 'Lugha unayochagua hapa itahifadhiwa kwenye kivinjari chako na itatumika kila unapoingia kwenye mfumo.' : 'The language you select here will be saved in your browser and used every time you log in.'}
                      </p>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL YA TIKETI OFFLINE YA KISHUA (BOARDING PASS STYLE) */}
      {ticketToPrint && (
        <div className="ticket-modal-overlay">
          <div className="ticket-wrapper animated-fade-in" style={{ background: 'transparent', boxShadow: 'none' }}>
            <div ref={ticketRef} style={{ width: '350px', background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', margin: '0 auto', border: '1px solid #e2e8f0' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '30px 20px', textAlign: 'center', borderBottom: '3px dashed #cbd5e1', position: 'relative' }}>
                <span style={{ background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {lang === 'sw' ? 'Tiketi Rasmi' : 'Official Ticket'}
                </span>
                <h3 style={{ margin: '15px 0 10px 0', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#f8fafc' }}>
                  {events.find(e => e.id === selectedEventId)?.event_name}
                </h3>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', display: 'inline-block', width: '100%' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>📅 {new Date(events.find(e => e.id === selectedEventId)?.event_date).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#cbd5e1' }}>📍 {events.find(e => e.id === selectedEventId)?.location}</p>
                </div>
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '30px', height: '30px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '30px', height: '30px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '50%' }}></div>
              </div>
              <div style={{ padding: '25px 20px', textAlign: 'center', background: '#f8fafc' }}>
                <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{lang === 'sw' ? 'Mwalikwa' : 'Guest'}</p>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: '900' }}>{ticketToPrint.full_name}</h2>
                <span style={{ background: ticketToPrint.guest_type.includes('VIP') ? '#fef08a' : '#e2e8f0', color: '#1e293b', padding: '6px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-block' }}>{ticketToPrint.guest_type}</span>
              </div>
              <div style={{ padding: '20px', textAlign: 'center', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ background: 'white', padding: '10px', display: 'inline-block', borderRadius: '15px', border: '2px solid #e2e8f0' }}>
                  <QRCodeCanvas value={ticketToPrint.id} size={150} fgColor="#0f172a" />
                </div>
                <div style={{ marginTop: '15px', fontFamily: 'monospace', letterSpacing: '4px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold' }}>{ticketToPrint.id.substring(0,8).toUpperCase()}</div>
                <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                  {lang === 'sw' ? 'Tafadhali onyesha tiketi hii (kwa simu au iliyochapishwa) kwenye geti la kuingilia kwa ajili ya uhakiki.' : 'Please present this ticket (on mobile or printed) at the entrance gate for verification.'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'center' }}>
              <button onClick={() => setTicketToPrint(null)} style={{ padding: '12px 25px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                {lang === 'sw' ? 'Funga' : 'Close'}
              </button>
              <button onClick={downloadTicketImage} style={{ padding: '12px 25px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(99,102,241,0.3)', transition: '0.3s' }}>
                📥 {lang === 'sw' ? 'Pakua Picha' : 'Download Image'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;