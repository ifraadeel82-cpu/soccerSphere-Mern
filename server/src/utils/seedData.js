require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Fan = require('../models/Fan');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Stadium = require('../models/Stadium');
const Match = require('../models/Match');
const Sponsor = require('../models/Sponsor');
const Coach = require('../models/Coach');
const Supply = require('../models/Supply');
const Staff = require('../models/Staff');
const Performance = require('../models/Performance');
const Ticket = require('../models/Ticket');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');
  await Promise.all([User.deleteMany(), Fan.deleteMany(), Team.deleteMany(), Player.deleteMany(), Stadium.deleteMany(), Match.deleteMany(), Sponsor.deleteMany(), Coach.deleteMany(), Supply.deleteMany(), Staff.deleteMany(), Performance.deleteMany(), Ticket.deleteMany()]);

  const adminUser = await User.create({ username: 'admin', passwordHash: 'admin123', role: 'ADMIN' });
  const fan1User = await User.create({ username: 'fan1', passwordHash: 'fan123', role: 'FAN' });
  const fan2User = await User.create({ username: 'fan2', passwordHash: 'fan123', role: 'FAN' });
  const fan1 = await Fan.create({ user: fan1User._id, name: 'Ahmed Khan', contact: '03001234567' });
  const fan2 = await Fan.create({ user: fan2User._id, name: 'Sara Ali', contact: '03009876543' });

  const metlife = await Stadium.create({ name: 'MetLife Stadium', location: 'New Jersey, USA', capacity: 82500, surface: 'Grass' });
  const dallas = await Stadium.create({ name: 'AT&T Stadium', location: 'Dallas, USA', capacity: 80000, surface: 'Artificial' });
  const sofi = await Stadium.create({ name: 'SoFi Stadium', location: 'Los Angeles, USA', capacity: 70240, surface: 'Grass' });
  const rose = await Stadium.create({ name: 'Rose Bowl', location: 'Pasadena, USA', capacity: 92542, surface: 'Grass' });

  const adidas = await Sponsor.create({ name: 'Adidas', industry: 'Sports', contactEmail: 'adidas@sponsor.com' });
  const visa = await Sponsor.create({ name: 'Visa', industry: 'Finance', contactEmail: 'visa@sponsor.com' });
  const coca = await Sponsor.create({ name: 'Coca-Cola', industry: 'Beverage', contactEmail: 'coca@sponsor.com' });

  const brazil = await Team.create({ name: 'Brazil', country: 'Brazil', founded: 1914, homeStadium: metlife._id, isWorldCup: true });
  const argentina = await Team.create({ name: 'Argentina', country: 'Argentina', founded: 1893, homeStadium: dallas._id, isWorldCup: true });
  const france = await Team.create({ name: 'France', country: 'France', founded: 1904, homeStadium: sofi._id, isWorldCup: true });
  const england = await Team.create({ name: 'England', country: 'England', founded: 1863, homeStadium: metlife._id, isWorldCup: true });
  const germany = await Team.create({ name: 'Germany', country: 'Germany', founded: 1900, homeStadium: dallas._id, isWorldCup: true });
  const spain = await Team.create({ name: 'Spain', country: 'Spain', founded: 1909, homeStadium: sofi._id, isWorldCup: true });
  const portugal = await Team.create({ name: 'Portugal', country: 'Portugal', founded: 1914, homeStadium: rose._id, isWorldCup: true });
  const morocco = await Team.create({ name: 'Morocco', country: 'Morocco', founded: 1955, homeStadium: rose._id, isWorldCup: true });

  const [vinicius, rodrygo, casemiro, messi, alvarez, mbappe, griezmann, bellingham, kane, musiala, pedri, yamal, ronaldo, bruno] = await Player.create([
    { name: 'Vinicius Jr', team: brazil._id, position: 'Forward', nationality: 'Brazilian', jerseyNumber: 7, isWorldCup: true },
    { name: 'Rodrygo', team: brazil._id, position: 'Forward', nationality: 'Brazilian', jerseyNumber: 11, isWorldCup: true },
    { name: 'Casemiro', team: brazil._id, position: 'Midfielder', nationality: 'Brazilian', jerseyNumber: 5, isWorldCup: true },
    { name: 'Lionel Messi', team: argentina._id, position: 'Forward', nationality: 'Argentine', jerseyNumber: 10, isWorldCup: true },
    { name: 'Julian Alvarez', team: argentina._id, position: 'Forward', nationality: 'Argentine', jerseyNumber: 9, isWorldCup: true },
    { name: 'Kylian Mbappe', team: france._id, position: 'Forward', nationality: 'French', jerseyNumber: 10, isWorldCup: true },
    { name: 'Antoine Griezmann', team: france._id, position: 'Midfielder', nationality: 'French', jerseyNumber: 7, isWorldCup: true },
    { name: 'Jude Bellingham', team: england._id, position: 'Midfielder', nationality: 'English', jerseyNumber: 10, isWorldCup: true },
    { name: 'Harry Kane', team: england._id, position: 'Forward', nationality: 'English', jerseyNumber: 9, isWorldCup: true },
    { name: 'Jamal Musiala', team: germany._id, position: 'Midfielder', nationality: 'German', jerseyNumber: 10, isWorldCup: true },
    { name: 'Pedri', team: spain._id, position: 'Midfielder', nationality: 'Spanish', jerseyNumber: 8, isWorldCup: true },
    { name: 'Lamine Yamal', team: spain._id, position: 'Forward', nationality: 'Spanish', jerseyNumber: 19, isWorldCup: true },
    { name: 'Cristiano Ronaldo', team: portugal._id, position: 'Forward', nationality: 'Portuguese', jerseyNumber: 7, isWorldCup: true },
    { name: 'Bruno Fernandes', team: portugal._id, position: 'Midfielder', nationality: 'Portuguese', jerseyNumber: 8, isWorldCup: true },
  ]);

  await Supply.create([
    { name: 'Football Boots', category: 'Equipment', quantity: 50, unit: 'pairs', lowStockThreshold: 10 },
    { name: 'Water Bottles', category: 'Medical', quantity: 8, unit: 'units', lowStockThreshold: 20 },
    { name: 'Training Jerseys', category: 'Equipment', quantity: 100, unit: 'units', lowStockThreshold: 20 },
    { name: 'First Aid Kits', category: 'Medical', quantity: 5, unit: 'kits', lowStockThreshold: 10 },
  ]);

  await Staff.create([
    { name: 'Dr. Hassan', category: 'Physiotherapist', contact: '0300111' },
    { name: 'Coach Ali', category: 'Assistant Coach', team: brazil._id, contact: '0300222' },
  ]);

  const now = new Date();
  const [matchBraArg, matchFraEng, matchGerSpa, matchPorMor, matchArgFra, matchEngGer] = await Match.create([
    { homeTeam: brazil._id, awayTeam: argentina._id, stadium: metlife._id, matchDate: new Date(now.getTime() + 2*86400000), ticketPrice: 250, totalSeats: 82500, status: 'Scheduled', sponsors: [adidas._id, visa._id], isWorldCup: true },
    { homeTeam: france._id, awayTeam: england._id, stadium: dallas._id, matchDate: new Date(now.getTime() + 4*86400000), ticketPrice: 200, totalSeats: 80000, status: 'Scheduled', sponsors: [visa._id, coca._id], isWorldCup: true },
    { homeTeam: germany._id, awayTeam: spain._id, stadium: sofi._id, matchDate: new Date(now.getTime() + 6*86400000), ticketPrice: 180, totalSeats: 70240, status: 'Scheduled', sponsors: [adidas._id], isWorldCup: true },
    { homeTeam: portugal._id, awayTeam: morocco._id, stadium: rose._id, matchDate: new Date(now.getTime() + 8*86400000), ticketPrice: 220, totalSeats: 92542, status: 'Scheduled', sponsors: [coca._id, adidas._id], isWorldCup: true },
    { homeTeam: argentina._id, awayTeam: france._id, stadium: metlife._id, matchDate: new Date(now.getTime() - 3*86400000), ticketPrice: 300, totalSeats: 82500, bookedSeats: 0, status: 'Completed', homeScore: 2, awayScore: 1, sponsors: [adidas._id, visa._id], isWorldCup: true },
    { homeTeam: england._id, awayTeam: germany._id, stadium: dallas._id, matchDate: new Date(now.getTime() - 6*86400000), ticketPrice: 220, totalSeats: 80000, bookedSeats: 0, status: 'Completed', homeScore: 1, awayScore: 3, sponsors: [coca._id], isWorldCup: true },
  ]);

  // Performance stats — tied to the two completed matches above
  // Match 1: Argentina 2 - 1 France
  await Performance.create([
    { player: messi._id, match: matchArgFra._id, goals: 1, assists: 1, minutesPlayed: 90, rating: 8.5 },
    { player: alvarez._id, match: matchArgFra._id, goals: 1, assists: 0, minutesPlayed: 90, rating: 7.8 },
    { player: mbappe._id, match: matchArgFra._id, goals: 1, assists: 0, minutesPlayed: 90, rating: 7.5 },
    { player: griezmann._id, match: matchArgFra._id, goals: 0, assists: 1, minutesPlayed: 85, rating: 7.0 },
  ]);

  // Match 2: England 1 - 3 Germany
  await Performance.create([
    { player: musiala._id, match: matchEngGer._id, goals: 2, assists: 0, minutesPlayed: 90, rating: 9.0 },
    { player: kane._id, match: matchEngGer._id, goals: 1, assists: 0, minutesPlayed: 90, rating: 7.2 },
    { player: bellingham._id, match: matchEngGer._id, goals: 0, assists: 1, minutesPlayed: 90, rating: 7.6 },
  ]);

  // Extra historical-style stats for other players (no real match tie needed for demo depth)
  await Performance.create([
    { player: vinicius._id, match: matchArgFra._id, goals: 0, assists: 0, minutesPlayed: 0, rating: null },
    { player: ronaldo._id, match: matchEngGer._id, goals: 0, assists: 0, minutesPlayed: 0, rating: null },
  ]);

  // Ticket bookings — needed for Match Revenue, Popular Matches, and Most Active Fans charts
  const tickets = await Ticket.create([
    // Fan1 bookings across both completed matches
    { fan: fan1._id, match: matchArgFra._id, seatNumber: 'A1', payment: { amount: 300, method: 'Card' }, log: [{ action: 'Booked' }] },
    { fan: fan1._id, match: matchArgFra._id, seatNumber: 'A2', payment: { amount: 300, method: 'Card' }, log: [{ action: 'Booked' }] },
    { fan: fan1._id, match: matchEngGer._id, seatNumber: 'B1', payment: { amount: 220, method: 'Online' }, log: [{ action: 'Booked' }] },
    // Fan2 bookings
    { fan: fan2._id, match: matchArgFra._id, seatNumber: 'A3', payment: { amount: 300, method: 'Cash' }, log: [{ action: 'Booked' }] },
    { fan: fan2._id, match: matchEngGer._id, seatNumber: 'B2', payment: { amount: 220, method: 'Card' }, log: [{ action: 'Booked' }] },
    { fan: fan2._id, match: matchEngGer._id, seatNumber: 'B3', payment: { amount: 220, method: 'Card' }, log: [{ action: 'Booked' }] },
    // A booking on an upcoming scheduled match too
    { fan: fan1._id, match: matchBraArg._id, seatNumber: 'C1', payment: { amount: 250, method: 'Online' }, log: [{ action: 'Booked' }] },
  ]);

  // Sync bookedSeats count on each match to match actual ticket counts
  await Match.findByIdAndUpdate(matchArgFra._id, { bookedSeats: 3 });
  await Match.findByIdAndUpdate(matchEngGer._id, { bookedSeats: 3 });
  await Match.findByIdAndUpdate(matchBraArg._id, { bookedSeats: 1 });

  console.log('✅ Seed complete!');
  console.log('Admin → username: admin   password: admin123');
  console.log('Fan   → username: fan1    password: fan123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
