'use server';

import { DB } from '@/lib/DB';
import { getAccountByEmail, markAccountAsVerified } from '@/actions/database/account';

export async function verifyEmail(token: string) {
  const rows = await DB`SELECT * FROM verification_token WHERE token = ${token}`;
  const existingToken = rows[0];

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getAccountByEmail(existingToken.identifier);
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await markAccountAsVerified(existingToken.identifier);
  await DB`DELETE FROM verification_token WHERE identifier = ${existingToken.identifier}`;

  return { success: "Email verified!" };
}