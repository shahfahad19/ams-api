const Admin = require('./../models/adminModel');

exports.getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                admin,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const newStudent = await Admin.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Admin: newStudent,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                admin,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};
