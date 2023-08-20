const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Batch = require('./batchModel');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        validate: {
            validator: function (value) {
                return validator.matches(value, /^[a-zA-Z\s]+$/);
            },
            message: 'Invalid name. Only alphabets and spaces are allowed.',
        },
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
        enum: [
            'Agriculture',
            'Computer Science',
            'Economics',
            'English',
            'Geology',
            'Management Sciences',
            'Microbiology',
            'Pharmacy',
            'Sociology',
            'Zoology',
            'PCRS',
            'Chemistry',
            'Physics',
            'Botany',
            'Biotechnology',
            'Law',
            'Education',
            'Environmental Sciences',
            'Geography',
            'Journalism & Mass Communication',
            'Library & Information Sciences',
            'Mathematics',
            'Pashto',
            'Political Science',
            'Psychology',
            'Tourism & Hotel Management',
            'Urdu',
            'Islamic & Arabic Studies',
        ],
        unique: true,
        sparse: true,
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

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    // Only for Student
    rollNo: {
        type: Number,
        min: 1,
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
    newEmail: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    newEmailToken: {
        type: String,
        select: false,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    confirmationToken: {
        type: String,
        select: false,
    },
    approved: {
        type: Boolean,
        default: false,
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
userSchema.index({ department: 1 }, { partialFilterExpression: { role: 'admin' }, unique: true, sparse: true });

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
    // Only run this function if email was actually modified
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

userSchema.methods.createNewEmailToken = function () {
    const newEmailToken = crypto.randomBytes(32).toString('hex');

    this.newEmailToken = crypto.createHash('sha256').update(newEmailToken).digest('hex');

    return newEmailToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
