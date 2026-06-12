import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Reply,
  Send,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import MediaUploadButton from "@/components/shared/MediaUploadButton";

const API_URL = "https://backend-fj9l.onrender.com";

export default function FeedPostCard({ post, user }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentMedia, setCommentMedia] = useState(null);

  const liked = post.liked_by?.includes(user?.id || "anon");

  // ================= COMMENTS =================
  const { data: comments = [] } = useQuery({
    queryKey: ["feed-comments", post.id],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/comments?post_id=${post.id}`
      );
      return res.json();
    },
    enabled: showComments,
  });

  // ================= LIKE POST =================
  const likePost = useMutation({
    mutationFn: async () => {
      await fetch(`${API_URL}/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "anon",
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  // ================= ADD COMMENT =================
  const addComment = useMutation({
    mutationFn: async () => {
      await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          parent_comment_id: replyTo?.id || null,
          author_id: user?.id || "anon",
          author_name: user?.full_name || "Anónimo",
          content: commentText,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-comments", post.id] });
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setCommentText("");
      setReplyTo(null);
      setCommentMedia(null);
    },
  });

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

  const topLevelComments = comments.filter(
    (c) => !c.parent_comment_id
  );

  const getReplies = (parentId) =>
    comments.filter((c) => c.parent_comment_id === parentId);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback>
            {(post.author_name || "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold text-sm">{post.author_name}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          onClick={() => likePost.mutate()}
          className={`flex items-center gap-1.5 text-sm ${
            liked ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{post.likes || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count || 0}</span>
          {showComments ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-3 pt-2">
          <Textarea
            placeholder="Escreve um comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <Button
            size="sm"
            disabled={!commentText.trim()}
            onClick={() => addComment.mutate()}
          >
            <Send className="w-4 h-4" />
            Comentar
          </Button>

          {/* LIST */}
          <div className="space-y-2">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <p className="text-sm font-semibold">
                  {comment.author_name}
                </p>
                <p className="text-xs">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
