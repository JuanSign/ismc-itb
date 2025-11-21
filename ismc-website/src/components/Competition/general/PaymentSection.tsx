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
import { Hourglass, XCircle, CheckCircle2, CreditCard, Copy, Building2 } from "lucide-react";
import { toast } from "sonner";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

// --- Types ---
type UploadState = { error?: string; message?: string };

export type PaymentMethod = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

type PaymentProps = {
  paymentProofUrl: string | null;
  ppVerified: number;
  step?: string;
  className?: string;
  
  stepBadgeClassName?: string; 

  paymentMethods: PaymentMethod[];
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
  stepBadgeClassName,
  paymentMethods,
  price,
  uploadAction
}: PaymentProps) {
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge 
                className={stepBadgeClassName}
            >
                {step}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">Payment Verification</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle>Payment</CardTitle>
                <CardDescription className="mt-1">
                  Select a method below and transfer the EXACT amount.
                </CardDescription>
            </div>
            <div className="flex flex-col items-end">
                 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</span>
                 <span className="text-2xl font-bold text-primary">{price}</span>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => (
                <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-xl border bg-muted/30 p-5 transition-all hover:border-primary/50 hover:bg-muted/50"
                >
                    {/* Background Decorator */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <div className="relative space-y-4">
                        {/* Header: Bank Name */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border shadow-sm">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Transfer</span>
                                <span className="font-bold text-foreground">{method.bankName}</span>
                            </div>
                        </div>

                        {/* Body: Account Number */}
                        <div className="space-y-1.5">
                            <span className="text-xs text-muted-foreground">Account Number</span>
                            <div className="flex items-center gap-2">
                                <code className="text-xl font-mono font-semibold tracking-tight text-primary">
                                    {method.accountNumber}
                                </code>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => copyToClipboard(method.accountNumber, method.bankName)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Footer: Account Holder */}
                        <div className="pt-2 border-t border-dashed">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>{method.accountHolder}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Then Upload Proof
                </span>
            </div>
        </div>

        <FileUploaderField
          name="payment_proof_url"
          label="Payment Proof File"
          accept=".pdf,.jpg,.jpeg,.png"
          currentFileUrl={paymentProofUrl}
          verificationBadge={<VerificationBadge status={ppVerified} />}
          uploadAction={uploadAction}
        />
      </CardContent>
    </Card>
  );
}