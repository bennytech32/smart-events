import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './LandingPage.css'; // Tunatumia CSS ileile ili iwe na muonekano wa kishua

const BuyTicket = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Hatua za fomu (0 = Jaza Taarifa, 1 = Chagua Mtandao, 2 = Inasubiri Malipo, 3 = Imekamilika)
  const [step, setStep] = useState(0); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    guestType: 'Kawaida',
  });
  const [paymentNetwork, setPaymentNetwork] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  // Logiki ya Bei
  const getTicketPrice = () => {
    if (!event) return 0;
    if (formData.guestType === 'Kawaida') return event.price_regular || 0;
    if (formData.guestType === 'VIP') return event.price_vip || 0;
    if (formData.guestType === 'VVIP') return event.price_vvip || 0;
    return 0;
  };

  // Logiki ya Majina ya Tiketi (kulingana na tukio)
  const getLabels = () => {
    if (!event) return { reg: 'Kawaida', vip: 'VIP', vvip: 'VVIP' };
    if (event.event_type === 'Harusi') return { reg: 'Kadi ya Single', vip: 'Kadi ya Double', vvip: 'Kadi ya Meza' };
    if (event.event_type === 'Utalii') return { reg: 'Tiketi ya Mtoto', vip: 'Mtu Mzima', vvip: 'Couple' };
    if (event.event_type === 'Charity') return { reg: 'Ahadi ya Bronze', vip: 'Ahadi ya Silver', vvip: 'Ahadi ya Gold' };
    return { reg: 'Tiketi ya Kawaida', vip: 'Tiketi ya VIP', vvip: 'Tiketi ya VVIP' };
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (getTicketPrice() === 0) {
      alert("Samahani, aina hii ya tiketi haina bei iliyopangwa.");
      return;
    }
    setStep(1); // Nenda kwenye malipo
  };

  const handlePay = async () => {
    if (!paymentNetwork) return alert("Tafadhali chagua mtandao wako wa simu.");
    setStep(2); // Onyesha inazunguka (Push USSD Simulation)

    // Hapa tuna-simulate mteja ameweka PIN kwenye simu yake baada ya sekunde 4
    setTimeout(async () => {
      try {
        const { error } = await supabase.from('guests').insert([{
          event_id: event.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          guest_type: formData.guestType,
          pledge_amount: getTicketPrice(),
          amount_paid: getTicketPrice(),
          is_paid: true,
          status: 'Amemaliza'
        }]);

        if (error) throw error;
        setStep(3); // Imekamilika
      } catch (err) {
        alert("Kosa kurekodi tiketi: " + err.message);
        setStep(1); // Mrudishe nyuma akijaribu tena
      }
    }, 4000);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Inapakia taarifa za tukio... ⏳</h3></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Tukio Halijapatikana ❌</h3></div>;

  const labels = getLabels();
  const ticketPrice = getTicketPrice();

  return (
    <div className="landing-layout" style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div className="contact-form-glass animated-fade-in" style={{ maxWidth: '550px', width: '100%', padding: '40px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ background: '#eef2ff', color: '#6366f1', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {event.event_type}
          </span>
          <h2 style={{ margin: '15px 0 5px 0', color: '#0f172a', fontSize: '1.8rem' }}>{event.event_name}</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            📅 {new Date(event.event_date).toLocaleDateString()} &nbsp;|&nbsp; 📍 {event.location}
          </p>
        </div>

        {/* STEP 0: JAZA TAARIFA (REGISTRATION) */}
        {step === 0 && (
          <form onSubmit={handleNext} className="animated-form">
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#1e293b' }}>Nunua Tiketi Mtandaoni</h3>
            
            <input 
              type="text" 
              placeholder="Jina lako kamili" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required 
            />
            
            <input 
              type="tel" 
              placeholder="Namba ya Simu (Mfano: 075... au 065...)" 
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              required 
            />

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Chagua Aina ya Tiketi</label>
              <select 
                value={formData.guestType} 
                onChange={(e) => setFormData({...formData, guestType: e.target.value})}
                style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '1rem' }}
              >
                <option value="Kawaida">{labels.reg} - TSH {event.price_regular?.toLocaleString() || 0}</option>
                <option value="VIP">{labels.vip} - TSH {event.price_vip?.toLocaleString() || 0}</option>
                <option value="VVIP">{labels.vvip} - TSH {event.price_vvip?.toLocaleString() || 0}</option>
              </select>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginTop: '20px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, color: '#64748b' }}>Jumla ya Kulipia:</p>
              <h1 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '2.5rem' }}>TSH {ticketPrice.toLocaleString()}</h1>
            </div>

            <button type="submit" className="btn-get-started pulse-glow" style={{ width: '100%', marginTop: '20px', padding: '18px' }}>
              Endelea Kwenye Malipo 💳
            </button>
          </form>
        )}

        {/* STEP 1: CHAGUA MTANDAO (MOBILE MONEY INTEGRATION MOCKUP) */}
        {step === 1 && (
          <div className="animated-fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Chagua Mtandao wa Kulipia</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '25px' }}>
              {['M-Pesa', 'Tigo Pesa', 'Airtel Money'].map(net => (
                <div 
                  key={net}
                  onClick={() => setPaymentNetwork(net)}
                  style={{ 
                    padding: '20px 10px', 
                    borderRadius: '15px', 
                    border: paymentNetwork === net ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: paymentNetwork === net ? '#eef2ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: paymentNetwork === net ? '#6366f1' : '#64748b',
                    transition: '0.3s'
                  }}
                >
                  {net}
                </div>
              ))}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tutakutumia ujumbe kwenye namba <strong>{formData.phoneNumber}</strong> uweke namba yako ya siri.
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: '15px', background: '#e2e8f0', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ghairi</button>
              <button onClick={handlePay} style={{ flex: 2, padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Lipa TSH {ticketPrice.toLocaleString()}</button>
            </div>
          </div>
        )}

        {/* STEP 2: LOADING PUSH USSD */}
        {step === 2 && (
          <div className="animated-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="pulse-glow" style={{ width: '80px', height: '80px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2rem' }}>📱</div>
            <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Tafadhali angalia simu yako...</h3>
            <p style={{ color: '#64748b' }}>Ingiza namba ya siri kwenye ujumbe wa {paymentNetwork} uliotumiwa sasa hivi ili kukamilisha malipo.</p>
          </div>
        )}

        {/* STEP 3: SUCCESS TICKET GENERATED */}
        {step === 3 && (
          <div className="animated-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ color: '#166534', marginBottom: '10px' }}>Malipo Yamefanikiwa!</h2>
            <p style={{ color: '#475569', marginBottom: '20px' }}>Asante {formData.fullName}. Tiketi yako imethibitishwa na umetumiwa ujumbe mfupi (SMS/WhatsApp) wenye QR Code yako.</p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px dashed #cbd5e1', marginBottom: '25px' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Tukio:</strong> {event.event_name}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Kadi:</strong> {formData.guestType}</p>
              <p style={{ margin: '0' }}><strong>Kiasi:</strong> TSH {ticketPrice.toLocaleString()}</p>
            </div>

            <button onClick={() => navigate('/')} className="btn-get-started" style={{ width: '100%' }}>Rudi Mwanzo</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BuyTicket;