import React, { useState } from 'react';
import { HOTELS_DATA } from '../data/hotels';

interface ContactFormProps {
  defaultProperty?: string;
  isHotelForm?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  defaultProperty = '',
  isHotelForm = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property: defaultProperty,
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (invalidFields[name]) {
      setInvalidFields((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    // Validation check
    const newInvalid: Record<string, boolean> = {};
    if (!formData.name.trim()) newInvalid.name = true;
    if (!formData.phone.trim()) newInvalid.phone = true;
    if (!formData.email.trim() || !formData.email.includes('@')) newInvalid.email = true;
    if (!isHotelForm && !formData.property) newInvalid.property = true;
    if (!formData.message.trim()) newInvalid.message = true;

    if (Object.keys(newInvalid).length > 0) {
      setInvalidFields(newInvalid);
      setStatus('error');
      setErrorMessage('Please fill in all required fields correctly.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/enquiry';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          hotel: formData.property || defaultProperty,
          message: formData.message.trim(),
          source: 'Hotel Website',
        }),
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok && responseData.success !== false) {
        setStatus('success');
        setSuccessMessage(responseData.message || 'Feature coming soon! Till then, please contact us directly at +91 86902 78979.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          property: defaultProperty,
          message: '',
        });
        setTimeout(() => {
          setStatus('idle');
        }, 8000);
      } else {

        setErrorMessage(responseData.message || 'Unable to submit enquiry. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Unable to connect to server. Please check your connection and try again.');
      setStatus('error');
    }
  };


  return (
    <form
      className={isHotelForm ? 'js-hotel-form' : 'js-contact-form'}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Default Banner (Always Visible Above Form) */}
      <div
        style={{
          background: '#e8f4f8',
          color: '#0c5460',
          border: '1px solid #bee5eb',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.925rem',
          lineHeight: '1.45',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <i className="fa-solid fa-circle-info" style={{ fontSize: '1.25rem', color: '#0c5460', flexShrink: 0 }}></i>
        <span>
          <strong>Online enquiry feature coming soon!</strong> Till then, please contact us directly at{' '}
          <a
            href="tel:+918690278979"
            style={{ color: '#0c5460', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            +91 86902 78979
          </a>.
        </span>
      </div>

      {status === 'error' && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {status === 'success' && (
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ fontSize: '1.2rem', color: '#155724' }}></i>
          <span>{successMessage || 'Feature coming soon! Till then, please contact us directly at +91 86902 78979.'}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor={isHotelForm ? 'hotel-name' : 'contact-name'}>Full Name *</label>
        <input
          type="text"
          id={isHotelForm ? 'hotel-name' : 'contact-name'}
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          style={{ borderColor: invalidFields.name ? '#c0392b' : undefined }}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={isHotelForm ? 'hotel-phone' : 'contact-phone'}>Phone / WhatsApp *</label>
          <input
            type="tel"
            id={isHotelForm ? 'hotel-phone' : 'contact-phone'}
            name="phone"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={handleChange}
            style={{ borderColor: invalidFields.phone ? '#c0392b' : undefined }}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor={isHotelForm ? 'hotel-email' : 'contact-email'}>Email Address *</label>
          <input
            type="email"
            id={isHotelForm ? 'hotel-email' : 'contact-email'}
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            style={{ borderColor: invalidFields.email ? '#c0392b' : undefined }}
            required
          />
        </div>
      </div>

      {!isHotelForm && (
        <div className="form-group">
          <label htmlFor="contact-property">Select Property *</label>
          <select
            id="contact-property"
            name="property"
            value={formData.property}
            onChange={handleChange}
            style={{ borderColor: invalidFields.property ? '#c0392b' : undefined }}
            required
          >
            <option value="" disabled>
              -- Select Hotel / Resort / Camp --
            </option>
            {HOTELS_DATA.map((h) => (
              <option key={h.slug} value={`${h.name}, ${h.city}`}>
                {h.name}, {h.city}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor={isHotelForm ? 'hotel-message' : 'contact-message'}>
          Your Message / Dates of Stay *
        </label>
        <textarea
          id={isHotelForm ? 'hotel-message' : 'contact-message'}
          name="message"
          placeholder="Please share details about your travel dates, number of guests, or special requirements..."
          value={formData.message}
          onChange={handleChange}
          style={{ borderColor: invalidFields.message ? '#c0392b' : undefined }}
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="btn btn-gold btn-lg"
        style={{
          width: '100%',
          justifyContent: 'center',
          background: status === 'success' ? '#27ae60' : undefined,
          borderColor: status === 'success' ? '#27ae60' : undefined,
        }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <i className="fa-solid fa-spinner fa-spin"></i> Sending...
          </>
        ) : status === 'success' ? (
          'Enquiry Sent!'
        ) : (
          'Send Enquiry'
        )}
      </button>
    </form>
  );
};
