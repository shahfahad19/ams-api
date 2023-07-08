const mongoose = require('mongoose');
const Attendance = require('./attendanceModel');
const AppError = require('../utils/appError');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is missing'],
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'A subject must have an semester id.'],
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    creditHours: {
        type: Number,
        required: [true, 'Credit hours are missing'],
    },
    archived: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        select: false,
    },
});

subjectSchema.index(
    {
        name: 1,
        semester: 1,
    },
    {
        unique: true,
    }
);

subjectSchema.pre('remove', async function (next) {
    const subjectId = this._id;

    try {
        // Delete attendances with the subjectId
        await Attendance.deleteMany({ subject: subjectId });

        next();
    } catch (error) {
        return next(new AppError('Failed to delete attendances', 500));
    }
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
