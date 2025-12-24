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
    title: "Laporan",
    icon: TrendingUpIcon,
    url: "/laporan",
  },
  {
    title: "Pengaturan",
    icon: SettingsIcon,
    url: "/pengaturan",
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 items-center justify-center rounded-md overflow-hidden bg-white">
            <Image src="/logo-dhananjaya-new.jpg" alt="Logo" fill className="object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Keuangan</span>
            <span className="text-xs text-muted-foreground leading-none mt-1">Komunitas</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.url === "/"}>
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
            <span className="text-sm font-medium leading-none truncate">Dhananjaya Admin</span>
            <span className="text-xs text-muted-foreground leading-none mt-1 truncate">dhananjaya@admin.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
