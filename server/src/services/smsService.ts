import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken) {
  console.warn('Warning: Twilio credentials not configured. SMS functionality will be disabled.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendOTPSMS = async (phoneNumber: string, otp: string, type: string) => {
  try {
    if (!client) {
      console.warn('Twilio not configured. OTP SMS not sent.');
      return false;
    }

    const message = `Your श्री sootra ${type} code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    await client.messages.create({
      body: message,
      from: fromNumber!,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Failed to send OTP SMS:', error);
    throw error;
  }
};

export const sendOrderNotificationSMS = async (phoneNumber: string, orderId: string, status: string) => {
  try {
    if (!client) {
      console.warn('Twilio not configured. Order SMS not sent.');
      return false;
    }

    const message = `Your श्री sootra order #${orderId} has been ${status}. Track your order at our website.`;

    await client.messages.create({
      body: message,
      from: fromNumber!,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification SMS:', error);
    throw error;
  }
};
