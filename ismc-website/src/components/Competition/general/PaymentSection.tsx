"use client";

import React from "react";
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
import { Hourglass, XCircle, CheckCircle2, CreditCard, Copy } from "lucide-react";
import { toast } from "sonner";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

// --- Types ---
type UploadState = { error?: string; message?: string };

type PaymentProps = {
  paymentProofUrl: string | null;
  ppVerified: number;
  step?: string;
  className?: string;
  
  // New Props for Generic Use
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  price: string;
  uploadAction: (prevState: UploadState, formData: FormData) => Promise<UploadState>;
};

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
  bankName,
  accountNumber,
  accountHolder,
  price,
  uploadAction
}: PaymentProps) {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Payment Verification</span>
        </div>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Please transfer the registration fee and upload the proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Bank Details Card */}
        <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Transfer Destination</span>
                </div>
                <Badge variant="secondary" className="text-base font-bold text-primary">
                    {price}
                </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Bank Name</span>
                    <p className="font-semibold text-foreground">{bankName}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Account Holder</span>
                    <p className="font-semibold text-foreground">{accountHolder}</p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                    <span className="text-xs text-muted-foreground">Account Number</span>
                    <div className="flex items-center gap-2">
                        <code className="bg-background border rounded px-2 py-1 text-lg font-mono tracking-wider">
                            {accountNumber}
                        </code>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(accountNumber)} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <FileUploaderField
          name="payment_proof_url"
          label="Payment Proof File (JPG/PNG/PDF)"
          accept=".pdf,.jpg,.jpeg,.png"
          currentFileUrl={paymentProofUrl}
          verificationBadge={<VerificationBadge status={ppVerified} />}
          uploadAction={uploadAction}
        />
      </CardContent>
    </Card>
  );
}