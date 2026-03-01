import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // 👈 Jina sahihi la package lipo hapa
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const Scanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [status, setStatus] = useState('ready'); // ready, checking, success, error, not-paid, already-in

  useEffect(() => {
    // Tunawasha kamera hapa
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(result) {
      scanner.clear(); // Simamisha kamera akishasoma
      setScanResult(result);
      verifyGuest(result); // Peleka ID kwenye database kuhakiki
    }

    function onScanError(err) {
      // Hii inapuuzia makosa madogo wakati kamera inatafuta QR Code
    }

    // Zima kamera ukiondoka kwenye hii page
    return () => {
      scanner.clear().catch(error => console.error("Kosa kuzima scanner", error));
    };
  }, []);

  // Kazi ya kuhakiki mgeni mtandaoni
  const verifyGuest = async (guestId) => {
    setStatus('checking');
    try {
      // 1. Tafuta mgeni kwa ID kutoka Supabase
      const { data: guest, error } = await supabase
        .from('guests')
        .select('*, events(event_name)')
        .eq('id', guestId)
        .single();

      if (error || !guest) {
        setStatus('error');
        return;
      }

      setGuestInfo(guest);

      // 2. Angalia kama amemaliza mchango
      if (!guest.is_paid) {
        setStatus('not-paid');
        return;
      }

      // 3. Angalia kama alishaingia (kuzuia kadi kutumika mara mbili)
      if (guest.checked_in) {
        setStatus('already-in');
        return;
      }

      // 4. Mruhusu aingie na update rekodi yake
      await supabase
        .from('guests')
        .update({ checked_in: true, check_in_time: new Date() })
        .eq('id', guestId);

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // Kazi ya kurudisha scanner isome tena kadi nyingine
  const handleScanAnother = () => {
    setScanResult(null);
    setGuestInfo(null);
    setStatus('ready');
    window.location.reload(); // Njia rahisi ya kureset kamera kwa haraka
  };

  return (
    <div className="scanner-container animated-fade-in" style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER YA SCANNER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '500px', margin: '0 auto 20px auto' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '10px 15px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ⬅ Rudi
        </button>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem' }}>📱 Smart Scanner</h2>
        <div style={{ width: '70px' }}></div> {/* Spacer */}
      </div>

      {/* ENEO LA KAMERA */}
      {!scanResult && (
        <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div id="reader" style={{ width: '100%', borderRadius: '15px', overflow: 'hidden' }}></div>
          <p style={{ marginTop: '15px', color: '#64748b', fontSize: '0.9rem' }}>Elekeza kamera kwenye QR Code ya mgeni.</p>
        </div>
      )}

      {/* MATOKEO BAADA YA KUSKENI */}
      {status === 'checking' && (
        <div style={{ marginTop: '30px' }}>
          <h2>⏳ Inahakiki tiketi...</h2>
        </div>
      )}

      {guestInfo && status !== 'checking' && (
        <div className={`status-card`} style={{ marginTop: '20px', padding: '30px', borderRadius: '20px', maxWidth: '400px', margin: '20px auto', background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          
          {/* UJUMBE WA HALI YA TIKETI */}
          {status === 'success' && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>✅ IMEKUBALI!</h2>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Mruhusu Aingie</p>
            </div>
          )}
          {status === 'already-in' && (
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>⚠️ TAYARI NDANI!</h2>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Kadi hii imeshatumika.</p>
            </div>
          )}
          {status === 'not-paid' && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>❌ HAJALIPA!</h2>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Mgeni anadaiwa mchango.</p>
            </div>
          )}
          {status === 'error' && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>❌ KOSA!</h2>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Tiketi haitambuliki.</p>
            </div>
          )}

          {/* TAARIFA ZA MGENI */}
          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 10px 0', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Jina:</strong> {guestInfo.full_name}</p>
            <p style={{ margin: '0 0 10px 0', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Tukio:</strong> {guestInfo.events?.event_name}</p>
            <p style={{ margin: '0 0 10px 0', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Kadi/Hadhi:</strong> <span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>{guestInfo.guest_type}</span></p>
          </div>

          <button 
            onClick={handleScanAnother} 
            style={{ width: '100%', marginTop: '25px', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' }}
          >
            📸 Skeni Nyingine
          </button>
        </div>
      )}

    </div>
  );
};

export default Scanner;