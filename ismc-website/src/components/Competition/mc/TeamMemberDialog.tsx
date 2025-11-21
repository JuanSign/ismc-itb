"use client";

// Utils
import { useActionState, useEffect, useState, useRef } from "react";

// UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomFileInput } from "@/components/CustomFileInput/CustomFileInput";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Pencil, Hourglass, XCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MedicalHistoryInput } from "./MedicalHistoryInput";
import { MemberMC, MedicalInfo, UpdateMemberFormState } from "@/actions/types/MC";
import { toast, Toaster } from "sonner";

// Actions
import { updateMemberDetails } from "@/actions/server/mc";

// --- Helpers ---
function VerificationStatusBadge({ status }: { status: number }) {
  const config = {
    0: { text: "Waiting", icon: <Hourglass className="h-3 w-3" />, className: "text-yellow-600 bg-yellow-50 border-yellow-300" },
    1: { text: "Rejected", icon: <XCircle className="h-3 w-3" />, className: "text-destructive bg-destructive/10 border-destructive/50" },
    2: { text: "Accepted", icon: <CheckCircle2 className="h-3 w-3" />, className: "text-emerald-600 bg-emerald-50 border-emerald-400" },
  }[status as 0|1|2] || { text: "Unknown", icon: null, className: "" };

  return (
    <Badge variant="outline" className={`shrink-0 gap-1.5 ${config.className}`}>
      {config.icon}
      <span className="hidden sm:inline">{config.text}</span>
    </Badge>
  );
}

const initialState: UpdateMemberFormState = {};

export function TeamMemberDialog({
  member,
  isCurrentUser,
}: {
  member: MemberMC;
  isCurrentUser: boolean;
}) {
  const [open, setOpen] = useState(false);
  
  const [illnessList, setIllnessList] = useState<MedicalInfo[]>(member.illness || []);
  const [allergyList, setAllergyList] = useState<MedicalInfo[]>(member.allergy || []);

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

  useEffect(() => {
    if (open) hasHandledSuccess.current = false;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Toaster richColors/>
      
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          {isCurrentUser ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0" key={member.account_id}>
        
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>
              {isCurrentUser ? "Edit Details" : `View ${member.name || member.email}`}
            </DialogTitle>
            <DialogDescription>
              {isCurrentUser ? "Please ensure your personal details matches your documents." : "Member details."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            <form id="update-mc-member-form" action={action} className="h-full">
              <FieldGroup className="flex flex-col gap-8">

                <input type="hidden" name="target_account_id" value={member.account_id} />

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Personal Information
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                       <FieldLabel>Full Name</FieldLabel>
                       <Input name="name" defaultValue={member.name ?? ""} disabled={!isCurrentUser} placeholder="e.g. John Doe" />
                     </Field>
                     <Field>
                       <FieldLabel>Institution</FieldLabel>
                       <Input name="institution" defaultValue={member.institution ?? ""} disabled={!isCurrentUser} placeholder="University Name" />
                     </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Phone Number</FieldLabel>
                      <Input name="phone_num" defaultValue={member.phone_num?? ""} disabled={!isCurrentUser} placeholder="+62..." />
                    </Field>
                    <Field>
                      <FieldLabel>Student Number</FieldLabel>
                      <Input name="id_no" defaultValue={member.id_no ?? ""} disabled={!isCurrentUser} placeholder="e.g. 123456" />
                    </Field>
                    <Field>
                      <FieldLabel>Blood Type</FieldLabel>
                      <Input name="blood_type" defaultValue={member.blood_type ?? ""} disabled={!isCurrentUser} placeholder="e.g. O+" />
                    </Field>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Medical Information
                  </h4>
                  
                  <input type="hidden" name="illness" value={JSON.stringify(illnessList)} />
                  <input type="hidden" name="allergy" value={JSON.stringify(allergyList)} />

                  {isCurrentUser ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MedicalHistoryInput label="History of Illness" items={illnessList} onChange={setIllnessList} />
                        <MedicalHistoryInput label="Allergies" items={allergyList} onChange={setAllergyList} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                        <div>
                          <span className="font-medium text-sm">Illnesses:</span>
                          {member.illness?.length ? (
                              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                 {member.illness.map((i, idx) => (
                                     <li key={idx}>
                                         <span className="font-semibold text-foreground">{i.name}</span>
                                         {i.description && <span className="ml-1">- {i.description}</span>}
                                     </li>
                                 ))}
                              </ul>
                          ) : <p className="text-sm text-muted-foreground mt-1">None</p>}
                        </div>
                        <div>
                          <span className="font-medium text-sm">Allergies:</span>
                          {member.allergy?.length ? (
                              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                 {member.allergy.map((i, idx) => (
                                     <li key={idx}>
                                         <span className="font-semibold text-foreground">{i.name}</span>
                                         {i.description && <span className="ml-1">- {i.description}</span>}
                                     </li>
                                 ))}
                              </ul>
                          ) : <p className="text-sm text-muted-foreground mt-1">None</p>}
                        </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <Field>
                      <div className="flex justify-between items-center mb-2">
                        <FieldLabel>Student Card</FieldLabel>
                        <VerificationStatusBadge status={member.sc_verified} />
                      </div>
                      <CustomFileInput 
                        name="sc_link" 
                        accept=".pdf,.jpg,.png" 
                        currentFileUrl={member.sc_link}
                        disabled={!isCurrentUser}
                        maxSizeMB={1}
                      />
                    </Field>

                    <Field>
                      <div className="flex justify-between items-center mb-2">
                        <FieldLabel>Formal Photo (FP)</FieldLabel>
                        <VerificationStatusBadge status={member.fp_verified} />
                      </div>
                      <CustomFileInput 
                        name="fp_link" 
                        accept=".jpg,.png" 
                        currentFileUrl={member.fp_link}
                        disabled={!isCurrentUser}
                        maxSizeMB={1}
                      />
                    </Field>
                  </div>
                </div>

                {member.notes && member.notes.length > 0 && (
                  <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-yellow-700" />
                      <h4 className="text-sm font-semibold text-yellow-800">Admin Notes</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-yellow-800/80 space-y-1">
                      {member.notes.map((note, idx) => <li key={idx}>{note}</li>)}
                    </ul>
                  </div>
                )}
              </FieldGroup>
            </form>
        </div>

        <div className="p-6 pt-4 border-t bg-background mt-auto">
          {isCurrentUser ? (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="update-mc-member-form"
                disabled={isPending} 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto font-semibold"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Save Details"
                )}
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}