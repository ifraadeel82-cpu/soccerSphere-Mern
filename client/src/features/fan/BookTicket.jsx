import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';

const BookTicket = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [form, setForm] = useState({ seatNumber: '', paymentMethod: 'Card' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/api/fan/matches/' + matchId).then(r => setMatch(r.data)).catch(() => {});
  }, [matchId]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/api/fan/tickets', { matchId, ...form });
      setSuccess('Ticket booked successfully! Redirecting...');
      setTimeout(() => navigate('/fan/tickets'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  if (!match) return <div style={{ color: '#B0AEAF', padding: 40 }}>Loading match info...</div>;

  return (
    <div style={{ maxWidth: 520 }}>
      <button className="btn btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title">Book Ticket</h1>

      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg,#141B2B,#1a2438)', borderColor: 'rgba(163,20,0,0.25)' }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#FFFFFF' }}>{match.homeTeam?.name} vs {match.awayTeam?.name}</div>
        <div style={{ color: '#B0AEAF', fontSize: 14, marginBottom: 4 }}>📍 {match.stadium?.name}</div>
        <div style={{ color: '#B0AEAF', fontSize: 14, marginBottom: 12 }}>📅 {new Date(match.matchDate).toLocaleDateString()}</div>
        <div style={{ fontWeight: 800, fontSize: 24, color: '#A31400' }}>
          ${match.ticketPrice} <span style={{ fontSize: 14, color: '#B0AEAF', fontWeight: 400 }}>per ticket</span>
        </div>
        <div style={{ fontSize: 13, color: '#B0AEAF', marginTop: 4 }}>
          {(match.totalSeats || 0) - (match.bookedSeats || 0)} seats remaining
        </div>
      </div>

      <div className="card">
        <form onSubmit={submit}>
          <div className="form-group">
            <div className="label">Seat Number *</div>
            <input name="seatNumber" placeholder="e.g. A23, B14" value={form.seatNumber} onChange={handle} required autoFocus />
          </div>
          <div className="form-group">
            <div className="label">Payment Method *</div>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handle}>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div style={{ background: 'rgba(8,103,157,0.1)', borderRadius: 8, padding: 14, marginBottom: 20, border: '1px solid rgba(8,103,157,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#B0AEAF' }}>Ticket price</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>${match.ticketPrice}</span>
            </div>
          </div>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠ {error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: 16 }}>✓ {success}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking · $' + match.ticketPrice}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookTicket;
