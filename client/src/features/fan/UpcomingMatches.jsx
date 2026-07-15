import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MatchCard from '../../components/ui/MatchCard';
const UpcomingMatches = () => {
  const [matches, setMatches] = useState([]); const [wc, setWc] = useState([]);
  const [loading, setLoading] = useState(true); const [tab, setTab] = useState('all');
  useEffect(()=>{
    Promise.all([axios.get('/api/fan/matches/upcoming'),axios.get('/api/worldcup/matches/upcoming')])
      .then(([r1,r2])=>{setMatches(r1.data);setWc(r2.data);}).finally(()=>setLoading(false));
  },[]);
  const display = tab==='wc'?wc:matches;
  if(loading) return <div style={{color:'#A9A9A9',padding:40}}>Loading matches...</div>;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 className="page-title" style={{marginBottom:0}}>Upcoming Matches</h1>
        <div style={{display:'flex',gap:8}}>
          {['all','wc'].map(t=><button key={t} onClick={()=>setTab(t)} className={`btn ${tab===t?'btn-primary':'btn-ghost'}`} style={{padding:'8px 16px',fontSize:13}}>{t==='all'?'📅 All Matches':'🏆 World Cup 2026'}</button>)}
        </div>
      </div>
      {display.length===0
        ?<div className="card" style={{textAlign:'center',color:'#A9A9A9',padding:60}}>No upcoming matches found.</div>
        :<div style={{display:'grid',gap:20}}>{display.map(m=><MatchCard key={m._id} match={m} showBookBtn basePath="/fan"/>)}</div>}
    </div>
  );
};
export default UpcomingMatches;
