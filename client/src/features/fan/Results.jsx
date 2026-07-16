import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/fan/results').then(r => setResults(r.data)).finally(() => setLoading(false));
  }, []);

  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div style={{ color: '#A9A9A9', padding: 40 }}>Loading results...</div>;

  return (
    <div>
      <h1 className="page-title">Match Results</h1>
      {results.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: '#A9A9A9', padding: 60 }}>No completed matches yet.</div>
        : <div style={{ display: 'grid', gap: 16 }}>
            {results.map(m => (
              <div key={m._id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                {m.isWorldCup && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#FF7A30,#F01818)' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="badge badge-gray">Completed</span>
                  {m.isWorldCup && <span className="badge badge-orange">🏆 WC 2026</span>}
                  <span style={{ color: '#A9A9A9', fontSize: 12 }}>{fmt(m.matchDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>🏴</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.homeTeam?.name}</div>
                  </div>
                  <div style={{ padding: '10px 20px', background: 'rgba(255,122,48,0.08)', borderRadius: 10, border: '1px solid rgba(255,122,48,0.15)', minWidth: 80, textAlign: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: 22 }}>{m.homeScore} - {m.awayScore}</span>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>🏴</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.awayTeam?.name}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 12, marginTop: 8, textAlign: 'center' }}>
                  <span style={{ color: '#A9A9A9', fontSize: 13 }}>📍 {m.stadium?.name}</span>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );
};

export default Results;