import express from 'express';
import Appointment from '../models/appointmentModel.js'; // Use ES module import

const router = express.Router();

// Define routes for handling appointment slots

router.get('/available-slots', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const selectedDate = new Date(`${date}T00:00:00Z`); // Parse the date into UTC
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);  // Start of day in UTC
        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);  // End of day in UTC

        // Fetch available slots for the selected date
        const availableSlots = await Appointment.find({
            date: { $gte: startOfDay, $lt: endOfDay },
            $or: [
                { isBooked: false },
                { isTimeSlotAvailable: true }
            ]
        });

        if (availableSlots.length > 0) {
            res.json({ availableSlots });
        } else {
            res.json({ message: 'No available slots for the selected date.' });
        }
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots. Please try again later.' });
    }
});

// Handle booking the appointment
router.post('/book-appointment', async (req, res) => {
    const { selectedSlot } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!selectedSlot) {
        return res.status(400).json({ message: 'Selected slot is required' });
    }

    try {
        const appointment = await Appointment.findById(selectedSlot);

        if (!appointment) {
            return res.status(404).json({ message: 'This appointment slot does not exist.' });
        }

        if (!appointment.isTimeSlotAvailable) {
            return res.status(400).json({ message: 'This slot is already booked or unavailable.' });
        }

        // Mark the slot as booked
        appointment.isTimeSlotAvailable = false;
        appointment.bookedBy = userId;

        await appointment.save();
        res.status(200).json({ message: 'Appointment booked successfully.' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Error booking appointment. Please try again later.' });
    }
});

// Export router using ES module syntax
export default router;
