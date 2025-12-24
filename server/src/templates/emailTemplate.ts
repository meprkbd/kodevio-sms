export const otpEmailTemplate = (otp: string, user: string): string => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #4A90E2;">OTP Verification Email</h2>
        <p>Hi ${user},</p>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #2c3e50;">${otp}</p>
        <p>This code will expire in <b>10 minutes</b>. Please enter it in the portal to reset your password.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">If you didn&apos;t request this, you can safely ignore this email.</p>
      </div>
    `;
};
