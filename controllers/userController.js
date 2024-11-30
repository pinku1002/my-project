

import bcrypt from 'bcrypt';
import User from '../models/userModel.js';  // Assuming you have a user model that handles user data
import Appointment from '../models/appointmentModel.js';

class Controller {



    // GET: Display Home Page
    static home_get = (req, res) => {
        const userLoggedIn = req.session.user ? true : false;
        const username = userLoggedIn ? req.session.user.username : null; // Pass username if logged in
        res.render('home.ejs', { userLoggedIn, username });
    };



    static signup_get = (req, res) => {
        const error_msg = req.session.error_msg || null;  // Fetch error message from session (if any)
        const success_msg = req.session.success_msg || null;  // Fetch success message from session (if any)

        req.session.error_msg = null;  // Clear error message after rendering
        req.session.success_msg = null;  // Clear success message after rendering

        res.render('signup', { error_msg, success_msg });  // Pass both error_msg and success_msg to the view
    };

    // POST: Handle SignUp Form
    static signup_post = async (req, res) => {
        try {
            const { username, password, confirmPassword, userType } = req.body;

            console.log('Signup Request:', { username, password, confirmPassword, userType });

            // Validate that passwords match
            if (password !== confirmPassword) {
                req.session.error_msg = 'Passwords do not match!';
                return res.redirect('/signup');
            }

            // Check if the username already exists in the DB
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                req.session.error_msg = 'Username already taken!';
                return res.redirect('/signup');
            }

            // Create new user with the username, password, and userType
            const newUser = new User({
                username,
                password,  // password will be hashed automatically
                userType,
            });

            // Save the new user to the DB
            await newUser.save();
            console.log('New user created:', newUser.username);

            // Success message and redirect to login page
            req.session.success_msg = 'Signup successful! Please log in.';
            res.redirect('/login');
        } catch (err) {
            console.log('Error during signup:', err);
            req.session.error_msg = 'Error occurred during signup process.';
            res.redirect('/signup');
        }
    }

    static login_get = (req, res) => {
        const error_msg = req.session.error_msg || null;  // Fetch error message from session (if any)
        const success_msg = req.session.success_msg || null;  // Fetch success message from session (if any)

        req.session.error_msg = null;  // Clear error message after rendering
        req.session.success_msg = null;  // Clear success message after rendering

        res.render('login', { action: 'login', error_msg, success_msg });
    };

    static login_post = async (req, res) => {
        try {
            const { username, password } = req.body;

            // Find the user by username
            const user = await User.findOne({ username });
            if (!user) {
                req.session.error_msg = 'User not found. Please sign up first.';
                return res.redirect('/signup');
            }

            // Compare the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                req.session.error_msg = 'Invalid password. Please try again.';
                return res.redirect('/login');
            }

            // Store user info in session
            req.session.user = {
                userId: user._id,
                username: user.username,
                userType: user.userType,
                firstname: user.firstname,
                lastname: user.lastname,
                licenseNo: user.licenseNo,
                age: user.age,
                car_details: user.car_details || null,  // No need for a separate Car model as car details are embedded
            };

            console.log("User data after login:", req.session.user);  // Logging the user data for debugging

            // After successful login, redirect to dashboard (not user-type specific)
            return res.redirect('/dashboard');
        } catch (err) {
            console.error('Error during login:', err);
            req.session.error_msg = 'An error occurred during login.';
            res.redirect('/login');
        }
    };
    // GET: Display Dashboard (only accessible by logged-in users)
    static dashboard_get = (req, res) => {
        // Extract user info from session
        const user = req.session.user;

        // Check if the user is logged in (if there's a user in the session)
        const userLoggedIn = user ? true : false;

        // Render the dashboard and pass the necessary data to the view
        res.render('dashboard', { user, userLoggedIn });
    }

    static async g2_test_get(req, res) {
        try {
            // Fetch userLoggedIn data from session
            const userLoggedIn = req.session.user; 
            console.log('User logged in:', userLoggedIn);
    
            // Redirect to login if no user is logged in
            if (!userLoggedIn) {
                console.log('No user logged in. Redirecting to login.');
                return res.redirect('/login');
            }
    
            // Default to today's date if no date is provided
            const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
            console.log('Selected Date (Original):', selectedDate);
    
            // Clone selectedDate before modifying
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0); 
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);
    
            // Convert to UTC if necessary
            const startOfDayUTC = new Date(startOfDay.toISOString());
            const endOfDayUTC = new Date(endOfDay.toISOString());
    
            console.log('Start of Day (UTC):', startOfDayUTC);
            console.log('End of Day (UTC):', endOfDayUTC);
    
            // Fetch available slots for the selected date
            const slots = await Appointment.find({
                date: { $gte: startOfDayUTC, $lt: endOfDayUTC },
                isTimeSlotAvailable: true 
            });
    
            console.log('Available Slots:', slots);
    
            // Handle success and error messages
            const success_msg = req.session.success_msg;
            const error_msg = req.session.error_msg;
            console.log('Success message:', success_msg);
            console.log('Error message:', error_msg);
    
            // Clear messages after use
            req.session.success_msg = null;
            req.session.error_msg = null;
    
            // Render the G2 test page
            res.render('g2_test', {
                availableSlots: slots,
                userLoggedIn,
                success_msg,
                error_msg,
                selectedDate: selectedDate.toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error fetching available slots:', error);
            req.session.error_msg = 'Error fetching available slots. Please try again later.';
            res.redirect('/g2_test');
        }
    }
    












    static g2_test_post = async (req, res) => {
        const { firstName, lastName, age, licenseNumber, make, model, year, platno, selectedSlot } = req.body;
    
        // Debugging: Log the session user
        console.log("Session user in g2_test_post:", req.session.user);
    
        if (!req.session.user) {
            req.session.error_msg = 'User not found or not authenticated.';
            return res.redirect('/g2_test');
        }
    
        try {
            // Debugging: Fetch the user from the database
            const user = await User.findById(req.session.user.userId);
            if (!user) {
                req.session.error_msg = 'User not found in the database.';
                return res.redirect('/g2_test');
            }
    
            console.log("User found in database:", user);
    
            // Update user details with form data
            user.firstname = firstName || user.firstname;
            user.lastname = lastName || user.lastname;
            user.age = age ? parseInt(age) : user.age;
            user.licenseNo = licenseNumber || user.licenseNo;
            user.car_details = {
                make: make || user.car_details?.make,
                model: model || user.car_details?.model,
                year: year ? parseInt(year) : user.car_details?.year,
                platno: platno || user.car_details?.platno,
            };
    
            // Debugging: Log updated user details
            console.log("Updated user details:", user);
    
            // Save the updated user data
            await user.save();
    
            // Ensure a valid slot was selected
            if (!selectedSlot) {
                req.session.error_msg = 'Please select a valid slot.';
                return res.redirect('/g2_test');
            }
    
            // Debugging: Check selected slot
            console.log("Selected slot:", selectedSlot);
    
            const slot = await Appointment.findById(selectedSlot);
            if (!slot) {
                req.session.error_msg = 'The selected slot is not valid.';
                return res.redirect('/g2_test');
            }
    
            console.log("Slot found:", slot);
    
            // Check if the slot is available
            if (!slot.isTimeSlotAvailable) {
                req.session.error_msg = 'The selected slot is no longer available.';
                return res.redirect('/g2_test');
            }
    
            // Debugging: Log the status before booking the slot
            console.log("Booking the slot:", slot._id);
    
            // Mark the slot as booked and associate it with the user
            slot.isTimeSlotAvailable = false;
            slot.bookedBy = user._id;
    
            // Debugging: Log slot details before saving
            console.log("Slot before save (should be updated):", slot);
    
            try {
                // Save the updated slot
                await slot.save();
                // Debugging: Log after successful save
                console.log("Slot after save (should show isTimeSlotAvailable = false):", slot);
            } catch (error) {
                // Debugging: Log error during save
                console.error("Error saving slot:", error);
                req.session.error_msg = 'An error occurred while saving the slot.';
                return res.redirect('/g2_test');
            }
    
            // Optionally, link the booked appointment to the user
            user.appointment = slot._id;
            await user.save();
    
            // Debugging: Log the success message
            console.log("Appointment booked successfully for user:", user._id);
    
            req.session.success_msg = 'Your appointment has been booked successfully!';
            return res.redirect('/g2_test');
        } catch (err) {
            // Debugging: Log any errors that occur during the process
            console.error('Error handling G2 Test POST request:', err);
    
            req.session.error_msg = 'An error occurred. Please try again.';
            return res.redirect('/g2_test');
        }
    };
    
    


    static getAvailableSlots = async (req, res) => {
        try {
            const selectedDate = req.query.date;  // Get the date from the query string
            console.log('Selected Date:', selectedDate);  // Debug log
    
            // Ensure the date is valid
            const formattedDate = new Date(selectedDate);
            console.log('Formatted Date:', formattedDate);  // Log formatted date for validation
    
            if (isNaN(formattedDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
    
            // Set the start and end of the day to ensure the full day is queried
            const startOfDay = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0, 0);  // Start of selected day
            const endOfDay = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59, 999);  // End of selected day
            console.log('Start of Day:', startOfDay);
            console.log('End of Day:', endOfDay);
    
            // Query for available slots within the selected date range and where isTimeSlotAvailable is true
            const slots = await Appointment.find({
                date: { $gte: startOfDay, $lt: endOfDay },  // Query within this range
                isTimeSlotAvailable: true  // Ensure the slot is available
            });
            console.log('Available Slots:', slots);  // Log the available slots
    
            // Return the slots as a JSON response
            res.json(slots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({ error: 'Error fetching available slots. Please try again later.' });
        }
    };
    










    // GET: Display g_page with user details (check session)

    static async g_page_get(req, res) {
        try {
            const user = req.session.user;

            console.log("User Data from Session:", user);

            // Check if user is logged in and is of type Driver
            if (user && user.userType === 'Driver') {
                // Retrieve and clear session messages
                const successMsg = req.session.success_msg || null;
                const errorMsg = req.session.error_msg || null;
                req.session.success_msg = null;
                req.session.error_msg = null;

                // Log messages and user info for debugging
                console.log("Success Message:", successMsg);
                console.log("Error Message:", errorMsg);
                console.log("User Logged In:", Boolean(user));
                console.log("User Car Details:", user.car_details);

                // Render `g_page` with user data and session messages
                return res.render('g_page', {
                    user,
                    userLoggedIn: Boolean(user),
                    success_msg: successMsg,
                    error_msg: errorMsg
                });
            } else {
                console.log("User is not a driver or not logged in.");
                req.session.error_msg = 'You must be a Driver to access this page.';
                return res.redirect('/login'); // Redirect if not logged in or not a Driver
            }
        } catch (err) {
            console.error('Error fetching user data for g_page:', err);
            req.session.error_msg = 'There was an error loading your page.';
            return res.redirect('/login');
        }
    }




    static async updateCarDetails(req, res) {
        try {
            const user = req.session.user; // Get the logged-in user from session

            // Check if user is logged in and is a driver
            if (!user || user.userType !== 'Driver') {
                req.session.error_msg = 'You must be a Driver to update car details.';
                return res.redirect('/login'); // Redirect if not a driver
            }

            // Get the updated car details from the request body
            const { carMake, carModel, carYear, carPlateNo } = req.body;

            // Update the car details in the session
            user.car_details = {
                make: carMake,
                model: carModel,
                year: carYear,
                platno: carPlateNo
            };

            // Save the updated user data in the session
            req.session.user = user;

            // Update the car details in the database
            const updatedUser = await User.findByIdAndUpdate(
                user.userId,  // Find the user by ID
                {
                    $set: {
                        'car_details.make': carMake,
                        'car_details.model': carModel,
                        'car_details.year': carYear,
                        'car_details.platno': carPlateNo
                    }
                },
                { new: true }  // Return the updated user document
            );

            // Check if the user was updated successfully
            if (!updatedUser) {
                req.session.error_msg = 'Error updating car details in the database.';
                return res.redirect('/g_page');
            }

            // Update the session with the latest user data
            req.session.user = {
                userId: updatedUser._id,
                username: updatedUser.username,
                userType: updatedUser.userType,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                licenseNo: updatedUser.licenseNo,
                age: updatedUser.age,
                car_details: updatedUser.car_details
            };

            // Set a success message
            req.session.success_msg = 'Car details updated successfully!';

            // Redirect back to the g_page with updated data
            return res.redirect('/g_page');
        } catch (err) {
            console.error('Error updating car details:', err);
            req.session.error_msg = 'There was an error updating your car details.';
            return res.redirect('/g_page');
        }
    }



  // GET: Render Appointment Booking Page (for Admin)
// GET: Render Appointment Booking Page (for Admin)
static manageAppointment_get = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.userType !== 'Admin') {
            req.session.error_msg = 'You must be an Admin to view appointments.';
            return res.redirect('/login');
        }

        const selectedDate = req.query.date || ''; // Date selected by the admin
        let appointmentSlots = [];
        let existingTimes = [];

        if (selectedDate) {
            // Ensure the date is in the correct format
            const selectedDateObject = new Date(selectedDate);
            
            // Fetch appointments for the selected date
            appointmentSlots = await Appointment.find({
                date: selectedDateObject
            });

            // Get all the times that are already booked (not available)
            existingTimes = appointmentSlots
                .filter(slot => !slot.isTimeSlotAvailable)  // Check if the time slot is booked (not available)
                .map(slot => slot.time); // Extract the time for booked slots
        }

        // Render the page with the necessary data
        res.render('manage-appointment', {
            userLoggedIn: user,
            appointmentSlots: appointmentSlots,
            success_msg: req.session.success_msg || null,
            error_msg: req.session.error_msg || null,
            selectedDate: selectedDate,
            existingTimes: existingTimes, // List of times that are already booked
        });

        req.session.success_msg = null;
        req.session.error_msg = null;
    } catch (err) {
        console.error('Error fetching appointments:', err);
        req.session.error_msg = 'Error loading appointment page.';
        res.redirect('/dashboard');
    }
};



// POST: Create a new Appointment Slot
// POST: Handle the creation of a new appointment slot
static manageAppointment_post = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.userType !== 'Admin') {
            req.session.error_msg = 'You must be an Admin to add appointments.';
            return res.redirect('/login');
        }

        const { date, time } = req.body;

        // Validate if both date and time are provided
        if (!date || !time) {
            req.session.error_msg = 'Both date and time are required.';
            return res.redirect('/manageAppointment');
        }

        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            req.session.error_msg = 'Invalid date provided.';
            return res.redirect('/manageAppointment');
        }

        const appointmentTime = time.trim();
        const existingSlot = await Appointment.findOne({
            date: appointmentDate,
            time: appointmentTime,
        });

        if (existingSlot) {
            req.session.error_msg = 'An appointment slot already exists for this date and time.';
            return res.redirect('/manageAppointment');
        }

        const newAppointment = new Appointment({
            date: appointmentDate,
            time: appointmentTime,
            isTimeSlotAvailable: true,  // Make the slot available initially
        });

        await newAppointment.save();

        req.session.success_msg = 'Appointment slot created successfully!';
        res.redirect(`/manageAppointment?date=${date}`); // Redirect with the selected date
    } catch (err) {
        console.error('Error creating appointment slot:', err);
        req.session.error_msg = 'Error creating appointment slot. Please try again.';
        res.redirect('/manageAppointment');
    }
};


    // GET: Handle Logout
    static logout_get = (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                return res.redirect('/home');
            }
            res.redirect('/login');
        });
    }
}

export default Controller;

