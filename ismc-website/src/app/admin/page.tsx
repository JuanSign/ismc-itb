import { verifySession } from "@/actions/server/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pickaxe, Code2, FileText, Camera, Presentation } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const modules = [
  { 
    name: "Mining Competition", 
    href: "/admin/mc", 
    icon: Pickaxe, 
    color: "text-amber-500",
    desc: "Manage teams, verify payments, and check submissions."
  },
  { name: "Hackathon", href: "/admin/hackathon", icon: Code2, color: "text-blue-500", desc: "Manage hackathon participants." },
  { name: "Poster", href: "/admin/poster", icon: FileText, color: "text-green-500", desc: "Manage poster submissions." },
  { name: "Paper", href: "/admin/paper", icon: Presentation, color: "text-purple-500", desc: "Manage paper abstracts and full papers." },
  { name: "Photo", href: "/admin/photo", icon: Camera, color: "text-pink-500", desc: "Manage photography contest entries." },
];

export default async function AdminDashboard() {
  const session = await verifySession();
  if (!session || !session.is_admin) {
    redirect("/register");
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Admin Portal</h1>
          <p className="text-zinc-400 text-lg">Select a module to manage entries and verifications.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <Link key={mod.name} href={mod.href} className="block h-full">
              <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all duration-200 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {mod.name}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-zinc-950 border border-zinc-800 ${mod.color}`}>
                    <mod.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{mod.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}