'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '@/actions/server/verify';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const hasFired = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (hasFired.current) return;
    hasFired.current = true;

    verifyEmail(token)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        }
        if (data.success) {
          setSuccess(data.success);
        }
      })
      .catch(() => {
        setError('Something went wrong!');
      });
  }, [token]);

  const finalError = error || (!token ? "Missing token!" : undefined);
  
  const isLoading = !success && !finalError;

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Verify your account</CardTitle>
        <CardDescription>
          Confirming your email verification status.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        {/* 1. Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying...</p>
          </div>
        )}

        {/* 2. Success State */}
        {success && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in-50 zoom-in-95 duration-300">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold text-emerald-600">Verified!</p>
            <p className="text-center text-sm text-muted-foreground">
              {success}
            </p>
          </div>
        )}

        {/* 3. Error State */}
        {finalError && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in-50 zoom-in-95 duration-300">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-semibold text-destructive">Verification Failed</p>
            <p className="text-center text-sm text-muted-foreground px-4">
              {finalError}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button asChild variant={success ? "default" : "outline"} className="w-full">
          <Link href="/register">
            {success ? "Continue to Login" : "Back to Login"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function VerificationFallback() {
  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Verify your account</CardTitle>
        <CardDescription>Please wait...</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default function NewVerificationPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Suspense fallback={<VerificationFallback />}>
        <VerificationContent />
      </Suspense>
    </div>
  );
}