import nodemailer from 'nodemailer';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('Warning: Email credentials not configured. Email functionality will be limited.');
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

export const sendOTPEmail = async (email: string, otp: string, type: string) => {
  try {
    const subject = type === 'registration' 
      ? 'Verify your श्री sootra account'
      : type === 'login'
      ? 'Login verification code'
      : 'Password reset code';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0;">श्री sootra</h1>
          <p style="margin: 10px 0 0 0;">${subject}</p>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p style="color: #333; font-size: 16px;">Hello,</p>
          <p style="color: #666; margin: 20px 0;">Your verification code is:</p>
          <div style="background: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h2 style="color: #b8860b; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h2>
          </div>
          <p style="color: #666; margin: 20px 0;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div style="background: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">© 2026 श्री sootra. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
};

export const sendInvoiceEmail = async (email: string, customerName: string, orderId: string, pdfBuffer: Buffer) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0;">श्री sootra</h1>
          <p style="margin: 10px 0 0 0;">Order Invoice</p>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p style="color: #333; font-size: 16px;">Hello ${customerName},</p>
          <p style="color: #666; margin: 20px 0;">Thank you for your order! Please find your invoice attached.</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="color: #999; font-size: 12px;">Invoice date: ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="color: #666; margin: 20px 0;">If you have any questions about your order, please don't hesitate to contact us.</p>
        </div>
        <div style="background: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">© 2026 श्री sootra. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invoice for Order #${orderId}`,
      html,
      attachments: [
        {
          filename: `invoice-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    throw error;
  }
};

export const sendNotificationEmail = async (email: string, subject: string, message: string) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0;">श्री sootra</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p style="color: #666;">${message}</p>
        </div>
        <div style="background: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">© 2026 श्री sootra. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
};
