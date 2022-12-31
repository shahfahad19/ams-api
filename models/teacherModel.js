const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Teacher name is missing'],
        unique: true,
    },
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
