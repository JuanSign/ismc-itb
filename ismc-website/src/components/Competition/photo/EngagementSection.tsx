"use client";

import React, { useState } from "react";
import { updateEngagement, getPresignedUrl } from "@/actions/server/photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Info, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";

function VerificationBadge({ status }: { status: number | null }) {
  if (status === 2) return <Badge className="bg-emerald-600">Verified</Badge>;
  if (status === 1) return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export function EngagementSection({
  edLink,
  edVerified,
  step = "FINAL STAGE",
  className,
}: {
  edLink: string | null;
  edVerified: number;
  step?: string;
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const isLocked = edVerified === 2;

  const handleSmartSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLocked) return;

    const formData = new FormData(e.currentTarget);
    const edFile = formData.get("doc_engagement") as File;

    if ((!edFile || edFile.size === 0) && !edLink) {
        toast.error("Please select a file.");
        return;
    }

    setIsUploading(true);

    try {
        let finalEdKey = "";

        if (edFile && edFile.size > 0) {
            const safeType = edFile.type || "application/octet-stream";
            const res = await getPresignedUrl('engagement', edFile.name, safeType);
            
            if ('error' in res) throw new Error(res.error);
            const { signedUrl, key } = res;
            
            if (!signedUrl || !key) throw new Error("Failed to get upload URL");

            const uploadRes = await fetch(signedUrl, { 
                method: "PUT", 
                body: edFile, 
                headers: { "Content-Type": safeType } 
            });
            
            if(!uploadRes.ok) throw new Error("Failed to upload file to storage");
            finalEdKey = key;
        }

        if (finalEdKey) {
            const serverFormData = new FormData();
            serverFormData.append("engagement_key", finalEdKey);

            const result = await updateEngagement({}, serverFormData);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
            }
        } else {
             toast.info("No new file selected.");
        }

    } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Error uploading.";
        toast.error(msg);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Card className={cn("border-l-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Finalist Requirement</span>
        </div>
        <CardTitle className="flex items-center gap-2">
            Engagement Proof
            <VerificationBadge status={edVerified} />
        </CardTitle>
        <CardDescription>
            Congratulations on being a finalist! Please upload proof of engagement as requested.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSmartSubmit} className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-amber-500"/> Upload Screenshot
                    </h4>
                    {edLink && (
                        <a href={edLink} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Info className="h-3 w-3" /> View Current Proof
                        </a>
                    )}
                </div>
                
                <CustomFileInput 
                    name="doc_engagement" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    currentFileUrl={edLink} 
                    placeholder="Upload proof..."
                    maxSizeMB={20}
                    disabled={isLocked || isUploading}
                />
            </div>

            <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold" 
                disabled={isUploading || isLocked}
            >
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : isLocked ? "Verified" : "Submit Proof"}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}