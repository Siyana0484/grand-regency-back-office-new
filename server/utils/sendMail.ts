import nodemailer from "nodemailer";

const sendMail = async (receiver: string, token: string) => {
  try {
    const mailConfigurations = {
      from: process.env.USER,
      to: receiver,
      subject: "Grand Regency Password Reset Request",
      html: `
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 500px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
        }
        .warning {
            font-size: 14px;
            color: #d9534f;
            margin-top: 10px;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
        a {
            color: #007BFF;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>You can click the link and update your password:</p>
            <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}" target="_blank">${token}</a></p>
            <p class="warning">This link will expire in 5 minutes.</p>
        </div>
        <div class="footer">
            <p>GrandRegency</p>
        </div>
    </div>
</body>
</html>

            `,
    };
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.APP_Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    //send mail
    const info = await transporter.sendMail(mailConfigurations);
  } catch (err) {}
};

export default sendMail;
