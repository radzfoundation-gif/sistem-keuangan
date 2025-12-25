"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboardIcon, FileTextIcon, SettingsIcon, TrendingUpIcon, WalletIcon, MegaphoneIcon } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useEffect, useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    url: "/",
  },
  {
    title: "Acara",
    icon: MegaphoneIcon,
    url: "/acara",
  },
  {
    title: "Nota",
    icon: FileTextIcon,
    url: "/nota",
  },
  {
    title: "Rekap",
    icon: TrendingUpIcon,
    url: "/rekap",
  },
  {
    title: "Laporan",
    icon: FileTextIcon,
    url: "/laporan",
  },
  {
    title: "Pengaturan",
    icon: SettingsIcon,
    url: "/pengaturan",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("Admin")

  useEffect(() => {
    const supabase = createClient()
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        // Set name from metadata if available, or just use "Admin" or part of email
        setUserName(user.user_metadata?.full_name || "Bendahara")
      }
    }
    getUser()
  }, [])

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 items-center justify-center rounded-md overflow-hidden bg-white">
            <Image src="/logo-dhananjaya-new.jpg" alt="Logo" fill className="object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Dhananjaya</span>
            <span className="text-xs text-muted-foreground leading-none mt-1">Komunitas</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)}>
                  <a href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-muted text-foreground text-xs font-medium">AB</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium leading-none truncate">{userName}</span>
            <span className="text-xs text-muted-foreground leading-none mt-1 truncate" title={userEmail}>
              {userEmail || "Memuat..."}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
