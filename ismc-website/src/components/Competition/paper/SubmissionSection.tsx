"use client";

import React, { useState, useActionState, useEffect } from "react";
import { submitPaper, uploadOriginalityDoc } from "@/actions/server/paper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Info, Download, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

type SubmitState = { error?: string; message?: string };
const initialState: SubmitState = {};

// --- Helper: Parse SDD ---
function parseSDD(sdd: string | null) {
  if (!sdd) return { title: "", theme: "" };
  const match = sdd.match(/^\[(.*?)\]\[(.*?)\]([\s\S]*)$/);
  if (match) return { title: match[1], theme: match[2] };
  // Fallback if format doesn't match
  return { title: "", theme: "" };
}

// --- Verification Badge ---
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

const OD_TEMPLATE_URL = "/files/templates/originality-statement.pdf";

export function SubmissionSection({
  sdLink,
  sdd,
  subVerified,
  odLink,
  odVerified,
  step = "STEP 3",
  className,
}: {
  sdLink: string | null;
  sdd: string | null;
  subVerified: number;
  odLink: string | null;
  odVerified: number;
  step?: string;
  className?: string;
}) {
  const parsed = parseSDD(sdd);
  const [title, setTitle] = useState(parsed.title);
  const [theme, setTheme] = useState(parsed.theme);
  
  const [state, action, isPending] = useActionState(submitPaper, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  const themes = [
    "Financing and Strategic Roadmap for Net-Zero Emissions",
    "Leveraging AI and Digital Twins for Supply Chains",
    "Circular Economy Innovations: Upcycling Mine Tailings",
    "Geopolitical Risk & Financial Modeling of Critical Minerals",
    "Integrated Water-Energy Nexus: Climate-Resilient Strategies"
  ];

  const cardClass = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";
  const inputClass = "bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50";
  const labelClass = "text-slate-300";

  return (
    <Card className={cn("border-l-4", cardClass, className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white">
                {step}
            </Badge>
            <span className="text-sm font-medium text-slate-400">Paper Submission</span>
        </div>
        <CardTitle className="text-white">Submission & Originality</CardTitle>
        <CardDescription className="text-slate-400">Submit your Proof of Originality and Paper Abstract.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* --- PART 1: ORIGINALITY DOCUMENT --- */}
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <div className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-indigo-500/30">1</div>
                    Proof of Originality
                </h4>
                <a href={OD_TEMPLATE_URL} download className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                    <Download className="h-3 w-3" /> Template
                </a>
            </div>
            
            <FileUploaderField
                name="doc_originality"
                label="Statement of Originality (PDF)"
                accept=".pdf"
                currentFileUrl={odLink}
                verificationBadge={<VerificationBadge status={odVerified} />}
                uploadAction={uploadOriginalityDoc}
            />
        </div>

        {/* --- PART 2: ABSTRACT SUBMISSION --- */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <div className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-indigo-500/30">2</div>
                    Paper Submission
                </h4>
                <VerificationBadge status={subVerified} />
            </div>

            <form action={action} className="space-y-6">
                <div className="grid gap-5">
                    <div className="space-y-2">
                        <Label className={labelClass}>Paper Title</Label>
                        <Input 
                            className={inputClass}
                            placeholder="Enter paper title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className={labelClass}>Select Theme</Label>
                        <Select onValueChange={setTheme} value={theme} required>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Select a theme..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                                {themes.map((t) => (
                                    <SelectItem key={t} value={t} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Hidden input for server compatibility. 
                        Format: [Title][Theme] 
                        (Description part is now empty/implicit) 
                    */}
                    <input type="hidden" name="submission_desc" value={`[${title}][${theme}]`} />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className={labelClass}>Abstract / Full Paper (PDF)</Label>
                            {sdLink && (
                                <a href={sdLink} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                                    <Info className="h-3 w-3" /> View Current File
                                </a>
                            )}
                        </div>
                        <CustomFileInput 
                            name="doc_submission" 
                            accept=".pdf" 
                            currentFileUrl={sdLink} 
                            placeholder="Upload PDF..." 
                        />
                    </div>
                </div>
                
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-none" disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Paper"}
                </Button>
            </form>
        </div>

      </CardContent>
    </Card>
  );
}