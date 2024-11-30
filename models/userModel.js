import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Admin'], required: true },
    firstname: { type: String, default: 'default' },
    lastname: { type: String, default: 'default' },
    licenseNo: { type: String, default: 'default' },
    age: { type: Number, default: 0 },
    car_details: {
        make: { type: String, default: 'default' },
        model: { type: String, default: 'default' },
        year: { type: Number, default: 0 },
        platno: { type: String, default: 'default' }
    },
    appointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Appointment',  // Reference to the Appointment model
        default: null 
    }
});

// Pre-save hook to hash password before saving to DB
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.licenseNo !== 'default') {
        this.licenseNo = await bcrypt.hash(this.licenseNo, 10);  // Encrypt License Number
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

// Method to compare license number
userSchema.methods.compareLicenseNo = async function(inputLicenseNo) {
    return await bcrypt.compare(inputLicenseNo, this.licenseNo);
};

// Create the model
const User = mongoose.model('User', userSchema);

// Default export for ES Modules
export default User;
