const Appointment = require('../models/Appointment'); // Assuming you have an Appointment model

// Controller action to display the manage appointments page
exports.manageAppointments_get = async (req, res) => {
  try {
    // Fetch appointment slots from the database
    const appointmentSlots = await Appointment.find(); // Retrieve all appointments
    res.render('admin/manage-appointments', {
      user: req.user, // Assuming user info is stored in req.user after authentication
      appointmentSlots: appointmentSlots // Passing the slots to the view
    });
  } catch (err) {
    console.error('Error fetching appointment slots:', err);
    res.status(500).send('Error fetching appointment slots');
  }
};

// Controller action to handle adding a new appointment slot
exports.addSlot_post = async (req, res) => {
  try {
    const { date, time } = req.body;

    // Create a new appointment slot
    const newSlot = new Appointment({
      date: date,
      time: time,
      status: 'available' // Default status can be 'available'
    });

    // Save the new appointment slot to the database
    await newSlot.save();

    // Redirect back to the manage appointments page
    res.redirect('/admin/manage-appointments');
  } catch (err) {
    console.error('Error adding appointment slot:', err);
    res.status(500).send('Error adding appointment slot');
  }
};

// Controller action to handle deleting an appointment slot
exports.deleteSlot_post = async (req, res) => {
  try {
    const { slotId } = req.body;

    // Delete the selected appointment slot by its ID
    await Appointment.findByIdAndDelete(slotId);

    // Redirect back to the manage appointments page
    res.redirect('/admin/manage-appointments');
  } catch (err) {
    console.error('Error deleting appointment slot:', err);
    res.status(500).send('Error deleting appointment slot');
  }
};
