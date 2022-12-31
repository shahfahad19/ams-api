const Teacher = require('./../models/teacherModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllTeachers = async (req, res) => {
    try {
        const features = new APIFeatures(Teacher.find(), req.query).filter().sort().limit().paginate();
        const teachers = await features.query;
        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: teachers.length,
            data: {
                teachers,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                teacher,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const newTeacher = await Teacher.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Teacher: newTeacher,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                teacher,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);

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
