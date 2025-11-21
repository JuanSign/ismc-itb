"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Hourglass,
  CheckCircle2,
  ListRestart,
  ScrollText,
} from "lucide-react";

type StatusConfig = {
  icon: React.ReactNode;
  className: string;
};

const statusMap: Record<number, StatusConfig> = {
  0: {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20",
  },
  1: {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20",
  },
  2: {
    icon: <Hourglass className="h-4 w-4" />,
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
  status,
  notes,
}: {
  status: number | null;
  notes: string[] | null;
}) {
  const finalStatus = statusMap[status || 0] || statusMap[0]; 
  const notesCount = notes?.length ?? 0;
  const hasNotes = notesCount > 0;

  let notesToDisplay: string[] = notes || [];
  const defaultNote = "No admin notes available for this status.";
  
  if (!hasNotes) {
      notesToDisplay = [defaultNote];
  }

  const StatusIcon = (
    <Button
      variant="outline"
      size="icon"
      className={`relative h-9 w-9 p-0 ${finalStatus.className}`}
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
      
      {/* Dark Glass Popover */}
      <PopoverContent className="w-80 bg-slate-950 border-white/10 text-slate-100 shadow-xl" align="end">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <ScrollText className="h-4 w-4 text-slate-400" />
            <h4 className="font-medium leading-none text-white">Admin Notes ({notesCount})</h4>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            {notesToDisplay.map((note, index) => (
              <li key={index} className="pl-1">{note}</li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}