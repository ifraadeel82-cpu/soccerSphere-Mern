# SoccerSphere MERN Stack
## FIFA World Cup 2026 Football Management System

---

## SETUP INSTRUCTIONS (follow exactly in order)

### STEP 1 — Get MongoDB URI
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free → Create a free cluster
3. Click "Connect" → "Drivers" → Copy the connection string
4. It looks like: mongodb+srv://user:password@cluster.mongodb.net/soccersphere

### STEP 2 — Create your .env file
1. Go into the server/ folder
2. Copy .env.example and rename it to .env
3. Open .env and fill in:
   - MONGO_URI=your mongodb connection string from step 1
   - JWT_SECRET=anyrandomlongstring123456
   - PORT=5000
   - NODE_ENV=development

### STEP 3 — Install backend dependencies
Open terminal in VS Code, run:
  cd server
  npm install

### STEP 4 — Install frontend dependencies
Open a second terminal, run:
  cd client
  npm install

### STEP 5 — Seed the database (adds WC 2026 data)
In the server terminal:
  npm run seed

You should see:
  ✅ Seed complete!
  Admin → username: admin   password: admin123
  Fan   → username: fan1    password: fan123

### STEP 6 — Run the project (need 2 terminals open at same time)

Terminal 1 (backend):
  cd server
  npm run dev

Terminal 2 (frontend):
  cd client
  npm run dev

### STEP 7 — Open the app
Go to: http://localhost:5173

---

## LOGIN CREDENTIALS
| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| Fan   | fan1     | fan123    |
| Fan   | fan2     | fan123    |

---

## FEATURES
- Landing page with interactive football animation
- Fan: Register, Login, View Matches, Book Tickets, Cancel Tickets, Match History
- Admin: Manage Matches, Teams, Players, Fans, Training, Staff, Supplies, Sponsors, Stadiums
- World Cup 2026: Full fixture list, top scorers, standings, team management
- Analytics: Popular matches, active fans, top scorers charts, training attendance
- JWT Authentication with role-based access (ADMIN / FAN)
- Dark sporty theme with orange/red color palette

---

## PROJECT STRUCTURE
soccersphere-mern/
  server/           → Express + Node.js backend
    src/
      config/       → DB connection, JWT helpers
      controllers/  → Business logic (auth, fan, admin, analytics, worldcup)
      middleware/   → Auth check, error handler
      models/       → All 13 Mongoose schemas
      routes/       → API endpoints
      utils/        → Seed data script
    server.js       → Entry point
    .env            → YOUR config (never commit this)
    .env.example    → Template

  client/           → React frontend
    src/
      context/      → Auth state management
      features/     → Pages (landing, auth, fan, admin)
      components/   → Shared UI (Sidebar, MatchCard, StatCard)
      routes/       → Protected route definitions
      theme/        → Global CSS with color palette
    index.html
    vite.config.js

---

## API ENDPOINTS
POST   /api/auth/register         → Fan registration
POST   /api/auth/login            → Login (fan + admin)
GET    /api/auth/me               → Current user

GET    /api/fan/matches/upcoming  → Upcoming matches
GET    /api/fan/matches/:id       → Match details
POST   /api/fan/tickets           → Book ticket
GET    /api/fan/tickets           → My tickets
DELETE /api/fan/tickets/:id       → Cancel ticket
GET    /api/fan/matches/history   → Match history

GET    /api/admin/teams           → All teams
POST   /api/admin/teams           → Add team
GET    /api/admin/players         → All players
POST   /api/admin/players         → Add player
GET    /api/admin/matches         → All matches
POST   /api/admin/matches         → Schedule match
PATCH  /api/admin/matches/:id/finalize → Finalize result
GET    /api/admin/supplies/low-stock   → Low stock alert
... (full list in routes/ folder)

GET    /api/worldcup/matches/upcoming  → WC upcoming matches
GET    /api/worldcup/teams             → WC teams
GET    /api/worldcup/players/top-scorers → Golden boot
GET    /api/worldcup/standings         → Group standings

GET    /api/analytics/overview         → Dashboard stats
GET    /api/analytics/popular-matches  → Most booked
GET    /api/analytics/top-scorers      → Goals chart
GET    /api/analytics/training-attendance → Attendance %
