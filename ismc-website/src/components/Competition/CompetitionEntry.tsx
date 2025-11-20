"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, User } from "lucide-react";

type ActionState = { error?: string; message?: string };

type Props = {
  title: string;
  hasJoined: boolean;
  redirectPath: string;
  
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  joinAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;

  teamNamePlaceholder?: string;
  teamCodePlaceholder?: string;
};

const initialState: ActionState = {};

export function CompetitionEntry({ 
  title,
  hasJoined, 
  redirectPath,
  createAction, 
  joinAction,
  teamNamePlaceholder = "e.g. The Rock Breakers",
  teamCodePlaceholder = "e.g. ABCDE"
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [createState, createFormAction, isCreating] = useActionState(createAction, initialState);
  const [joinState, joinFormAction, isJoining] = useActionState(joinAction, initialState);

  useEffect(() => {
    if (createState.error) {
      toast.error(createState.error);
    }
    if (joinState.error) {
      toast.error(joinState.error);
    }
  }, [createState, joinState]);

  if (hasJoined) {
    return (
      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href={redirectPath}>Enter Competition</Link>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Enter Competition</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join {title}</DialogTitle>
          <DialogDescription>
            To participate in the {title}, you must belong to a team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>

          {/* --- CREATE TEAM TAB --- */}
          <TabsContent value="create" className="space-y-4 py-4">
            <form action={createFormAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  name="teamName" 
                  placeholder={teamNamePlaceholder} 
                  required 
                  disabled={isCreating}
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-md flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>
                  By creating a team, you will automatically be assigned as the <strong>Manager</strong>.
                </p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* --- JOIN TEAM TAB --- */}
          <TabsContent value="join" className="space-y-4 py-4">
             <form action={joinFormAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code</Label>
                <Input 
                  id="teamCode" 
                  name="teamCode" 
                  placeholder={teamCodePlaceholder} 
                  required 
                  disabled={isJoining}
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-md flex items-start gap-3 text-sm text-muted-foreground">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>
                  You are joining as a <strong>Member</strong>. Ask your Manager for the 5-letter team code.
                </p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2" disabled={isJoining}>
                 {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join Team"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}