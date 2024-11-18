import { Recipient, EmailParams, MailerSend, Sender } from 'mailersend';

export const sendOTPVerificationMail = async (
  email: string,
  name: string,
  OTP: string,
) => {
  const mailersend = new MailerSend({
    apiKey: process.env.SMTP_API_KEY,
  });

  const recipients = [new Recipient(email, name)];

  const personalization = [
    {
      email,
      data: {
        OTP,
      },
    },
  ];

  // Create the sender instance or structure as required
  const sender = new Sender('support@tabbie.africa', 'Tabbie');

  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject('Verify OTP')
    .setTemplateId('k68zxl2v1p54j905')
    .setPersonalization(personalization);

  try {
    await mailersend.email.send(emailParams);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error);
  }
};
