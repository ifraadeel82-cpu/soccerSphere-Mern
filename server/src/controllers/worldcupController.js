const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Performance = require('../models/Performance');

// All World Cup data is stored in the same collections
// but flagged with isWorldCup: true on matches
// and a worldCup: true flag on teams/players

// GET /api/worldcup/matches/upcoming
const getWCUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      isWorldCup: true,
      matchDate: { $gte: new Date() },
      status: 'Scheduled',
    })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location')
      .sort({ matchDate: 1 });
    res.json(matches);
  } catch (err) { next(err); }
};

// GET /api/worldcup/matches
const getWCMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ isWorldCup: true })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location')
      .sort({ matchDate: 1 });
    res.json(matches);
  } catch (err) { next(err); }
};

// GET /api/worldcup/matches/:id
const getWCMatchById = async (req, res, next) => {
  try {
    const match = await Match.findOne({ _id: req.params.id, isWorldCup: true })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location capacity')
      .populate('sponsors', 'name logoUrl');
    if (!match) return res.status(404).json({ message: 'World Cup match not found' });
    res.json(match);
  } catch (err) { next(err); }
};

// GET /api/worldcup/teams
const getWCTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ isWorldCup: true, isActive: true })
      .populate('homeStadium', 'name location')
      .sort({ name: 1 });
    res.json(teams);
  } catch (err) { next(err); }
};

// GET /api/worldcup/players/top-scorers
const getWCTopScorers = async (req, res, next) => {
  try {
    // Only performances in WC matches
    const wcMatches = await Match.find({ isWorldCup: true }).select('_id');
    const wcMatchIds = wcMatches.map(m => m._id);

    const data = await Performance.aggregate([
      { $match: { match: { $in: wcMatchIds } } },
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
      { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
      { $unwind: '$player' },
      { $lookup: { from: 'teams', localField: 'player.team', foreignField: '_id', as: 'team' } },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalGoals: 1, totalAssists: 1, matchesPlayed: 1,
          playerName: '$player.name',
          nationality: '$player.nationality',
          position: '$player.position',
          jerseyNumber: '$player.jerseyNumber',
          teamName: '$team.name',
          teamLogoUrl: '$team.logoUrl',
        },
      },
    ]);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/worldcup/standings — group standings by country
const getWCStandings = async (req, res, next) => {
  try {
    const wcMatches = await Match.find({ isWorldCup: true, status: 'Completed' })
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl');

    // Build standings map
    const standings = {};
    wcMatches.forEach(m => {
      const homeId = m.homeTeam._id.toString();
      const awayId = m.awayTeam._id.toString();

      if (!standings[homeId]) standings[homeId] = { team: m.homeTeam, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      if (!standings[awayId]) standings[awayId] = { team: m.awayTeam, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };

      standings[homeId].played++;
      standings[awayId].played++;
      standings[homeId].goalsFor += m.homeScore || 0;
      standings[homeId].goalsAgainst += m.awayScore || 0;
      standings[awayId].goalsFor += m.awayScore || 0;
      standings[awayId].goalsAgainst += m.homeScore || 0;

      if (m.homeScore > m.awayScore) {
        standings[homeId].won++; standings[homeId].points += 3;
        standings[awayId].lost++;
      } else if (m.homeScore < m.awayScore) {
        standings[awayId].won++; standings[awayId].points += 3;
        standings[homeId].lost++;
      } else {
        standings[homeId].drawn++; standings[homeId].points++;
        standings[awayId].drawn++; standings[awayId].points++;
      }
    });

    const result = Object.values(standings).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
    res.json(result);
  } catch (err) { next(err); }
};

// POST /api/worldcup/matches — admin creates WC match
const createWCMatch = async (req, res, next) => {
  try {
    const match = await Match.create({ ...req.body, isWorldCup: true });
    res.status(201).json(match);
  } catch (err) { next(err); }
};

// PUT /api/worldcup/matches/:id — admin updates WC match
const updateWCMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) { next(err); }
};

// POST /api/worldcup/teams — admin creates WC team
const createWCTeam = async (req, res, next) => {
  try {
    const team = await Team.create({ ...req.body, isWorldCup: true });
    res.status(201).json(team);
  } catch (err) { next(err); }
};

module.exports = {
  getWCUpcomingMatches, getWCMatches, getWCMatchById,
  getWCTeams, getWCTopScorers, getWCStandings,
  createWCMatch, updateWCMatch, createWCTeam,
};