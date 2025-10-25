const nodemailer = require("nodemailer");

function sendWelcomeEmail(userEmail, userName) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Pounce Bank" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "🎉 Welcome to Pounce Bank!",
        html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f9f9; padding: 40px; text-align: center;">
        <div style="background-color: #1d353d; color: white; padding: 20px; border-radius: 10px;">
        <h1>Welcome to <span style="color: #00b894;">Pounce Bank</span> 💳</h1>
        </div>

        <div style="background-color: white; margin-top: 30px; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #1d353d;">Hello, ${userName || "New Customer"} 👋</h2>
        <p style="color: #333; font-size: 16px;">
            We’re thrilled to have you onboard! Your Pounce Bank account is ready to help you manage your finances smarter and faster.
        </p>
        <p style="color: #333;">Here’s what you can do right away:</p>
        <ul style="text-align: left; display: inline-block; color: #555; font-size: 15px;">
            <li>💰 Deposit and transfer funds securely</li>
            <li>📊 Track your spending and savings</li>
            <li>💳 Request a virtual or physical Pounce Bank card</li>
        </ul>

        <a href="https://pouncebank.com/login" 
            style="display: inline-block; margin-top: 20px; background: #00b894; color: white; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold;">
            Login to Your Account
        </a>
        </div>

        <p style="margin-top: 40px; color: #777; font-size: 13px;">© ${new Date().getFullYear()} Pounce Bank. All Rights Reserved.</p>
    </div>
    `,
    };

    transporter
        .sendMail(mailOptions)
        .then((info) => {
            console.log(` Welcome email sent to ${userEmail}: ${info.response}`);
        })
        .catch((error) => {
            console.error(" Error sending welcome email:", error);
        });
}

module.exports = { sendWelcomeEmail };
