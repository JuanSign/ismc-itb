'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createAccount, getAccountByEmail } from '@/actions/database/account';
import { createSession, deleteSession } from '@/actions/server/session';
import { AuthSchema, AuthState } from '../types/Auth';
import { generateVerificationToken, getVerificationTokenByEmail } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = Object.fromEntries(formData);
  const result = AuthSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  const { email, password } = result.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await createAccount(email, hashedPassword);

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
    
    return { success: true, message: 'Confirmation email sent!' };

  } catch (error) {
    console.error('Registration Error:', error);
    if(error instanceof Error && error.message == "EMAIL_EXISTS" )
      return { success: false, error: "Email already in use." }
    return { success: false, error: 'Failed to create account.' };
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = Object.fromEntries(formData);
  const result = AuthSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  const { email, password } = result.data;

  try {
    const account = await getAccountByEmail(email);
    
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return { success: false, error: 'Invalid credentials.' };
    }

    if (!account.verified_at) {
      const existingToken = await getVerificationTokenByEmail(account.email);
      
      if (!existingToken || new Date(existingToken.expires) < new Date()) {
        const newToken = await generateVerificationToken(account.email);
        await sendVerificationEmail(newToken.identifier, newToken.token);
        
        return { 
          success: false, 
          error: 'Verification token expired. We just sent you a new one!' 
        };
      }

      return { 
        success: false, 
        error: 'Please check your email to verify your account.' 
      };
    }

    await createSession({
      account_id: account.account_id,
      email: account.email,
      events: account.events,
    });

  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: 'Something went wrong.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/register');
}