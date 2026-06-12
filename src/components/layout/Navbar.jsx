const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Search, Menu, X, Zap, Settings, User, LogOut, Shield, Wallet, Crown, Package, Coins, Diamond, Gem } from "lucide-react";
import NotificationPanel from "@/components/shared/NotificationPanel";
import MessagesPanel from "@/components/shared/MessagesPanel";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";

const TOKEN_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/b67743f1e_7208-dragocoin.gif";
const DIAMOND_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/abcabe201_2046-diamond-4.gif";
const POTION_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/1f92ffbb0_32528-potion.gif";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ["wallet-navbar", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const w = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return w[0] || null;
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  const navLinks = [
  { label: "Início", path: "/" },
  { label: "Streams", path: "/streams" },
  { label: "Loja", path: "/store" },
  { label: "Carteira", path: "/wallet" }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="h-14 flex items-center px-4 gap-3">
        {/* Left - Logo + Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-lg hidden sm:block tracking-wide">FlashStream</span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs mx-auto hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-none h-9 text-sm" />
          </div>
        </div>

        {/* Maintenance Ticker — between search and wallet */}
        <div className="hidden md:flex flex-1 overflow-hidden max-w-xs">
          <div className="w-full overflow-hidden h-7 flex items-center bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2">
            <div className="whitespace-nowrap text-yellow-400 text-[11px] font-semibold animate-[marquee_20s_linear_infinite]">
              ⚠️ SITE EM MANUTENÇÃO — SEJA PACIENTE, ATE BREVE &nbsp;&nbsp;&nbsp; ⚠️ SITE EM MANUTENÇÃO — SEJA PACIENTE, ATE BREVE &nbsp;&nbsp;&nbsp;
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* VIP */}
          <Link to="/vip">
            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 gap-1.5 hidden sm:flex">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-semibold">VIP</span>
            </Button>
          </Link>

          {/* Wallet balances — ao lado do VIP */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              <Link to="/wallet" className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors">
                <img src={TOKEN_GIF} alt="" className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold text-yellow-400">{(wallet?.tokens || 0).toLocaleString()}</span>
              </Link>
              <Link to="/wallet" className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors">
                <img src={DIAMOND_GIF} alt="" className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold text-cyan-400">{(wallet?.diamonds || 0).toLocaleString()}</span>
              </Link>
              <Link to="/wallet" className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors">
                <img src={POTION_GIF} alt="" className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold text-pink-400">{(wallet?.gems || 0).toLocaleString()}</span>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <>
              <MessagesPanel />
              <NotificationPanel />
            </>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center text-xs font-bold ring-2 ring-primary/30">
                  {user?.full_name?.[0]?.toUpperCase() || "?"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
                  {user?.full_name || "Utilizador"}
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2"><User className="w-4 h-4" /> Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/inventory" className="flex items-center gap-2"><Package className="w-4 h-4" /> Inventário</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wallet" className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Carteira</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 text-primary"><Shield className="w-4 h-4" /> Admin</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => db.auth.redirectToLogin()} className="gap-2">
              <User className="w-4 h-4" /> Entrar
            </Button>
          )}
        </div>
      </div>
    </nav>);

}