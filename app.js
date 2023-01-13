const express = require('express');
const app = express();
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const adminRouter = require('./routes/adminRoutes');
const studentRouter = require('./routes/studentRoutes');
const teacherRouter = require('./routes/teacherRoutes');

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.end('AMS API is running');
});

app.use('/admin', adminRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
