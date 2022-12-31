const Subject = require('./../models/subjectModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllSubjects = async (req, res) => {
    try {
        const features = new APIFeatures(Subject.find(), req.query).filter().sort().limit().paginate();

        const subjects = await features.query
            .populate('teacherId')
            .populate({
                path: 'semesterId',
                populate: {
                    path: 'batchId',
                    populate: {
                        path: 'adminId',
                    },
                },
            })
            .select('-__v');

        let subjectsArray = [];

        subjects.forEach((subject, i) => {
            subjectsArray[i] = {
                _id: subject._id,
                name: subject.name,
                teacherId: subject.teacherId._id,
                teacherName: subject.teacherId.name,
                semesterId: subject.semesterId._id,
                semesterName: subject.semesterId.name,
                batchId: subject.semesterId.batchId._id,
                batchName: subject.semesterId.batchId.name,
                department: subject.semesterId.batchId.adminId.department,
            };
        });

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: subjects.length,
            data: {
                subjects: subjectsArray,
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

exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('teacherId')
            .populate({
                path: 'semesterId',
                populate: {
                    path: 'batchId',
                },
            })
            .select('-__v');

        res.status(200).json({
            status: 'success',
            data: {
                subject: {
                    _id: subject._id,
                    name: subject.name,
                    teacherId: subject.teacherId._id,
                    teacherName: subject.teacherId.name,
                    semesterId: subject.semesterId._id,
                    semesterName: subject.semesterId.name,
                    batchId: subject.semesterId.batchId._id,
                    batchName: subject.semesterId.batchId.name,
                },
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const newSubject = await Subject.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Subject: newSubject,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                subject,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);

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
