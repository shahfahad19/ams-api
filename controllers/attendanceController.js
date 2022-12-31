const Attendance = require('./../models/attendanceModel');
const APIFeatures = require('./../utils/apiFeatures');
const mongoose = require('mongoose');

exports.getAllAttendances = async (req, res) => {
    try {
        //const features = new APIFeatures(Attendance.find(), req.query).filter().sort().limit().paginate();
        const subjectId = mongoose.Types.ObjectId('63ac1c21f1000278723b489a');
        const attendances = await Attendance.aggregate([
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject',
                },
            },
            {
                $unwind: '$subject',
            },
            {
                $match: {
                    'subject._id': subjectId,
                },
            },
            {
                $project: {
                    _id: '$_id',
                    date: '$date',
                    subject: '$subject',
                    students: '$students',
                    attendances: '$attendances',
                },
            },
            {
                $sort: {
                    date: 1,
                },
            },
            // {
            //     $unwind: '$attendances.studentId',
            // },
        ]);

        // let refactoredAttendanceArray = [];
        // attendances.forEach((attendance, index) => {
        //     let sepAtt = [];
        //     attendance.attendances.forEach((sepatt, index) => {
        //         sepAtt[index] = {
        //             studentId: sepatt.studentId._id,
        //             rollNo: sepatt.studentId.rollNo,
        //             name: sepatt.studentId.name,
        //             status: sepatt.status,
        //         };
        //     });
        //     refactoredAttendanceArray[index] = {
        //         _id: attendance._id,
        //         date: attendance.date,
        //         subjectId: attendance.subjectId,
        //         attendance: sepAtt,
        //     };
        // });
        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: attendances.length,
            data: {
                attendances,
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

/*
exports.getAllAttendances = async (req, res) => {
    try {
        const features = new APIFeatures(Attendance.find(), req.query).filter().sort().limit().paginate();
        const attendances = await features.query.populate({
            path: 'attendances',
            populate: {
                path: 'studentId',
            },
        });

        let refactoredAttendanceArray = [];
        attendances.forEach((attendance, index) => {
            let sepAtt = [];
            attendance.attendances.forEach((sepatt, index) => {
                sepAtt[index] = {
                    studentId: sepatt.studentId._id,
                    rollNo: sepatt.studentId.rollNo,
                    name: sepatt.studentId.name,
                    status: sepatt.status,
                };
            });
            refactoredAttendanceArray[index] = {
                _id: attendance._id,
                date: attendance.date,
                subjectId: attendance.subjectId,
                attendance: sepAtt,
            };
        });

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: attendances.length,
            data: {
                attendances: refactoredAttendanceArray,
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

*/

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'teacherId',
                },
            })
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'semesterId',
                },
            })
            .populate({
                path: 'attendances',
                populate: {
                    path: 'studentId',
                },
            });
        let sepAtt = [];
        attendance.attendances.forEach((sepatt, index) => {
            sepAtt[index] = {
                studentId: sepatt.studentId._id,
                rollNo: sepatt.studentId.rollNo,
                name: sepatt.studentId.name,
                status: sepatt.status,
            };
        });
        const refactoredAttendanceArray = {
            _id: attendance._id,
            date: attendance.date,
            subjectId: attendance.subjectId._id,
            subjectName: attendance.subjectId.name,
            teacherId: attendance.subjectId.teacherId._id,
            teacherName: attendance.subjectId.teacherId.name,
            semesterId: attendance.subjectId.semesterId._id,
            semester: attendance.subjectId.semesterId.name,
            attendance: sepAtt,
        };
        res.status(200).json({
            status: 'success',
            data: {
                attendance: attendance,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createAttendance = async (req, res) => {
    try {
        const newAttendance = await Attendance.create(req.body)
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'teacherId',
                },
            })
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'semesterId',
                },
            });
        res.status(201).json({
            status: 'success',
            data: {
                Attendance: newAttendance,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const student = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'teacherId',
                },
            })
            .populate({
                path: 'subjectId',
                populate: {
                    path: 'semesterId',
                },
            });

        res.status(200).json({
            status: 'success',
            data: {
                student,
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

exports.deleteAttendance = async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);

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

exports.getStudentAttendance = async (req, res) => {
    try {
        const student = mongoose.Types.ObjectId(req.params.studentid);

        const semesterId = mongoose.Types.ObjectId('63ac1a87f1000278723b487d');
        const stdatt = await Attendance.aggregate([
            {
                $match: {
                    'attendances.studentId': student,
                },
            },
            {
                $unwind: '$attendances',
            },
            {
                $match: {
                    'attendances.studentId': student,
                },
            },
            {
                $group: {
                    _id: '$subjectId',
                    attendances: {
                        $push: '$attendances',
                    },
                },
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'subject',
                },
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'subject.teacherId',
                    foreignField: '_id',
                    as: 'teacher',
                },
            },

            {
                $lookup: {
                    from: 'semesters',
                    localField: 'subject.semesterId',
                    foreignField: '_id',
                    as: 'semester',
                },
            },
            {
                $unwind: '$subject',
            },
            {
                $unwind: '$teacher',
            },
            {
                $unwind: '$semester',
            },
            // {
            //     $match: {
            //         'semester._id': semesterId,
            //     },
            // },
            {
                $project: {
                    subjectId: '$_id',
                    subjectName: '$subject.name',
                    teacherId: '$teacher._id',
                    teacherName: '$teacher.name',
                    semesterId: '$semester._id',
                    semesterName: '$semester.name',
                    totalClass: {
                        $size: '$attendances',
                    },
                    present: {
                        $size: {
                            $filter: {
                                input: '$attendances',
                                cond: {
                                    $eq: ['$$this.status', 'present'],
                                },
                            },
                        },
                    },
                    absent: {
                        $size: {
                            $filter: {
                                input: '$attendances',
                                cond: {
                                    $eq: ['$$this.status', 'absent'],
                                },
                            },
                        },
                    },
                    leave: {
                        $size: {
                            $filter: {
                                input: '$attendances',
                                cond: {
                                    $eq: ['$$this.status', 'leave'],
                                },
                            },
                        },
                    },
                    percentage: {
                        $concat: [
                            {
                                $convert: {
                                    input: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: '$attendances',
                                                                cond: {
                                                                    $eq: ['$$this.status', 'present'],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $size: '$attendances',
                                                    },
                                                ],
                                            },
                                            100,
                                        ],
                                    },
                                    to: 'string',
                                },
                            },
                            '%',
                        ],
                    },
                    attendances: '$attendances',
                },
            },
        ]);
        res.send({
            status: 'success',
            results: stdatt.length,
            attendances: stdatt,
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};
