const { default: axios } = require('axios');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.verifyCaptcha = catchAsync(async (req, res, next) => {
    const secret = process.env.RECAPTCHA_KEY;
    const response = req.query.token;
    const verify = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
            secret: secret,
            response,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        }
    );
    if (verify.data.success) next();
    else next(new AppError('ReCaptcha Verification Failed', 403));
});
