import { Resend } from 'resend';
import { VerifyEmailTemplate } from "@/components/Emails/Verify-Email"

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: 'ISMC XV <admin@ismc-xv.com>',
    to: email,
    subject: 'Confirm your email address',
    react: VerifyEmailTemplate({ confirmLink }), 
  });
}