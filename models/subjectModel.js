const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'A subject must have an semester id.'],
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'A subject must have an teacher id.'],
    },
    name: {
        type: String,
        required: [true, 'Subject name is missing'],
        unique: true,
    },
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
