// middleware/authMiddleware.js

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      return next();  // Continue to the next middleware or route handler if logged in
  }
  req.session.error_msg = 'You need to log in first.';
  return res.redirect('/login');  // Redirect to login page if not authenticated
}

export function isDriver(req, res, next) {
  if (req.session && req.session.user && req.session.user.userType === 'Driver') {
      return next();  // Continue to the next middleware or route handler if user is a Driver
  }
  req.session.error_msg = 'Access denied. You must be a driver to access this page.';
  return res.redirect('/login');  // Redirect to login page if not a driver
}

export function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.userType === 'Admin') {
      return next();  // Continue to the next middleware or route handler if user is an Admin
  }
  req.session.error_msg = 'Access denied. You must be an admin to access this page.';
  return res.redirect('/login');  // Redirect to login page if not an admin
}
