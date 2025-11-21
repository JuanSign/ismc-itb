"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Hourglass,
  CheckCircle2,
  ListRestart,
  ScrollText,
  Info,
  BookText,
  CreditCard,
} from "lucide-react";

type StatusConfig = {
  icon: React.ReactNode;
  className: string;
};

// Dark Mode Adapted Colors
const statusMap: Record<number, StatusConfig> = {
  0: {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20",
  },
  1: {
    icon: <BookText className="h-4 w-4" />,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20",
  },
  2: {
    icon: <CreditCard className="h-4 w-4" />,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20",
  },
  3: {
    icon: <ListRestart className="h-4 w-4" />, 
    className: "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20",
  },
  4: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20",
  },
};

export function TeamStatusBadge({
  statusText,
  status,
  notes,
}: {
  statusText: string;
  status: number | null;
  notes: string[] | null;
}) {
  const finalStatus = statusMap[status || 0] || statusMap[0];
  
  const rawNotes = notes || [];
  const notesCount = rawNotes.length;
  const hasNotes = notesCount > 0;

  const notesToDisplay = hasNotes ? rawNotes : ["No details provided."];

  const StatusIcon = (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "relative h-9 w-9 transition-all duration-200",
        finalStatus.className
      )}
    >
      {finalStatus.icon}
      {hasNotes && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950 shadow-sm">
          {notesCount}
        </span>
      )}
    </Button>
  );

  if (!hasNotes) {
    return StatusIcon;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {StatusIcon}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-slate-950 border-white/10 text-slate-100 shadow-xl" align="end">
        <div className="flex items-center gap-2 border-b border-white/10 p-4 bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-white/10 shadow-sm">
            <ScrollText className="h-4 w-4 text-slate-200" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold leading-none text-white">Admin Notes</h4>
            <p className="text-xs text-slate-400 mt-1">
              Status: {statusText}
            </p>
          </div>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {notesToDisplay.map((note, index) => (
              <div
                key={index}
                className="relative flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm shadow-sm hover:bg-white/10 transition-colors"
              >
                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 leading-relaxed">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

         {/* Footer Section */}
         <div className="bg-white/5 p-2 border-t border-white/10 text-center">
           <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
             {notesCount} {notesCount === 1 ? 'Message' : 'Messages'}
           </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}