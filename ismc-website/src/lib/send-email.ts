import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is missing');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://ismc-xv.com'; 
const TARGET_LINK = 'https://ismc-xv.com';

const sql = neon(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

const emailSubject = "Mining Insight Registration";
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; margin: 0; padding: 0;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); max-width: 600px;">
    
    <div style="width: 100%;">
      <img src="${CDN_URL}/email/footer.JPG" alt="ISMC XV Footer" width="100%" style="max-width: 100%; display: block;" />
    </div>

    <h1 style="color: #333; font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; padding: 0;">
      Registration Closes Today!
    </h1>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; text-align: center; padding: 0 40px; margin-bottom: 20px;">
      Hello,
    </p>
    <p style="color: #525f7f; font-size: 16px; line-height: 26px; text-align: center; padding: 0 40px;">
      We noticed you have started your journey with ISMC XV but haven't quite crossed the finish line.
    </p>
    <p style="color: #525f7f; font-size: 16px; line-height: 26px; text-align: center; padding: 0 40px;">
      <strong>Today is the official deadline</strong> to complete your registration for the <strong>Mining Insight</strong> events, including the 
      Poster Competition, Paper Competition, Photo Competition, and Hackathon.
    </p>
    <p style="color: #525f7f; font-size: 16px; line-height: 26px; text-align: center; padding: 0 40px;">
      Don't miss your chance to participate. Please finalize your registration below.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${TARGET_LINK}" style="background-color: #000000; border-radius: 6px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; width: 100%; max-width: 210px; padding: 12px 0;">
        Visit ISMC XV.
      </a>
    </div>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; text-align: center; padding: 0 40px;">
      If the button doesn't work, you can visit our website directly at:
    </p>

    <div style="background: #f4f4f4; border-radius: 4px; border: 1px solid #e6ebf1; width: 90%; margin: 16px auto; padding: 12px; text-align: center;">
      <span style="font-size: 12px; color: #555; font-family: monospace; word-break: break-all;">
        ${TARGET_LINK}
      </span>
    </div>

    <hr style="border: 0; border-top: 1px solid #e6ebf1; margin: 20px 0;" />

    <p style="color: #8898aa; font-size: 12px; line-height: 16px; text-align: center; margin-top: 20px;">
      © 2025 ISMC XV. All rights reserved.
    </p>

  </div>
</body>
</html>
`;

type User = {
  email: string;
};

async function main() {
  console.log('Starting "Last Day" reminder script');

  const args = process.argv.slice(2);
  const toArg = args.find(arg => arg.startsWith('--to='));
  const testEmail = toArg ? toArg.split('=')[1] : null;

  let users: User[] = [];

  try {
    if (testEmail) {
      console.log(`TEST MODE ACTIVATED`);
      console.log(`Target: ${testEmail}`);
      users = [{ email: testEmail }];
    } else {
      console.log(`PRODUCTION MODE (Fetching from Database)`);
      
      users = (await sql`
        SELECT email 
        FROM account 
        WHERE 
          events IS NOT NULL 
          AND cardinality(events) > 0 
          AND NOT ('MC' = ANY(events))
      `) as User[];
      
      console.log(`Found ${users.length} users matching criteria.`);
    }

    if (users.length === 0) {
      console.log('No users to email. Exiting.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const { email } = user;
      
      try {
        const { error } = await resend.emails.send({
          from: 'ISMC XV <admin@ismc-xv.com>',
          to: email,
          subject: emailSubject,
          html: emailHtml, 
        });

        if (error) {
          console.error(`Failed to send to ${email}:`, error);
          failCount++;
        } else {
          console.log(`Sent to: ${email}`);
          successCount++;
        }

        if (users.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100)); 
        }

      } catch (err) {
        console.error(`Unexpected error for ${email}:`, err);
        failCount++;
      }
    }

    console.log('---');
    console.log(`Job Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);

  } catch (error) {
    console.error('🚨 Critical Script Error:', error);
  }
}

main();