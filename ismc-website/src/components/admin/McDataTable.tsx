"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, FileText, Download, Loader2, Send, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getSignedDocUrl, updateMCStatus } from "@/actions/server/admin_mc";
import { MCMemberManager } from "./McMemberManager";
import { MCTeam } from "@/actions/types/McAdmin";

const getTeamStatusBadge = (status: number) => {
    switch(status) {
        case 4: return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Accepted</Badge>;
        case 3: return <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">Waitlisted</Badge>;
        case 2: return <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10">Wait Payment</Badge>;
        case 1: return <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">Wait Docs</Badge>;
        default: return <Badge variant="outline" className="text-zinc-500 border-zinc-700">Verif. Team</Badge>;
    }
};

export function MCDataTable({ data }: { data: MCTeam[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedRows(newSet);
  };

  const openTeamDoc = async (key: string | null | undefined) => {
    if(!key) return;
    setLoadingDoc(key);
    const res = await getSignedDocUrl(key);
    setLoadingDoc(null);
    if(res.success && res.url) window.open(res.url, "_blank");
    else toast.error("Could not open document");
  };

  const handleUpdateTeamStatus = async (teamId: string, value: string) => {
      setUpdatingStatus(true);
      const res = await updateMCStatus(teamId, 'team', 'status', Number(value));
      setUpdatingStatus(false);
      if(res.success) toast.success("Team status updated");
      else toast.error("Update failed");
  };

  const handleAddNote = async (teamId: string, formData: FormData) => {
      const note = formData.get('note') as string;
      if(!note) return;
      await updateMCStatus(teamId, 'team', 'notes', note, 'update');
      toast.success("Note added");
  };

  const handleDeleteNote = async (teamId: string, note: string) => {
      await updateMCStatus(teamId, 'team', 'notes', note, 'remove_note');
      toast.success("Note deleted");
  };

  const handleVerifyTeamDoc = async (teamId: string, field: string, value: number) => {
      await updateMCStatus(teamId, 'team', field, value);
      toast.success("Doc status updated");
  }

  const filteredData = data.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.code.toLowerCase().includes(search.toLowerCase())
  );

  const TeamDocRow = ({ label, link, verified, field, teamId }: { label: string, link: string | null, verified: number, field: string, teamId: string }) => (
    <div className="flex items-center justify-between p-2.5 bg-zinc-900/50 rounded border border-zinc-800 mb-2">
        <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() => openTeamDoc(link)}
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
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-600" onClick={() => handleVerifyTeamDoc(teamId, field, 2)}>
                        <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400 text-zinc-600" onClick={() => handleVerifyTeamDoc(teamId, field, 1)}>
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
            placeholder="Search team name or code..." 
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
              <TableHead className="text-zinc-400">Team Name</TableHead>
              <TableHead className="text-zinc-400">Code</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Payment</TableHead>
              <TableHead className="text-right text-zinc-400">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-32 text-center text-zinc-500">No teams found.</TableCell></TableRow>
            ) : (
              filteredData.map((team) => (
                <Fragment key={team.team_id}>
                  <TableRow 
                    className={`border-zinc-800 transition-colors cursor-pointer ${expandedRows.has(team.team_id) ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/40'}`}
                    onClick={() => toggleRow(team.team_id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:bg-zinc-800 hover:text-white" onClick={() => toggleRow(team.team_id)}>
                        {expandedRows.has(team.team_id) ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-200 text-base">{team.name}</TableCell>
                    <TableCell className="font-mono text-zinc-500 text-xs">{team.code}</TableCell>
                    
                    {/* Status Column */}
                    <TableCell>
                       {getTeamStatusBadge(team.status)}
                    </TableCell>

                    <TableCell>
                       {team.pp_verified === 1 ? <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Paid</Badge> 
                       : team.pp_verified === 2 ? <Badge className="bg-red-500/15 text-red-400 hover:bg-red-500/20 border-red-500/20">Rejected</Badge> 
                       : <Badge variant="outline" className="text-zinc-500 border-zinc-700">Check</Badge>}
                    </TableCell>

                    <TableCell className="text-right">
                       <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{team.members.length}</Badge>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(team.team_id) && (
                    <TableRow className="bg-black border-b border-zinc-800 hover:bg-black">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 border-l-2 border-emerald-600 bg-zinc-950/30 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* LEFT: Team Admin */}
                                <div className="lg:col-span-4 space-y-6">
                                    
                                    {/* 1. STATUS CHANGER */}
                                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Change Team Status</h4>
                                        <Select 
                                          disabled={updatingStatus} 
                                          value={String(team.status)} 
                                          onValueChange={(val) => handleUpdateTeamStatus(team.team_id, val)}
                                        >
                                          <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="0">0 - Wait Team Verif</SelectItem>
                                            <SelectItem value="1">1 - Wait Core Docs</SelectItem>
                                            <SelectItem value="2">2 - Wait Payment</SelectItem>
                                            <SelectItem value="3">3 - Waitlisted</SelectItem>
                                            <SelectItem value="4">4 - Accepted</SelectItem>
                                          </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Documents */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2 mb-3"><FileText className="h-3 w-3" /> Team Files</h4>
                                        <TeamDocRow label="Proof of Payment" link={team.pp_link} verified={team.pp_verified} field="pp_verified" teamId={team.team_id} />
                                        <TeamDocRow label="Statement Letter" link={team.sp_link} verified={team.sp_verified} field="sp_verified" teamId={team.team_id} />
                                        <TeamDocRow label="Originality Letter" link={team.ol_link} verified={team.ol_verified} field="ol_verified" teamId={team.team_id} />
                                        <div className="my-2 border-t border-zinc-800/50"></div>
                                        <TeamDocRow label="Health Documents " link={team.hd_link} verified={team.hd_verified} field="hd_verified" teamId={team.team_id} />
                                        <TeamDocRow label="Team Assignmenet Document" link={team.td_link} verified={team.td_verified} field="td_verified" teamId={team.team_id} />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500">Admin Notes</h4>
                                        <div className="space-y-2">
                                            {team.notes && team.notes.map((n, i) => (
                                                <div key={i} className="flex justify-between gap-2 p-2 bg-zinc-900 rounded border border-zinc-800 text-xs text-zinc-400 group">
                                                    <span>{n}</span>
                                                    <button onClick={() => handleDeleteNote(team.team_id, n)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3"/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <form action={(fd) => handleAddNote(team.team_id, fd)} className="flex gap-2">
                                            <Input name="note" placeholder="Add note..." className="h-8 text-xs bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"/>
                                            <Button size="icon" className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700"><Send className="h-3 w-3"/></Button>
                                        </form>
                                    </div>
                                </div>

                                {/* RIGHT: Members Grid */}
                                <div className="lg:col-span-8">
                                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4">Team Members</h4>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {team.members.map((m) => (
                                            <MCMemberManager key={m.account_id} member={m}/>
                                        ))}
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