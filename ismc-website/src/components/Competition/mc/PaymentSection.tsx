"use client";

import React from "react";
import { updateBilling } from "@/actions/server/mc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Hourglass, XCircle, CheckCircle2 } from "lucide-react";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

function VerificationBadge({ status }: { status: number | null }) {
  const config = {
    0: { icon: <Hourglass className="h-4 w-4" />, className: "text-yellow-600 bg-yellow-50 border-yellow-300" },
    1: { icon: <XCircle className="h-4 w-4" />, className: "text-destructive bg-destructive/10 border-destructive/50" },
    2: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-emerald-600 bg-emerald-50 border-emerald-400" },
  }[status ?? 0] || { icon: null, className: "" };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-8 w-8 p-0 cursor-default hover:bg-transparent", config.className)}
      disabled
    >
      {config.icon}
    </Button>
  );
}

export function PaymentSection({
  paymentProofUrl,
  ppVerified,
  step = "STEP 3",
  className,
}: {
  paymentProofUrl: string | null;
  ppVerified: number;
  step?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Payment Verification</span>
        </div>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Please complete your payment and upload the proof of transaction here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploaderField
          name="payment_proof_url"
          label="Payment Proof File (JPG/PNG/PDF)"
          accept=".pdf,.jpg,.jpeg,.png"
          currentFileUrl={paymentProofUrl}
          verificationBadge={<VerificationBadge status={ppVerified} />}
          uploadAction={updateBilling}
        />
      </CardContent>
    </Card>
  );
}