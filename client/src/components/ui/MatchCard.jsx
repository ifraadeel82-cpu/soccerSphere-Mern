import React from 'react';
import { useNavigate } from 'react-router-dom';
const MatchCard = ({ match, showBookBtn, basePath }) => {
  const navigate = useNavigate();
  const fmt = d => new Date(d).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 return (
    <div className="card" style={{position:'relative',overflow:'hidden',transition:'transform 0.2s,border-color 0.2s'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(163,20,0,0.35)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='rgba(180,110,90,0.2)';}}>
      {match.isWorldCup && <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#A31400,#B46E5A)'}} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <span className={`badge badge-${match.status==='Scheduled'?'orange':match.status==='Completed'?'gray':'red'}`}>{match.status}</span>
        {match.isWorldCup && <span className="badge badge-orange">🏆 WC 2026</span>}
        <span style={{color:'#B0AEAF',fontSize:12}}>{fmt(match.matchDate)}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0'}}>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:28,marginBottom:6}}>🏴</div>
          <div style={{fontWeight:700,fontSize:15,color:'#FFFFFF'}}>{match.homeTeam?.name}</div>
          <div style={{color:'#B0AEAF',fontSize:12}}>{match.homeTeam?.country}</div>
        </div>
        <div style={{padding:'10px 16px',background:'rgba(8,103,157,0.1)',borderRadius:10,border:'1px solid rgba(8,103,157,0.25)',textAlign:'center',minWidth:70}}>
          {match.status==='Completed'
            ? <span style={{fontWeight:900,fontSize:22,color:'#FFFFFF'}}>{match.homeScore} - {match.awayScore}</span>
            : <span style={{fontWeight:900,fontSize:18,color:'#08679D'}}>VS</span>}
        </div>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:28,marginBottom:6}}>🏴</div>
          <div style={{fontWeight:700,fontSize:15,color:'#FFFFFF'}}>{match.awayTeam?.name}</div>
          <div style={{color:'#B0AEAF',fontSize:12}}>{match.awayTeam?.country}</div>
        </div>
      </div>
      <div style={{borderTop:'1px solid rgba(180,110,90,0.2)',paddingTop:14,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <span style={{color:'#B0AEAF',fontSize:13}}>📍 {match.stadium?.name}</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{color:'#A31400',fontWeight:700}}>${match.ticketPrice}</span>
          {showBookBtn && match.status==='Scheduled' && (
            <button className="btn btn-primary" style={{padding:'6px 14px',fontSize:13}} onClick={()=>navigate(`${basePath}/book/${match._id}`)}>Book</button>
          )}
          <button className="btn btn-ghost" style={{padding:'6px 14px',fontSize:13}} onClick={()=>navigate(`${basePath}/matches/${match._id}`)}>Details</button>
        </div>
      </div>
    </div>
  );
};
export default MatchCard;
