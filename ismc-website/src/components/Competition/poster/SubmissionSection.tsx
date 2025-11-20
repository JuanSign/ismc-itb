"use client";

import React, { useState, useActionState, useEffect } from "react";
import { submitPoster, uploadOriginalityDoc } from "@/actions/server/poster";
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
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField"

type SubmitState = { error?: string; message?: string };
const initialState: SubmitState = {};

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

const OD_TEMPLATE_URL = "/files/templates/originality-statement.pdf";

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
  
  const [state, action, isPending] = useActionState(submitPoster, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  const themes = [
    "Decarbonization Pathways in Mining Industry",
    "Smart & Sustainable Mining",
    "Mine Waste Valorization",
    "Critical Minerals for Energy Transition",
    "Water Management and Recycling Innovation in Mining Industry"
  ];

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
        
        {/* --- PART 1: ORIGINALITY DOCUMENT --- */}
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold flex items-center gap-2">
                    1. Proof of Originality
                    <a href={OD_TEMPLATE_URL} download className="text-xs font-normal text-blue-600 hover:underline flex items-center gap-1 ml-2">
                        <Download className="h-3 w-3" /> Download Template
                    </a>
                </h4>
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

        {/* --- PART 2: POSTER SUBMISSION --- */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold">2. Poster & Description</h4>
                <VerificationBadge status={subVerified} />
            </div>

            <form action={action} className="space-y-6">
                <div className="grid gap-5">
                    <div className="space-y-2">
                        <Label>Poster Title</Label>
                        <Input placeholder="Enter poster title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Select Theme</Label>
                        <Select onValueChange={setTheme} value={theme} required>
                            <SelectTrigger><SelectValue placeholder="Select a theme..." /></SelectTrigger>
                            <SelectContent>
                                {themes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Description / Explanation</Label>
                        <p className="text-xs text-muted-foreground">Write 1-2 paragraphs explaining your poster&apos;s content.</p>
                        <Textarea placeholder="Explain your poster content..." className="min-h-[150px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    
                    <input type="hidden" name="submission_desc" value={`[${title}][${theme}]${description}`} />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Poster File (PDF/JPG/PNG)</Label>
                            {sdLink && <a href={sdLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Info className="h-3 w-3" /> View Current File</a>}
                        </div>
                        {/* Accept Images for Poster */}
                        <CustomFileInput name="doc_submission" accept=".pdf,.jpg,.jpeg,.png" currentFileUrl={sdLink} placeholder="Upload Poster..." />
                    </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Poster"}
                </Button>
            </form>
        </div>

      </CardContent>
    </Card>
  );
}