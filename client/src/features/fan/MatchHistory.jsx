import React, { useEffect, useState } from 'react';
import api from '../../api';
const MatchHistory = () => {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(()=>{ api.get('/api/fan/matches/history').then(r=>setHistory(r.data)).finally(()=>setLoading(false)); },[]);
  const fmt = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if(loading) return <div style={{color:'#A9A9A9',padding:40}}>Loading history...</div>;
  return (
    <div>
      <h1 className="page-title">Match History</h1>
      {history.length===0
        ?<div className="card" style={{textAlign:'center',color:'#A9A9A9',padding:60}}>No completed matches attended yet.</div>
        :<div className="card" style={{overflow:'hidden'}}>
          <table>
            <thead><tr><th>Match</th><th>Date</th><th>Stadium</th><th>Seat</th><th>Score</th><th>Paid</th></tr></thead>
            <tbody>{history.map(t=>(
              <tr key={t._id}>
                <td style={{fontWeight:600}}>{t.match?.homeTeam?.name} vs {t.match?.awayTeam?.name}</td>
                <td style={{color:'#A9A9A9'}}>{fmt(t.match?.matchDate)}</td>
                <td style={{color:'#A9A9A9'}}>{t.match?.stadium?.name}</td>
                <td><span className="badge badge-orange">{t.seatNumber}</span></td>
                <td style={{fontWeight:700}}>{t.match?.homeScore} - {t.match?.awayScore}</td>
                <td style={{color:'#FF7A30',fontWeight:700}}>${t.payment?.amount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
    </div>
  );
};
export default MatchHistory;
