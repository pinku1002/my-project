import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MemoryStore } from 'express-session';  // Import MemoryStore
import routes from './routes/routes.js';  // Import your routes
import adminRoutes from './routes/admin.js';  // Admin routes if any
import appointmentRoutes from './routes/appointment.js';  // Appointment routes if any

dotenv.config();  // Load environment variables from .env file

// Get __filename and __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const uri = process.env.MONGO_URI;  // MongoDB connection URI

// MongoDB connection setup
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Views folder path

// Session setup using MemoryStore (not recommended for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',  // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 10 * 60 * 1000 },  // Set session cookie
  store: new MemoryStore(),  // Use MemoryStore for session storage
}));

// Authentication middleware (can be used to protect certain routes)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();  // User is authenticated, proceed to next middleware or route
  } else {
    return res.redirect('/login');  // Redirect to login page if not authenticated
  }
};

// Routes setup
app.use('/', routes);  // Root routes (public, login, signup, etc.)
app.use('/admin', isAuthenticated, adminRoutes);  // Admin routes (protected)
app.use('/appointments', isAuthenticated, appointmentRoutes);  // Appointment routes (protected)

// Static files (for CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Test route to check if server is working
app.get('/test', (req, res) => {
  res.send('Server is working!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send('Something went wrong!');
});

// If running locally, start the server on a specific port
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Vercel handler (for production)
export default app;
