"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, X, FileCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

type UploadState = { error?: string; message?: string };

type Props = {
  name: string;
  label: string;
  accept: string;
  currentFileUrl: string | null;
  verificationBadge: React.ReactNode;
  uploadAction: (prevState: UploadState, formData: FormData) => Promise<UploadState>;
  disabled?: boolean;
};

const initialState: UploadState = {};

export function FileUploaderField({
  name,
  label,
  accept,
  currentFileUrl,
  verificationBadge,
  uploadAction,
  disabled = false,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [state, action, isPending] = useActionState(uploadAction, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) {
      toast.success(state.message);
      formRef.current?.reset();
      setTimeout(() => setFileName(null), 0);
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const maxSize = 1 * 1024 * 1024; 
        if (file.size > maxSize) {
            toast.error("File is too large. Max size is 1MB.");
            e.target.value = "";
            setFileName(null);
            return;
        }
        setFileName(file.name);
    } else {
        setFileName(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasNewFile = !!fileName;
  const hasSavedFile = !!currentFileUrl && !hasNewFile;
  const isInteractive = !disabled && !isPending;

  const showViewButton = !!currentFileUrl;
  const showUploadButton = hasNewFile;
  const showActionRow = showViewButton || showUploadButton;

  return (
    <div className="flex flex-col gap-3 p-5 border rounded-lg bg-white/5 border-white/10 transition-all shadow-sm hover:border-white/20">
      <div className="flex justify-between items-center">
         <Label htmlFor={name} className="text-base font-medium text-slate-200">
           {label}
         </Label>
         {verificationBadge}
      </div>

      <form ref={formRef} action={action} className="flex flex-col sm:flex-row gap-3 items-stretch mt-1">
        
        {/* 1. File Selection Trigger */}
        <div 
            onClick={() => isInteractive && inputRef.current?.click()}
            className={cn(
                "flex-1 flex items-center gap-3 px-3 py-2 border rounded-md transition-all relative group min-w-0",
                
                // Interactive States
                isInteractive ? "cursor-pointer hover:bg-white/5" : "opacity-50 cursor-not-allowed bg-white/5",
                
                // Default State (Dark)
                !hasNewFile && !hasSavedFile && "bg-black/20 border-white/10",

                // New File State (Blue)
                hasNewFile ? "bg-blue-500/10 border-blue-500/30" : "",

                // Saved File State (Emerald)
                hasSavedFile && !hasNewFile ? "bg-emerald-500/10 border-emerald-500/30" : ""
            )}
        >
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                hasNewFile ? "bg-blue-500/20 text-blue-400" : 
                hasSavedFile ? "bg-emerald-500/20 text-emerald-400" : 
                "bg-white/10 text-slate-400"
            )}>
                {hasNewFile ? <UploadCloud className="h-4 w-4" /> : 
                 hasSavedFile ? <FileCheck className="h-4 w-4" /> : 
                 <UploadCloud className="h-4 w-4" />}
            </div>

            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className={cn(
                    "text-sm font-medium truncate", 
                    hasNewFile ? "text-blue-300" : 
                    hasSavedFile ? "text-emerald-300" : "text-slate-300"
                )}>
                    {fileName || (hasSavedFile ? "File Uploaded" : "Click to select file...")}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                    {hasNewFile ? "Ready to upload" : 
                     hasSavedFile ? "Click to replace" : 
                     `Max 1MB (${accept.replace(/\./g, "").toUpperCase()})`}
                </span>
            </div>

             {hasNewFile && isInteractive && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-400 shrink-0 -mr-1"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
        </div>

        <Input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          disabled={!isInteractive}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 2. Action Buttons - STRICTLY CONDITIONAL */}
        {showActionRow && (
            <div className={cn(
                "flex items-center gap-2 shrink-0", 
                showUploadButton ? "w-full sm:w-auto" : "w-auto"
            )}>
                
                {showViewButton && (
                    <Button 
                        asChild 
                        variant="outline" 
                        size="icon" 
                        type="button"
                        className="border-dashed border-white/20 bg-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/40 shrink-0"
                        title="View uploaded file"
                    >
                        <Link href={currentFileUrl} target="_blank">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                )}

                {showUploadButton && (
                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-24 border-none"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Upload"
                        )}
                    </Button>
                )}
            </div>
        )}
      </form>
    </div>
  );
}