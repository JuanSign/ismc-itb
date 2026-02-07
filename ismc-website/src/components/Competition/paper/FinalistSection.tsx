"use client";

import { useState, useRef } from "react";
import { getPaperFinalistUploadUrl, saveFinalistPaper } from "@/actions/server/paper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, UploadCloud, ExternalLink } from "lucide-react";
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
  finalPaper: string | null; // Signed URL
};

const GLASS_CARD = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

export function PaperFinalistSection({ isFinalist, finalPaper }: FinalistProps) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  if (!isFinalist) return null;

  const handleFileSelect = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const onSubmit = async () => {
    if (!file) return toast.error("Please select a file.");
    
    setLoading(true);
    const toastId = toast.loading("Uploading Final Paper...");

    try {
      // 1. Upload to R2
      const { signedUrl, key } = await getPaperFinalistUploadUrl(file.name, file.type);
      
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed.");

      // 2. Save to DB
      await saveFinalistPaper(key);

      toast.success("Final Paper submitted successfully!", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = !!finalPaper;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-1">FINALIST STAGE</Badge>
        <span className="text-amber-200/60 text-sm animate-pulse">Good luck!</span>
      </div>

      <Card className={`border-l-4 border-l-amber-500 ${GLASS_CARD}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-amber-50">
            <FileText className="w-5 h-5 text-amber-500" /> 
            Final Paper Submission
          </CardTitle>
          <CardDescription className="text-slate-400">
            Submit your finalized Full Paper (PDF). <br />
            <span className="text-amber-400/90 font-bold text-xs uppercase tracking-wider">Warning: One-time submission only</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg space-y-3">
               <div className="flex items-center gap-2 text-emerald-400 font-medium">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
                 Submission Received
              </div>
              <a href={finalPaper} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors bg-white/5 p-2 rounded border border-white/5 w-fit">
                  <FileText className="w-4 h-4 text-emerald-500"/>
                  <span className="underline decoration-emerald-500/50">View Final Paper</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50"/>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Full Paper (PDF)</Label>
                
                {/* Hidden Input */}
                <input 
                  type="file" 
                  accept="application/pdf"
                  ref={inputRef}
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                
                {/* Custom Trigger */}
                <div className="flex items-center gap-3">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => handleFileSelect(inputRef)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Choose PDF
                    </Button>
                    <span className="text-sm text-slate-400 italic truncate max-w-[200px]">
                        {file ? file.name : "No file selected"}
                    </span>
                </div>
              </div>

              {/* Confirmation Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold" disabled={loading || !file}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Submit Final Paper
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-slate-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This action cannot be undone. You cannot edit or re-upload your Final Paper once submitted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-slate-300">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit} className="bg-amber-600 text-black hover:bg-amber-700">
                      Yes, Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}