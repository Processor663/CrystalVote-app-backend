const baseStyles = `
  font-family: Arial, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 28px;
  background: #4F46E5;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  margin: 16px 0;
`;

const footerStyle = `
  margin-top: 24px;
  font-size: 13px;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
`;

export function verificationEmailTemplate({ name, url, appName }) {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #111827; margin-bottom: 8px;">Verify your email address</h2>
      <p style="color: #374151;">Hi ${name},</p>
      <p style="color: #374151;">
        Thanks for signing up for <strong>${appName}</strong>. 
        Please verify your email address by clicking the button below.
      </p>
      <a href="${url}" style="${buttonStyle}">Verify Email</a>
      <p style="color: #6b7280; font-size: 14px;">
        This link expires in <strong>1 hour</strong>. 
        If you did not create an account, you can safely ignore this email.
      </p>
      <div style="${footerStyle}">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${url}</p>
      </div>
    </div>
  `;
}

export function passwordResetEmailTemplate({ name, url, appName }) {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #111827; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #374151;">Hi ${name},</p>
      <p style="color: #374151;">
        We received a request to reset your password for your 
        <strong>${appName}</strong> account.
      </p>
      <a href="${url}" style="${buttonStyle}">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">
        This link expires in <strong>1 hour</strong>. 
        If you did not request a password reset, you can safely ignore this email. 
        Your password will not be changed.
      </p>
      <div style="${footerStyle}">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${url}</p>
      </div>
    </div>
  `;
}
