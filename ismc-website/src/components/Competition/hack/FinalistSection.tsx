"use client";

import { useRef, useState } from "react";
import { 
  getFinalistUploadUrl, 
  saveFinalistProject, 
  saveFinalistSlides 
} from "@/actions/server/hackathon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Presentation, Link as LinkIcon, ExternalLink, UploadCloud, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type FinalistProps = {
  isFinalist: boolean;
  finalPdf: string | null; 
  finalLinks: { title: string; url: string }[] | null;
  finalSlides: string | null; 
};

const GLASS_CARD = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

export function FinalistSection({ isFinalist, finalPdf, finalLinks, finalSlides }: FinalistProps) {
  const [loading, setLoading] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const slidesInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  // Form States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [slidesFile, setSlidesFile] = useState<File | null>(null);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([{ title: "", url: "" }]);

  if (!isFinalist) return null;

  // --- Helper: Client-Side Upload to R2 ---
  const uploadToR2 = async (file: File, type: 'pdf' | 'slides') => {
    const { signedUrl, key } = await getFinalistUploadUrl(file.name, file.type, type);
    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!uploadRes.ok) throw new Error("Failed to upload file to storage.");
    return key;
  };

  const onSubmitProject = async () => {
    // 1. Validate Links (Mandatory)
    const validLinks = links.filter(l => l.title.trim() !== "" && l.url.trim() !== "");
    if (validLinks.length === 0) {
        return toast.error("Please provide at least one valid link (e.g. Github Repo).");
    }

    setLoading(true);
    const toastId = toast.loading("Submitting Final Project...");
    
    try {
      let fileKey = null;

      if (pdfFile) {
          toast.loading("Uploading PDF...", { id: toastId });
          fileKey = await uploadToR2(pdfFile, 'pdf');
      }

      await saveFinalistProject(fileKey, validLinks);
      toast.success("Final submission received!", { id: toastId });

    } catch (e) {
      console.error(e);
      toast.error("Submission failed. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSlides = async () => {
    if (!slidesFile) return toast.error("Please select a slides file.");
    setLoading(true);
    const toastId = toast.loading("Uploading Presentation Slides...");
    try {
      const fileKey = await uploadToR2(slidesFile, 'slides');
      await saveFinalistSlides(fileKey);
      toast.success("Slides updated successfully!", { id: toastId });
      setSlidesFile(null);
    } catch (e) {
      console.error(e);
      toast.error("Upload failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Determine if submitted based on PDF OR Links existence
  const isProjectSubmitted = !!finalPdf || (finalLinks && finalLinks.length > 0);
  
  // Check if user has entered at least one link for the button disable state
  const hasValidLinkInput = links.some(l => l.title.trim() !== "" && l.url.trim() !== "");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-1">FINALIST STAGE</Badge>
        <span className="text-amber-200/60 text-sm animate-pulse">Good luck!</span>
      </div>

      {/* --- PART 1: PROJECT SUBMISSION --- */}
      <Card className={`border-l-4 border-l-amber-500 ${GLASS_CARD}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-amber-50">
            <FileText className="w-5 h-5 text-amber-500" /> 
            Final Project Materials
          </CardTitle>
          <CardDescription className="text-slate-400">
              Submit your Project Links and PDF (Optional). <br/>
              <span className="text-amber-400/90 font-bold text-xs uppercase tracking-wider">Warning: One-time submission only</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProjectSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
                 Submission Received
              </div>
              <div className="grid gap-2 text-sm text-slate-300">
                {/* PDF Link - Only show if it exists */}
                {finalPdf ? (
                    <a href={finalPdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors bg-white/5 p-2 rounded border border-white/5 group">
                        <FileText className="w-4 h-4 text-emerald-500"/>
                        <span className="underline decoration-emerald-500/50 group-hover:decoration-emerald-400">View Submitted PDF</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50"/>
                    </a>
                ) : (
                    <div className="flex items-center gap-2 text-slate-500 italic text-xs p-2">
                        <FileText className="w-4 h-4 opacity-50"/> No PDF Submitted
                    </div>
                )}
                
                {finalLinks && finalLinks.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Links</span>
                      {finalLinks.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors bg-white/5 p-2 rounded border border-white/5">
                            <LinkIcon className="w-3 h-3 text-emerald-500"/>
                            {l.title}
                            <ExternalLink className="w-3 h-3 ml-auto opacity-50"/>
                        </a>
                      ))}
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* CUSTOM FILE INPUT UI */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    Final PDF Document 
                    <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                </Label>
                
                {/* Hidden Input */}
                <input 
                  type="file" 
                  accept="application/pdf"
                  ref={pdfInputRef}
                  className="hidden" 
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                
                {/* Custom Trigger Area */}
                <div className="flex items-center gap-3">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => handleFileSelect(pdfInputRef)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Choose PDF
                    </Button>
                    <span className="text-sm text-slate-400 italic truncate max-w-[200px]">
                        {pdfFile ? pdfFile.name : "No file selected"}
                    </span>
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    External Links 
                    <span className="text-xs text-amber-500 font-normal">(Required, at least 1)</span>
                </Label>
                
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input 
                      placeholder="Title (e.g. Github)" 
                      className="bg-slate-900 border-white/10 w-1/3"
                      value={link.title}
                      onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[idx].title = e.target.value;
                          setLinks(newLinks);
                      }}
                    />
                    <Input 
                      placeholder="https://..." 
                      className="bg-slate-900 border-white/10 flex-1"
                      value={link.url}
                      onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[idx].url = e.target.value;
                          setLinks(newLinks);
                      }}
                    />
                    
                    {links.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setLinks(links.filter((_, i) => i !== idx));
                        }} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLinks([...links, { title: "", url: "" }])} 
                  className="border-dashed border-white/20 hover:bg-white/5 text-slate-400 w-full sm:w-auto"
                >
                  <Plus className="w-3 h-3 mr-2" /> Add Another Link
                </Button>
              </div>

              <AlertDialog>
                 <AlertDialogTrigger asChild>
                    {/* DISABLED logic changed: Checks for links, not PDF */}
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold" disabled={loading || !hasValidLinkInput}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit Final Materials
                    </Button>
                </AlertDialogTrigger>
                 <AlertDialogContent className="bg-slate-950 border-white/10 text-slate-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This action cannot be undone. You are submitting:
                      <ul className="list-disc list-inside mt-2 mb-2 text-slate-300">
                        <li>{pdfFile ? "1 PDF Document" : "No PDF Document"}</li>
                        <li>{links.filter(l => l.url.trim() !== "").length} External Link(s)</li>
                      </ul>
                      Once submitted, you cannot edit these details.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-slate-300">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmitProject} className="bg-amber-600 text-black hover:bg-amber-700">
                      Yes, Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- PART 2: PRESENTATION SLIDES (Unchanged) --- */}
      <Card className={`border-l-4 border-l-rose-500 ${GLASS_CARD}`}>
        <CardHeader>
           <CardTitle className="text-xl flex items-center gap-2 text-rose-50">
            <Presentation className="w-5 h-5 text-rose-500" />
            Presentation Slides
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upload your pitch deck (PDF/PPT). You can update this freely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="slides">Slides File</Label>
                <input 
                  type="file" 
                  ref={slidesInputRef}
                  className="hidden" 
                  onChange={(e) => setSlidesFile(e.target.files?.[0] || null)}
                />

                <div className="flex items-center gap-3 w-full">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => handleFileSelect(slidesInputRef)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 shrink-0"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Select Deck
                    </Button>
                    <span className="text-sm text-slate-400 italic truncate">
                        {slidesFile ? slidesFile.name : "No file selected"}
                    </span>
                </div>
             </div>
             <Button onClick={onSubmitSlides} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]">
                {loading ? <Loader2 className="animate-spin" /> : "Upload Slides"}
             </Button>
          </div>
          
          {finalSlides && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded flex justify-between items-center group">
              <span className="text-sm text-rose-200">Current Deck</span>
              <a href={finalSlides} target="_blank" rel="noopener noreferrer" className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1 rounded border border-rose-500/30 transition-colors flex items-center gap-2">
                  View Slides <ExternalLink className="w-3 h-3"/>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}