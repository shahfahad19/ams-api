const Semester = require('./../models/semesterModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllSemesters = async (req, res) => {
    try {
        const features = new APIFeatures(Semester.find(), req.query).filter().sort().limit().paginate();
        const semesters = await features.query
            .populate({
                path: 'batchId',
                populate: 'adminId',
            })
            .select('-__v');

        let semesterArray = [];

        semesters.forEach((semester, i) => {
            semesterArray[i] = {
                _id: semester._id,
                name: semester.name,
                batchId: semester.batchId._id,
                batchName: semester.batchId.name,
                department: semester.batchId.adminId.department,
            };
        });
        //        SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: semesters.length,
            data: {
                semesters: semesterArray,
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

exports.getSemester = async (req, res) => {
    try {
        const student = await Semester.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                student,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createSemester = async (req, res) => {
    try {
        const newSemester = await Semester.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Semester: newSemester,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateSemester = async (req, res) => {
    try {
        const student = await Semester.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                student,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteSemester = async (req, res) => {
    try {
        await Semester.findByIdAndDelete(req.params.id);

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
