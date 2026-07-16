import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../api';

const MatchHistory = () => {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(()=>{ api.get('/api/fan/matches/history').then(r=>setHistory(r.data)).finally(()=>setLoading(false)); },[]);
  const fmt = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if (loading) {
  return (
    <div style={{ color: '#B0AEAF', padding: 40 }}>
      Loading history...
    </div>
  );
}

return (
  <div>
    <h1 className="page-title">Match History</h1>
    {history.length === 0 ? (
      <div
        className="card"
        style={{
          textAlign: 'center',
          color: '#B0AEAF',
          padding: 60,
          background: '#141B2B',
          border: '1px solid rgba(180,110,90,0.35)',
        }}
      >
        No completed matches attended yet.
      </div>
    ) : (
      <div
        className="card"
        style={{
          overflow: 'hidden',
          background: '#141B2B',
          border: '1px solid rgba(180,110,90,0.35)',
        }}
      >
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Date</th>
              <th>Stadium</th>
              <th>Seat</th>
              <th>Score</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {history.map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {t.match?.homeTeam?.name} vs {t.match?.awayTeam?.name}
                </td>
                <td style={{ color: '#B0AEAF' }}>
                  {fmt(t.match?.matchDate)}
                </td>
                <td style={{ color: '#B0AEAF' }}>
                  {t.match?.stadium?.name}
                </td>
                <td>
                  <span className="badge badge-orange">{t.seatNumber}</span>
                </td>
                <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {t.match?.homeScore} - {t.match?.awayScore}
                </td>
                <td
                  style={{
                    color: '#A31400', // main accent for paid amount
                    fontWeight: 700,
                  }}
                >
                  ${t.payment?.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};
export default MatchHistory;
