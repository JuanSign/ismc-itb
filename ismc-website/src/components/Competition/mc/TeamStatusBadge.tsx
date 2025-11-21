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

const statusMap: Record<number, StatusConfig> = {
  0: {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-600 bg-yellow-50 border-yellow-300 hover:bg-yellow-100",
  },
  1: {
    icon: < BookText className="h-4 w-4" />,
    className: "text-yellow-600 bg-yellow-50 border-yellow-300 hover:bg-yellow-100",
  },
  2: {
    icon: <CreditCard className="h-4 w-4" />,
    className: "text-yellow-600 bg-yellow-50 border-yellow-300 hover:bg-yellow-100",
  },
  3: {
    icon: <ListRestart className="h-4 w-4" />, 
    className: "text-destructive bg-destructive/10 border-destructive/50 hover:bg-destructive/20",
  },
  4: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "text-emerald-600 bg-emerald-50 border-emerald-400 hover:bg-emerald-100",
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
        <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background shadow-sm">
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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center gap-2 border-b p-4 bg-muted/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm">
            <ScrollText className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold leading-none">Admin Notes</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {statusText}
            </p>
          </div>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {notesToDisplay.map((note, index) => (
              <div
                key={index}
                className="relative flex gap-3 rounded-lg border bg-card p-3 text-sm shadow-sm hover:bg-accent/50 transition-colors"
              >
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90 leading-relaxed">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

         {/* Footer Section */}
         <div className="bg-muted/30 p-2 border-t text-center">
           <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
             {notesCount} {notesCount === 1 ? 'Message' : 'Messages'}
           </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}