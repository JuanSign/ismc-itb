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
      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href={redirectPath}>Enter Competition</Link>
      </Button>
    );
  }

  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
             <Button className="bg-blue-600 hover:bg-blue-700 text-white">Enter Competition</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Join {title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={formAction}>
                    <AlertDialogAction type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</> : "Continue"}
                    </AlertDialogAction>
                </form>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}