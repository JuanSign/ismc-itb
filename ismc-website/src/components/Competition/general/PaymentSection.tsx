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
    0: { icon: <Hourglass className="h-4 w-4" />, className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    1: { icon: <XCircle className="h-4 w-4" />, className: "text-red-400 bg-red-400/10 border-red-400/20" },
    2: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
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

  // Use glassmorphism card class
  const cardClass = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";
  
  // Check if there is only one payment method to adjust layout
  const isSingleMethod = paymentMethods.length === 1;

  return (
    <Card className={cn("border-l-4", cardClass, className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge 
                className={stepBadgeClassName}
            >
                {step}
            </Badge>
            <span className="text-sm font-medium text-slate-400">Payment Verification</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-white">Payment</CardTitle>
                <CardDescription className="mt-1 text-slate-400">
                  Select a method below and transfer the EXACT amount.
                </CardDescription>
            </div>
            <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Amount</span>
                  <span className="text-2xl font-bold text-yellow-400 tracking-tight">{price}</span>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* Payment Methods Grid - UPDATED HERE */}
        <div className={cn(
            "grid gap-4",
            // If single: 1 column, max-width to look like a card, centered
            // If multiple: Standard 1 column mobile, 2 columns desktop
            isSingleMethod 
                ? "grid-cols-1 max-w-lg mx-auto w-full" 
                : "grid-cols-1 md:grid-cols-2"
        )}>
            {paymentMethods.map((method, index) => (
                <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-blue-500/50 hover:bg-white/10"
                >
                    {/* Background Decorator */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <div className="relative space-y-4">
                        {/* Header: Bank Name */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-white/10 shadow-sm">
                                <Building2 className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Transfer</span>
                                <span className="font-bold text-white">{method.bankName}</span>
                            </div>
                        </div>

                        {/* Body: Account Number */}
                        <div className="space-y-1.5">
                            <span className="text-xs text-slate-400">Account Number</span>
                            <div className="flex items-center gap-2">
                                <code className="text-xl font-mono font-semibold tracking-tight text-blue-300">
                                    {method.accountNumber}
                                </code>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                    onClick={() => copyToClipboard(method.accountNumber, method.bankName)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Footer: Account Holder */}
                        <div className="pt-2 border-t border-white/10 border-dashed">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
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
                <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">
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