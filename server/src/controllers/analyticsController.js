const Match = require('../models/Match');
const Ticket = require('../models/Ticket');
const Performance = require('../models/Performance');
const Training = require('../models/Training');
const Fan = require('../models/Fan');

// GET /api/analytics/popular-matches — replaces vw_PopularMatches
const getPopularMatches = async (req, res, next) => {
  try {
    const data = await Ticket.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$match', ticketCount: { $sum: 1 }, revenue: { $sum: '$payment.amount' } } },
      { $sort: { ticketCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'matches', localField: '_id', foreignField: '_id', as: 'match',
        },
      },
      { $unwind: '$match' },
      {
        $lookup: {
          from: 'teams', localField: 'match.homeTeam', foreignField: '_id', as: 'homeTeam',
        },
      },
      {
        $lookup: {
          from: 'teams', localField: 'match.awayTeam', foreignField: '_id', as: 'awayTeam',
        },
      },
      { $unwind: '$homeTeam' },
      { $unwind: '$awayTeam' },
      {
        $project: {
          ticketCount: 1,
          revenue: 1,
          matchDate: '$match.matchDate',
          status: '$match.status',
          homeTeam: '$homeTeam.name',
          awayTeam: '$awayTeam.name',
        },
      },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/analytics/most-active-fans — replaces vw_MostActiveFans
const getMostActiveFans = async (req, res, next) => {
  try {
    const data = await Ticket.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$fan', ticketCount: { $sum: 1 }, totalSpent: { $sum: '$payment.amount' } } },
      { $sort: { ticketCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'fans', localField: '_id', foreignField: '_id', as: 'fan',
        },
      },
      { $unwind: '$fan' },
      {
        $project: {
          ticketCount: 1,
          totalSpent: 1,
          fanName: '$fan.name',
          contact: '$fan.contact',
        },
      },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/analytics/top-scorers — replaces vw_TopScorers
const getTopScorers = async (req, res, next) => {
  try {
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
      { $limit: 10 },
      {
        $lookup: {
          from: 'players', localField: '_id', foreignField: '_id', as: 'player',
        },
      },
      { $unwind: '$player' },
      {
        $lookup: {
          from: 'teams', localField: 'player.team', foreignField: '_id', as: 'team',
        },
      },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalGoals: 1,
          totalAssists: 1,
          matchesPlayed: 1,
          playerName: '$player.name',
          position: '$player.position',
          jerseyNumber: '$player.jerseyNumber',
          teamName: '$team.name',
        },
      },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/analytics/training-attendance — replaces vw_TrainingAttendance
const getTrainingAttendance = async (req, res, next) => {
  try {
    const data = await Training.aggregate([
      { $unwind: '$attendance' },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          scheduledDate: { $first: '$scheduledDate' },
          team: { $first: '$team' },
          total: { $sum: 1 },
          attended: { $sum: { $cond: ['$attendance.attended', 1, 0] } },
        },
      },
      {
        $project: {
          title: 1,
          scheduledDate: 1,
          team: 1,
          total: 1,
          attended: 1,
          attendancePercent: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$attended', '$total'] }, 100] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'teams', localField: 'team', foreignField: '_id', as: 'teamInfo',
        },
      },
      { $unwind: { path: '$teamInfo', preserveNullAndEmptyArrays: true } },
      { $addFields: { teamName: '$teamInfo.name' } },
      { $sort: { scheduledDate: -1 } },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/analytics/match-revenue — revenue per match
const getMatchRevenue = async (req, res, next) => {
  try {
    const data = await Ticket.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: '$match',
          revenue: { $sum: '$payment.amount' },
          ticketsSold: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'matches', localField: '_id', foreignField: '_id', as: 'match',
        },
      },
      { $unwind: '$match' },
      {
        $lookup: {
          from: 'teams', localField: 'match.homeTeam', foreignField: '_id', as: 'homeTeam',
        },
      },
      {
        $lookup: {
          from: 'teams', localField: 'match.awayTeam', foreignField: '_id', as: 'awayTeam',
        },
      },
      { $unwind: '$homeTeam' },
      { $unwind: '$awayTeam' },
      {
        $project: {
          revenue: 1,
          ticketsSold: 1,
          matchDate: '$match.matchDate',
          label: { $concat: ['$homeTeam.name', ' vs ', '$awayTeam.name'] },
        },
      },
      { $sort: { matchDate: -1 } },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/analytics/overview — dashboard summary cards
const getOverview = async (req, res, next) => {
  try {
    const [totalMatches, totalFans, totalTickets, revenueResult] = await Promise.all([
      Match.countDocuments(),
      Fan.countDocuments({ isActive: true }),
      Ticket.countDocuments({ status: 'Active' }),
      Ticket.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } },
      ]),
    ]);
    res.json({
      totalMatches,
      totalFans,
      totalTickets,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getPopularMatches,
  getMostActiveFans,
  getTopScorers,
  getTrainingAttendance,
  getMatchRevenue,
  getOverview,
};