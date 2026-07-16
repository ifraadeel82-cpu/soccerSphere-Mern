import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';
const MatchDetails = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [match, setMatch] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(()=>{
    api.get(`/api/fan/matches/${id}`).then(r=>setMatch(r.data))
      .catch(()=>api.get(`/api/worldcup/matches/${id}`).then(r=>setMatch(r.data)))
      .finally(()=>setLoading(false));
  },[id]);
  if(loading) return <div style={{color:'#B0AEAF',padding:40}}>Loading...</div>;
  if(!match) return <div style={{color:'#A31400',padding:40}}>Match not found.</div>;
  const fmt = d => new Date(d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  return (
    <div style={{maxWidth:800}}>
      <button className="btn btn-ghost" style={{marginBottom:24}} onClick={()=>navigate(-1)}>← Back</button>
      <div className="card" style={{position:'relative',overflow:'hidden',marginBottom:20}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'linear-gradient(90deg,#A31400,#B46E5A)'}} />
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          <span className={`badge badge-${match.status==='Scheduled'?'orange':match.status==='Completed'?'gray':'red'}`}>{match.status}</span>
          {match.isWorldCup&&<span className="badge badge-orange">🏆 World Cup 2026</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 0'}}>
          <div style={{textAlign:'center',flex:1}}><div style={{fontSize:56,marginBottom:12}}>🏴</div><div style={{fontWeight:800,fontSize:22,color:'#FFFFFF'}}>{match.homeTeam?.name}</div><div style={{color:'#B0AEAF'}}>{match.homeTeam?.country}</div></div>
          <div style={{textAlign:'center',padding:'20px 30px',background:'rgba(8,103,157,0.1)',borderRadius:16,border:'1px solid rgba(8,103,157,0.25)'}}>
            {match.status==='Completed'?<div style={{fontWeight:900,fontSize:40,color:'#FFFFFF'}}>{match.homeScore} - {match.awayScore}</div>:<div style={{fontWeight:900,fontSize:28,color:'#08679D'}}>VS</div>}
            <div style={{color:'#B0AEAF',fontSize:13,marginTop:8}}>{match.status==='Completed'?'FINAL SCORE':'UPCOMING'}</div>
          </div>
          <div style={{textAlign:'center',flex:1}}><div style={{fontSize:56,marginBottom:12}}>🏴</div><div style={{fontWeight:800,fontSize:22,color:'#FFFFFF'}}>{match.awayTeam?.name}</div><div style={{color:'#B0AEAF'}}>{match.awayTeam?.country}</div></div>
        </div>
        <div style={{borderTop:'1px solid rgba(180,110,90,0.2)',paddingTop:20,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16}}>
          <div><div style={{color:'#B0AEAF',fontSize:12,marginBottom:4}}>DATE & TIME</div><div style={{fontWeight:600,fontSize:13,color:'#FFFFFF'}}>{fmt(match.matchDate)}</div></div>
          <div><div style={{color:'#B0AEAF',fontSize:12,marginBottom:4}}>STADIUM</div><div style={{fontWeight:600,color:'#FFFFFF'}}>{match.stadium?.name}</div></div>
          <div><div style={{color:'#B0AEAF',fontSize:12,marginBottom:4}}>LOCATION</div><div style={{fontWeight:600,color:'#FFFFFF'}}>{match.stadium?.location}</div></div>
          <div><div style={{color:'#B0AEAF',fontSize:12,marginBottom:4}}>TICKET PRICE</div><div style={{fontWeight:700,fontSize:16,color:'#A31400'}}>${match.ticketPrice}</div></div>
          <div><div style={{color:'#B0AEAF',fontSize:12,marginBottom:4}}>SEATS LEFT</div><div style={{fontWeight:600,color:'#FFFFFF'}}>{(match.totalSeats||0)-(match.bookedSeats||0)}</div></div>
        </div>
      </div>
      {match.sponsors?.length>0&&<div className="card" style={{marginBottom:20}}><div className="section-title">Sponsors</div><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{match.sponsors.map(s=><span key={s._id} className="badge badge-orange">{s.name}</span>)}</div></div>}
      {match.status==='Scheduled'&&<button className="btn btn-primary" style={{padding:'14px 32px',fontSize:15}} onClick={()=>navigate(`/fan/book/${match._id}`)}>🎟️ Book Ticket</button>}
    </div>
  );
};
export default MatchDetails;
