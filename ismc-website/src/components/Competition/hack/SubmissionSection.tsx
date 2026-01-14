"use client";

import React, { useState, useEffect } from "react";
import { submitProject, getPresignedUrl } from "@/actions/server/hackathon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Loader2, Link as LinkIcon, Quote, Info, X, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";

function parseSDD(sdd: string | null) {
  if (!sdd) return { title: "", theme: "", desc: "" };
  
  let match = sdd.match(/^\[(.*?)\]\[(.*?)\]([\s\S]*)$/);
  
  if (!match) {
    match = sdd.match(/^\[(.*?)\]\[(.*?)$/);
    if (match) {
        return { title: match[1], theme: match[2], desc: "" };
    }
  }

  if (match) {
    return { title: match[1], theme: match[2], desc: match[3] || "" };
  }
  
  return { title: "", theme: "", desc: sdd };
}

function VerificationBadge({ status }: { status: number | null }) {
    if (status === 2) return <Badge className="bg-emerald-600">Verified</Badge>;
    if (status === 1) return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
}

const OD_TEMPLATE_URL = "https://assets.ismc-xv.com/Statement%20of%20Originality.docx";

export function SubmissionSection({
  sdLink,
  sdd,
  odLink,
  odVerified,
  extLinks: initialExtLinks,
  subVerified,
  step = "STEP 4",
  className,
}: {
  sdLink: string | null;
  sdd: string | null;
  odLink: string | null;
  odVerified: number;
  extLinks: string[] | null;
  subVerified: number;
  step?: string;
  className?: string;
}) {
  const parsed = parseSDD(sdd);
  
  const [extLinks, setExtLinks] = useState<string[]>(initialExtLinks || []);
  const [newLink, setNewLink] = useState("");
  
  const [title, setTitle] = useState(parsed.title);
  const [theme, setTheme] = useState(parsed.theme);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const latestParsed = parseSDD(sdd);
    if (latestParsed.title || latestParsed.theme) {
        setTitle(latestParsed.title);
        setTheme(latestParsed.theme);
    }
  }, [sdd]);

  const isSubmitted = subVerified === 0 && sdLink !== null && odLink !== null; 
  const isLocked = isSubmitted || subVerified === 2;

  const addLink = () => {
    if (newLink.trim()) {
      setExtLinks([...extLinks, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeLink = (idx: number) => {
    setExtLinks(extLinks.filter((_, i) => i !== idx));
  };

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
    const links = formData.get("external_links") as string;

    if (!title || !theme) {
        toast.error("Please fill in project title and theme.");
        return;
    }

    if ((!odFile || odFile.size === 0) && !odLink) {
        toast.error("Please select a Statement of Originality file.");
        return;
    }

    if ((!sdFile || sdFile.size === 0) && !sdLink) {
        toast.error("Please select a Project PDF file.");
        return;
    }

    setIsUploading(true);

    try {
        let finalOdKey = "";
        let finalSdKey = "";
        const uploadPromises = [];

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

        if (sdFile && sdFile.size > 0) {
            uploadPromises.push((async () => {
                const res = await getPresignedUrl('submission', sdFile.name, sdFile.type);
                if ('error' in res) throw new Error(res.error);
                const { signedUrl, key } = res;

                if (!signedUrl || !key) throw new Error("Failed to get project upload URL");

                const uploadRes = await fetch(signedUrl, { method: "PUT", body: sdFile, headers: { "Content-Type": sdFile.type } });
                if(!uploadRes.ok) throw new Error("Failed to upload Project document");
                finalSdKey = key;
            })());
        }

        if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
        }

        const serverFormData = new FormData();
        serverFormData.append("originality_key", finalOdKey);
        serverFormData.append("submission_key", finalSdKey);
        serverFormData.append("submission_desc", submissionDesc);
        serverFormData.append("external_links", links);

        const result = await submitProject({}, serverFormData);
        
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
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-background">{step}</Badge>
                <span className="text-sm font-medium text-muted-foreground">Final Submission</span>
            </div>
        </div>
        <CardTitle>Submission & Originality</CardTitle>
        <CardDescription>
          Submit your proof of originality and final project files.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start text-blue-800">
            <Quote className="h-5 w-5 shrink-0 mt-0.5 fill-blue-200" />
            <div>
                <p className="font-medium italic text-sm">
                    “MineTheFuture: Empowering the future of mining technology for the benefit of society and the environment.”
                </p>
            </div>
        </div>

        <form onSubmit={handleSmartSubmit} className="space-y-8">
            
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                        1. Proof of Originality
                        <VerificationBadge status={odVerified} />
                    </h4>
                    <a href={OD_TEMPLATE_URL} download className="text-xs font-normal text-blue-600 hover:underline flex items-center gap-1">
                        <Download className="h-3 w-3" /> Template
                    </a>
                </div>
                
                <div className="px-1">
                    <CustomFileInput 
                        name="doc_originality" 
                        accept=".pdf" 
                        currentFileUrl={odLink} 
                        placeholder="Upload Statement of Originality..."
                        maxSizeMB={5} 
                        disabled={isLocked || isUploading}
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                        2. Project Details
                        <VerificationBadge status={subVerified} />
                    </h4>
                </div>

                <div className="grid gap-5 px-1">
                    
                    <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input 
                            placeholder="Enter your project title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            name="temp_title" 
                            required
                            disabled={isLocked || isUploading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Select Theme</Label>
                        <Select onValueChange={setTheme} value={theme} required disabled={isLocked || isUploading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a theme..." />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* FIX 3: Add the missing bracket ']' here so future saves are correct */}
                    <input 
                        type="hidden" 
                        name="submission_desc" 
                        value={`[${title}][${theme}]`} 
                    />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Submission File (PDF)</Label>
                            {sdLink && (
                                 <a href={sdLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    <Info className="h-3 w-3" /> View Current File
                                 </a>
                            )}
                        </div>
                        <CustomFileInput 
                            name="doc_submission" 
                            accept=".pdf" 
                            currentFileUrl={sdLink}
                            placeholder="Upload project Documents..."
                            maxSizeMB={20}
                            disabled={isLocked || isUploading}
                        />
                    </div>

                    <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                        <Label className="text-base">External Links</Label>
                        <p className="text-xs text-muted-foreground -mt-1.5 mb-2">
                            Add links to GitHub repositories, YouTube videos, or Figma designs.
                        </p>
                        
                        <div className="flex gap-2">
                            <Input 
                                placeholder="https://..." 
                                value={newLink} 
                                onChange={(e) => setNewLink(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); }}}
                                disabled={isLocked || isUploading}
                            />
                            <Button type="button" onClick={addLink} variant="outline" disabled={isLocked || isUploading}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {extLinks.length === 0 && <p className="text-xs text-muted-foreground italic">No links added.</p>}
                            {extLinks.map((link, i) => (
                                <div key={i} className="flex items-center justify-between bg-background p-2.5 rounded border text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate text-blue-600 underline-offset-4 hover:underline">
                                            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                        </span>
                                    </div>
                                    {!isLocked && !isUploading && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeLink(i)}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <input type="hidden" name="external_links" value={JSON.stringify(extLinks)} />
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
                disabled={isUploading || isLocked}
            >
                {isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Submitting...</>
                ) : isLocked ? (
                    "Submitted"
                ) : (
                    "Submit All Files"
                )}
            </Button>
        </form>

      </CardContent>
    </Card>
  );
}