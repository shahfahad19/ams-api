const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: [true, 'A semester must have an batch id.'],
    },

    name: {
        type: String,
        required: [true, 'Semester name is missing'],
        unique: true,
    },
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
