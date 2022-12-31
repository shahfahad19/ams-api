const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        required: [true, 'A student must have a roll no.'],
    },

    name: {
        type: String,
        required: [true, 'Student name is missing'],
        maxlength: [20, 'Student name must be less or equal than 20 characters'],
        minlength: [3, 'Student name must be greater or equal than 3 characters'],
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: [true, 'A semester must have an batch id.'],
    },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
