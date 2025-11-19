"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Check, UploadCloud } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  accept: string;
  currentFileUrl?: string | null;
  disabled?: boolean;
  placeholder?: string;
};

export function CustomFileInput({ 
  name, 
  accept, 
  currentFileUrl, 
  disabled,
  placeholder = "Click to browse files..."
}: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  const triggerClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden Native Input */}
      <Input 
        ref={inputRef}
        type="file" 
        name={name} 
        accept={accept} 
        className="hidden" 
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Custom UI */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div 
          onClick={!disabled ? triggerClick : undefined}
          className={cn(
            "flex-1 flex items-center gap-3 px-3 py-2.5 border rounded-md transition-all",
            disabled ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-accent/50 hover:border-primary/50 bg-background",
            fileName ? "border-blue-500/50 bg-blue-50/50" : "border-input"
          )}
        >
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                fileName ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
            )}>
                {fileName ? <Check className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
            </div>
            
            <div className="flex flex-col overflow-hidden">
                <span className={cn(
                    "text-sm truncate font-medium", 
                    fileName ? "text-foreground" : "text-muted-foreground"
                )}>
                    {fileName || placeholder}
                </span>
                {!fileName && <span className="text-xs text-muted-foreground/70">Max 1MB ({accept.replace(/\./g, "").toUpperCase()})</span>}
            </div>
        </div>

        {/* View Current File Button */}
        {currentFileUrl && (
           <Button asChild variant="outline" size="icon" className="shrink-0" title="View Current File">
             <Link href={currentFileUrl} target="_blank">
               <Eye className="h-4 w-4 text-muted-foreground" />
             </Link>
           </Button>
        )}
      </div>
    </div>
  );
}