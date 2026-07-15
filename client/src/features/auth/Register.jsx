import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
const Register = () => {
  const navigate = useNavigate(); const { login } = useAuth();
  const [form, setForm] = useState({ username:'', password:'', confirm:'', name:'', contact:'', address:'' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); setError('');
    if(form.password!==form.confirm) return setError('Passwords do not match');
    if(form.password.length<6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register',{username:form.username,password:form.password,name:form.name,contact:form.contact,address:form.address});
      login(res.data.token,res.data.user); navigate('/fan');
    } catch(err) { setError(err.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111',padding:24}}>
      <div style={{position:'fixed',top:'15%',right:'10%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,122,48,0.08),transparent 70%)',pointerEvents:'none'}} />
      <div style={{width:'100%',maxWidth:480,position:'relative'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Link to="/" style={{textDecoration:'none'}}>
            <span style={{fontSize:36}}>⚽</span>
            <div style={{fontWeight:900,fontSize:24,background:'linear-gradient(135deg,#FF7A30,#F01818)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginTop:6}}>SoccerSphere</div>
          </Link>
          <p style={{color:'#A9A9A9',marginTop:6}}>Create your fan account</p>
        </div>
        <div className="card" style={{boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
          <h2 style={{fontWeight:800,fontSize:22,marginBottom:24}}>Register</h2>
          <form onSubmit={submit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group"><div className="label">Username *</div><input name="username" placeholder="Username" value={form.username} onChange={handle} required autoFocus /></div>
              <div className="form-group"><div className="label">Full Name *</div><input name="name" placeholder="Your full name" value={form.name} onChange={handle} required /></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group"><div className="label">Password *</div><input name="password" type="password" placeholder="Min 6 chars" value={form.password} onChange={handle} required /></div>
              <div className="form-group"><div className="label">Confirm Password *</div><input name="confirm" type="password" placeholder="Re-enter" value={form.confirm} onChange={handle} required /></div>
            </div>
            <div className="form-group"><div className="label">Contact</div><input name="contact" placeholder="Phone number" value={form.contact} onChange={handle} /></div>
            <div className="form-group"><div className="label">Address</div><input name="address" placeholder="Your address" value={form.address} onChange={handle} /></div>
            {error && <div className="error-msg" style={{marginBottom:16}}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
          </form>
          <p style={{textAlign:'center',marginTop:20,color:'#A9A9A9',fontSize:14}}>Already have an account? <Link to="/login" style={{color:'#FF7A30',fontWeight:600,textDecoration:'none'}}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Register;
