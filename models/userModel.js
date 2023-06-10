const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['super-admin', 'admin', 'teacher', 'student'],
        required: [true, 'User role must be defined'],
        lowercase: true,
    },

    // Only for Admin and Teacher
    department: {
        type: String,
        enum: ["Agriculture", "Computer Science", "Economics", "English", "Geology", "Management Sciences", "Microbiology", "Pharmacy", "Sociology", "Zoology", "PCRS", "Chemistry", "Physics", "Botany", "Biotechnology", "Law", "Education", "Environmental Sciences", "Geography", "Journalism & Mass Communication", "Library & Information Sciences", "Mathematics", "Pashto", "Political Science", "Psychology", "Tourism & Hotel Management", "Urdu", "Islamic & Arabic Studies",],
    },

    // Only for Teacher
    gender: {
        type: String,
        enum: ['male', 'female'],
        lowercase: true,
    },

    designation: {
        type: String,
        enum: ['Lecturer', 'Assistant Professor', 'Associate Professor'],
    },
              
    // Only for Student
    rollNo: {
        type: Number,
    },
    registrationNo: {
        type: String,
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
    },
    photo: {
        type: String,
        default: 'https://res.cloudinary.com/dbph73rvi/image/upload/v1675170781/mdqcinla4xkogsatvbr3.jpg',
    },

    // For All users
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    confirmed: {
        type: Boolean,
        default: false,
    },
    confirmationToken: {
        type: String,
        select: false,
    },
    photoUpdatedAt: {
        type: Date,
        select: false,
    },
    createdAt: {
        type: Date,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('email')) return next();

    // Delete passwordConfirm field
    this.confirmed = false;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.methods.createConfirmationToken = function () {
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    this.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');

    return confirmationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
