import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CreateGuest = ({ selectedEvent, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    guestType: 'Kawaida',
    pledgeAmount: '' 
  });

  // Weka bei ya "Kawaida/Single" moja kwa moja fomu ikifunguka
  useEffect(() => {
    if (selectedEvent) {
      setFormData(prev => ({ 
        ...prev, 
        pledgeAmount: selectedEvent.price_regular || '' 
      }));
    }
  }, [selectedEvent]);

  // Kazi ya kusikiliza mabadiliko ya Fomu
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // KAMA ANABADILISHA AINA YA MGENI (VIP/Kawaida)
    if (name === 'guestType') {
      let autoPrice = '';
      if (value === 'Kawaida') autoPrice = selectedEvent.price_regular || '';
      else if (value === 'VIP') autoPrice = selectedEvent.price_vip || '';
      else if (value === 'VVIP') autoPrice = selectedEvent.price_vvip || '';

      setFormData({ ...formData, guestType: value, pledgeAmount: autoPrice });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('guests').insert([
        {
          event_id: selectedEvent.id, // 👈 Tunatumia ID kutoka kwenye tukio lililochaguliwa
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          guest_type: formData.guestType,
          pledge_amount: parseFloat(formData.pledgeAmount) || 0,
          amount_paid: 0,
          is_paid: false,
          status: 'Hajalipa'
        }
      ]);

      if (error) throw error;
      alert("Mgeni na Ahadi yake vimehifadhiwa Kishua! 🎉");
      onSuccess();
    } catch (err) {
      alert("Kosa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Panga majina ya lebo kulingana na aina ya tukio
  const isHarusi = selectedEvent?.event_type === 'Harusi';
  const labelKawaida = isHarusi ? 'Single' : 'Kawaida (Regular)';
  const labelVIP = isHarusi ? 'Double' : 'VIP';
  const labelVVIP = isHarusi ? 'Meza / VVIP' : 'VVIP';

  return (
    <div className="create-event-card animated-fade-in" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="card-header">
        <h2>Ongeza Mgeni ({selectedEvent?.event_name})</h2>
        <button className="btn-close" onClick={onClose}>✖</button>
      </div>
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="auth-input-group" style={{ marginBottom: '15px' }}>
          <label>Jina Kamili la Mgeni</label>
          <input type="text" name="fullName" placeholder="Mfano: Ali Kamau" onChange={handleChange} required />
        </div>

        <div className="auth-input-group" style={{ marginBottom: '15px' }}>
          <label>Namba ya Simu</label>
          <input type="tel" name="phoneNumber" placeholder="Mfano: 0712345678" onChange={handleChange} required />
        </div>

        {/* MCHAGUO WA AINA YA MGENI UNABADILIKA KULINGANA NA TUKIO */}
        <div className="auth-input-group" style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Hadhi ya Mgeni / Kadi</label>
          <select name="guestType" value={formData.guestType} onChange={handleChange} style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}>
            <option value="Kawaida">{labelKawaida} (TSH {selectedEvent?.price_regular?.toLocaleString() || 0})</option>
            <option value="VIP">{labelVIP} (TSH {selectedEvent?.price_vip?.toLocaleString() || 0})</option>
            <option value="VVIP">{labelVVIP} (TSH {selectedEvent?.price_vvip?.toLocaleString() || 0})</option>
          </select>
        </div>

        {/* AHADI INAJAA YENYEWE LAKINI INARUHUSU KU-EDIT KAMA KUNA PUNGUZO */}
        <div className="auth-input-group" style={{ marginBottom: '25px' }}>
          <label>Ahadi ya Mchango (TSH)</label>
          <input type="number" name="pledgeAmount" value={formData.pledgeAmount} placeholder="Mfano: 100000" onChange={handleChange} required />
          <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>Kiasi hiki kimejazwa kiotomatiki kulingana na kadi uliyochagua.</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Ghairi</button>
          <button type="submit" className="btn-submit pulse-glow" disabled={loading}>Hifadhi Mgeni</button>
        </div>
      </form>
    </div>
  );
};

export default CreateGuest;