const express = require('express');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const adminRouter = require('./routes/adminRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');
const batchRouter = require('./routes/batchRoutes');
const semesterRouter = require('./routes/semesterRoutes');
const studentRouter = require('./routes/studentRoutes');
const subjectRouter = require('./routes/subjectRoutes');
const teacherRouter = require('./routes/teacherRoutes');

app.use(express.json());
app.get('/', (req, res) => {
    res.end('Hi');
});

app.use('/admin', adminRouter);
app.use('/attendances', attendanceRouter);
app.use('/batches', batchRouter);
app.use('/semesters', semesterRouter);
app.use('/students', studentRouter);
app.use('/subjects', subjectRouter);
app.use('/teachers', teacherRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
