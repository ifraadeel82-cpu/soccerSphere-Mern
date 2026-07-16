import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import StatCard from '../../components/ui/StatCard';
import api from '../../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const links = [
  { to: '/admin', icon: '📊', label: 'Overview' },
  { to: '/admin/matches', icon: '⚽', label: 'Matches' },
  { to: '/admin/teams', icon: '🏆', label: 'Teams' },
  { to: '/admin/players', icon: '👟', label: 'Players' },
  { to: '/admin/fans', icon: '👥', label: 'Fans' },
  { to: '/admin/training', icon: '🏋️', label: 'Training' },
  { to: '/admin/staff', icon: '👔', label: 'Staff' },
  { to: '/admin/supplies', icon: '📦', label: 'Supplies' },
  { to: '/admin/sponsors', icon: '💰', label: 'Sponsors' },
  { to: '/admin/stadiums', icon: '🏟️', label: 'Stadiums' },
  { to: '/admin/worldcup', icon: '🌍', label: 'World Cup' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

const COLORS = ['#A31400', '#B46E5A', '#f59e0b', '#22c55e', '#818CF8', '#FBBF24', '#4ADE80'];

const TT = {
  contentStyle: {
    background: '#141B2B',
    border: '1px solid rgba(180,110,90,0.35)',
    borderRadius: 8,
    color: '#E2E8F0',
  },
};

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [scorers, setScorers] = useState([]);

  useEffect(() => {
    api.get('/api/analytics/overview').then(r => setStats(r.data));

    api
      .get('/api/analytics/match-revenue')
      .then(r => setRevenue(Array.isArray(r.data) ? r.data.slice(0, 6) : []));

    api
      .get('/api/analytics/top-scorers')
      .then(r => setScorers(Array.isArray(r.data) ? r.data.slice(0, 5) : []));
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard icon="⚽" label="Total Matches" value={stats?.totalMatches ?? '—'} />
        <StatCard icon="👥" label="Active Fans" value={stats?.totalFans ?? '—'} color="#22c55e" />
        <StatCard icon="🎟️" label="Tickets Sold" value={stats?.totalTickets ?? '—'} color="#A31400" />
        <StatCard
          icon="💰"
          label="Revenue"
          value={stats ? `$${stats.totalRevenue.toLocaleString()}` : '—'}
          color="#f59e0b"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="section-title">Revenue by Match</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={revenue.map(r => ({
                name: r.label?.substring(0, 18),
                rev: r.revenue,
              }))}
            >
              <XAxis dataKey="name" tick={{ fill: '#B0AEAF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#B0AEAF', fontSize: 10 }} />
              <Tooltip {...TT} />
              <Bar dataKey="rev" fill="#A31400" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Top Scorers Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={scorers}
                dataKey="totalGoals"
                nameKey="playerName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={e => e.playerName?.split(' ').pop()}
              >
                {scorers.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [form, setForm] = useState({
    homeTeam: '',
    awayTeam: '',
    stadium: '',
    matchDate: '',
    ticketPrice: '',
    totalSeats: '',
  });
  const [err, setErr] = useState('');

  const load = () => {
    api.get('/api/admin/matches').then(r => setMatches(r.data));
    api.get('/api/admin/teams').then(r => setTeams(r.data));
    api.get('/api/admin/stadiums').then(r => setStadiums(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const schedule = async e => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/admin/matches', form);
      load();
      setForm({
        homeTeam: '',
        awayTeam: '',
        stadium: '',
        matchDate: '',
        ticketPrice: '',
        totalSeats: '',
      });
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
    }
  };

  const finalize = async id => {
    const hs = prompt('Home score:');
    const as = prompt('Away score:');
    if (hs === null || as === null) return;
    try {
      await api.patch(`/api/admin/matches/${id}/finalize`, {
        homeScore: +hs,
        awayScore: +as,
      });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  const cancel = async id => {
    if (!window.confirm('Cancel match?')) return;
    await api.patch(`/api/admin/matches/${id}/cancel`);
    load();
  };

  const fmt = d =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div>
      <h1 className="page-title">Match Management</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Schedule New Match</div>
        <form onSubmit={schedule}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
              gap: 12,
            }}
          >
            {/* form unchanged */}
            {/* ... */}
          </div>
          {err && (
            <div className="error-msg" style={{ marginBottom: 12 }}>
              ⚠ {err}
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            Schedule Match
          </button>
        </form>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Date</th>
              <th>Stadium</th>
              <th>Status</th>
              <th>Tickets</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <tr key={m._id}>
                <td style={{ fontWeight: 600, color: '#E2E8F0' }}>
                  {m.homeTeam?.name} vs {m.awayTeam?.name}
                </td>
                <td style={{ color: '#B0AEAF', fontSize: 13 }}>{fmt(m.matchDate)}</td>
                <td style={{ color: '#B0AEAF' }}>{m.stadium?.name}</td>
                <td>
                  <span
                    className={`badge badge-${
                      m.status === 'Scheduled'
                        ? 'orange'
                        : m.status === 'Completed'
                        ? 'gray'
                        : 'red'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td style={{ color: '#E2E8F0' }}>
                  {m.bookedSeats}/{m.totalSeats}
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {m.status === 'Scheduled' && (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          backgroundColor: '#A31400',
                        }}
                        onClick={() => finalize(m._id)}
                      >
                        Finalize
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          backgroundColor: '#A31400',
                        }}
                        onClick={() => cancel(m._id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// For brevity, the remaining sections only show palette tweaks.
// Apply the same pattern: primary text #E2E8F0, secondary #B0AEAF,
// accents #A31400 / #f59e0b / #22c55e, and keep cards using your shared CSS.

const Teams = () => {
  // ...logic unchanged...
  return (
    <div>
      <h1 className="page-title">Team Management</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        {/* form unchanged */}
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Founded</th>
              <th>Players</th>
              <th>WC</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600, color: '#E2E8F0' }}>{t.name}</td>
                <td style={{ color: '#B0AEAF' }}>{t.country}</td>
                <td style={{ color: '#B0AEAF' }}>{t.founded}</td>
                <td style={{ color: '#E2E8F0' }}>{t.playerCount ?? 0}</td>
                <td>
                  {t.isWorldCup && (
                    <span className="badge badge-orange">WC</span>
                  )}
                </td>
                <td>
                  {t.isActive && (
                    <button
                      className="btn btn-danger"
                      style={{
                        padding: '5px 10px',
                        fontSize: 12,
                        backgroundColor: '#A31400',
                      }}
                      onClick={() => deactivate(t._id)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Players, Fans, Training, Staff, Supplies, Sponsors, Stadiums, WorldCupAdmin, Analytics
// follow the same text color + accent adjustments as above.

const AdminDashboard = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0F172A',
    }}
  >
    <Sidebar links={links} />
    <main
      style={{
        flex: 1,
        marginLeft: 240,
        padding: 32,
        minHeight: '100vh',
      }}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="matches" element={<Matches />} />
        <Route path="teams" element={<Teams />} />
        <Route path="players" element={<Players />} />
        <Route path="fans" element={<Fans />} />
        <Route path="training" element={<Training />} />
        <Route path="staff" element={<Staff />} />
        <Route path="supplies" element={<Supplies />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="stadiums" element={<Stadiums />} />
        <Route path="worldcup" element={<WorldCupAdmin />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </main>
  </div>
);

export default AdminDashboard;