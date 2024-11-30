// Use ES module syntax consistently
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { MemoryStore } from 'express-session';
import dotenv from 'dotenv';
import routes from './routes/routes.js';  // Import your routes
import adminRoutes from './routes/admin.js';  // Admin routes if any
import appointmentRoutes from './routes/appointment.js';  // Appointment routes if any

// Load environment variables from .env file
dotenv.config();

// MongoDB Atlas connection URI
const uri = process.env.MONGO_URI;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);  // Get the resolved path to the file
const __dirname = path.dirname(__filename);  // Get the name of the directory

// Create the express app
const app = express();

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected to Atlas (cardatabase)'))
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);  // Exit process if DB connection fails
  });

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
  secret: 'your-secret-key',  // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 10 * 60 * 1000 },  // Set session cookie to expire in 10 minutes
  store: new MemoryStore({
    checkPeriod: 10 * 60 * 1000,  // Clean expired sessions every 10 minutes
  }),
}));

// Session middleware to make user data available in views
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;  // Make user session data available in all views
  }
  next();
});

// Authentication middleware (can be used to protect certain routes)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();  // User is authenticated, proceed to next middleware or route
  } else {
    return res.redirect('/login');  // Redirect to login page if not authenticated
  }
};

// Use routes
app.use('/', routes);  // Root routes
app.use('/admin', isAuthenticated, adminRoutes);  // Admin routes (protected)
app.use('/appointments', appointmentRoutes);  // Appointment routes

// Static files (for CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware (catch-all for unhandled errors)
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send('Something went wrong!');
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
