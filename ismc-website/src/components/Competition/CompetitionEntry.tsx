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

// SHARED STYLES
const PRIMARY_BTN = "bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold";
const DARK_INPUT = "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-yellow-500/50";

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
    if (createState.error) toast.error(createState.error);
    if (joinState.error) toast.error(joinState.error);
  }, [createState, joinState]);

  if (hasJoined) {
    return (
      <Button asChild className={PRIMARY_BTN}>
        <Link href={redirectPath}>Enter Competition</Link>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={PRIMARY_BTN}>Enter Competition</Button>
      </DialogTrigger>
      
      {/* DARK GLASS MODAL STYLE */}
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-white/10 text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Join {title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            To participate in the {title}, you must belong to a team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 text-slate-400">
            <TabsTrigger value="create" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Create Team</TabsTrigger>
            <TabsTrigger value="join" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Join Team</TabsTrigger>
          </TabsList>

          {/* --- CREATE TEAM TAB --- */}
          <TabsContent value="create" className="space-y-4 py-4">
            <form action={createFormAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-slate-300">Team Name</Label>
                <Input 
                  id="teamName" 
                  name="teamName" 
                  placeholder={teamNamePlaceholder} 
                  required 
                  disabled={isCreating}
                  className={DARK_INPUT}
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-md flex items-start gap-3 text-sm text-blue-200">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  By creating a team, you will automatically be assigned as the <strong>Manager</strong>.
                </p>
              </div>

              <Button type="submit" className={`w-full mt-2 ${PRIMARY_BTN}`} disabled={isCreating}>
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
                <Label htmlFor="teamCode" className="text-slate-300">Team Code</Label>
                <Input 
                  id="teamCode" 
                  name="teamCode" 
                  placeholder={teamCodePlaceholder} 
                  required 
                  disabled={isJoining}
                  className={DARK_INPUT}
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-md flex items-start gap-3 text-sm text-purple-200">
                <User className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  You are joining as a <strong>Member</strong>. Ask your Manager for the 5-letter team code.
                </p>
              </div>

              <Button type="submit" className={`w-full mt-2 ${PRIMARY_BTN}`} disabled={isJoining}>
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