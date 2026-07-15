import React, { useEffect, useState } from 'react';
import api from '../../api';
const MyTickets = () => {
  const [tickets, setTickets] = useState([]); const [loading, setLoading] = useState(true); const [cancelling, setCancelling] = useState(null);
  const load = () => api.get('/api/fan/tickets').then(r=>setTickets(r.data)).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);
  const cancel = async id => {
    if(!window.confirm('Cancel this ticket? Payment will be refunded.')) return;
    setCancelling(id);
    try { await api.delete(`/api/fan/tickets/${id}`); load(); }
    catch(err) { alert(err.response?.data?.message||'Cancel failed'); }
    finally { setCancelling(null); }
  };
  const fmt = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if(loading) return <div style={{color:'#A9A9A9',padding:40}}>Loading tickets...</div>;
  return (
    <div>
      <h1 className="page-title">My Tickets</h1>
      {tickets.length===0
        ?<div className="card" style={{textAlign:'center',color:'#A9A9A9',padding:60}}>No tickets yet. Book your first match! 🎟️</div>
        :<div style={{display:'grid',gap:16}}>
          {tickets.map(t=>(
            <div key={t._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,opacity:t.status==='Cancelled'?0.6:1}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{t.match?.homeTeam?.name} vs {t.match?.awayTeam?.name}</div>
                <div style={{color:'#A9A9A9',fontSize:13,marginBottom:2}}>📍 {t.match?.stadium?.name}</div>
                <div style={{color:'#A9A9A9',fontSize:13}}>📅 {fmt(t.match?.matchDate)} · Seat: <strong style={{color:'#fff'}}>{t.seatNumber}</strong></div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                <div style={{display:'flex',gap:8}}>
                  <span className={`badge badge-${t.status==='Active'?'green':'red'}`}>{t.status}</span>
                  <span className={`badge badge-${t.payment?.status==='Paid'?'orange':'gray'}`}>{t.payment?.status}</span>
                </div>
                <div style={{fontWeight:700,color:'#FF7A30'}}>${t.payment?.amount}</div>
                {t.status==='Active'&&t.match?.status==='Scheduled'&&(
                  <button className="btn btn-danger" style={{padding:'6px 14px',fontSize:12}} onClick={()=>cancel(t._id)} disabled={cancelling===t._id}>{cancelling===t._id?'Cancelling...':'Cancel'}</button>
                )}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
};
export default MyTickets;
