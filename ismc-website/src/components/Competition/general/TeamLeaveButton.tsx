"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

type Props = {
  action: () => Promise<void>;
  title: string; // e.g. "Mining Competition"
};

export function TeamLeaveButton({ action, title }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleLeave = () => {
    startTransition(async () => {
      const toastId = toast.loading(`Leaving ${title} team...`);
      
      try {
        await action();
        toast.dismiss(toastId);
        // Redirect is handled by server action, but we can show success just in case
        toast.success("Left team successfully.");
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Failed to leave team. Please try again.");
        console.error(error);
      }
    });
  };

  const redButtonClasses = "bg-red-600 text-white hover:bg-red-700";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
          disabled={isPending}
        >
          <LogOut className="h-4 w-4" />
          Leave Team
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be removed from this <strong>{title}</strong> team. 
            If you are the only member, the team might be disbanded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-closing, let transition handle it
              handleLeave();
            }}
            disabled={isPending}
            className={cn(redButtonClasses)}
          >
            {isPending ? "Leaving..." : "Yes, Leave Team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}