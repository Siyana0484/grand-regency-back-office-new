import nodemailer from "nodemailer";

const successMail = async (receiver: string) => {
  try {
    const mailConfigurations = {
      from: process.env.USER,
      to: receiver,
      subject: "Grand Regency Password Reset Successful",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Password Reset Successful</title>
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
          .success {
            font-size: 14px;
            color: #28a745;
            margin-top: 10px;
          }
          .timestamp {
            margin-top: 8px;
            font-size: 13px;
            color: #555;
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
            <h2>Password Reset Successful</h2>
            <p>Your password for your Grand Regency account has been successfully updated.</p>
            <p class="success">You can now log in using your new password.</p>
            <p class="timestamp">Reset on: <strong>${new Date().toLocaleString()}</strong></p>
          </div>
          <div class="footer">
            <p>If you did not perform this action, please contact us immediately at 
              <a href="mailto:support@grandreagency.com">support@grandreagency.com</a>.
            </p>
            <p>— Grand Regency Team</p>
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

export default successMail;
