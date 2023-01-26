const mongoose = require('mongoose');

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

subjectSchema.index(
    {
        name: 1,
        semester: 1,
    },
    {
        unique: true,
    }
);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
