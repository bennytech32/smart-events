import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CreateEvent = ({ onClose, onSuccess, eventToEdit }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    eventType: 'Kawaida', // Default: Kawaida, Harusi, Tamasha
    eventName: '',
    brideName: '',
    groomName: '',
    eventDate: '',
    location: '',
    guests: '',
    priceRegular: '', // Single / Kawaida
    priceVip: '',     // Double / VIP
    priceVvip: ''     // VVIP / Meza nzima
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        eventType: eventToEdit.event_type || 'Kawaida',
        eventName: eventToEdit.event_name,
        brideName: eventToEdit.bride_name || '',
        groomName: eventToEdit.groom_name || '',
        eventDate: eventToEdit.event_date,
        location: eventToEdit.location,
        guests: eventToEdit.expected_guests,
        priceRegular: eventToEdit.price_regular || '',
        priceVip: eventToEdit.price_vip || '',
        priceVvip: eventToEdit.price_vvip || ''
      });
    }
  }, [eventToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Kama amechagua Harusi na haija-editiwa, jaza jina la tukio kiotomatiki
    if (e.target.name === 'eventType' && e.target.value === 'Harusi' && !eventToEdit) {
      setFormData(prev => ({ ...prev, eventType: 'Harusi', eventName: 'Harusi ya ' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Tafadhali ingia (login) tena.");

      const eventData = {
        event_type: formData.eventType,
        event_name: formData.eventName,
        bride_name: formData.eventType === 'Harusi' ? formData.brideName : null,
        groom_name: formData.eventType === 'Harusi' ? formData.groomName : null,
        event_date: formData.eventDate,
        location: formData.location,
        expected_guests: parseInt(formData.guests) || 0,
        price_regular: parseFloat(formData.priceRegular) || 0,
        price_vip: parseFloat(formData.priceVip) || 0,
        price_vvip: parseFloat(formData.priceVvip) || 0,
      };

      if (eventToEdit) {
        // UPDATE
        const { error } = await supabase.from('events').update(eventData).eq('id', eventToEdit.id);
        if (error) throw error;
        alert("Taarifa za Tukio Zimesasishwa! ✅");
      } else {
        // INSERT
        eventData.user_id = user.id;
        const { error } = await supabase.from('events').insert([eventData]);
        if (error) throw error;
        alert("Tukio Jipya Limetengenezwa! 🎉");
      }

      onSuccess();
    } catch (err) {
      alert("Kosa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-card animated-fade-in" style={{ maxWidth: '750px' }}>
      <div className="card-header">
        <h2>{eventToEdit ? "Badili Taarifa za Tukio" : "Tengeneza Tukio Jipya"}</h2>
        <button className="btn-close" onClick={onClose}>✖</button>
      </div>
      
      <form onSubmit={handleSubmit} className="event-form">
        
        {/* AINA YA TUKIO */}
        <div className="auth-input-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#6366f1' }}>📌 Aina ya Tukio</label>
          <select name="eventType" value={formData.eventType} onChange={handleChange} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '100%', outline: 'none', background: '#eef2ff' }}>
            <option value="Kawaida">Tukio la Kawaida (Mkutano, Sherehe nyingine)</option>
            <option value="Harusi">Harusi / Sendoff 💍</option>
            <option value="Tamasha">Tamasha / Concert 🎵</option>
          </select>
        </div>

        {/* KAMA NI HARUSI ONYESHA HIZI FIELDS ZA MAHARUSI */}
        {formData.eventType === 'Harusi' && (
          <div className="input-row" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px dashed #cbd5e1' }}>
            <div className="auth-input-group">
              <label>Jina la Bwana Harusi</label>
              <input type="text" name="groomName" value={formData.groomName} placeholder="Mfano: Juma" onChange={handleChange} required />
            </div>
            <div className="auth-input-group">
              <label>Jina la Bibi Harusi</label>
              <input type="text" name="brideName" value={formData.brideName} placeholder="Mfano: Aisha" onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* TAARIFA ZA MSINGI ZA TUKIO */}
        <div className="input-row">
          <div className="auth-input-group">
            <label>Jina Kamili la Tukio</label>
            <input type="text" name="eventName" value={formData.eventName} placeholder="Mfano: Harusi ya Juma na Aisha" onChange={handleChange} required />
          </div>
          <div className="auth-input-group">
            <label>Tarehe</label>
            <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="input-row">
          <div className="auth-input-group">
            <label>Eneo / Ukumbi</label>
            <input type="text" name="location" value={formData.location} placeholder="Mfano: Mlimani City" onChange={handleChange} required />
          </div>
          <div className="auth-input-group">
            <label>Lengo la Idadi ya Wageni</label>
            <input type="number" name="guests" value={formData.guests} placeholder="Mfano: 300" onChange={handleChange} required />
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '25px 0' }} />

        {/* SEHEMU YA BEI (SINGLE/DOUBLE) */}
        <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>💰 Panga Viwango vya Michango/Kadi (TSH)</h3>
        
        <div className="input-row">
          <div className="auth-input-group">
            <label>{formData.eventType === 'Harusi' ? 'Kadi ya Single' : 'Tiketi ya Kawaida'}</label>
            <input type="number" name="priceRegular" value={formData.priceRegular} placeholder="Mfano: 50000" onChange={handleChange} />
          </div>
          <div className="auth-input-group">
            <label>{formData.eventType === 'Harusi' ? 'Kadi ya Double (VIP)' : 'Tiketi ya VIP'}</label>
            <input type="number" name="priceVip" value={formData.priceVip} placeholder="Mfano: 100000" onChange={handleChange} />
          </div>
          <div className="auth-input-group">
            <label>Kadi ya VVIP / Meza</label>
            <input type="number" name="priceVvip" value={formData.priceVvip} placeholder="Mfano: 500000" onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Ghairi</button>
          <button type="submit" className="btn-submit pulse-glow" disabled={loading}>
            {loading ? "Inahifadhi..." : (eventToEdit ? "Sasisha Tukio" : "Hifadhi Tukio")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;