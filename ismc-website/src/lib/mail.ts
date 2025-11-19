import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: 'admin@ismc-xv.com',
    to: email,
    subject: 'ISMC XV Email Confirmation',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  });
}