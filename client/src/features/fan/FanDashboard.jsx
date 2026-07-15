import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import UpcomingMatches from './UpcomingMatches';
import MatchDetails from './MatchDetails';
import BookTicket from './BookTicket';
import MyTickets from './MyTickets';
import MatchHistory from './MatchHistory';
import Results from './Results';
import TopPlayers from './TopPlayers';

const links = [
  {to:'/fan/matches',icon:'📅',label:'Upcoming Matches'},
  {to:'/fan/tickets',icon:'🎟️',label:'My Tickets'},
  {to:'/fan/history',icon:'📜',label:'Match History'},
  {to:'/fan/results',icon:'📊',label:'Results'},
  {to:'/fan/top-players',icon:'⭐',label:'Top Players'},
];

const FanDashboard = () => (
  <div style={{display:'flex',minHeight:'100vh',background:'#111'}}>
    <Sidebar links={links}/>
    <main style={{flex:1,marginLeft:240,padding:32,minHeight:'100vh'}}>
      <Routes>
        <Route index element={<Navigate to="matches" replace />}/>
        <Route path="matches" element={<UpcomingMatches />}/>
        <Route path="matches/:id" element={<MatchDetails />}/>
        <Route path="book/:matchId" element={<BookTicket />}/>
        <Route path="tickets" element={<MyTickets />}/>
        <Route path="history" element={<MatchHistory />}/>
        <Route path="results" element={<Results />}/>
        <Route path="top-players" element={<TopPlayers />}/>
      </Routes>
    </main>
  </div>
);
export default FanDashboard;