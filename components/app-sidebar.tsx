"use client";

import { type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LineChart,
  LogOut,
  Package,
  Users2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const primaryNav = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Customers", href: "/customers", icon: Users2 },
];

export function AppSidebar({
  className,
  ...props
}: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const handleLogout = () => {
    logout();
    notify.success("Signed out");
    router.replace("/login");
  };

  return (
    <Sidebar collapsible="icon" className={cn("py-6", className)} {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60 pb-4">
        <div className="flex flex-col gap-1 px-2">
          <p className="text-xs uppercase tracking-wide text-sidebar-foreground/60">
            Khushika
          </p>
          <h1 className="text-lg font-semibold leading-tight">Mobile Shop</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => {
                const basePath = item.href.split("#")[0];
                const isActive = pathname === basePath;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      size="lg"
                      className="relative pl-6"
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-2"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-primary transition-opacity",
                            "group-data-[collapsible=icon]:hidden",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60">
        <div className="flex items-center gap-3 bg-sidebar-accent/60 p-3">
          <Avatar className="size-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-semibold leading-tight">
              {user?.name ?? "Admin"}
            </span>
            <span className="text-sidebar-foreground/70 text-xs">
              {user?.email ?? "admin@electronics.dev"}
            </span>
          </div>
        </div>
        <Separator className="bg-sidebar-border" />
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
