const User = require('../models/User');
const Fan = require('../models/Fan');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Stadium = require('../models/Stadium');
const Performance = require('../models/Performance');
const Training = require('../models/Training');
const Staff = require('../models/Staff');
const Supply = require('../models/Supply');
const Sponsor = require('../models/Sponsor');
const Coach = require('../models/Coach');
const mongoose = require('mongoose');

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/fans
const getAllFans = async (req, res, next) => {
  try {
    const fans = await Fan.find().populate('user', 'username isActive createdAt');
    res.json(fans);
  } catch (err) { next(err); }
};

// PATCH /api/admin/fans/:id/deactivate — replaces sp_DeactivateFan
const deactivateFan = async (req, res, next) => {
  try {
    const fan = await Fan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!fan) return res.status(404).json({ message: 'Fan not found' });
    await User.findByIdAndUpdate(fan.user, { isActive: false });
    res.json({ message: 'Fan deactivated' });
  } catch (err) { next(err); }
};

// ─── TEAM MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/teams — replaces vw_TeamsWithPlayerCount
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('homeStadium', 'name location')
      .sort({ name: 1 });
    // attach player count
    const result = await Promise.all(teams.map(async t => {
      const count = await Player.countDocuments({ team: t._id, isActive: true });
      return { ...t.toObject(), playerCount: count };
    }));
    res.json(result);
  } catch (err) { next(err); }
};

// POST /api/admin/teams — replaces sp_AddTeam
const addTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (err) { next(err); }
};

// PUT /api/admin/teams/:id — replaces sp_UpdateTeam
const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) { next(err); }
};

// PATCH /api/admin/teams/:id/deactivate — replaces sp_DeactivateTeam
const deactivateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deactivated' });
  } catch (err) { next(err); }
};

// ─── PLAYER MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/players
const getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().populate('team', 'name country');
    res.json(players);
  } catch (err) { next(err); }
};

// POST /api/admin/players — replaces sp_AddPlayer
const addPlayer = async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) { next(err); }
};

// PUT /api/admin/players/:id — replaces sp_UpdatePlayer
const updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) { next(err); }
};

// PATCH /api/admin/players/:id/transfer — replaces sp_TransferPlayer
const transferPlayer = async (req, res, next) => {
  try {
    const { newTeamId } = req.body;
    const player = await Player.findByIdAndUpdate(req.params.id, { team: newTeamId }, { new: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player transferred', player });
  } catch (err) { next(err); }
};

// POST /api/admin/players/:id/awards — replaces sp_AssignSeasonAwards
const assignAward = async (req, res, next) => {
  try {
    const { awardName, season } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $push: { awards: { awardName, season, awardedDate: new Date() } } },
      { new: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Award assigned', player });
  } catch (err) { next(err); }
};

// ─── STADIUM MANAGEMENT ───────────────────────────────────────────────────────

// GET /api/admin/stadiums
const getStadiums = async (req, res, next) => {
  try {
    const stadiums = await Stadium.find();
    res.json(stadiums);
  } catch (err) { next(err); }
};

// POST /api/admin/stadiums
const addStadium = async (req, res, next) => {
  try {
    const stadium = await Stadium.create(req.body);
    res.status(201).json(stadium);
  } catch (err) { next(err); }
};

// GET /api/admin/stadiums/usage — replaces vw_StadiumUsage
const getStadiumUsage = async (req, res, next) => {
  try {
    const usage = await Match.aggregate([
      { $group: { _id: '$stadium', matchCount: { $sum: 1 }, totalBookings: { $sum: '$bookedSeats' } } },
      { $lookup: { from: 'stadiums', localField: '_id', foreignField: '_id', as: 'stadium' } },
      { $unwind: '$stadium' },
      { $project: { name: '$stadium.name', location: '$stadium.location', capacity: '$stadium.capacity', matchCount: 1, totalBookings: 1 } },
      { $sort: { matchCount: -1 } },
    ]);
    res.json(usage);
  } catch (err) { next(err); }
};

// ─── MATCH MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/matches
const getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name country logoUrl')
      .populate('awayTeam', 'name country logoUrl')
      .populate('stadium', 'name location')
      .sort({ matchDate: -1 });
    res.json(matches);
  } catch (err) { next(err); }
};

// POST /api/admin/matches — replaces sp_ScheduleMatch
const scheduleMatch = async (req, res, next) => {
  try {
    const { homeTeam, awayTeam, stadium, matchDate, ticketPrice, totalSeats } = req.body;
    if (homeTeam === awayTeam) {
      return res.status(400).json({ message: 'Home and away teams must be different' });
    }
    // Conflict detection: same stadium same day
    const conflict = await Match.findOne({
      stadium,
      matchDate: {
        $gte: new Date(new Date(matchDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(matchDate).setHours(23, 59, 59, 999)),
      },
      status: { $ne: 'Cancelled' },
    });
    if (conflict) return res.status(400).json({ message: 'Stadium already booked on this date' });

    const match = await Match.create({
      homeTeam, awayTeam, stadium, matchDate, ticketPrice, totalSeats,
      statusLog: [{ oldStatus: null, newStatus: 'Scheduled', changedBy: req.user._id }],
    });
    res.status(201).json(match);
  } catch (err) { next(err); }
};

// PATCH /api/admin/matches/:id/finalize — replaces sp_FinalizeMatchResult
const finalizeMatch = async (req, res, next) => {
  try {
    const { homeScore, awayScore } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const oldStatus = match.status;
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = 'Completed';
    match.statusLog.push({ oldStatus, newStatus: 'Completed', changedBy: req.user._id });
    await match.save();
    res.json({ message: 'Match finalized', match });
  } catch (err) { next(err); }
};

// DELETE /api/admin/matches/:id/cancel
const cancelMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    const oldStatus = match.status;
    match.status = 'Cancelled';
    match.statusLog.push({ oldStatus, newStatus: 'Cancelled', changedBy: req.user._id });
    await match.save();
    res.json({ message: 'Match cancelled' });
  } catch (err) { next(err); }
};

// ─── PERFORMANCE ──────────────────────────────────────────────────────────────

// POST /api/admin/performance — replaces sp_RecordPerformance
const recordPerformance = async (req, res, next) => {
  try {
    const perf = await Performance.create(req.body);
    res.status(201).json(perf);
  } catch (err) { next(err); }
};

// GET /api/admin/performance/:matchId
const getMatchPerformance = async (req, res, next) => {
  try {
    const perfs = await Performance.find({ match: req.params.matchId })
      .populate('player', 'name position jerseyNumber')
      .populate('match', 'matchDate homeTeam awayTeam');
    res.json(perfs);
  } catch (err) { next(err); }
};

// ─── TRAINING ─────────────────────────────────────────────────────────────────

// GET /api/admin/training
const getTrainingSessions = async (req, res, next) => {
  try {
    const sessions = await Training.find()
      .populate('team', 'name')
      .populate('coach', 'name')
      .populate('attendance.player', 'name jerseyNumber')
      .sort({ scheduledDate: -1 });
    res.json(sessions);
  } catch (err) { next(err); }
};

// POST /api/admin/training — replaces sp_CreateTrainingSession
const createTraining = async (req, res, next) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json(training);
  } catch (err) { next(err); }
};

// PATCH /api/admin/training/:id/attendance
const updateAttendance = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndUpdate(
      req.params.id,
      { attendance: req.body.attendance },
      { new: true }
    );
    if (!training) return res.status(404).json({ message: 'Training session not found' });
    res.json(training);
  } catch (err) { next(err); }
};

// ─── STAFF ────────────────────────────────────────────────────────────────────

// GET /api/admin/staff — replaces vw_StaffByCategory
const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find({ isActive: true }).populate('team', 'name');
    res.json(staff);
  } catch (err) { next(err); }
};

// POST /api/admin/staff — replaces sp_AddStaff
const addStaff = async (req, res, next) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (err) { next(err); }
};

// ─── SUPPLIES ─────────────────────────────────────────────────────────────────

// GET /api/admin/supplies
const getSupplies = async (req, res, next) => {
  try {
    const supplies = await Supply.find().populate('assignedTo', 'name');
    res.json(supplies);
  } catch (err) { next(err); }
};

// GET /api/admin/supplies/low-stock — replaces vw_LowStockSupplies
const getLowStockSupplies = async (req, res, next) => {
  try {
    const supplies = await Supply.find({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } });
    res.json(supplies);
  } catch (err) { next(err); }
};

// POST /api/admin/supplies — replaces sp_AssignSupply
const addSupply = async (req, res, next) => {
  try {
    const supply = await Supply.create(req.body);
    res.status(201).json(supply);
  } catch (err) { next(err); }
};

// PUT /api/admin/supplies/:id
const updateSupply = async (req, res, next) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) return res.status(404).json({ message: 'Supply not found' });
    Object.assign(supply, req.body);
    await supply.save(); // triggers low-stock middleware
    res.json(supply);
  } catch (err) { next(err); }
};

// ─── SPONSORS ─────────────────────────────────────────────────────────────────

// GET /api/admin/sponsors
const getSponsors = async (req, res, next) => {
  try {
    const sponsors = await Sponsor.find({ isActive: true });
    res.json(sponsors);
  } catch (err) { next(err); }
};

// POST /api/admin/sponsors — replaces sp_AddSponsor
const addSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.create(req.body);
    res.status(201).json(sponsor);
  } catch (err) { next(err); }
};

// POST /api/admin/matches/:id/sponsors — replaces sp_LinkMatchSponsor
const linkSponsor = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { sponsors: req.body.sponsorId } },
      { new: true }
    ).populate('sponsors', 'name industry logoUrl');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Sponsor linked', match });
  } catch (err) { next(err); }
};

// DELETE /api/admin/matches/:id/sponsors/:sponsorId — replaces sp_UnlinkMatchSponsor
const unlinkSponsor = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { $pull: { sponsors: req.params.sponsorId } },
      { new: true }
    );
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Sponsor unlinked' });
  } catch (err) { next(err); }
};

// ─── COACHES ──────────────────────────────────────────────────────────────────

// GET /api/admin/coaches
const getCoaches = async (req, res, next) => {
  try {
    const coaches = await Coach.find().populate('team', 'name');
    res.json(coaches);
  } catch (err) { next(err); }
};

// POST /api/admin/coaches
const addCoach = async (req, res, next) => {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (err) { next(err); }
};

module.exports = {
  getAllFans, deactivateFan,
  getTeams, addTeam, updateTeam, deactivateTeam,
  getPlayers, addPlayer, updatePlayer, transferPlayer, assignAward,
  getStadiums, addStadium, getStadiumUsage,
  getMatches, scheduleMatch, finalizeMatch, cancelMatch,
  recordPerformance, getMatchPerformance,
  getTrainingSessions, createTraining, updateAttendance,
  getStaff, addStaff,
  getSupplies, getLowStockSupplies, addSupply, updateSupply,
  getSponsors, addSponsor, linkSponsor, unlinkSponsor,
  getCoaches, addCoach,
};
