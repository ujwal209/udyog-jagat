import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"Udyog Jagat Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Authentication Code - Udyog Jagat',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0; color: #1e3a8a; font-size: 28px; font-weight: 900; letter-spacing: -1px;">UDYOG JAGAT</h1>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Security Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 24px;">Hello,</p>
              <p style="margin: 0 0 32px 0; color: #334155; font-size: 16px; line-height: 24px;">You recently requested an authentication code. Please use the following One-Time Password (OTP) to securely proceed with your request.</p>
              
              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: inline-block;">
                      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; font-family: monospace;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; color: #64748b; font-size: 14px; line-height: 24px; text-align: center;">
                This code will automatically expire in <strong style="color: #334155;">10 minutes</strong>.<br/>
                If you did not request this code, please safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                © ${new Date().getFullYear()} Udyog Jagat Inc. All rights reserved.<br/>
                The Modern Hiring Infrastructure.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
