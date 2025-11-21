"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export type MedicalItem = { name: string; description?: string };

type Props = {
  label: string;
  items: MedicalItem[] | null;
  onChange: (items: MedicalItem[]) => void;
};

export function MedicalHistoryInput({ label, items, onChange }: Props) {
  const [list, setList] = useState<MedicalItem[]>(items || []);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addItem = () => {
    if (!newName.trim()) return;
    const updated = [...list, { name: newName, description: newDesc }];
    setList(updated);
    onChange(updated);
    setNewName("");
    setNewDesc("");
  };

  const removeItem = (index: number) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    onChange(updated);
  };

  // Dark Styles
  const inputClass = "h-9 text-sm bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-yellow-500/50";

  return (
    <div className="space-y-3 border border-white/10 rounded-md p-3 bg-white/5">
      <Label className="text-base font-medium text-slate-200">{label}</Label>
      
      {/* Input Area */}
      <div className="flex flex-col gap-2">
        <Input 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          placeholder="Condition Name"
          className={inputClass}
        />
        <div className="flex gap-2">
          <Input 
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description"
            className={`${inputClass} flex-1`}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); }}}
          />
          <Button type="button" onClick={addItem} size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white border-none">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* List Area */}
      <div className="flex flex-col gap-2 mt-2">
        {list.length === 0 && <span className="text-xs text-slate-500 italic">No items listed.</span>}
        {list.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between bg-white/5 p-2 rounded-md border border-white/10 text-sm shadow-sm">
            <div className="flex flex-col">
                <span className="font-semibold text-slate-200">{item.name}</span>
                {item.description && <span className="text-xs text-slate-400">{item.description}</span>}
            </div>
            <button 
              type="button" 
              onClick={() => removeItem(idx)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}