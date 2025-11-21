"use client";

import React from "react";
import { uploadHealthDocument, uploadAssignmentDocument } from "@/actions/server/mc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Hourglass, XCircle, CheckCircle2, Info, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

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

const ASSIGNMENT_TEMPLATE_URL = `${process.env.NEXT_PUBLIC_CDN_URL}/mc/team_assignment_template.docx`;

type Props = {
  healthLink: string | null;
  healthVerified: number;
  assignmentLink: string | null;
  assignmentVerified: number;
  step?: string;
  className?: string;
  stepBadgeClassName?: string;
};

export function TeamDocumentSection({
  healthLink,
  healthVerified,
  assignmentLink,
  assignmentVerified,
  step = "STEP 4",
  className,
  stepBadgeClassName,
}: Props) {
  
  const cardClass = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

  return (
    <Card className={cn("border-l-4", cardClass, className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge 
                variant={stepBadgeClassName ? "default" : "outline"} 
                className={cn(
                    stepBadgeClassName ? "border-transparent" : "bg-transparent border-slate-500 text-slate-300", 
                    stepBadgeClassName
                )}
            >
                {step}
            </Badge>
            <span className="text-sm font-medium text-slate-400">Team Documents</span>
        </div>
        <CardTitle className="text-white">Health & Role Assignment</CardTitle>
        <CardDescription className="text-slate-400">
          Please upload the proof of health and team role assignments.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* --- SECTION 1: Health Statement --- */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">1. Health Statement Letter</h3>
            </div>
            
            {/* Instruction Box - Dark Blue Theme */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm text-blue-200 font-medium">Requirement Details</p>
                    <p className="text-xs text-blue-300/80 leading-relaxed">
                        This document must prove that the team is in healthy condition. 
                        It must be issued by a <strong>Hospital or Clinic</strong> and dated 
                        <strong> at least 3 January 2025</strong>. And provide valid health insurance for each member.
                        No specific template provided.
                    </p>
                </div>
            </div>

            <FileUploaderField
                name="doc_health_statement"
                label="Upload Health Statement"
                accept=".pdf"
                currentFileUrl={healthLink}
                verificationBadge={<VerificationBadge status={healthVerified} />}
                uploadAction={uploadHealthDocument} 
            />
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">2. Team Assignment Document</h3>
            </div>

             {/* Download Template Block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-lg border border-white/10 border-dashed">
                <div className="space-y-1">
                      <h4 className="text-sm font-medium flex items-center gap-2 text-slate-200">
                        <FileText className="h-4 w-4 text-slate-400" />
                        Template
                      </h4>
                      <p className="text-xs text-slate-400">
                        Download the template, fill in the roles, and upload as PDF.
                      </p>
                </div>
                <Button asChild variant="outline" size="sm" className="bg-transparent border-white/20 text-slate-200 hover:bg-white/10 hover:text-white shrink-0">
                    <a href={ASSIGNMENT_TEMPLATE_URL} download target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download Template
                    </a>
                </Button>
            </div>

            <FileUploaderField
                name="doc_team_assignment"
                label="Upload Team Assignment"
                accept=".pdf"
                currentFileUrl={assignmentLink}
                verificationBadge={<VerificationBadge status={assignmentVerified} />}
                uploadAction={uploadAssignmentDocument} 
            />
        </div>

      </CardContent>
    </Card>
  );
}