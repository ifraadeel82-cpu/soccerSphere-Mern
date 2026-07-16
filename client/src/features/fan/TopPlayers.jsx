import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../api';

const TopPlayers = () => {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/fan/top-scorers').then(r => setScorers(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#B0AEAF', padding: 40 }}>Loading player stats...</div>;

  return (
  <div>
    <h1 className="page-title">Top Players</h1>
    {scorers.length === 0 ? (
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
        No player stats recorded yet.
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
              <th>#</th>
              <th>Player</th>
              <th>Team</th>
              <th>Position</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Matches</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s, i) => (
              <tr key={s._id}>
                <td>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color:
                        i === 0
                          ? '#A31400' // top rank accent
                          : i === 1
                          ? '#B0AEAF' // muted silver
                          : i === 2
                          ? '#B46E5A' // bronze-ish accent
                          : '#B0AEAF',
                    }}
                  >
                    {i + 1}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {s.playerName}
                  {s.jerseyNumber && (
                    <span
                      style={{
                        color: '#B0AEAF',
                        fontWeight: 400,
                        fontSize: 12,
                      }}
                    >
                      {' '}
                      #{s.jerseyNumber}
                    </span>
                  )}
                </td>
                <td style={{ color: '#B0AEAF' }}>
                  {s.teamName || '—'}
                </td>
                <td>
                  <span
                    className="badge badge-gray"
                    style={{ fontSize: 11 }}
                  >
                    {s.position}
                  </span>
                </td>
                <td>
                  <span className="badge badge-orange">
                    {s.totalGoals} ⚽
                  </span>
                </td>
                <td
                  style={{
                    color: '#B0AEAF',
                    fontWeight: 600,
                  }}
                >
                  {s.totalAssists}
                </td>
                <td style={{ color: '#B0AEAF' }}>
                  {s.matchesPlayed}
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

export default TopPlayers;