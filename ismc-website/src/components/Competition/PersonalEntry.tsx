"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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

type ActionState = { error?: string };

type Props = {
  title: string;       
  description?: string; 
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  hasJoined: boolean;
  redirectPath: string; 
};

const initialState: ActionState = { error: "" };
const PRIMARY_BTN = "bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold";

export function PersonalEntry({ 
  title, 
  description = "This is an individual competition. By clicking continue, you will be registered as a participant.", 
  action, 
  hasJoined, 
  redirectPath 
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  if (hasJoined) {
    return (
      <Button asChild className={PRIMARY_BTN}>
        <Link href={redirectPath}>Enter Competition</Link>
      </Button>
    );
  }

  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
             <Button className={PRIMARY_BTN}>Enter Competition</Button>
        </AlertDialogTrigger>
        
        {/* DARK GLASS ALERT DIALOG */}
        <AlertDialogContent className="bg-slate-950 border-white/10 text-slate-100 shadow-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Join {title}</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                    {description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <form action={formAction}>
                    <AlertDialogAction type="submit" className={PRIMARY_BTN} disabled={isPending}>
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</> : "Continue"}
                    </AlertDialogAction>
                </form>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}