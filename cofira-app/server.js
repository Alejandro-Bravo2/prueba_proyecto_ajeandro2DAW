const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Secret key for JWT (In production, use environment variable)
const SECRET_KEY = 'cofira-secret-key-2025';
const SALT_ROUNDS = 10;

// Helper functions
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}

function isAuthenticated(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  const decoded = verifyToken(token);

  if (decoded) {
    req.userId = decoded.id;
    return true;
  }
  return false;
}

// Read database
function getDb() {
  const dbPath = path.join(__dirname, 'db.json');
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

// Write database
function saveDb(db) {
  const dbPath = path.join(__dirname, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Middleware
server.use(jsonServer.bodyParser);
server.use(middlewares);

// CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register endpoint
server.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password y nombre son requeridos' });
    }

    const db = getDb();

    // Check if user exists
    const existingUser = db.users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = {
      id: String(Date.now()),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    // Create token
    const token = createToken({ id: newUser.id, email: newUser.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// Login endpoint
server.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    const db = getDb();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Create token
    const token = createToken({ id: user.id, email: user.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Protected routes middleware
server.use(/^(?!\/auth).*$/, (req, res, next) => {
  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Verify authentication for all other routes
  if (req.method !== 'GET' || req.path.includes('/users')) {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'No autenticado. Token inválido o expirado.' });
    }
  }

  next();
});

// Use default router
server.use(router);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server is running on http://localhost:${PORT}`);
  console.log('📝 Auth endpoints:');
  console.log('   POST http://localhost:${PORT}/auth/register');
  console.log('   POST http://localhost:${PORT}/auth/login');
});
