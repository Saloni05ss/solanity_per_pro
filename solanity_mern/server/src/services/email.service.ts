import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const EmailService = {
  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: `"Solanity Support" <${process.env.SMTP_USER || 'no-reply@solanity.com'}>`,
      to: email,
      subject: 'Solanity Password Reset OTP',
      text: `Your One-Time Password (OTP) for password reset is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eef2f6; border-radius: 16px; max-width: 480px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
          <h2 style="color: #1e293b; font-weight: 800; font-size: 20px; margin-bottom: 8px;">Password Reset Request</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">You requested a password reset. Use the following 6-digit One-Time Password (OTP) to complete the action:</p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
            <h1 style="color: #4f6ef7; letter-spacing: 6px; font-size: 32px; font-weight: 900; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin-top: 24px;">This OTP is valid for 10 minutes. If you did not request a password reset, please disregard this message.</p>
        </div>
      `,
    };

    if (!process.env.SMTP_USER) {
      console.log('====== NODEMAILER MOCK EMAIL (DEVELOPMENT) ======');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`OTP Code: ${otp}`);
      console.log('=================================================');
      return;
    }

    await transporter.sendMail(mailOptions);
  }
};
