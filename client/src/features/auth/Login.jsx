import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
const Login = () => {
  const navigate = useNavigate(); const { login } = useAuth();
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role==='ADMIN'?'/admin':'/fan');
    } catch(err) { setError(err.response?.data?.message||'Login failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111',padding:24}}>
      <div style={{position:'fixed',top:'20%',left:'10%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,122,48,0.08),transparent 70%)',pointerEvents:'none'}} />
      <div style={{position:'fixed',bottom:'20%',right:'10%',width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle,rgba(240,24,24,0.06),transparent 70%)',pointerEvents:'none'}} />
      <div style={{width:'100%',maxWidth:420,position:'relative'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <Link to="/" style={{textDecoration:'none'}}>
            <span style={{fontSize:40}}>⚽</span>
            <div style={{fontWeight:900,fontSize:26,background:'linear-gradient(135deg,#FF7A30,#F01818)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginTop:8}}>SoccerSphere</div>
          </Link>
          <p style={{color:'#A9A9A9',marginTop:8}}>Welcome back</p>
        </div>
        <div className="card" style={{boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
          <h2 style={{fontWeight:800,fontSize:22,marginBottom:24}}>Sign In</h2>
          <form onSubmit={submit}>
            <div className="form-group"><div className="label">Username</div><input name="username" placeholder="Enter username" value={form.username} onChange={handle} required autoFocus /></div>
            <div className="form-group"><div className="label">Password</div><input name="password" type="password" placeholder="Enter password" value={form.password} onChange={handle} required /></div>
            {error && <div className="error-msg" style={{marginBottom:16}}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15,marginTop:8}} disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
          </form>
          <p style={{textAlign:'center',marginTop:20,color:'#A9A9A9',fontSize:14}}>No account? <Link to="/register" style={{color:'#FF7A30',fontWeight:600,textDecoration:'none'}}>Register here</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;
