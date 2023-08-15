const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const batchRouter = require('./routes/batchRoutes');
const semesterRouter = require('./routes/semesterRoutes');
const subjectRouter = require('./routes/subjectRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.text({ type: '/' }));

app.get('/', (req, res) => {
    res.end('AMS API is running');
});

app.use('/user', authRouter);
app.use('/users', userRouter);
app.use('/batches', batchRouter);
app.use('/semesters', semesterRouter);
app.use('/subjects', subjectRouter);
app.use('/attendances', attendanceRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
