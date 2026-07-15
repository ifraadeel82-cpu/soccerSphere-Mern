const Match = require('../models/Match');
const Ticket = require('../models/Ticket');
const Fan = require('../models/Fan');
const mongoose = require('mongoose');

// GET /api/fan/matches/upcoming — replaces vw_UpcomingMatches
const getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      matchDate: { $gte: new Date() },
      status: 'Scheduled',
    })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location')
      .populate('sponsors', 'name logoUrl')
      .sort({ matchDate: 1 })
      .limit(20);
    res.json(matches);
  } catch (err) { next(err); }
};

// GET /api/fan/matches/:id — replaces vw_MatchDetails
const getMatchDetails = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location capacity')
      .populate('sponsors', 'name industry logoUrl');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) { next(err); }
};

// GET /api/fan/matches/history — replaces vw_FanMatchHistory
const getMatchHistory = async (req, res, next) => {
  try {
    const fan = await Fan.findOne({ user: req.user._id });
    if (!fan) return res.status(404).json({ message: 'Fan profile not found' });

    const tickets = await Ticket.find({ fan: fan._id, status: 'Active' })
      .populate({
        path: 'match',
        match: { status: 'Completed' },
        populate: [
          { path: 'homeTeam', select: 'name logoUrl' },
          { path: 'awayTeam', select: 'name logoUrl' },
          { path: 'stadium', select: 'name location' },
        ],
      })
      .sort({ createdAt: -1 });

    const history = tickets.filter(t => t.match !== null);
    res.json(history);
  } catch (err) { next(err); }
};

// POST /api/fan/tickets — Book a ticket (replaces sp_BookTicket)
const bookTicket = async (req, res, next) => {
  try {
    const { matchId, seatNumber, paymentMethod } = req.body;
    if (!matchId || !seatNumber || !paymentMethod) {
      return res.status(400).json({ message: 'matchId, seatNumber and paymentMethod required' });
    }

    const fan = await Fan.findOne({ user: req.user._id });
    if (!fan || !fan.isActive) {
      return res.status(403).json({ message: 'Fan account not found or inactive' });
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'Scheduled') {
      return res.status(400).json({ message: 'Match not available for booking' });
    }
    if (match.bookedSeats >= match.totalSeats) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Check duplicate seat
    const existingSeat = await Ticket.findOne({ match: matchId, seatNumber, status: 'Active' });
    if (existingSeat) {
      return res.status(400).json({ message: 'Seat already booked' });
    }

    const ticket = await Ticket.create({
      fan: fan._id,
      match: matchId,
      seatNumber,
      payment: { amount: match.ticketPrice, method: paymentMethod },
      log: [{ action: 'Booked', performedBy: req.user._id }],
    });

    match.bookedSeats += 1;
    await match.save();

    res.status(201).json({ message: 'Ticket booked successfully', ticket });
  } catch (err) {
    next(err);
  }
};

// GET /api/fan/tickets — Fan's tickets (replaces vw_FanTickets)
const getMyTickets = async (req, res, next) => {
  try {
    const fan = await Fan.findOne({ user: req.user._id });
    if (!fan) return res.status(404).json({ message: 'Fan not found' });

    const tickets = await Ticket.find({ fan: fan._id })
      .populate({
        path: 'match',
        populate: [
          { path: 'homeTeam', select: 'name logoUrl' },
          { path: 'awayTeam', select: 'name logoUrl' },
          { path: 'stadium', select: 'name location' },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) { next(err); }
};

// DELETE /api/fan/tickets/:id — Cancel ticket (replaces sp_CancelTicket)
const cancelTicket = async (req, res, next) => {
  try {
    const fan = await Fan.findOne({ user: req.user._id });
    const ticket = await Ticket.findById(req.params.id).populate('match');

    if (!ticket || ticket.fan.toString() !== fan._id.toString()) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ message: 'Ticket already cancelled' });
    }
    if (ticket.match.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel ticket for completed match' });
    }

    ticket.status = 'Cancelled';
    ticket.payment.status = 'Refunded';
    ticket.log.push({ action: 'Cancelled', performedBy: req.user._id });
    await ticket.save();

    await Match.findByIdAndUpdate(ticket.match._id, { $inc: { bookedSeats: -1 } });

    res.json({ message: 'Ticket cancelled and refunded' });
  } catch (err) {
    next(err);
  }
};

// GET /api/fan/results — All completed match results (public results, not just fan's own tickets)
const getAllResults = async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'Completed' })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location')
      .sort({ matchDate: -1 })
      .limit(30);
    res.json(matches);
  } catch (err) { next(err); }
};

// GET /api/fan/top-scorers — Top scoring players across all matches
const getTopScorers = async (req, res, next) => {
  try {
    const Performance = require('../models/Performance');
    const data = await Performance.aggregate([
      {
        $group: {
          _id: '$player',
          totalGoals: { $sum: '$goals' },
          totalAssists: { $sum: '$assists' },
          matchesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalGoals: -1, totalAssists: -1 } },
      { $limit: 15 },
      { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
      { $unwind: '$player' },
      { $lookup: { from: 'teams', localField: 'player.team', foreignField: '_id', as: 'team' } },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalGoals: 1,
          totalAssists: 1,
          matchesPlayed: 1,
          playerName: '$player.name',
          position: '$player.position',
          nationality: '$player.nationality',
          jerseyNumber: '$player.jerseyNumber',
          teamName: '$team.name',
        },
      },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { getUpcomingMatches, getMatchDetails, getMatchHistory, bookTicket, getMyTickets, cancelTicket, getAllResults, getTopScorers };