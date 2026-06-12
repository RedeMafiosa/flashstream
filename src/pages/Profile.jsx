const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Camera, Edit3, Save, Heart, Eye, Diamond, Star, Trophy, Zap,
  Package, Send, MessageCircle, Upload, X
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import XPBar from "@/components/profile/XPBar";

const LEVEL_COLORS = [
  "from-gray-500 to-gray-600", "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600", "from-purple-500 to-violet-600",
  "from-yellow-400 to-amber-500", "from-red-500 to-rose-600",
  "from-pink-500 to-fuchsia-600", "from-orange-400 to-red-500",
];
const getLevelColor = (level) => LEVEL_COLORS[Math.floor((level - 1) / 7) % LEVEL_COLORS.length];

const ACHIEVEMENT_LIST = [
  { id: "first_message", label: "Primeira Mensagem", icon: "💬" },
  { id: "vip", label: "Membro VIP", icon: "👑" },
  { id: "donator", label: "Doador Generoso", icon: "💎" },
  { id: "streamer", label: "Streamer", icon: "📡" },
  { id: "top10", label: "Top 10 Ranking", icon: "🏆" },
  { id: "og", label: "Membro OG", icon: "⭐" },
];

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: "", username: "" });
  const coverRef = useRef();
  const avatarRef = useRef();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await db.entities.UserProfile.filter({ user_id: user.id }, "-created_date", 1);
      return profiles[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet-me"],
    queryFn: async () => {
      if (!user?.id) return null;
      const wallets = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return wallets[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["member-tags"],
    queryFn: () => db.entities.MemberTag.filter({ is_active: true }, "-priority", 50),
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory-preview"],
    queryFn: async () => {
      if (!user?.id) return [];
      return db.entities.Inventory.filter({ owner_id: user.id }, "-created_date", 6);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setForm({ bio: profile.bio || "", username: profile.username || user?.full_name || "" });
    } else if (user) {
      setForm({ bio: "", username: user.full_name || "" });
    }
  }, [profile, user]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return db.entities.UserProfile.update(profile.id, data);
      } else {
        return db.entities.UserProfile.create({ ...data, user_id: user.id, xp: 0, level: 1 });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      setEditing(false);
      toast.success("Perfil guardado!");
    }
  });

  const uploadImage = async (file, field) => {
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    const update = { [field]: file_url };
    if (profile?.id) {
      await db.entities.UserProfile.update(profile.id, update);
    } else {
      await db.entities.UserProfile.create({ user_id: user.id, username: user.full_name || "User", ...update });
    }
    qc.invalidateQueries({ queryKey: ["profile-me"] });
    toast.success("Imagem atualizada!");
  };

  const xpForLevel = (lvl) => lvl * lvl * 100;
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const currentLevelXP = xpForLevel(currentLevel);
  const xpProgress = Math.min(100, ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  const userTags = (profile?.tags || []).map(t => tags.find(mt => mt.name === t)).filter(Boolean);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Zap className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Faz login para ver o teu perfil</p>
        <Button onClick={() => db.auth.redirectToLogin(window.location.href)}>Entrar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Cover & Avatar */}
      <div className="relative rounded-2xl overflow-hidden border border-border">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-br from-primary/30 via-purple-900/40 to-card">
          {profile?.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 p-2 rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={coverRef} type="file" accept="image/*,image/gif" className="hidden"
            onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0], "cover_url")} />
        </div>

        {/* Avatar */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-2xl border-4 border-background bg-gradient-to-br ${getLevelColor(currentLevel)} overflow-hidden flex-shrink-0`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    {(profile?.username || user?.full_name || "U")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/80 p-1.5 rounded-lg transition-colors">
                <Upload className="w-3 h-3 text-white" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*,image/gif" className="hidden"
                onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0], "avatar_url")} />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-display font-bold">{profile?.username || user?.full_name || "Utilizador"}</h1>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Nv. {currentLevel}</Badge>
                {userTags.map(tag => (
                  <Badge key={tag.id} style={{ background: tag.bg_color, color: tag.color }} className="text-xs border-0">
                    {tag.icon} {tag.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">ID: {user?.id?.slice(0, 8)}...</p>
            </div>
            <Button size="sm" variant={editing ? "default" : "outline"} onClick={() => {
              if (editing) saveMutation.mutate({ ...form, user_id: user.id });
              else setEditing(true);
            }} className="gap-2 self-end mb-2">
              {editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editing ? "Guardar" : "Editar"}
            </Button>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Nível {currentLevel}</span>
              <span>{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
              <span>Nível {currentLevel + 1}</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full`}
              />
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Nome de utilizador" />
              <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Escreve algo sobre ti..." rows={3} className="resize-none" />
            </div>
          ) : (
            profile?.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Heart, label: "Likes", value: (profile?.total_messages || 0) * 3, color: "text-red-400", bg: "bg-red-400/10" },
          { icon: Eye, label: "Visualizações", value: (profile?.total_messages || 0) * 12, color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: Diamond, label: "Diamantes", value: wallet?.diamonds || 0, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          { icon: MessageCircle, label: "Mensagens", value: profile?.total_messages || 0, color: "text-green-400", bg: "bg-green-400/10" },
        ].map(stat => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="achievements">
        <TabsList className="bg-secondary">
          <TabsTrigger value="achievements">🏆 Conquistas</TabsTrigger>
          <TabsTrigger value="inventory">📦 Inventário</TabsTrigger>
          <TabsTrigger value="tags">🏷️ Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENT_LIST.map(ach => {
              const earned = (profile?.achievements || []).includes(ach.id);
              return (
                <div key={ach.id} className={`p-4 rounded-xl border text-center transition-all ${earned ? "border-primary/40 bg-primary/10" : "border-border bg-card opacity-40"}`}>
                  <div className="text-3xl mb-2">{ach.icon}</div>
                  <p className="text-sm font-semibold">{ach.label}</p>
                  {earned && <Badge className="bg-primary/20 text-primary border-0 text-xs mt-1">Conquistado!</Badge>}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Inventário vazio. Compra items na loja!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {inventoryItems.map(item => (
                <div key={item.id} className="border border-border rounded-xl p-2 text-center bg-card hover:border-primary/40 cursor-pointer transition-all">
                  <img src={item.item_image} alt={item.item_name} className="w-full aspect-square object-cover rounded-lg mb-1" onError={e => e.target.style.display = 'none'} />
                  <p className="text-xs truncate">{item.item_name}</p>
                  {item.quantity > 1 && <Badge className="bg-secondary text-xs">x{item.quantity}</Badge>}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/inventory"} className="gap-2">
              <Package className="w-4 h-4" /> Ver Inventário Completo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {userTags.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma tag atribuída ainda.</p>
            ) : (
              userTags.map(tag => (
                <div key={tag.id} className="px-4 py-2 rounded-full text-sm font-semibold border"
                  style={{ background: tag.bg_color, color: tag.color, borderColor: tag.color + "44" }}>
                  {tag.icon} {tag.label}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}