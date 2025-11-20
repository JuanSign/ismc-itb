"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { registerPoster } from "@/actions/server/poster";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

const initialState = { error: "" };

export function PosterEntry() {
  const [state, action, isPending] = useActionState(registerPoster, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
             <Button className="bg-blue-600 hover:bg-blue-700 text-white">Enter Competition</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Join Poster Competition</AlertDialogTitle>
                <AlertDialogDescription>
                    This is an individual competition. By clicking continue, you will be registered as a participant.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={action}>
                    <AlertDialogAction type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</> : "Continue"}
                    </AlertDialogAction>
                </form>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}