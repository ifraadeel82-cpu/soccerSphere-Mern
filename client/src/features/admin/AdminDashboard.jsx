import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import StatCard from '../../components/ui/StatCard';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const links = [
  {to:'/admin',icon:'📊',label:'Overview'},
  {to:'/admin/matches',icon:'⚽',label:'Matches'},
  {to:'/admin/teams',icon:'🏆',label:'Teams'},
  {to:'/admin/players',icon:'👟',label:'Players'},
  {to:'/admin/fans',icon:'👥',label:'Fans'},
  {to:'/admin/training',icon:'🏋️',label:'Training'},
  {to:'/admin/staff',icon:'👔',label:'Staff'},
  {to:'/admin/supplies',icon:'📦',label:'Supplies'},
  {to:'/admin/sponsors',icon:'💰',label:'Sponsors'},
  {to:'/admin/stadiums',icon:'🏟️',label:'Stadiums'},
  {to:'/admin/worldcup',icon:'🌍',label:'World Cup'},
  {to:'/admin/analytics',icon:'📈',label:'Analytics'},
];


const COLORS=['#FF7A30','#A31400','#FF6A21','#C10F10','#8D0A0A','#f59e0b','#22c55e'];
const TT = { contentStyle:{background:'#141B2B',border:'1px solid #2a2a2a',borderRadius:8,color:'#E2E8F0'} };


const Overview = () => {
  const [stats,setStats]=useState(null); const [revenue,setRevenue]=useState([]); const [scorers,setScorers]=useState([]);
  useEffect(()=>{
    api.get('/api/analytics/overview')
  .then(r => setStats(r.data));


api.get('/api/analytics/match-revenue')
  .then(r => setRevenue(Array.isArray(r.data) ? r.data.slice(0,6) : []));


api.get('/api/analytics/top-scorers')
  .then(r => setScorers(Array.isArray(r.data) ? r.data.slice(0,5) : []));
  },[]);
  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32}}>
        <StatCard icon="⚽" label="Total Matches" value={stats?.totalMatches??'—'} />
        <StatCard icon="👥" label="Active Fans" value={stats?.totalFans??'—'} color="#22c55e"/>
        <StatCard icon="🎟️" label="Tickets Sold" value={stats?.totalTickets??'—'} color="#F01818"/>
        <StatCard icon="💰" label="Revenue" value={stats?`$${stats.totalRevenue.toLocaleString()}`:'—'} color="#f59e0b"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <div className="section-title">Revenue by Match</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue.map(r=>({name:r.label?.substring(0,18),rev:r.revenue}))}>
              <XAxis dataKey="name" tick={{fill:'#B0AEAF',fontSize:10}}/><YAxis tick={{fill:'#A9A9A9',fontSize:10}}/>
              <Tooltip {...TT}/><Bar dataKey="rev" fill="#FF7A30" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Top Scorers Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={scorers} dataKey="totalGoals" nameKey="playerName" cx="50%" cy="50%" outerRadius={80} label={e=>e.playerName?.split(' ').pop()}>
              {scorers.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Pie><Tooltip {...TT}/></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


const Matches = () => {
  const [matches,setMatches]=useState([]); const [teams,setTeams]=useState([]); const [stadiums,setStadiums]=useState([]);
  const [form,setForm]=useState({homeTeam:'',awayTeam:'',stadium:'',matchDate:'',ticketPrice:'',totalSeats:''}); const [err,setErr]=useState('');
  const load=()=>{api.get('/api/admin/matches').then(r=>setMatches(r.data));api.get('/api/admin/teams').then(r=>setTeams(r.data));api.get('/api/admin/stadiums').then(r=>setStadiums(r.data));};
  useEffect(()=>{load();},[]);
  const schedule=async e=>{e.preventDefault();setErr('');try{await api.post('/api/admin/matches',form);load();setForm({homeTeam:'',awayTeam:'',stadium:'',matchDate:'',ticketPrice:'',totalSeats:''});}catch(e){setErr(e.response?.data?.message||'Failed');}};
  const finalize=async id=>{const hs=prompt('Home score:');const as=prompt('Away score:');if(hs===null||as===null)return;try{await api.patch(`/api/admin/matches/${id}/finalize`,{homeScore:+hs,awayScore:+as});load();}catch(e){alert(e.response?.data?.message||'Failed');}};
  const cancel=async id=>{if(!window.confirm('Cancel match?'))return;await api.patch(`/api/admin/matches/${id}/cancel`);load();};
  const fmt=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  return (
    <div>
      <h1 className="page-title">Match Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Schedule New Match</div>
        <form onSubmit={schedule}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            <div className="form-group"><div className="label">Home Team</div><select value={form.homeTeam} onChange={e=>setForm(p=>({...p,homeTeam:e.target.value}))} required><option value="">Select</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Away Team</div><select value={form.awayTeam} onChange={e=>setForm(p=>({...p,awayTeam:e.target.value}))} required><option value="">Select</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Stadium</div><select value={form.stadium} onChange={e=>setForm(p=>({...p,stadium:e.target.value}))} required><option value="">Select</option>{stadiums.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Date & Time</div><input type="datetime-local" value={form.matchDate} onChange={e=>setForm(p=>({...p,matchDate:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Ticket Price ($)</div><input type="number" placeholder="150" value={form.ticketPrice} onChange={e=>setForm(p=>({...p,ticketPrice:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Total Seats</div><input type="number" placeholder="50000" value={form.totalSeats} onChange={e=>setForm(p=>({...p,totalSeats:e.target.value}))} required /></div>
          </div>
          {err&&<div className="error-msg" style={{marginBottom:12}}>⚠ {err}</div>}
          <button type="submit" className="btn btn-primary">Schedule Match</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table><thead><tr><th>Match</th><th>Date</th><th>Stadium</th><th>Status</th><th>Tickets</th><th>Actions</th></tr></thead>
          <tbody>{matches.map(m=>(
            <tr key={m._id}>
              <td style={{fontWeight:600}}>{m.homeTeam?.name} vs {m.awayTeam?.name}</td>
              <td style={{color:'#B0AEAF',fontSize:13}}>{fmt(m.matchDate)}</td>
              <td style={{color:'#B0AEAF',fontSize:13}}>{m.stadium?.name}</td>
              <td><span className={`badge badge-${m.status==='Scheduled'?'orange':m.status==='Completed'?'gray':'red'}`}>{m.status}</span></td>
              <td>{m.bookedSeats}/{m.totalSeats}</td>
              <td style={{display:'flex',gap:6}}>
                {m.status==='Scheduled'&&<><button className="btn btn-primary" style={{padding:'5px 10px',fontSize:12}} onClick={()=>finalize(m._id)}>Finalize</button><button className="btn btn-danger" style={{padding:'5px 10px',fontSize:12}} onClick={()=>cancel(m._id)}>Cancel</button></>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};


const Teams = () => {
  const [teams,setTeams]=useState([]); const [form,setForm]=useState({name:'',country:'',founded:''});
  const load=()=>api.get('/api/admin/teams').then(r=>setTeams(r.data));
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/teams',form);load();setForm({name:'',country:'',founded:''});};
  const deactivate=async id=>{if(!window.confirm('Deactivate?'))return;await api.patch(`/api/admin/teams/${id}/deactivate`);load();};
  return (
    <div>
      <h1 className="page-title">Team Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Team</div>
        <form onSubmit={add} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Team Name</div><input placeholder="e.g. Real Madrid" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Country</div><input placeholder="e.g. Spain" value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Founded</div><input type="number" placeholder="1902" value={form.founded} onChange={e=>setForm(p=>({...p,founded:e.target.value}))} /></div>
          <button type="submit" className="btn btn-primary" style={{marginBottom:0}}>Add Team</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table><thead><tr><th>Name</th><th>Country</th><th>Founded</th><th>Players</th><th>WC</th><th>Action</th></tr></thead>
          <tbody>{teams.map(t=>(
            <tr key={t._id}><td style={{fontWeight:600}}>{t.name}</td><td style={{color:'#A9A9A9'}}>{t.country}</td><td style={{color:'#A9A9A9'}}>{t.founded}</td><td>{t.playerCount??0}</td><td>{t.isWorldCup&&<span className="badge badge-orange">WC</span>}</td>
            <td>{t.isActive&&<button className="btn btn-danger" style={{padding:'5px 10px',fontSize:12}} onClick={()=>deactivate(t._id)}>Deactivate</button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};


const Players = () => {
  const [players,setPlayers]=useState([]); const [teams,setTeams]=useState([]);
  const [form,setForm]=useState({name:'',team:'',position:'Forward',nationality:'',jerseyNumber:''});
  const load=()=>{api.get('/api/admin/players').then(r=>setPlayers(r.data));api.get('/api/admin/teams').then(r=>setTeams(r.data));};
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/players',form);load();setForm({name:'',team:'',position:'Forward',nationality:'',jerseyNumber:''});};
  const transfer=async id=>{const tid=prompt('New team ID:');if(!tid)return;await api.patch(`/api/admin/players/${id}/transfer`,{newTeamId:tid});load();};
  return (
    <div>
      <h1 className="page-title">Player Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Player</div>
        <form onSubmit={add}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
            <div className="form-group"><div className="label">Name</div><input placeholder="Player name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Team</div><select value={form.team} onChange={e=>setForm(p=>({...p,team:e.target.value}))}><option value="">No team</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Position</div><select value={form.position} onChange={e=>setForm(p=>({...p,position:e.target.value}))}>{['Goalkeeper','Defender','Midfielder','Forward'].map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="form-group"><div className="label">Nationality</div><input placeholder="Nationality" value={form.nationality} onChange={e=>setForm(p=>({...p,nationality:e.target.value}))} /></div>
            <div className="form-group"><div className="label">Jersey #</div><input type="number" placeholder="10" value={form.jerseyNumber} onChange={e=>setForm(p=>({...p,jerseyNumber:e.target.value}))} /></div>
          </div>
          <button type="submit" className="btn btn-primary">Add Player</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table><thead><tr><th>Name</th><th>Team</th><th>Position</th><th>Nationality</th><th>#</th><th>Action</th></tr></thead>
          <tbody>{players.map(p=>(
            <tr key={p._id}><td style={{fontWeight:600}}>{p.name}</td><td style={{color:'#A9A9A9'}}>{p.team?.name||'—'}</td><td><span className="badge badge-orange" style={{fontSize:11}}>{p.position}</span></td><td style={{color:'#A9A9A9'}}>{p.nationality}</td><td>{p.jerseyNumber}</td>
            <td><button className="btn btn-ghost" style={{padding:'5px 10px',fontSize:12}} onClick={()=>transfer(p._id)}>Transfer</button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};


const Fans = () => {
  const [fans,setFans]=useState([]);
  const load=()=>api.get('/api/admin/fans').then(r=>setFans(r.data));
  useEffect(()=>{load();},[]);
  const deactivate=async id=>{if(!window.confirm('Deactivate fan?'))return;await api.patch(`/api/admin/fans/${id}/deactivate`);load();};
  return (
    <div>
      <h1 className="page-title">Fan Management</h1>
      <div className="card" style={{overflow:'hidden'}}>
        <table><thead><tr><th>Name</th><th>Username</th><th>Contact</th><th>Registered</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{fans.map(f=>(
            <tr key={f._id}><td style={{fontWeight:600}}>{f.name}</td><td style={{color:'#A9A9A9'}}>{f.user?.username}</td><td style={{color:'#A9A9A9'}}>{f.contact||'—'}</td><td style={{color:'#A9A9A9'}}>{new Date(f.registeredDate).toLocaleDateString()}</td>
            <td><span className={`badge badge-${f.isActive?'green':'red'}`}>{f.isActive?'Active':'Inactive'}</span></td>
            <td>{f.isActive&&<button className="btn btn-danger" style={{padding:'5px 10px',fontSize:12}} onClick={()=>deactivate(f._id)}>Deactivate</button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};


const Training = () => {
  const [sessions,setSessions]=useState([]); const [teams,setTeams]=useState([]);
  const [form,setForm]=useState({title:'',team:'',scheduledDate:'',durationMinutes:90,location:''});
  const load=()=>{api.get('/api/admin/training').then(r=>setSessions(r.data));api.get('/api/admin/teams').then(r=>setTeams(r.data));};
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/training',form);load();setForm({title:'',team:'',scheduledDate:'',durationMinutes:90,location:''});};
  return (
    <div>
      <h1 className="page-title">Training Sessions</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Create Session</div>
        <form onSubmit={add}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            <div className="form-group"><div className="label">Title</div><input placeholder="Session title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Team</div><select value={form.team} onChange={e=>setForm(p=>({...p,team:e.target.value}))} required><option value="">Select</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Date & Time</div><input type="datetime-local" value={form.scheduledDate} onChange={e=>setForm(p=>({...p,scheduledDate:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Duration (min)</div><input type="number" value={form.durationMinutes} onChange={e=>setForm(p=>({...p,durationMinutes:e.target.value}))} /></div>
            <div className="form-group"><div className="label">Location</div><input placeholder="Training ground" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
          </div>
          <button type="submit" className="btn btn-primary">Create Session</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table><thead><tr><th>Title</th><th>Team</th><th>Date</th><th>Duration</th><th>Location</th><th>Attendance</th></tr></thead>
          <tbody>{sessions.map(s=>(
            <tr key={s._id}><td style={{fontWeight:600}}>{s.title}</td><td>{s.team?.name}</td><td style={{color:'#A9A9A9'}}>{new Date(s.scheduledDate).toLocaleDateString()}</td><td style={{color:'#A9A9A9'}}>{s.durationMinutes}min</td><td style={{color:'#A9A9A9'}}>{s.location||'—'}</td><td>{s.attendance?.filter(a=>a.attended).length||0}/{s.attendance?.length||0}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};


const Staff = () => {
  const [staff,setStaff]=useState([]); const [teams,setTeams]=useState([]);
  const [form,setForm]=useState({name:'',category:'',team:'',contact:''});
  const load=()=>{api.get('/api/admin/staff').then(r=>setStaff(r.data));api.get('/api/admin/teams').then(r=>setTeams(r.data));};
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/staff',form);load();setForm({name:'',category:'',team:'',contact:''});};
  return (
    <div>
      <h1 className="page-title">Staff Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Staff</div>
        <form onSubmit={add} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Name</div><input placeholder="Staff name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Category</div><input placeholder="e.g. Physiotherapist" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Team</div><select value={form.team} onChange={e=>setForm(p=>({...p,team:e.target.value}))}><option value="">No team</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Contact</div><input placeholder="Phone" value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} /></div>
          <button type="submit" className="btn btn-primary" style={{marginBottom:0}}>Add</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}><table><thead><tr><th>Name</th><th>Category</th><th>Team</th><th>Contact</th></tr></thead>
        <tbody>{staff.map(s=><tr key={s._id}><td style={{fontWeight:600}}>{s.name}</td><td><span className="badge badge-orange">{s.category}</span></td><td style={{color:'#A9A9A9'}}>{s.team?.name||'—'}</td><td style={{color:'#A9A9A9'}}>{s.contact||'—'}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
};


const Supplies = () => {
  const [supplies,setSupplies]=useState([]);
  const [form,setForm]=useState({name:'',category:'',quantity:'',unit:'units',lowStockThreshold:10});
  const load=()=>api.get('/api/admin/supplies').then(r=>setSupplies(r.data));
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/supplies',form);load();setForm({name:'',category:'',quantity:'',unit:'units',lowStockThreshold:10});};
  return (
    <div>
      <h1 className="page-title">Supplies Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Supply</div>
        <form onSubmit={add}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
            <div className="form-group"><div className="label">Name</div><input placeholder="Supply name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Category</div><input placeholder="e.g. Medical" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Quantity</div><input type="number" placeholder="0" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Unit</div><input placeholder="units" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} /></div>
            <div className="form-group"><div className="label">Alert Threshold</div><input type="number" value={form.lowStockThreshold} onChange={e=>setForm(p=>({...p,lowStockThreshold:e.target.value}))} /></div>
          </div>
          <button type="submit" className="btn btn-primary">Add Supply</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}><table><thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Status</th></tr></thead>
        <tbody>{supplies.map(s=>(
          <tr key={s._id}><td style={{fontWeight:600}}>{s.name}</td><td><span className="badge badge-gray">{s.category}</span></td>
          <td style={{fontWeight:700,color:s.quantity<=s.lowStockThreshold?'#F01818':'#22c55e'}}>{s.quantity}</td>
          <td style={{color:'#A9A9A9'}}>{s.unit}</td>
          <td>{s.quantity<=s.lowStockThreshold?<span className="badge badge-red">⚠ Low Stock</span>:<span className="badge badge-green">OK</span>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
};


const Sponsors = () => {
  const [sponsors,setSponsors]=useState([]); const [form,setForm]=useState({name:'',industry:'',contactEmail:''});
  const load=()=>api.get('/api/admin/sponsors').then(r=>setSponsors(r.data));
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/sponsors',form);load();setForm({name:'',industry:'',contactEmail:''});};
  return (
    <div>
      <h1 className="page-title">Sponsor Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Sponsor</div>
        <form onSubmit={add} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Name</div><input placeholder="Sponsor name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Industry</div><input placeholder="e.g. Sports" value={form.industry} onChange={e=>setForm(p=>({...p,industry:e.target.value}))} /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Email</div><input type="email" placeholder="contact@company.com" value={form.contactEmail} onChange={e=>setForm(p=>({...p,contactEmail:e.target.value}))} /></div>
          <button type="submit" className="btn btn-primary" style={{marginBottom:0}}>Add</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}><table><thead><tr><th>Name</th><th>Industry</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>{sponsors.map(s=><tr key={s._id}><td style={{fontWeight:600}}>{s.name}</td><td style={{color:'#A9A9A9'}}>{s.industry}</td><td style={{color:'#A9A9A9'}}>{s.contactEmail}</td><td><span className="badge badge-green">Active</span></td></tr>)}</tbody>
      </table></div>
    </div>
  );
};


const Stadiums = () => {
  const [stadiums,setStadiums]=useState([]); const [form,setForm]=useState({name:'',location:'',capacity:'',surface:'Grass'});
  const load=()=>api.get('/api/admin/stadiums').then(r=>setStadiums(r.data));
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/admin/stadiums',form);load();setForm({name:'',location:'',capacity:'',surface:'Grass'});};
  return (
    <div>
      <h1 className="page-title">Stadium Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Add Stadium</div>
        <form onSubmit={add} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Name</div><input placeholder="Stadium name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Location</div><input placeholder="City, Country" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Capacity</div><input type="number" placeholder="80000" value={form.capacity} onChange={e=>setForm(p=>({...p,capacity:e.target.value}))} required /></div>
          <div className="form-group" style={{flex:1,marginBottom:0}}><div className="label">Surface</div><select value={form.surface} onChange={e=>setForm(p=>({...p,surface:e.target.value}))}><option>Grass</option><option>Artificial</option><option>Hybrid</option></select></div>
          <button type="submit" className="btn btn-primary" style={{marginBottom:0}}>Add</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}><table><thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Surface</th></tr></thead>
        <tbody>{stadiums.map(s=><tr key={s._id}><td style={{fontWeight:600}}>{s.name}</td><td style={{color:'#A9A9A9'}}>{s.location}</td><td>{s.capacity?.toLocaleString()}</td><td><span className="badge badge-gray">{s.surface}</span></td></tr>)}</tbody>
      </table></div>
    </div>
  );
};


const WorldCupAdmin = () => {
  const [matches,setMatches]=useState([]); const [teams,setTeams]=useState([]); const [stadiums,setStadiums]=useState([]);
  const [form,setForm]=useState({homeTeam:'',awayTeam:'',stadium:'',matchDate:'',ticketPrice:'',totalSeats:''});
  const load=()=>{api.get('/api/worldcup/matches').then(r=>setMatches(r.data));api.get('/api/worldcup/teams').then(r=>setTeams(r.data));api.get('/api/admin/stadiums').then(r=>setStadiums(r.data));};
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();await api.post('/api/worldcup/matches',form);load();};
  const finalize=async id=>{const hs=prompt('Home score:');const as=prompt('Away score:');if(hs===null||as===null)return;await api.put(`/api/worldcup/matches/${id}`,{homeScore:+hs,awayScore:+as,status:'Completed'});load();};
  return (
    <div>
      <h1 className="page-title">🌍 World Cup 2026 Management</h1>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">Schedule WC Match</div>
        <form onSubmit={add}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            <div className="form-group"><div className="label">Home Team</div><select value={form.homeTeam} onChange={e=>setForm(p=>({...p,homeTeam:e.target.value}))} required><option value="">Select</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Away Team</div><select value={form.awayTeam} onChange={e=>setForm(p=>({...p,awayTeam:e.target.value}))} required><option value="">Select</option>{teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Stadium</div><select value={form.stadium} onChange={e=>setForm(p=>({...p,stadium:e.target.value}))} required><option value="">Select</option>{stadiums.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
            <div className="form-group"><div className="label">Date & Time</div><input type="datetime-local" value={form.matchDate} onChange={e=>setForm(p=>({...p,matchDate:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Ticket Price</div><input type="number" placeholder="250" value={form.ticketPrice} onChange={e=>setForm(p=>({...p,ticketPrice:e.target.value}))} required /></div>
            <div className="form-group"><div className="label">Total Seats</div><input type="number" placeholder="80000" value={form.totalSeats} onChange={e=>setForm(p=>({...p,totalSeats:e.target.value}))} required /></div>
          </div>
          <button type="submit" className="btn btn-primary">Schedule WC Match</button>
        </form>
      </div>
      <div className="card" style={{overflow:'hidden'}}><table><thead><tr><th>Match</th><th>Date</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
        <tbody>{matches.map(m=>(
          <tr key={m._id}><td style={{fontWeight:600}}>{m.homeTeam?.name} vs {m.awayTeam?.name}</td>
          <td style={{color:'#B0AEAF'}}>{new Date(m.matchDate).toLocaleDateString()}</td>
          <td><span className={`badge badge-${m.status==='Scheduled'?'orange':m.status==='Completed'?'gray':'red'}`}>{m.status}</span></td>
          <td>{m.status==='Completed'?`${m.homeScore} - ${m.awayScore}`:'—'}</td>
          <td>{m.status==='Scheduled'&&<button className="btn btn-primary" style={{padding:'5px 10px',fontSize:12}} onClick={()=>finalize(m._id)}>Finalize</button>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
};


const Analytics = () => {
  const [popular,setPopular]=useState([]); const [fans,setFans]=useState([]); const [scorers,setScorers]=useState([]); const [attendance,setAttendance]=useState([]);
  useEffect(()=>{
    api.get('/api/analytics/popular-matches').then(r=>setPopular(r.data));
    api.get('/api/analytics/most-active-fans').then(r=>setFans(r.data));
    api.get('/api/analytics/top-scorers').then(r=>setScorers(r.data));
    api.get('/api/analytics/training-attendance').then(r=>setAttendance(r.data));
  },[]);
  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div className="card"><div className="section-title">Popular Matches</div>
          <ResponsiveContainer width="100%" height={220}><BarChart data={popular.map(p=>({name:`${p.homeTeam} vs ${p.awayTeam}`.substring(0,16),tickets:p.ticketCount}))}>
            <XAxis dataKey="name" tick={{fill:'#B0AEAF',fontSize:10}}/><YAxis tick={{fill:'#B0AEAF',fontSize:10}}/><Tooltip {...TT}/><Bar dataKey="tickets" fill="#FF7A30" radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        </div>
        <div className="card"><div className="section-title">Most Active Fans</div>
          <ResponsiveContainer width="100%" height={220}><BarChart data={fans.map(f=>({name:f.fanName,tickets:f.ticketCount}))}>
            <XAxis dataKey="name" tick={{fill:'#B0AEAF',fontSize:10}}/><YAxis tick={{fill:'#B0AEAF',fontSize:10}}/><Tooltip {...TT}/><Bar dataKey="tickets" fill="#F01818" radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        </div>
        <div className="card"><div className="section-title">Top Scorers</div>
          <table><thead><tr><th>#</th><th>Player</th><th>Team</th><th>Goals</th><th>Assists</th></tr></thead>
            <tbody>{scorers.map((s,i)=><tr key={i}><td style={{fontWeight:800,color:i===0?'#FF7A30':i===1?'#A9A9A9':'#cd7f32'}}>{i+1}</td><td style={{fontWeight:600}}>{s.playerName}</td><td style={{color:'#B0AEAF'}}>{s.teamName||'—'}</td><td><span className="badge badge-orange">{s.totalGoals} ⚽</span></td><td style={{color:'#B0AEAF'}}>{s.totalAssists}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card"><div className="section-title">Training Attendance %</div>
          <ResponsiveContainer width="100%" height={220}><BarChart data={attendance.map(a=>({name:a.title?.substring(0,14),pct:Math.round(a.attendancePercent)}))}>
            <XAxis dataKey="name" tick={{fill:'#B0AEAF',fontSize:10}}/><YAxis domain={[0,100]} tick={{fill:'#B0AEAF',fontSize:10}}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Bar dataKey="pct" fill="#22c55e" radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


const AdminDashboard = () => (
  <div style={{display:'flex',minHeight:'100vh',background:'#0f1724'}}>
    <Sidebar links={links}/>
    <main style={{flex:1,marginLeft:240,padding:32,minHeight:'100vh'}}>
      <Routes>
        <Route index element={<Overview />}/>
        <Route path="matches" element={<Matches />}/>
        <Route path="teams" element={<Teams />}/>
        <Route path="players" element={<Players />}/>
        <Route path="fans" element={<Fans />}/>
        <Route path="training" element={<Training />}/>
        <Route path="staff" element={<Staff />}/>
        <Route path="supplies" element={<Supplies />}/>
        <Route path="sponsors" element={<Sponsors />}/>
        <Route path="stadiums" element={<Stadiums />}/>
        <Route path="worldcup" element={<WorldCupAdmin />}/>
        <Route path="analytics" element={<Analytics />}/>
        <Route path="*" element={<Navigate to="/admin" replace />}/>
      </Routes>
    </main>
  </div>
);
export default AdminDashboard;