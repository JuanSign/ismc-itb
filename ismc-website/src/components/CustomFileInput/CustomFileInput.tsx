"use client";

// Utils
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import Link from "next/link";

// UI
import { Button } from "@/components/ui/button";
import { Eye, UploadCloud, X, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 

type Props = {
  name: string;
  accept: string;
  currentFileUrl?: string | null;
  disabled?: boolean;
  placeholder?: string;
  maxSizeMB?: number;
};

export function CustomFileInput({ 
  name, 
  accept, 
  currentFileUrl, 
  disabled,
  placeholder = "Click to upload...",
  maxSizeMB = 1
}: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeMB) {
        toast.error(`File is too large. Max size is ${maxSizeMB}MB.`);
        if (inputRef.current) inputRef.current.value = "";
        setFileName(null);
        return;
      }
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  const triggerClick = () => {
    inputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasNewFile = !!fileName;
  const hasSavedFile = !!currentFileUrl && !hasNewFile;

  return (
    <div className="flex flex-col gap-2">
      <Input 
        ref={inputRef}
        type="file" 
        name={name} 
        accept={accept} 
        className="hidden" 
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex items-center gap-2 w-full">
        <div 
          onClick={!disabled ? triggerClick : undefined}
          className={cn(
            "flex-1 flex items-center gap-3 px-3 py-2.5 border rounded-md transition-all relative group min-w-0",
            // Disabled State
            disabled ? "opacity-50 cursor-not-allowed bg-white/5 border-white/5" : "cursor-pointer",
            
            // Default State (Dark)
            !hasNewFile && !hasSavedFile && "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20",

            // New File State (Blue tint)
            hasNewFile ? "border-blue-500/30 bg-blue-500/10" : "",

            // Saved File State (Emerald tint)
            hasSavedFile ? "border-emerald-500/30 bg-emerald-500/10" : ""
          )}
        >
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                hasNewFile ? "bg-blue-500/20 text-blue-400" : 
                hasSavedFile ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-400"
            )}>
                {hasNewFile ? <UploadCloud className="h-4 w-4" /> : 
                 hasSavedFile ? <FileCheck className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
            </div>
            
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className={cn(
                    "text-sm truncate font-medium", 
                    hasNewFile ? "text-blue-300" : 
                    hasSavedFile ? "text-emerald-300" : "text-slate-300"
                )}>
                    {fileName ? fileName : 
                     hasSavedFile ? "File Uploaded" : 
                     placeholder}
                </span>
                
                <span className="text-xs text-slate-500 truncate">
                   {hasNewFile ? "Ready to save" : 
                    hasSavedFile ? "Click to replace" : 
                    `Max ${maxSizeMB}MB (${accept.replace(/\./g, "").toUpperCase()})`}
                </span>
            </div>

            {hasNewFile && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-400 shrink-0"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
        </div>

        {currentFileUrl && (
           <Button 
             asChild 
             variant="outline" 
             size="icon" 
             className="shrink-0 border-dashed border-white/20 bg-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/40" 
             title="View Current File"
            >
             <Link href={currentFileUrl} target="_blank">
               <Eye className="h-4 w-4" />
             </Link>
           </Button>
        )}
      </div>
    </div>
  );
}