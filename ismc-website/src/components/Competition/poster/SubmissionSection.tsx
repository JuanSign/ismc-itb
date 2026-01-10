"use client";

import React, { useState } from "react";
import { submitPoster, getPresignedUrl } from "@/actions/server/poster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Info, Download } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";

function parseSDD(sdd: string | null) {
  if (!sdd) return { title: "", theme: "", desc: "" };
  const match = sdd.match(/^\[(.*?)\]\[(.*?)\]([\s\S]*)$/);
  if (match) return { title: match[1], theme: match[2], desc: match[3] };
  return { title: "", theme: "", desc: sdd };
}

function VerificationBadge({ status }: { status: number | null }) {
  if (status === 2) return <Badge className="bg-emerald-600">Verified</Badge>;
  if (status === 1) return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

const OD_TEMPLATE_URL = "https://assets.ismc-xv.com/Statement%20of%20Originality.docx";

export function PosterSubmissionSection({
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
  const [description, setDescription] = useState(parsed.desc);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const isSubmitted = subVerified === 0 && sdLink !== null && odLink !== null; 
  const isLocked = isSubmitted || subVerified === 2;

  const themes = [
    "Decarbonization Pathways in Mining Industry",
    "Smart & Sustainable Mining",
    "Mine Waste Valorization",
    "Critical Minerals for Energy Transition",
    "Water Management and Recycling Innovation in Mining Industry"
  ];

  const handleSmartSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLocked) {
        toast.error("You have already submitted.");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const odFile = formData.get("doc_originality") as File;
    const sdFile = formData.get("doc_submission") as File;
    const submissionDesc = formData.get("submission_desc") as string;

    // --- Validation ---
    if (!title || !theme || !description) {
        toast.error("Please fill in all text fields.");
        return;
    }

    if ((!odFile || odFile.size === 0) && !odLink) {
        toast.error("Please select a Statement of Originality file.");
        return;
    }

    if ((!sdFile || sdFile.size === 0) && !sdLink) {
        toast.error("Please select a Poster file.");
        return;
    }

    setIsUploading(true);

    try {
        let finalOdKey = "";
        let finalSdKey = "";
        const uploadPromises = [];

        // --- 1. Upload Originality ---
        if (odFile && odFile.size > 0) {
            uploadPromises.push((async () => {
                // Fix: Check for error property before accessing signedUrl
                const res = await getPresignedUrl('originality', odFile.name, odFile.type);
                
                if ('error' in res) throw new Error(res.error);
                
                // Now TS knows 'res' is { signedUrl, key }
                const { signedUrl, key } = res; 
                
                if (!signedUrl || !key) throw new Error("Failed to get originality upload URL");

                const uploadRes = await fetch(signedUrl, { method: "PUT", body: odFile, headers: { "Content-Type": odFile.type } });
                if(!uploadRes.ok) throw new Error("Failed to upload Originality document");
                finalOdKey = key;
            })());
        }

        // --- 2. Upload Poster ---
        if (sdFile && sdFile.size > 0) {
            uploadPromises.push((async () => {
                // Fix: Check for error property before accessing signedUrl
                const res = await getPresignedUrl('submission', sdFile.name, sdFile.type);
                
                if ('error' in res) throw new Error(res.error);
                
                // Now TS knows 'res' is { signedUrl, key }
                const { signedUrl, key } = res;

                if (!signedUrl || !key) throw new Error("Failed to get poster upload URL");

                const uploadRes = await fetch(signedUrl, { method: "PUT", body: sdFile, headers: { "Content-Type": sdFile.type } });
                if(!uploadRes.ok) throw new Error("Failed to upload Poster document");
                finalSdKey = key;
            })());
        }

        if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
        }

        // --- 3. Submit Keys ---
        const serverFormData = new FormData();
        serverFormData.append("originality_key", finalOdKey);
        serverFormData.append("submission_key", finalSdKey);
        serverFormData.append("submission_desc", submissionDesc);

        // Fix: Pass empty object {} instead of null
        const result = await submitPoster({}, serverFormData);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message);
        }

    } catch (err) {
        console.error(err);
        // Fix: safe error message extraction
        const msg = err instanceof Error ? err.message : "Error submitting files.";
        toast.error(msg);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Poster Submission</span>
        </div>
        <CardTitle>Submission & Originality</CardTitle>
        <CardDescription>Submit your Proof of Originality and Poster.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <form onSubmit={handleSmartSubmit} className="space-y-8">
            
            {/* ORIGINALITY */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                        1. Proof of Originality
                        <VerificationBadge status={odVerified} />
                    </h4>
                    <a href={OD_TEMPLATE_URL} download className="text-xs font-normal text-blue-600 hover:underline flex items-center gap-1">
                        <Download className="h-3 w-3" /> Template
                    </a>
                </div>
                
                <CustomFileInput 
                    name="doc_originality" 
                    accept=".pdf" 
                    currentFileUrl={odLink} 
                    placeholder="Upload Statement of Originality..."
                    maxSizeMB={10} 
                    disabled={isLocked || isUploading}
                />
            </div>

            {/* POSTER */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold">2. Poster & Description</h4>
                    <VerificationBadge status={subVerified} />
                </div>

                <div className="grid gap-5">
                    <div className="space-y-2">
                        <Label>Poster Title</Label>
                        <Input 
                            placeholder="Enter poster title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            disabled={isLocked || isUploading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Select Theme</Label>
                        <Select onValueChange={setTheme} value={theme} required disabled={isLocked || isUploading}>
                            <SelectTrigger><SelectValue placeholder="Select a theme..." /></SelectTrigger>
                            <SelectContent>
                                {themes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Description / Explanation</Label>
                        <p className="text-xs text-muted-foreground">Write 1-2 paragraphs explaining your poster&apos;s content.</p>
                        <Textarea 
                            placeholder="Explain your poster content..." 
                            className="min-h-[150px]" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            disabled={isLocked || isUploading}
                        />
                    </div>
                    
                    <input type="hidden" name="submission_desc" value={`[${title}][${theme}]${description}`} />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Poster File (PDF/JPG/PNG)</Label>
                            {sdLink && <a href={sdLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Info className="h-3 w-3" /> View Current File</a>}
                        </div>
                        <CustomFileInput 
                            name="doc_submission" 
                            accept=".jpg,.jpeg,.png" 
                            currentFileUrl={sdLink} 
                            placeholder="Upload Poster (Max 20MB)..." 
                            maxSizeMB={100}
                            disabled={isLocked || isUploading}
                        />
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
                disabled={isUploading || isLocked}
            >
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Submitting...</> : isLocked ? "Submitted" : "Submit All Files"}
            </Button>
        </form>

      </CardContent>
    </Card>
  );
}