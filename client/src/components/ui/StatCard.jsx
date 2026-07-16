import React from 'react';
const StatCard = ({ icon, label, value, color='#A31400', sub }) => (
  <div className="card" style={{position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},transparent)`}} />
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
      <div>
        <div style={{color:'#B0AEAF',fontSize:13,fontWeight:500,marginBottom:8}}>{label}</div>
        <div style={{fontSize:32,fontWeight:900,color}}>{value}</div>
        {sub && <div style={{fontSize:12,color:'#B0AEAF',marginTop:4,opacity:0.7}}>{sub}</div>}
      </div>
      <div style={{fontSize:32,opacity:0.6}}>{icon}</div>
    </div>
  </div>
);
export default StatCard;
