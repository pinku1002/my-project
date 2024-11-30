import express from 'express';
import { isAuthenticated, isDriver, isAdmin } from '../middleware/authMiddleware.js'; // Assuming middleware exists
import userController from '../controllers/userController.js';  // Import default export

const router = express.Router();

// Route for homepage (GET)
router.get('/home', userController.home_get);

// Route for signup page (GET)
router.get('/signup', userController.signup_get);

// POST route for signup (handling signup submission)
router.post('/signup', userController.signup_post);

// Route for login page (GET)
router.get('/login', userController.login_get);

// POST route for login (handling login submission)
router.post('/login', userController.login_post);

// Route for dashboard (GET) - Only accessible if logged in and if the user is a driver
router.get('/dashboard', isAuthenticated, userController.dashboard_get);

// Route for G2 Test Page - Only accessible to logged-in drivers
router.get('/g2_test', isAuthenticated, isDriver, userController.g2_test_get);

// POST route for G2 Test - Handling form submission (if any)
router.post('/g2_test', userController.g2_test_post);

// Route to get available slots
router.get('/get-available-slots', userController.getAvailableSlots);

// Route for g_page (GET) - Only accessible if logged in
router.get('/g_page', isAuthenticated, userController.g_page_get);

// Route for updating car details
router.post('/updateCarDetails', isAuthenticated, userController.updateCarDetails);

// Admin routes - Only accessible if the user is authenticated and an admin
router.get('/manageAppointment', isAuthenticated, isAdmin, userController.manageAppointment_get);  // Protected route for admins
router.post('/manageAppointment', isAuthenticated, isAdmin, userController.manageAppointment_post); // If you need a POST route for handling form submissions

// Route for logout (GET) - Log out the user
router.get('/logout', userController.logout_get);

router.use((req, res, next) => {
  res.locals.error_msg = req.session.error_msg || null;
  req.session.error_msg = null;  // Clear the error message after rendering
  res.locals.success_msg = req.session.success_msg || null;
  req.session.success_msg = null;  // Clear the success message after rendering
  next();
});

// Export the router as the default export (ES Module Syntax)
export default router;
