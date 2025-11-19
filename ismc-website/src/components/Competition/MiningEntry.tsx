"use client";

import React, { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { joinTeam, createTeam } from "@/actions/server/mc"; 
import {
  type CreateTeamFormState,
  type JoinTeamFormState,
} from "@/actions/types/MC";

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

type Props = {
  hasJoinedMC: boolean;
};

const initialCreateState: CreateTeamFormState = {};
const initialJoinState: JoinTeamFormState = {};

export function MiningEntry({ hasJoinedMC }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [createState, createAction, isCreating] = useActionState(createTeam, initialCreateState);
  const [joinState, joinAction, isJoining] = useActionState(joinTeam, initialJoinState);

  useEffect(() => {
    if (createState.error) {
      toast.error(createState.error);
    }
    if (joinState.error) {
      toast.error(joinState.error);
    }
  }, [createState, joinState]);

  if (hasJoinedMC) {
    return (
      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href="/dashboard/competition/mc">Enter Competition</Link>
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
          <DialogTitle>It Looks Like you don&apos;t have a Team Yet!</DialogTitle>
          <DialogDescription>
            To participate in the Mining Competition, you must belong to a team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>

          {/* --- CREATE TEAM TAB --- */}
          <TabsContent value="create" className="space-y-4 py-4">
            <form action={createAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  name="teamName" 
                  placeholder="e.g. The Rock Breakers" 
                  required 
                  disabled={isCreating}
                />
              </div>

              {/* Informational Text regarding Role */}
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
             <form action={joinAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code</Label>
                <Input 
                  id="teamCode" 
                  name="teamCode" 
                  placeholder="e.g. ABCDE" 
                  required 
                  disabled={isJoining}
                />
              </div>

              {/* Informational Text regarding Role */}
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