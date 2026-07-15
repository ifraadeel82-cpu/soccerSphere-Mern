import React, { useEffect, useState } from 'react';
import api from '../../api';

const TopPlayers = () => {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/fan/top-scorers').then(r => setScorers(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#A9A9A9', padding: 40 }}>Loading player stats...</div>;

  return (
    <div>
      <h1 className="page-title">Top Players</h1>
      {scorers.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: '#A9A9A9', padding: 60 }}>No player stats recorded yet.</div>
        : <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr><th>#</th><th>Player</th><th>Team</th><th>Position</th><th>Goals</th><th>Assists</th><th>Matches</th></tr>
              </thead>
              <tbody>
                {scorers.map((s, i) => (
                  <tr key={s._id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? '#FF7A30' : i === 1 ? '#A9A9A9' : i === 2 ? '#cd7f32' : '#555' }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {s.playerName}
                      {s.jerseyNumber && <span style={{ color: '#A9A9A9', fontWeight: 400, fontSize: 12 }}> #{s.jerseyNumber}</span>}
                    </td>
                    <td style={{ color: '#A9A9A9' }}>{s.teamName || '—'}</td>
                    <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{s.position}</span></td>
                    <td><span className="badge badge-orange">{s.totalGoals} ⚽</span></td>
                    <td style={{ color: '#A9A9A9', fontWeight: 600 }}>{s.totalAssists}</td>
                    <td style={{ color: '#A9A9A9' }}>{s.matchesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
    </div>
  );
};

export default TopPlayers;