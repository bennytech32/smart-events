import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateEvent from './CreateEvent';
import CreateGuest from './CreateGuest';
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [activeMenu, setActiveMenu] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [guests, setGuests] = useState([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);

  const [bulkMessage, setBulkMessage] = useState('');
  const [smsAudience, setSmsAudience] = useState('all');
  const [settingsData, setSettingsData] = useState({ fullName: '', companyName: '', phone: '' });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    const checkUserAndFetchEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        setSettingsData({
          fullName: session.user.user_metadata?.full_name || '',
          companyName: session.user.user_metadata?.company_name || 'B-Tech Group',
          phone: session.user.user_metadata?.phone || ''
        });
        fetchEvents(session.user.id);
      }
    };
    checkUserAndFetchEvents();
  }, [navigate]);

  useEffect(() => { if (selectedEventId) fetchGuests(selectedEventId); }, [selectedEventId]);

  const fetchEvents = async (userId) => {
    setIsLoadingEvents(true);
    try {
      const { data, error } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0 && !selectedEventId) setSelectedEventId(data[0].id);
    } catch (error) { console.error(error.message); } finally { setIsLoadingEvents(false); }
  };

  const fetchGuests = async (eventId) => {
    setIsLoadingGuests(true);
    try {
      const { data, error } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
      if (error) throw error;
      setGuests(data || []);
    } catch (error) { console.error(error.message); } finally { setIsLoadingGuests(false); }
  };

  // 💰 KAZI MPYA YA KUPOKEA MCHANGO (INAHESABU BAKI)
  const handlePayment = async (guest) => {
    const pledge = Number(guest.pledge_amount) || 0;
    const currentlyPaid = Number(guest.amount_paid) || 0;
    const balance = Math.max(pledge - currentlyPaid, 0);

    const amountStr = window.prompt(
      `Mchango wa ${guest.full_name}\nAhadi: TSH ${pledge.toLocaleString()}\nKiasi Anachodaiwa: TSH ${balance.toLocaleString()}\n\nIngiza kiasi anachotoa sasa hivi:`, 
      balance.toString()
    );
    
    if (amountStr === null) return;
    const currentPayment = parseFloat(amountStr);
    if (isNaN(currentPayment) || currentPayment <= 0) return alert("Tafadhali weka kiasi sahihi cha pesa.");

    const newTotalPaid = currentlyPaid + currentPayment;
    let newStatus = 'Ametoa Nusu';
    let isFullyPaid = false;

    // Angalia kama amemaliza deni
    if (newTotalPaid >= pledge) {
      newStatus = 'Amemaliza';
      isFullyPaid = true;
    }

    try {
      const { error } = await supabase
        .from('guests')
        .update({ 
          is_paid: isFullyPaid, 
          status: newStatus, 
          amount_paid: newTotalPaid 
        })
        .eq('id', guest.id);

      if (error) throw error;
      
      if (isFullyPaid) {
        alert(`Safi! ${guest.full_name} amemaliza mchango wake. QR Code imetengenezwa. 💳`);
      } else {
        alert(`${guest.full_name} ametoa TSH ${currentPayment.toLocaleString()}. Bado anadaiwa TSH ${(pledge - newTotalPaid).toLocaleString()}. 📝`);
      }
      
      fetchGuests(selectedEventId);
    } catch (err) { alert("Kosa kurekodi malipo: " + err.message); }
  };

  // WHATSAPP
  const sendWhatsApp = (guest) => {
    const message = `Habari ${guest.full_name}, tunashukuru kwa kukamilisha mchango wako. Tiketi yako ipo tayari. ID yako ni: ${guest.id.substring(0,8).toUpperCase()}. Karibu sana!`;
    let phone = guest.phone_number;
    if (phone.startsWith('0')) phone = '255' + phone.substring(1);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // BEEM SMS
  const sendSMS = async (guest) => {
    const apiKey = import.meta.env.VITE_BEEM_API_KEY;
    const secretKey = import.meta.env.VITE_BEEM_SECRET_KEY;
    const senderId = import.meta.env.VITE_BEEM_SENDER_ID || 'INFO';
    if (!apiKey || !secretKey) return alert("Hujaweka funguo za Beem API kwenye .env");

    const message = `Habari ${guest.full_name}, tunashukuru kwa mchango wako. ID yako: ${guest.id.substring(0,8).toUpperCase()}. Karibu kwenye tukio!`;
    let phone = guest.phone_number;
    if (phone.startsWith('0')) phone = '255' + phone.substring(1);
    else if (phone.startsWith('+')) phone = phone.substring(1);

    try {
      const response = await fetch('https://apisms.beem.africa/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(apiKey + ':' + secretKey) },
        body: JSON.stringify({ source_addr: senderId, schedule_time: '', encoding: '0', message: message, recipients: [{ recipient_id: 1, dest_addr: phone }] })
      });
      if (response.ok) alert('✅ SMS imetumwa kikamilifu!');
      else alert('❌ Kosa kutoka Beem SMS API.');
    } catch (error) { alert('Kosa kutuma SMS: ' + error.message); }
  };

  // BULK SMS
  const handleBulkSMS = () => {
    if (!bulkMessage.trim()) return alert("Tafadhali andika ujumbe kwanza.");
    let targetGuests = guests;
    if (smsAudience === 'paid') targetGuests = guests.filter(g => g.is_paid);
    if (smsAudience === 'unpaid') targetGuests = guests.filter(g => !g.is_paid);
    if (targetGuests.length === 0) return alert("Hakuna wageni kwenye kundi hili.");

    if (window.confirm(`Upo tayari kutuma SMS kwa wageni ${targetGuests.length}?`)) {
      alert(`✅ Ujumbe unatumwa kwa wageni ${targetGuests.length}...`);
      setBulkMessage('');
    }
  };

  const handleSetBudget = async () => {
    const currentEvent = events.find(e => e.id === selectedEventId);
    const newBudget = window.prompt("Ingiza Lengo la Bajeti (Kiasi kinachohitajika):", currentEvent?.budget_goal || 0);
    if (newBudget !== null && !isNaN(newBudget)) {
      try {
        const { error } = await supabase.from('events').update({ budget_goal: parseFloat(newBudget) }).eq('id', selectedEventId);
        if (error) throw error;
        alert("Lengo la Bajeti limesasishwa! 🎯");
        fetchEvents(user.id);
      } catch (err) { alert("Kosa: " + err.message); }
    }
  };

  const calculateTotalCollected = () => guests.reduce((sum, g) => sum + (Number(g.amount_paid) || 0), 0);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: settingsData.fullName, company_name: settingsData.companyName, phone: settingsData.phone } });
      if (error) throw error;
      alert("Mipangilio imehifadhiwa kikamilifu! ✅");
      setUser(data.user);
    } catch (err) { alert("Kosa kusasisha mipangilio: " + err.message); } finally { setIsUpdatingSettings(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'events', icon: '🎫', label: 'My Events' },
    { id: 'guests', icon: '👥', label: 'Guests & QR' },
    { id: 'budget', icon: '💰', label: 'Budget & Pledges' },
    { id: 'communication', icon: '📢', label: 'SMS & Emails' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>✨ SMART EVENTS</div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${activeMenu === item.id && !showCreateForm && !showGuestForm ? 'active' : ''}`}
              onClick={() => { setActiveMenu(item.id); setShowCreateForm(false); setShowGuestForm(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-search"><input type="text" placeholder="Search events, guests..." /></div>
          <div className="topbar-actions">
            <button className="btn-create-event" onClick={() => { setEventToEdit(null); setShowCreateForm(true); }}>+ New Event</button>
            <div className="user-profile"><div className="avatar">👤</div><span>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span></div>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="dashboard-content">
          {showCreateForm ? ( <CreateEvent eventToEdit={eventToEdit} onClose={() => setShowCreateForm(false)} onSuccess={() => { setShowCreateForm(false); fetchEvents(user.id); setActiveMenu('overview'); }} />
          ) : showGuestForm ? ( <CreateGuest eventId={selectedEventId} onClose={() => setShowGuestForm(false)} onSuccess={() => { setShowGuestForm(false); fetchGuests(selectedEventId); }} />
          ) : (
            <>
              {/* OVERVIEW */}
              {activeMenu === 'overview' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>Dashboard Overview</h2><p>Karibu! Hapa kuna muhtasari wa matukio yako.</p></div>
                  <div className="stats-grid"><div className="stat-card"><div className="stat-icon" style={{background: '#eef2ff', color: '#6366f1'}}>🎫</div><div className="stat-details"><h3>Total Events</h3><h2>{events.length} Active</h2></div></div></div>
                  <div className="recent-section">
                    <h3>Recent Events</h3>
                    <div className="table-container">
                      <table className="dashboard-table">
                        <thead><tr><th>Jina la Tukio</th><th>Tarehe</th><th>Ukumbi</th><th>Action</th></tr></thead>
                        <tbody>{events.map(ev => (<tr key={ev.id}><td style={{ fontWeight: 'bold' }}>{ev.event_name}</td><td>{new Date(ev.event_date).toLocaleDateString()}</td><td>{ev.location}</td><td><button className="btn-action" onClick={() => { setEventToEdit(ev); setShowCreateForm(true); }}>✏️ Edit</button></td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* EVENTS */}
              {activeMenu === 'events' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>Matukio Yangu (My Events)</h2></div>
                  <div className="table-container">
                    <table className="dashboard-table">
                        <thead><tr><th>Jina la Tukio</th><th>Tarehe</th><th>Ukumbi</th><th>Lengo la Wageni</th><th>Action</th></tr></thead>
                        <tbody>{events.map(ev => (<tr key={ev.id}><td style={{ fontWeight: 'bold' }}>{ev.event_name}</td><td>{new Date(ev.event_date).toLocaleDateString()}</td><td>{ev.location}</td><td>{ev.expected_guests}</td><td><button className="btn-action" onClick={() => { setEventToEdit(ev); setShowCreateForm(true); }}>✏️ Edit</button></td></tr>))}</tbody>
                      </table>
                  </div>
                </div>
              )}

              {/* GUESTS & QR YENYE MICHANGO */}
              {activeMenu === 'guests' && (
                <div className="animated-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h2>Wageni, Ahadi & Mialiko</h2><p>Dhibiti ahadi za wageni na utoe tiketi wakimaliza.</p></div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <select style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                        {events.length === 0 && <option value="">Hakuna Matukio Bado</option>}
                        {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.event_name}</option>))}
                      </select>
                      <button className="btn-create-event" style={{ background: '#22c55e' }} onClick={() => setShowGuestForm(true)} disabled={events.length === 0}>+ Add Guest</button>
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Jina & Aina</th>
                          <th>Mchango (Ahadi & Malipo)</th>
                          <th style={{ textAlign: 'center' }}>Hali & QR Code</th>
                          <th style={{ textAlign: 'center' }}>Kitendo (Action)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingGuests ? (
                          <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>⏳ Inapakia wageni...</td></tr>
                        ) : guests.length === 0 ? (
                          <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Huna mgeni yeyote kwenye tukio hili bado.</td></tr>
                        ) : (
                          guests.map(guest => {
                            const pledge = Number(guest.pledge_amount) || 0;
                            const paid = Number(guest.amount_paid) || 0;
                            const balance = Math.max(pledge - paid, 0);

                            return (
                              <tr key={guest.id}>
                                <td>
                                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{guest.full_name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{guest.phone_number}</div>
                                  <span className="badge" style={{ background: guest.guest_type === 'VIP' ? '#fef08a' : '#e2e8f0', color: '#1e293b', marginTop: '5px', display: 'inline-block' }}>{guest.guest_type}</span>
                                </td>

                                {/* SEHEMU MPYA YA KUONYESHA AHADI, LILILOTOLEWA, NA BAKI */}
                                <td>
                                  <div style={{ fontSize: '0.85rem' }}>
                                    <div style={{ color: '#475569', marginBottom: '3px' }}><strong>Ahadi:</strong> TSH {pledge.toLocaleString()}</div>
                                    <div style={{ color: '#166534', marginBottom: '3px' }}><strong>Ametoa:</strong> TSH {paid.toLocaleString()}</div>
                                    <div style={{ color: balance > 0 ? '#ef4444' : '#64748b' }}><strong>Baki:</strong> TSH {balance.toLocaleString()}</div>
                                  </div>
                                </td>
                                
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                  {guest.is_paid ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                      <QRCodeCanvas value={guest.id} size={50} fgColor="#4f46e5" level="M" />
                                      <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>Amemaliza</span>
                                    </div>
                                  ) : guest.amount_paid > 0 ? (
                                    <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Ametoa Nusu</span>
                                  ) : (
                                    <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '4px 10px', borderRadius: '12px' }}>Hajalipa</span>
                                  )}
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                    {!guest.is_paid ? (
                                      <button className="btn-action" style={{ background: '#dcfce7', color: '#166534', width: '130px' }} onClick={() => handlePayment(guest)}>
                                        {guest.amount_paid > 0 ? '➕ Ongeza Mchango' : '💰 Weka Mchango'}
                                      </button>
                                    ) : (
                                      <>
                                        <button className="btn-action" style={{ background: '#25D366', color: 'white', width: '130px' }} onClick={() => sendWhatsApp(guest)}>💬 WhatsApp</button>
                                        <button className="btn-action" style={{ background: '#6366f1', color: 'white', width: '130px' }} onClick={() => sendSMS(guest)}>📩 Tuma SMS</button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BUDGET, COMMUNICATION, & SETTINGS ZIKO HAPA CHINI (HAZIJABADILIKA SANA) */}
              {activeMenu === 'budget' && (
                <div className="animated-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h2>Bajeti na Michango</h2></div>
                    <select style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                      {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.event_name}</option>))}
                    </select>
                  </div>
                  {events.length > 0 && selectedEventId && (() => {
                      const currentEv = events.find(e => e.id === selectedEventId);
                      const totalCollected = calculateTotalCollected();
                      const targetBudget = currentEv?.budget_goal || 0;
                      const progress = targetBudget > 0 ? Math.min((totalCollected / targetBudget) * 100, 100) : 0;
                      return (
                        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#0f172a' }}>Maendeleo ya Makusanyo</h3>
                            <button className="btn-action" onClick={handleSetBudget}>🎯 Weka Lengo</button>
                          </div>
                          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}><p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Lengo la Bajeti</p><h2 style={{ margin: 0, color: '#0f172a' }}>TSH {targetBudget.toLocaleString()}</h2></div>
                            <div style={{ flex: 1, background: '#dcfce7', padding: '20px', borderRadius: '15px', border: '1px solid #bbf7d0' }}><p style={{ margin: '0 0 5px 0', color: '#166534' }}>Zilizokusanywa</p><h2 style={{ margin: 0, color: '#166534' }}>TSH {totalCollected.toLocaleString()}</h2></div>
                            <div style={{ flex: 1, background: '#fee2e2', padding: '20px', borderRadius: '15px', border: '1px solid #fecaca' }}><p style={{ margin: '0 0 5px 0', color: '#991b1b' }}>Kiasi Kilichobaki</p><h2 style={{ margin: 0, color: '#991b1b' }}>TSH {Math.max(targetBudget - totalCollected, 0).toLocaleString()}</h2></div>
                          </div>
                          <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #22c55e)' }}></div></div>
                        </div>
                      );
                    })()}
                </div>
              )}

              {activeMenu === 'communication' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>Matangazo & SMS</h2></div>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9', maxWidth: '800px' }}>
                    <div style={{ marginBottom: '20px' }}><label>Walengwa</label><select style={{ width: '100%', padding: '12px', borderRadius: '10px' }} value={smsAudience} onChange={(e) => setSmsAudience(e.target.value)}><option value="all">Wote</option><option value="paid">Waliomaliza (Kutuma Tiketi)</option><option value="unpaid">Wanaodaiwa (Kukumbusha)</option></select></div>
                    <div style={{ marginBottom: '20px' }}><textarea rows="5" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} placeholder="Andika ujumbe hapa..." value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)}></textarea></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn-create-event" onClick={handleBulkSMS}>🚀 Tuma Bulk SMS</button></div>
                  </div>
                </div>
              )}

              {activeMenu === 'settings' && (
                <div className="animated-fade-in">
                  <div className="page-header"><h2>Mipangilio</h2></div>
                  <div style={{ background: 'white', padding: '35px', borderRadius: '20px', border: '1px solid #f1f5f9', maxWidth: '600px' }}>
                    <form onSubmit={handleUpdateSettings}>
                      <div style={{ marginBottom: '20px' }}><label>Jina Kamili</label><input type="text" style={{ width: '100%', padding: '12px' }} value={settingsData.fullName} onChange={(e) => setSettingsData({...settingsData, fullName: e.target.value})} required/></div>
                      <div style={{ marginBottom: '20px' }}><label>Kampuni</label><input type="text" style={{ width: '100%', padding: '12px' }} value={settingsData.companyName} onChange={(e) => setSettingsData({...settingsData, companyName: e.target.value})}/></div>
                      <div style={{ marginBottom: '30px' }}><label>Simu</label><input type="tel" style={{ width: '100%', padding: '12px' }} value={settingsData.phone} onChange={(e) => setSettingsData({...settingsData, phone: e.target.value})}/></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><button type="submit" className="btn-create-event">💾 Hifadhi Mabadiliko</button></div>
                    </form>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;