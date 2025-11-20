"use client";

import React, { useState, useActionState, useEffect } from "react";
import { submitProject } from "@/actions/server/hackathon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Loader2, Link as LinkIcon, Quote, Info, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput"

type SubmitState = { error?: string; message?: string };
const initialState: SubmitState = {};

// --- Helper to parse the [Title][Theme][Desc] format ---
function parseSDD(sdd: string | null) {
  if (!sdd) return { title: "", theme: "", desc: "" };
  // Regex to match [Title][Theme]Description
  // We use [\s\S]* for description to match newlines
  const match = sdd.match(/^\[(.*?)\]\[(.*?)\]([\s\S]*)$/);
  if (match) {
    return { title: match[1], theme: match[2], desc: match[3] };
  }
  // Fallback if format doesn't match
  return { title: "", theme: "", desc: sdd };
}

export function SubmissionSection({
  sdLink,
  sdd,
  extLinks: initialExtLinks,
  subVerified,
  step = "STEP 4",
  className,
}: {
  sdLink: string | null;
  sdd: string | null;
  extLinks: string[] | null;
  subVerified: number;
  step?: string;
  className?: string;
}) {
  // 1. Parse existing data
  const parsed = parseSDD(sdd);
  
  const [extLinks, setExtLinks] = useState<string[]>(initialExtLinks || []);
  const [newLink, setNewLink] = useState("");
  
  // Form State
  const [title, setTitle] = useState(parsed.title);
  const [theme, setTheme] = useState(parsed.theme);
  const [description, setDescription] = useState(parsed.desc);

  const [state, action, isPending] = useActionState(submitProject, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  const addLink = () => {
    if (newLink.trim()) {
      // Basic URL validation could go here
      setExtLinks([...extLinks, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeLink = (idx: number) => {
    setExtLinks(extLinks.filter((_, i) => i !== idx));
  };

  // Themes List
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
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-background">{step}</Badge>
                <span className="text-sm font-medium text-muted-foreground">Project Submission</span>
            </div>
            <Badge variant={subVerified === 2 ? "default" : "secondary"}>
                {subVerified === 2 ? "Verified" : "Pending Verification"}
            </Badge>
        </div>
        <CardTitle>Submission</CardTitle>
        <CardDescription>
          Submit your project details, files, and related links.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Theme Quote Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start text-blue-800">
            <Quote className="h-5 w-5 shrink-0 mt-0.5 fill-blue-200" />
            <div>
                <p className="font-medium italic text-sm">
                    “MineTheFuture: Empowering the future of mining technology for the benefit of society and the environment.”
                </p>
            </div>
        </div>

        <form action={action} className="space-y-6">
            <div className="grid gap-5">
                
                {/* Title */}
                <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input 
                        placeholder="Enter your project title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        name="temp_title" // Not read by server directly
                        required
                    />
                </div>

                {/* Theme Selection */}
                <div className="space-y-2">
                    <Label>Select Theme</Label>
                    <Select onValueChange={setTheme} value={theme} required>
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

                {/* Description */}
                <div className="space-y-2">
                    <Label>Description / Abstract</Label>
                    <Textarea 
                        placeholder="Describe your project, objectives, and solution..." 
                        className="min-h-[150px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                {/* HIDDEN INPUT: Merges Title, Theme, and Desc for the Server Action */}
                {/* Format: [Title][Theme]Description */}
                <input 
                    type="hidden" 
                    name="submission_desc" 
                    value={`[${title}][${theme}]${description}`} 
                />

                {/* File Upload */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Submission File (PDF)</Label>
                        {sdLink && (
                             <a href={sdLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Info className="h-3 w-3" /> View Current File
                             </a>
                        )}
                    </div>
                    {/* Using CustomFileInput purely as a UI wrapper for the input */}
                    <CustomFileInput 
                        name="doc_submission" 
                        accept=".pdf" 
                        currentFileUrl={sdLink}
                        placeholder="Upload project PDF..."
                    />
                </div>

                {/* External Links */}
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
                        />
                        <Button type="button" onClick={addLink} variant="outline"><Plus className="h-4 w-4" /></Button>
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
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeLink(i)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    {/* Hidden input for external links JSON */}
                    <input type="hidden" name="external_links" value={JSON.stringify(extLinks)} />
                </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isPending}>
                {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Project...</>
                ) : (
                    "Submit Project"
                )}
            </Button>
        </form>

      </CardContent>
    </Card>
  );
}