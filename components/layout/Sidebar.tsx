"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  UserRound,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { useAuth } from "../../lib/hooks/useAuth";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";

export const Sidebar: React.FC<{
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}> = ({ isMobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navItems = [
    {
      label: "Visão geral",
      icon: <LayoutDashboard className="w-[19px] h-[19px]" />,
      href: "/dashboard",
    },
    {
      label: "Cargas",
      icon: <Package className="w-[19px] h-[19px]" />,
      href: "/cargas",
    },
    {
      label: "Transportadores",
      icon: <Truck className="w-[19px] h-[19px]" />,
      href: "/transportadores",
    },
    {
      label: "Motoristas",
      icon: <UserRound className="w-[19px] h-[19px]" />,
      href: "/motoristas",
    },
    {
      label: "Clientes",
      icon: <Users className="w-[19px] h-[19px]" />,
      href: "/clientes",
    },
    {
      label: "Alertas",
      icon: <AlertTriangle className="w-[19px] h-[19px]" />,
      href: "/alertas",
    },
    {
      label: "Relatórios",
      icon: <FileText className="w-[19px] h-[19px]" />,
      href: "/relatorios",
    },
    ...(user?.perfil === "administrador_principal" ||
    user?.perfil === "administrador"
      ? [
          {
            label: "Configurações",
            icon: <Settings className="w-[19px] h-[19px]" />,
            href: "/configuracoes",
          },
        ]
      : []),
  ];

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-slate-950 text-white flex flex-col transition-all duration-300 shadow-2xl",
          !isMobile && (collapsed ? "w-20" : "w-64"),
          isMobile &&
            (isMobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"),
        )}
      >
        <div
          className={cn(
            "h-20 flex items-center border-b border-white/10",
            collapsed && !isMobile ? "justify-center" : "px-5 justify-between",
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => isMobile && onMobileClose?.()}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Radio className="w-5 h-5" />
            </div>
            {(!collapsed || isMobile) && (
              <div>
                <div className="font-bold tracking-tight">
                  Cargo<span className="text-blue-400">Track</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-[.2em]">
                  Logística inteligente
                </div>
              </div>
            )}
          </Link>
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <div className="px-3 pt-5">
          {(!collapsed || isMobile) && (
            <Link
              href="/rastrear"
              className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10"
            >
              <Search className="w-4 h-4 text-blue-400" />
              Rastrear publicamente
            </Link>
          )}
        </div>
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500 px-3 mb-2">
            Operação
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && onMobileClose?.()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                      active
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/7",
                      collapsed && !isMobile && "justify-center px-2",
                    )}
                  >
                    <span>{item.icon}</span>
                    {(!collapsed || isMobile) && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-white/10">
          {(!collapsed || isMobile) && user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1">
              <Avatar
                name={user.nomeCompleto || user.nomeUtilizador || "U"}
                size="sm"
                color="primary"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.nomeCompleto || user.nomeUtilizador}
                </p>
                <p className="text-[11px] text-slate-500 capitalize truncate">
                  {user.perfil?.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full !text-slate-400 hover:!text-white hover:!bg-white/10",
              collapsed && !isMobile && "justify-center",
            )}
            onClick={logout}
            leftIcon={<LogOut className="w-[18px] h-[18px]" />}
          >
            {(!collapsed || isMobile) && "Terminar sessão"}
          </Button>
        </div>
      </aside>
    </>
  );
};
