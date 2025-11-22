"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Hourglass, XCircle, CheckCircle2, Loader2, Info, ScrollText } from "lucide-react";
import { MemberPaper, UpdateMemberFormState } from "@/actions/types/Paper";
import { updateMemberDetails } from "@/actions/server/paper";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";

// --- Helper: Status Badge (Dark Mode) ---
function VerificationStatusBadge({ status }: { status: number }) {
  const config = {
    0: { text: "Waiting", icon: <Hourglass className="h-3 w-3" />, className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    1: { text: "Rejected", icon: <XCircle className="h-3 w-3" />, className: "text-red-400 bg-red-400/10 border-red-400/20" },
    2: { text: "Accepted", icon: <CheckCircle2 className="h-3 w-3" />, className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  }[status as 0|1|2] || { text: "Unknown", icon: null, className: "" };

  return (
    <Badge variant="outline" className={`shrink-0 gap-1.5 ${config.className}`}>
      {config.icon}
      <span className="hidden sm:inline">{config.text}</span>
    </Badge>
  );
}

const initialState: UpdateMemberFormState = {};

export function TeamMemberDialog({ member, isCurrentUser }: { member: MemberPaper; isCurrentUser: boolean; }) {
  const [open, setOpen] = useState(false);
  const hasHandledSuccess = useRef(false);
  const [state, action, isPending] = useActionState(updateMemberDetails, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.message && !hasHandledSuccess.current) {
      toast.success(state.message);
      hasHandledSuccess.current = true; 
      setTimeout(() => setOpen(false), 0);
    }
  }, [state]);

  useEffect(() => { if (open) hasHandledSuccess.current = false; }, [open]);

  // --- Styles ---
  const inputClass = "bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-yellow-500/50";
  const labelClass = "text-slate-300";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-white/10 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white">
            {isCurrentUser ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-950 border-white/10 text-slate-100 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-6 pb-4 border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
                {isCurrentUser ? "Edit Details" : `View ${member.name || member.email}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
                Paper participant info.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            <form id="update-paper-member-form" action={action} className="h-full">
              <FieldGroup className="flex flex-col gap-8">
                
                {/* Section 1: Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel className={labelClass}>Full Name</FieldLabel>
                        <Input className={inputClass} name="name" defaultValue={member.name ?? ""} disabled={!isCurrentUser} placeholder="e.g. John Doe" />
                      </Field>
                      <Field>
                        <FieldLabel className={labelClass}>Institution</FieldLabel>
                        <Input className={inputClass} name="institution" defaultValue={member.institution ?? ""} disabled={!isCurrentUser} placeholder="University" />
                      </Field>
                      <Field>
                        <FieldLabel className={labelClass}>Phone Number</FieldLabel>
                        <Input className={inputClass} name="phone_num" defaultValue={member.phone_num ?? ""} disabled={!isCurrentUser} />
                      </Field>
                      <Field>
                        <FieldLabel className={labelClass}>Student ID Number</FieldLabel>
                        <Input className={inputClass} name="id_no" defaultValue={member.id_no ?? ""} disabled={!isCurrentUser} />
                      </Field>
                  </div>
                </div>

                {/* Section 2: Documents */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field>
                        <div className="flex justify-between items-center mb-2">
                            <FieldLabel className={labelClass}>Student Card</FieldLabel>
                            <VerificationStatusBadge status={member.sc_verified} />
                        </div>
                        <CustomFileInput name="sc_link" accept=".pdf,.jpg,.png" currentFileUrl={member.sc_link} disabled={!isCurrentUser} />
                    </Field>
                    <Field>
                        <div className="flex justify-between items-center mb-2">
                            <FieldLabel className={labelClass}>Formal Photo</FieldLabel>
                            <VerificationStatusBadge status={member.fp_verified} />
                        </div>
                        <CustomFileInput name="fp_link" accept=".jpg,.png" currentFileUrl={member.fp_link} disabled={!isCurrentUser} />
                    </Field>
                  </div>
                </div>

                {/* Section 3: Notes */}
                {member.notes && member.notes.length > 0 && (
                   <div className="mt-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                        <ScrollText className="h-4 w-4 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">Admin Notes</h4>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {member.notes.map((note, idx) => (
                        <div 
                            key={idx} 
                            className="relative flex gap-3 rounded-lg border border-l-4 border-l-amber-400 bg-amber-900/10 border-y-amber-500/10 border-r-amber-500/10 p-4 text-sm shadow-sm"
                        >
                           <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                           <span className="text-amber-100 leading-relaxed">
                             {note}
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FieldGroup>
            </form>
        </div>
        
        <div className="p-6 pt-4 border-t border-white/10 bg-slate-950 mt-auto">
          {isCurrentUser ? (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="update-paper-member-form" 
                disabled={isPending} 
                className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto font-semibold border-none"
              >
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Details"}
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10">Close</Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}