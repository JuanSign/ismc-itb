"use client";

import { useState } from "react";
import { updateMCStatus, getSignedDocUrl } from "@/actions/server/admin_mc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, Loader2, User, Trash2, Send, Info } from "lucide-react";
import { toast } from "sonner";
import { MemberMC, MedicalInfo } from "@/actions/types/MC";

export function MCMemberManager({ member }: { member: MemberMC }) {
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);
  const [updatingMemberStatus, setUpdatingMemberStatus] = useState(false);

  const handleOpenDoc = async (key: string | null, docName: string) => {
    if (!key) return;
    setOpeningDoc(docName);
    const res = await getSignedDocUrl(key);
    if (res.success && res.url) window.open(res.url, "_blank");
    else toast.error("Failed to load document");
    setOpeningDoc(null);
  };

  const handleUpdateDoc = async (field: string, value: number) => {
    setLoadingField(field);
    const res = await updateMCStatus(member.account_id, 'member', field, value);
    if (res.success) toast.success("Document updated");
    else toast.error("Failed update");
    setLoadingField(null);
  };

  // --- NEW: Handle Overall Member Status (Accept/Reject) ---
  const handleMemberStatus = async (newStatus: number) => {
      setUpdatingMemberStatus(true);
      const res = await updateMCStatus(member.account_id, 'member', 'status', newStatus);
      setUpdatingMemberStatus(false);
      
      if (res.success) {
          const statusText = newStatus === 2 ? "Accepted" : newStatus === 1 ? "Rejected" : "Pending";
          toast.success(`Member ${statusText}`);
      } else {
          toast.error("Failed to update member status");
      }
  };

  const handleAddNote = async (formData: FormData) => {
      const note = formData.get('note') as string;
      if(!note) return;
      await updateMCStatus(member.account_id, 'member', 'notes', note, 'update');
      toast.success("Note added");
  };

  const handleDeleteNote = async (note: string) => {
      await updateMCStatus(member.account_id, 'member', 'notes', note, 'remove_note');
      toast.success("Note deleted");
  };

  const renderDocRow = (label: string, linkKey: string | null, status: number, field: string) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/30 px-2 -mx-2 rounded transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-zinc-400 w-24">{label}</span>
        {linkKey ? (
          <Button 
            onClick={() => handleOpenDoc(linkKey, field)}
            variant="ghost"
            disabled={openingDoc === field}
            className="flex items-center gap-1 h-5 px-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded"
          >
            {openingDoc === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="flex items-center gap-1">VIEW <ExternalLink className="h-3 w-3" /></span>}
          </Button>
        ) : (
          <span className="text-[10px] text-zinc-700 italic">No File</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {status === 2 && <Badge className="text-[9px] px-1 h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</Badge>}
        {status === 1 && <Badge className="text-[9px] px-1 h-4 bg-red-500/10 text-red-500 border-red-500/20">Bad</Badge>}
        
        {linkKey && (
            <div className="flex gap-1 ml-2">
            <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-600"
                onClick={() => handleUpdateDoc(field, 2)} disabled={loadingField === field}>
                {loadingField === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-red-500/20 hover:text-red-400 text-zinc-600"
                onClick={() => handleUpdateDoc(field, 1)} disabled={loadingField === field}>
                <X className="h-3 w-3" />
            </Button>
            </div>
        )}
      </div>
    </div>
  );

  const renderMedicalList = (data: MedicalInfo[] | null | undefined) => {
      if (Array.isArray(data) && data.length > 0) {
          return (
            <div className="flex flex-col gap-1 mt-0.5">
                {data.map((item, i) => (
                    <span key={i} className="text-zinc-300">
                        • <span className="font-medium">{item.name}</span>
                        {item.description && <span className="text-zinc-500 ml-1 italic">({item.description})</span>}
                    </span>
                ))}
            </div>
          );
      }
      return <span className="text-zinc-600 italic">None</span>;
  };

  return (
    <div className={`
        border rounded-lg p-4 flex flex-col h-full transition-all duration-300
        ${member.status === 2 ? 'bg-emerald-950/10 border-emerald-500/20' : 
          member.status === 1 ? 'bg-red-950/10 border-red-500/20' : 
          'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'}
    `}>
      
      {/* 1. HEADER & MEMBER ACTIONS */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${member.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                <User className="h-4 w-4" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-zinc-200 leading-none">{member.name}</h4>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900 px-1 rounded">{member.role}</span>
                </div>
            </div>
        </div>

        {/* STATUS ACTIONS */}
        <div className="flex items-center gap-2">
            {/* Accept Button */}
            <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleMemberStatus(2)}
                disabled={updatingMemberStatus}
                className={`h-7 px-2 text-[10px] gap-1 transition-all ${member.status === 2 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'}`}
            >
                {updatingMemberStatus ? <Loader2 className="h-3 w-3 animate-spin"/> : <Check className="h-3 w-3" />}
                {member.status === 2 ? "Accepted" : "Accept"}
            </Button>

            {/* Reject Button */}
            <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleMemberStatus(1)}
                disabled={updatingMemberStatus}
                className={`h-7 px-2 text-[10px] gap-1 transition-all ${member.status === 1 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-zinc-800'}`}
            >
                {updatingMemberStatus ? <Loader2 className="h-3 w-3 animate-spin"/> : <X className="h-3 w-3" />}
                {member.status === 1 ? "Rejected" : "Reject"}
            </Button>
        </div>
      </div>

      {/* 2. MEMBER DATA GRID */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-[11px]">
         <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Email</span>
            <span className="text-zinc-300 break-all">{member.email}</span>
         </div>
         <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Phone</span>
            <span className="text-zinc-300">{member.phone_num}</span>
         </div>
         <div className="col-span-2">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Institution</span>
            <span className="text-zinc-300">{member.institution}</span>
         </div>
         <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">ID Number</span>
            <span className="text-zinc-300">{member.id_no}</span>
         </div>
         <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Blood Type</span>
            <span className="text-zinc-300">{member.blood_type || "-"}</span>
         </div>
         
         {/* Health Info */}
         {(member.illness?.length || 0 > 0 || member.allergy?.length || 0> 0) && (
             <div className="col-span-2 mt-2 pt-2 border-t border-dashed border-zinc-800">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-red-400 block text-[10px] uppercase font-bold items-center gap-1 mb-1">
                            <Info className="h-3 w-3"/> Illness
                        </span>
                        {renderMedicalList(member.illness)}
                     </div>
                     <div>
                        <span className="text-red-400 block text-[10px] uppercase font-bold items-center gap-1 mb-1">
                            <Info className="h-3 w-3"/> Allergy
                        </span>
                        {renderMedicalList(member.allergy)}
                     </div>
                 </div>
             </div>
         )}
      </div>

      {/* 3. DOCUMENTS */}
      <div className="bg-zinc-950/50 rounded px-2 py-1 mb-4 border border-zinc-800/50 grow">
        <h5 className="text-[10px] font-bold text-zinc-600 uppercase mb-1 px-2 pt-1">Documents</h5>
        {renderDocRow("Student Card", member.sc_link, member.sc_verified, "sc_verified")}
        {renderDocRow("Formal Photo", member.fp_link, member.fp_verified, "fp_verified")}
      </div>

      {/* 4. NOTES */}
      <div className="mt-auto space-y-2">
        {member.notes && member.notes.length > 0 && (
            <div className="space-y-1 max-h-20 overflow-y-auto mb-2 custom-scrollbar">
                {member.notes.map((n, i) => (
                    <div key={i} className="text-[10px] text-zinc-400 bg-zinc-900 p-1.5 rounded flex justify-between items-center group">
                        <span>{n}</span>
                        <button onClick={() => handleDeleteNote(n)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500"><Trash2 className="h-3 w-3"/></button>
                    </div>
                ))}
            </div>
        )}
        <form action={handleAddNote} className="flex gap-2">
            <Input name="note" placeholder="Note / Rejection reason..." className="h-7 text-[10px] bg-zinc-950 border-zinc-800 placeholder:text-zinc-700"/>
            <Button size="icon" className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700"><Send className="h-3 w-3"/></Button>
        </form>
      </div>
    </div>
  );
}