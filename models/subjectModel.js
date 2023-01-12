const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'A subject must have an semester id.'],
    },

    name: {
        type: String,
        required: [true, 'Subject name is missing'],
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
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

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
