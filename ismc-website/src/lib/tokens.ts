import { DB } from '@/lib/DB';
import { v4 as uuidv4 } from 'uuid';

type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
}

export async function getVerificationTokenByEmail(email: string) {
  try {
    const rows = await DB`SELECT * FROM verification_token WHERE identifier = ${email}`;
    return rows[0] as VerificationToken;
  } catch {
    return null;
  }
}

export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await DB`DELETE FROM verification_token WHERE identifier = ${email}`;
  }

  const rows = await DB`
    INSERT INTO verification_token (identifier, token, expires)
    VALUES (${email}, ${token}, ${expires})
    RETURNING *
  `;

  return rows[0] as VerificationToken;
}