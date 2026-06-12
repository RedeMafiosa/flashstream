const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Shield, Tag, Plus, X, Pencil, Zap } from "lucide-react";
import { toast } from "sonner";
import TagBadge from "@/components/tags/TagBadge";
import XPBar, { getLevelFromXP } from "@/components/profile/XPBar";

export default function AdminMembers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProfile, setEditingProfile] = useState(null);
  const [xpAdd, setXpAdd] = useState(0);

  const { data: profiles = [] } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => db.entities.UserProfile.list("-xp", 100),
  });
  const { data: tags = [] } = useQuery({
    queryKey: ["member-tags"],
    queryFn: () => db.entities.MemberTag.list("-priority", 50),
  });

  const filtered = profiles.filter(p =>
    !search || p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const updateProfile = useMutation({
    mutationFn: ({ id, data }) => db.entities.UserProfile.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success("Perfil atualizado!");
    },
  });

  const addXpMutation = useMutation({
    mutationFn: ({ profile, amount }) => {
      const newXP = (profile.xp || 0) + amount;
      const info = getLevelFromXP(newXP);
      return db.entities.UserProfile.update(profile.id, { xp: newXP, level: info.level });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success(`+${xpAdd} XP adicionados!`);
      setXpAdd(0);
    },
  });

  const toggleTag = (profile, tagName) => {
    const currentTags = profile.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    updateProfile.mutate({ id: profile.id, data: { tags: newTags } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Membros
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar membros..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-none" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(profile => {
          const info = getLevelFromXP(profile.xp || 0);
          const profileTags = (profile.tags || []).map(name => tags.find(t => t.name === name)).filter(Boolean);
          return (
            <div key={profile.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="rounded-full" /> : null}
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {(profile.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <span className="font-bold">{profile.username}</span>
                    {profileTags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
                  </div>
                  <XPBar xp={profile.xp || 0} compact />
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.xp || 0} XP total • Nível {info.level}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => setEditingProfile(profile)}>
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Gerir Membro: {editingProfile?.username}
            </DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-5">
              {/* XP Section */}
              <div className="space-y-3">
                <p className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />XP & Nível</p>
                <XPBar xp={editingProfile.xp || 0} />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Quantidade de XP"
                    value={xpAdd || ""}
                    onChange={e => setXpAdd(Number(e.target.value))}
                    className="bg-secondary border-none"
                  />
                  <Button size="sm" className="gap-1.5 flex-shrink-0"
                    onClick={() => addXpMutation.mutate({ profile: editingProfile, amount: xpAdd })}
                    disabled={!xpAdd}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar XP
                  </Button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <p className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-primary" />Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const hasTag = (editingProfile.tags || []).includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newProfile = {
                            ...editingProfile,
                            tags: hasTag
                              ? (editingProfile.tags || []).filter(t => t !== tag.name)
                              : [...(editingProfile.tags || []), tag.name],
                          };
                          setEditingProfile(newProfile);
                          toggleTag(editingProfile, tag.name);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${
                          hasTag ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <TagBadge tag={tag} />
                        {hasTag && <X className="w-3 h-3 text-muted-foreground" />}
                        {!hasTag && <Plus className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
                {tags.length === 0 && <p className="text-sm text-muted-foreground">Cria tags em "Tags de Membros" primeiro.</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}