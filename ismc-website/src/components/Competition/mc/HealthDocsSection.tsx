"use client";

import React from "react";
import { uploadHealthDocuments } from "@/actions/server/mc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Hourglass, XCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

const HEALTH_STATEMENT_URL = "/files/templates/health-statement.pdf";

export function HealthDocsSection({
  hdLink,
  hdVerified,
  step = "STEP 4",
  className,
}: {
  hdLink: string | null;
  hdVerified: number;
  step?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-l-4", className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Optional/Final Documents</span>
        </div>
        <CardTitle>Health Documents</CardTitle>
        <CardDescription>
          Upload the compiled health documents for your team members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Download Section */}
        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
          <h4 className="font-medium text-sm text-muted-foreground">Download Template (Optional)</h4>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="bg-background">
                <a href={HEALTH_STATEMENT_URL} download>
                <Download className="mr-2 h-4 w-4" /> Health Document (HD)
                </a>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <FileUploaderField
            name="doc_health"
            label="Health Documents (HD)"
            accept=".pdf"
            currentFileUrl={hdLink}
            verificationBadge={<VerificationBadge status={hdVerified} />}
            uploadAction={uploadHealthDocuments}
        />
      </CardContent>
    </Card>
  );
}