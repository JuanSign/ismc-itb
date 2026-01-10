"use client";

import React, { useState } from "react";
import { submitPaper, getPresignedUrl } from "@/actions/server/paper";
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

const OD_TEMPLATE_URL = "https://assets.ismc-xv.com/Statement%20of%20Originality.docx";

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
  
  const [isUploading, setIsUploading] = useState(false);

  // Status checks
  // 0 = Pending, 1 = Rejected, 2 = Accepted
  const isLocked = subVerified === 2; // Lock if Accepted
  
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

  const handleSmartSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLocked) {
        toast.error("Submission is locked (Accepted).");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const odFile = formData.get("doc_originality") as File;
    const sdFile = formData.get("doc_submission") as File;
    const submissionDesc = formData.get("submission_desc") as string;

    if (!title || !theme) {
        toast.error("Please fill in Paper Title and Theme.");
        return;
    }

    // Require files only if they haven't been uploaded yet
    if ((!odFile || odFile.size === 0) && !odLink) {
        toast.error("Please select a Statement of Originality file.");
        return;
    }

    if ((!sdFile || sdFile.size === 0) && !sdLink) {
        toast.error("Please select a Paper Abstract/Full Paper file.");
        return;
    }

    setIsUploading(true);

    try {
        let finalOdKey = "";
        let finalSdKey = "";
        const uploadPromises = [];

        // 1. Upload Originality if new file present
        if (odFile && odFile.size > 0) {
            uploadPromises.push((async () => {
                const res = await getPresignedUrl('originality', odFile.name, odFile.type);
                if ('error' in res) throw new Error(res.error);
                const { signedUrl, key } = res;
                if (!signedUrl || !key) throw new Error("Failed to get originality upload URL");

                const uploadRes = await fetch(signedUrl, { method: "PUT", body: odFile, headers: { "Content-Type": odFile.type } });
                if(!uploadRes.ok) throw new Error("Failed to upload Originality document");
                finalOdKey = key;
            })());
        }

        // 2. Upload Submission if new file present
        if (sdFile && sdFile.size > 0) {
            uploadPromises.push((async () => {
                const res = await getPresignedUrl('submission', sdFile.name, sdFile.type);
                if ('error' in res) throw new Error(res.error);
                const { signedUrl, key } = res;
                if (!signedUrl || !key) throw new Error("Failed to get submission upload URL");

                const uploadRes = await fetch(signedUrl, { method: "PUT", body: sdFile, headers: { "Content-Type": sdFile.type } });
                if(!uploadRes.ok) throw new Error("Failed to upload Submission document");
                finalSdKey = key;
            })());
        }

        if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
        }

        // 3. Submit to Server Action
        const serverFormData = new FormData();
        serverFormData.append("originality_key", finalOdKey);
        serverFormData.append("submission_key", finalSdKey);
        serverFormData.append("submission_desc", submissionDesc);

        // Pass empty object for initial state
        const result = await submitPaper({}, serverFormData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message);
        }

    } catch (err) {
        const msg = err instanceof Error ? err.message : "Error submitting files.";
        toast.error(msg);
    } finally {
        setIsUploading(false);
    }
  };

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
        
        <form onSubmit={handleSmartSubmit} className="space-y-8">
            
            {/* --- PART 1: ORIGINALITY DOCUMENT --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <div className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-indigo-500/30">1</div>
                        Proof of Originality
                        <VerificationBadge status={odVerified} />
                    </h4>
                    <a href={OD_TEMPLATE_URL} download className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                        <Download className="h-3 w-3" /> Template
                    </a>
                </div>
                
                <CustomFileInput 
                    name="doc_originality" 
                    accept=".pdf" 
                    currentFileUrl={odLink} 
                    placeholder="Upload Statement of Originality (PDF)..."
                    maxSizeMB={5}
                    disabled={isLocked || isUploading}
                />
            </div>

            {/* --- PART 2: ABSTRACT SUBMISSION --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <div className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-indigo-500/30">2</div>
                        Paper Submission
                        <VerificationBadge status={subVerified} />
                    </h4>
                </div>

                <div className="grid gap-5">
                    <div className="space-y-2">
                        <Label className={labelClass}>Paper Title</Label>
                        <Input 
                            className={inputClass}
                            placeholder="Enter paper title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            disabled={isLocked || isUploading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className={labelClass}>Select Theme</Label>
                        <Select onValueChange={setTheme} value={theme} required disabled={isLocked || isUploading}>
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
                    
                    {/* Hidden input for server compatibility: [Title][Theme] */}
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
                            placeholder="Upload Paper..." 
                            maxSizeMB={20}
                            disabled={isLocked || isUploading}
                        />
                    </div>
                </div>
            </div>
            
            <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-none" 
                disabled={isUploading || isLocked}
            >
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : isLocked ? "Submission Accepted" : "Submit All Files"}
            </Button>
        </form>

      </CardContent>
    </Card>
  );
}