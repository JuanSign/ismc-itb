"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, FileText, Download, Loader2, Send, Trash2, Check, X, User, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { getSignedDocUrl, updatePosterStatus } from "@/actions/server/admin_poster";
import { PosterMember } from "@/actions/types/Admin";

// --- Status Logic ---
const getStatusBadge = (status: number) => {
    switch(status) {
        case 3: return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Accepted</Badge>;
        case 2: return <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">Wait Submission</Badge>;
        case 1: return <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10">Wait Payment</Badge>;
        case 0: return <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">Wait Verif</Badge>;
        default: return <Badge variant="outline" className="text-zinc-500 border-zinc-700">Unknown</Badge>;
    }
};

export function PosterDataTable({ data }: { data: PosterMember[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedRows(newSet);
  };

  const openDoc = async (key: string | null | undefined) => {
    if(!key) return;
    setLoadingDoc(key);
    const res = await getSignedDocUrl(key);
    setLoadingDoc(null);
    if(res.success && res.url) window.open(res.url, "_blank");
    else toast.error("Could not open document");
  };

  const handleUpdateStatus = async (id: string, value: string) => {
      setUpdatingStatus(true);
      const res = await updatePosterStatus(id, 'status', Number(value));
      setUpdatingStatus(false);
      if(res.success) toast.success("Status updated");
      else toast.error("Update failed");
  };

  const handleVerifyDoc = async (id: string, field: string, value: number) => {
      setLoadingField(field);
      await updatePosterStatus(id, field, value);
      setLoadingField(null);
      toast.success("Doc status updated");
  }

  const handleAddNote = async (id: string, formData: FormData) => {
      const note = formData.get('note') as string;
      if(!note) return;
      await updatePosterStatus(id, 'notes', note, 'update');
      toast.success("Note added");
  };

  const handleDeleteNote = async (id: string, note: string) => {
      await updatePosterStatus(id, 'notes', note, 'remove_note');
      toast.success("Note deleted");
  };

  const filteredData = data.filter(m => 
    (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // Reusable Row for Documents
  const DocRow = ({ label, link, verified, field, id }: { label: string, link: string | null, verified: number, field: string, id: string }) => (
    <div className="flex items-center justify-between p-2.5 bg-zinc-900/50 rounded border border-zinc-800 mb-2">
        <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() => openDoc(link)}
                disabled={!link}
             >
                {loadingDoc === link ? <Loader2 className="h-3 w-3 animate-spin"/> : <Download className="h-3 w-3 mr-1.5"/>}
                {label}
             </Button>
             {!link && <span className="text-[10px] text-zinc-600 italic">Not uploaded</span>}
        </div>
        <div className="flex items-center gap-1">
             {verified === 2 ? <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] hover:bg-emerald-500/20">Verified</Badge> 
             : verified === 1 ? <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] hover:bg-red-500/20">Rejected</Badge> 
             : <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-[10px]">Pending</Badge>}
             
             {link && (
                 <div className="flex items-center gap-1 ml-2">
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-600" 
                        onClick={() => handleVerifyDoc(id, field, 2)} disabled={loadingField === field}>
                        <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400 text-zinc-600" 
                        onClick={() => handleVerifyDoc(id, field, 1)} disabled={loadingField === field}>
                         <X className="h-3 w-3" />
                    </Button>
                 </div>
             )}
        </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search name or email..." 
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-900/80">
            <TableRow className="hover:bg-zinc-900 border-zinc-800">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-zinc-400">Participant</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Payment</TableHead>
              <TableHead className="text-zinc-400">Submission</TableHead>
              <TableHead className="text-right text-zinc-400">Institution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-32 text-center text-zinc-500">No participants found.</TableCell></TableRow>
            ) : (
              filteredData.map((m) => (
                <Fragment key={m.account_id}>
                  <TableRow 
                    className={`border-zinc-800 transition-colors cursor-pointer ${expandedRows.has(m.account_id) ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/40'}`}
                    onClick={() => toggleRow(m.account_id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:bg-zinc-800 hover:text-white" onClick={() => toggleRow(m.account_id)}>
                        {expandedRows.has(m.account_id) ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                      </Button>
                    </TableCell>
                    
                    <TableCell>
                       <div className="font-medium text-zinc-200">{m.name}</div>
                       <div className="text-xs text-zinc-500">{m.email}</div>
                    </TableCell>
                    
                    <TableCell>{getStatusBadge(m.status)}</TableCell>

                    <TableCell>
                       {m.pp_verified === 2 ? <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Paid</Badge> 
                       : m.pp_verified === 1 ? <Badge className="bg-red-500/15 text-red-400 hover:bg-red-500/20 border-red-500/20">Rejected</Badge> 
                       : <Badge variant="outline" className="text-zinc-500 border-zinc-700">Check</Badge>}
                    </TableCell>

                    <TableCell>
                        {m.sub_verified === 2 ? <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Accepted</Badge>
                        : m.sd_link ? <Badge variant="outline" className="text-blue-400 border-blue-500/30">Received</Badge> 
                        : <span className="text-zinc-600 text-xs">Waiting</span>}
                    </TableCell>

                    <TableCell className="text-right text-zinc-400 text-xs">
                       {m.institution}
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(m.account_id) && (
                    <TableRow className="bg-black border-b border-zinc-800 hover:bg-black">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 border-l-2 border-green-600 bg-zinc-950/30 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* LEFT: Personal Info & Docs */}
                                <div className="lg:col-span-4 space-y-6">
                                    
                                    {/* Participant Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-200">{m.name}</h4>
                                            <p className="text-xs text-zinc-500">{m.phone_num}</p>
                                            <p className="text-xs text-zinc-500">ID: {m.id_no}</p>
                                        </div>
                                    </div>

                                    {/* Personal Docs */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2 mb-2">Identity Verification</h4>
                                        <DocRow label="Student Card" link={m.sc_link} verified={m.sc_verified} field="sc_verified" id={m.account_id} />
                                        <DocRow label="Formal Photo" link={m.fp_link} verified={m.fp_verified} field="fp_verified" id={m.account_id} />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500">Admin Notes</h4>
                                        <div className="space-y-2">
                                            {m.notes && m.notes.map((n, i) => (
                                                <div key={i} className="flex justify-between gap-2 p-2 bg-zinc-900 rounded border border-zinc-800 text-xs text-zinc-400 group">
                                                    <span>{n}</span>
                                                    <button onClick={() => handleDeleteNote(m.account_id, n)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3"/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <form action={(fd) => handleAddNote(m.account_id, fd)} className="flex gap-2">
                                            <Input name="note" placeholder="Add note..." className="h-8 text-xs bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"/>
                                            <Button size="icon" className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700"><Send className="h-3 w-3"/></Button>
                                        </form>
                                    </div>
                                </div>

                                {/* RIGHT: Competition Info */}
                                <div className="lg:col-span-8 space-y-6">
                                    
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Status Changer */}
                                        <div className="flex-1 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                            <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Overall Status</h4>
                                            <Select 
                                              disabled={updatingStatus} 
                                              value={String(m.status)} 
                                              onValueChange={(val) => handleUpdateStatus(m.account_id, val)}
                                            >
                                              <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="0">0 - Wait Identity Verif</SelectItem>
                                                <SelectItem value="1">1 - Wait Payment</SelectItem>
                                                <SelectItem value="2">2 - Wait Submission</SelectItem>
                                                <SelectItem value="3">3 - Accepted</SelectItem>
                                              </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* Payment Section */}
                                        <div className="flex-1 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                            <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Payment</h4>
                                            <DocRow label="Proof of Payment" link={m.pp_link} verified={m.pp_verified} field="pp_verified" id={m.account_id} />
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-800 pt-6">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Competition Submission
                                        </h4>
                                        
                                        <div className="bg-zinc-900/20 p-4 rounded border border-zinc-800/50">
                                            {/* Description / Abstract */}
                                            <div className="flex items-center gap-2 mb-2 text-green-400">
                                                <AlignLeft className="h-3 w-3" />
                                                <h5 className="text-[10px] font-bold uppercase">Description / Theme</h5>
                                            </div>
                                            <div className="mb-4 p-3 bg-black rounded border border-zinc-800 text-xs text-zinc-300 max-h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                                                {m.sdd ? m.sdd : <span className="text-zinc-600 italic">No description submitted yet.</span>}
                                            </div>

                                            {/* Submission Docs */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h6 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Originality</h6>
                                                    <DocRow label="Statement Letter" link={m.od_link} verified={m.od_verified} field="od_verified" id={m.account_id} />
                                                </div>
                                                <div>
                                                    <h6 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Poster File</h6>
                                                    <DocRow label="Submission File" link={m.sd_link} verified={m.sub_verified} field="sub_verified" id={m.account_id} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}