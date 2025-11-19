"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, Check, X } from "lucide-react";
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
      // Wrap state update to prevent sync-render error
      setTimeout(() => setFileName(null), 0);
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.files?.[0]?.name || null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5 border rounded-lg bg-card hover:border-primary/20 transition-colors shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
            <Label htmlFor={name} className="text-base font-medium text-foreground">
            {label}
            </Label>
            {currentFileUrl ? (
                <Link href={currentFileUrl} target="_blank" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                    View Current File
                </Link>
            ) : (
                <span className="text-xs text-muted-foreground">No file currently uploaded.</span>
            )}
        </div>
        {verificationBadge}
      </div>

      <form ref={formRef} action={action} className="flex flex-col sm:flex-row gap-3 items-stretch mt-2">
        {/* Custom File Input UI */}
        <div 
            onClick={() => !disabled && !isPending && inputRef.current?.click()}
            className={cn(
                "flex-1 flex items-center gap-3 px-3 py-2 border rounded-md transition-all cursor-pointer relative group",
                fileName ? "bg-blue-50 border-blue-200" : "bg-background hover:bg-accent",
                (disabled || isPending) && "opacity-50 cursor-not-allowed"
            )}
        >
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                fileName ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
            )}>
                {fileName ? <Check className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className={cn("text-sm font-medium truncate", fileName ? "text-blue-900" : "text-muted-foreground")}>
                    {fileName || "Click to select file..."}
                </span>
                {!fileName && <span className="text-[10px] text-muted-foreground/70">Max 1MB</span>}
            </div>

             {/* Clear Button - Flex item now */}
             {fileName && !disabled && !isPending && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 -mr-1"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
        </div>

        {/* Hidden Real Input */}
        <Input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled || isPending}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={disabled || isPending || !fileName}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Upload"
          )}
        </Button>
      </form>
    </div>
  );
}