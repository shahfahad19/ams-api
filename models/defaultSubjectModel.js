const mongoose = require('mongoose');

const defaultSubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is missing'],
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A subject must have an department id.'],
    },
    creditHours: {
        type: Number,
        required: [true, 'Credit hours are missing'],
    },
});

defaultSubjectSchema.index(
    {
        name: 1,
        department: 1,
    },
    {
        unique: true,
    }
);

const DefaultSubject = mongoose.model('DefaultSubject', defaultSubjectSchema);

module.exports = DefaultSubject;
