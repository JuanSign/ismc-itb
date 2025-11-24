import { getMiningCompetitionData } from "@/actions/database/admin_mc";
import { verifySession } from "@/actions/server/session";
import { MCDataTable } from "@/components/admin/McDataTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MCAdminPage() {
  const session = await verifySession();
  if (!session || !session.is_admin) {
    redirect("/register");
  }
  const data = await getMiningCompetitionData();

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6">
          <Link href="/admin">
             <Button variant="link" className="pl-0 text-zinc-500 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
             </Button>
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white">Mining Competition</h1>
              <p className="text-zinc-500 mt-1">
                Manage <span className="text-emerald-400 font-mono">{data.length}</span> registered teams
              </p>
            </div>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
           <MCDataTable data={data} />
        </div>

      </div>
    </div>
  );
}