import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const Sidebar = ({ links }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate('/'); };
  return (
    <aside style={{width:240,minHeight:'100vh',background:'#161616',borderRight:'1px solid #2a2a2a',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50}}>
      <div style={{padding:'24px 20px',borderBottom:'1px solid #2a2a2a'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:26}}>⚽</span>
          <span style={{fontWeight:900,fontSize:18,background:'linear-gradient(135deg,#FF7A30,#F01818)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SoccerSphere</span>
        </div>
        <div style={{marginTop:14,padding:'10px 12px',background:'rgba(255,122,48,0.08)',borderRadius:8,border:'1px solid rgba(255,122,48,0.15)'}}>
          <div style={{fontWeight:700,fontSize:14}}>{user?.name || user?.username}</div>
          <div style={{fontSize:12,color:'#FF7A30',fontWeight:600,marginTop:2}}>{user?.role}</div>
        </div>
      </div>
      <nav style={{flex:1,padding:'16px 12px',overflowY:'auto'}}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/admin' || l.to === '/fan'}
            style={({isActive}) => ({display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,marginBottom:4,textDecoration:'none',fontSize:14,fontWeight:500,transition:'all 0.15s',background:isActive?'rgba(255,122,48,0.12)':'transparent',color:isActive?'#FF7A30':'#A9A9A9',borderLeft:isActive?'3px solid #FF7A30':'3px solid transparent'})}>
            <span style={{fontSize:18}}>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div style={{padding:'16px 12px',borderTop:'1px solid #2a2a2a'}}>
        <button onClick={doLogout} className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>🚪 Logout</button>
      </div>
    </aside>
  );
};
export default Sidebar;
