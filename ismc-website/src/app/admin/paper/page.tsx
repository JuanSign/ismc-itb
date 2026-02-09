import { getPaperCompetitionData } from "@/actions/server/admin_paper";
import { PaperDataTable } from "@/components/admin/PaperDataTable";
import { RefreshBtn } from "@/components/admin/RefreshBtn";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; 

export default async function PaperAdminPage() {
  const data = await getPaperCompetitionData();

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6">
          <Link href="/admin">
             <Button variant="link" className="pl-0 text-zinc-500 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
             </Button>
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white">Paper Competition</h1>
              <p className="text-zinc-500 mt-1">
                Manage <span className="text-purple-400 font-mono">{data.length}</span> registered teams
              </p>
            </div>
            <div>
              <RefreshBtn />
            </div>
          </div>
        </div>

        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
           <PaperDataTable data={data} />
        </div>

      </div>
    </div>
  );
}