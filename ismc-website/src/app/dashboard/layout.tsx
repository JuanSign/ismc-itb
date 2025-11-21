import Image from "next/image"
import { AppSidebar } from "@/components/Dashboard/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh flex flex-col overflow-hidden bg-transparent isolate relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pages/register/bg.jpg"
            alt="Dashboard Background"
            fill
            priority
            className="object-cover"
            quality={75}
            sizes="100vw"
            style={{ opacity: 0.15 }} 
          />
          <div className="absolute inset-0 bg-background/50 mix-blend-overlay" />
        </div>

        <header className="relative z-10 flex h-16 shrink-0 items-center gap-2 bg-background/20 backdrop-blur-md border-b border-primary/5 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}