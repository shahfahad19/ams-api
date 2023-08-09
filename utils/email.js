const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Attendance Managment System',
        to: options.email,
        subject: 'Welcome to attendance management system',
        text: `Welcome to attendance management system!
        Please confirm your account by opening this link:
        ${options.confirmationLink}
        
        If you didn't create this account, open this link to delete it
        ${options.deleteLink}`,
        html: `
      ${htmlHead}
      <p class="text-content">
      ${greetings}
      <br/>
      Thanks for creating account at AMS.
      <br/>
      Your account is inactive and it won't appear in attendance until you confirm it.
      <br/>
      Confirm your account now by clicking the following link
      <br/>
      <a href="${options.confirmationLink}">${options.confirmationLink}</a>
      <br/><br/>
      If you didn't create this account click <a href="${options.deleteLink}" style="color: red;">here</a> to delete it.
     
      <p class="footer">This email was sent to you beacuse an account with your email was created in attendance management system</p>  
      ${htmlEnd}
  `,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

exports.sendEmailToDepartment = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Attendance Managment System',
        to: options.email,
        subject: 'You have been added as a Department Admin in AMS',
        text: `You have been added by AMS administrator to manage ${options.department} department.
        To activate your account, login at https://amsapp.vercel.app using following credentials
        Email: ${options.email}
        Password: ${options.password}`,
        html: `${htmlHead}
        <p class="text-content">
        ${greetings}
        <br/>
        You have been added by administrator of AMS to manage Depeartment of ${options.department}!
        <br/><br/>
        Login now and complete you profile!
        <br/>
        Here are your login credentials
        </p>

        ${emailPassword(options)}
               
		    <p class="text-content">To go to login page <a href='https://amsapp.vercel.app/login' class="link">click here</a></p>

        <br/>
        <p class="footer">This email was sent to you beacuse an account with your email was created in attendance management system</p>  
      ${htmlEnd}`,
        // html:
    };
    await transporter.sendMail(mailOptions);
};

exports.sendEmailToTeacher = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Attendance Managment System',
        to: options.email,
        subject: 'You have been added as a Teacher in AMS',
        text: `You have been added by Department of ${options.department} as a teacher.
        To activate your account, login at https://amsapp.vercel.app using following credentials
        Email: ${options.email}
        Password: ${options.password}
        If you think you received this email by mistake, contact: attendancesystemuos@gmail.com`,
        html: `
        ${htmlHead}
        <p class="text-content">
        ${greetings}
        <br/>
        You have been added by department of ${options.department} as a teacher!
        <br/><br/>
        Login now and complete you profile!
        <br/>
        Here are your login credentials
        </p>

        ${emailPassword(options)}
               
		    <p class="text-content">To go to login page <a href='https://amsapp.vercel.app/login' class="link">click here</a></p>

        <br/>
        <p class="footer">This email was sent to you beacuse an account with your email was created in attendance management system</p>  
                 
        ${htmlEnd}  
      `,
    };
    await transporter.sendMail(mailOptions);
};

const htmlHead = `<html>
	<head>
    	<meta name="viewport" content="width=device-width, intial-scale=1">
    	<title>AMS</title>
        <style>
        
        	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
            	font-family: 'Inter', sans-serif;
            }
            
			body {
            	margin: 0;
            }
            
            .main-heading {
                margin: 10px;
            	color: #0072F5;
                text-align: center;
                margin: 10px 0px 0px 0px;
                
            }
            
            .secondary-heading {
                margin: 10px;
            	color: #0072F5;
                text-align: center;
            }
            
            .text-content {
            	color: #1C1C1C;
                padding: 2px 5px;
                font-size: 14px;
            }
            
            .footer {
            	color: #969696;
                text-align: center;
                border-top: 0.5px solid #969696;
                padding: 20px 0px;
                font-size: 12px;
            }
            .link {
            	text-decoration: none;
                color: #0072F5;
            }
            .bold {
            	font-weight: 500;
                font-size: 16px;
                margin-bottom: 5px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        	<h1 class="main-heading">AMS</h1>
        	<p class="secondary-heading">Attendance management system</p>
`;

const htmlEnd = `</body></html>`;

const greetings = '<span class="bold">Assalam-u-alikum!</span>';

const emailPassword = (options) => {
    return `<p class="text-content">
        <span>Email: </span><code><Recipent email></code>
        <br/>
        <span>Password: </span><code>${options.password}</code></p>`;
};
