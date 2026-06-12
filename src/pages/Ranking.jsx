const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Eye, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const podiumColors = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-slate-400",
  "from-orange-500 to-amber-700",
];
const podiumIcons = [Crown, Medal, Medal];

export default function Ranking() {
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["ranking-streams"],
    queryFn: () => db.entities.Stream.list("-followers", 20),
  });

  const top3 = streams.slice(0, 3);
  const rest = streams.slice(3);

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 justify-center">
          <Trophy className="w-7 h-7 text-yellow-400" />
          Ranking
        </h1>
        <p className="text-sm text-muted-foreground">Os streamers mais populares da plataforma</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 items-end">
            {[1, 0, 2].map((idx) => {
              const s = top3[idx];
              if (!s) return <div key={idx} />;
              const PodiumIcon = podiumIcons[idx];
              const isFirst = idx === 0;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className={isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"}
                >
                  <Card className={`text-center ${isFirst ? "ring-2 ring-yellow-500/50 glow-purple" : ""} border-border`}>
                    <CardContent className="p-5">
                      <div className="relative inline-block mb-3">
                        <div className={`w-16 h-16 ${isFirst ? "w-20 h-20" : ""} rounded-full bg-gradient-to-br ${podiumColors[idx]} flex items-center justify-center text-2xl font-bold text-white mx-auto overflow-hidden`}>
                          {s.streamer_avatar ? (
                            <img src={s.streamer_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            s.streamer_name?.[0]
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                          <PodiumIcon className={`w-3 h-3 ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-400" : "text-orange-500"}`} />
                        </div>
                      </div>
                      <p className="font-bold text-sm truncate">{s.streamer_name}</p>
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{(s.followers || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(s.total_views || 0).toLocaleString()}</span>
                      </div>
                      <Badge className={`mt-2 text-[10px] bg-gradient-to-r ${podiumColors[idx]} text-white border-none`}>
                        #{idx + 1}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Rest of ranking */}
          {rest.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Classificação Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rest.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="w-8 text-center text-sm font-bold text-muted-foreground">#{i + 4}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-purple-800 flex items-center justify-center text-sm font-bold overflow-hidden">
                      {s.streamer_avatar ? (
                        <img src={s.streamer_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        s.streamer_name?.[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{s.streamer_name}</p>
                      <p className="text-xs text-muted-foreground">{s.game || s.category}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{(s.followers || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(s.total_views || 0).toLocaleString()}</span>
                    </div>
                    {s.status === "live" && (
                      <Badge className="bg-red-600 text-white border-none text-[10px]">LIVE</Badge>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}