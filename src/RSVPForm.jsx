import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

const RSVPForm = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState('si');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  
  const [status, setStatus] = useState(() => {
    return localStorage.getItem('rsvp_submitted') ? 'success' : 'idle';
  });
  
  const [errorMessage, setErrorMessage] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const formData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        attending: attending,
        guests: attending === 'si' ? guests : 0,
        message: message.trim(),
      };

      const { error: insertError } = await supabase
        .from('confirmaciones')
        .insert([formData]);

      if (insertError) {
        if (insertError.code === '23505') {
          setStatus('error');
          setErrorMessage('Este correo electrónico ya figura como registrado. Si deseas modificar tu asistencia, comunícate directamente con la familia.');
        } else {
          console.error("Error al guardar:", insertError);
          setStatus('error');
          setErrorMessage('Hubo un problema al guardar tu confirmación. Intenta de nuevo.');
        }
        return;
      }

    localStorage.setItem('rsvp_submitted', 'true');

    if (attending === 'si' && email.trim() !== '') {
      try {
        await emailjs.send(
          'service_h3osboe',
          'template_kvsyz7m',
          {
            to_name: name.trim(),
            to_email: email.trim(),
            guests: guests,
          },
          'rvi77d8S6R7URFq7J'
        );
      } catch (emailError) {
        console.error("Error al enviar el correo de confirmación:", emailError);
      }
    }

setStatus('success');

    } catch (error) {
      console.error("Error inesperado:", error);
      setStatus('error');
      setErrorMessage('Ocurrió un error inesperado. Revisa tu conexión a internet.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rsvp-success">
        <p>Confirmación recibida.</p>
        <p className="success-sub">Nos vemos pronto.</p>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="rsvp-name">Nombre completo</label>
        <input
          type="text"
          id="rsvp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="rsvp-toggle">
        <button
          type="button"
          className={`toggle-option ${attending === 'si' ? 'active' : ''}`}
          onClick={() => setAttending('si')}
        >
          Sí, asistiré
        </button>
        <button
          type="button"
          className={`toggle-option ${attending === 'no' ? 'active' : ''}`}
          onClick={() => setAttending('no')}
        >
          No podré ir
        </button>
      </div>

      {attending === 'si' && (
        <>
          <div className="field">
            <label htmlFor="rsvp-email">Correo electrónico</label>
            <input
              type="email"
              id="rsvp-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="rsvp-phone">Número de celular (opcional)</label>
            <input
              type="tel"
              id="rsvp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="999 999 999"
            />
          </div>

          <div className="field" id="guests-field">
            <label htmlFor="rsvp-guests">Número de personas (incluyéndote)</label>
            <input
              type="number"
              id="rsvp-guests"
              min="1"
              max="2"
              value={guests}
              onChange={(e) => {
                const valor = parseInt(e.target.value) || 1;
                setGuests(Math.min(valor, 2));
              }}
            />
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="rsvp-message">Mensaje para la quinceañera (opcional)</label>
        <textarea
          id="rsvp-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p style={{ color: '#d9b077', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.4' }}>
          {errorMessage}
        </p>
      )}

      <button 
        type="submit" 
        className="submit-btn" 
        disabled={status === 'loading' || !name.trim()}
      >
        {status === 'loading' ? 'Confirmando...' : 'Confirmar asistencia'}
      </button>
    </form>
  );
};

export default RSVPForm;