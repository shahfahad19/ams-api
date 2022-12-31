const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Admin name is missing'],
        unique: true,
        trim: true,
        maxlength: [20, 'Admin name must be less or equal than 20 characters'],
        minlength: [3, 'Admin name must be greater or equal than 3 characters'],
    },
    department: {
        type: String,
        required: [true, 'Department name is missing'],
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
