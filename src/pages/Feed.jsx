import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Reply, Send, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import MediaUploadButton from "@/components/shared/MediaUploadButton";

/**
 * MOCK DB (substitui Base44)
 * mantém app a funcionar sem backend
 */
const db = {
  entities: {
    FeedComment: {
      filter: async () => [],
      create: async () => ({}),
      update: async () => ({})
    },
    FeedPost: {
      update: async () => ({})
    }
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: "" })
    }
  }
};

export default function FeedPostCard({ post, user }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentMedia, setCommentMedia] = useState(null);

  const liked = post.liked_by?.includes(user?.id || "anon");

  const { data: comments = [] } = useQuery({
    queryKey: ["feed-comments", post.id],
    queryFn: () =>
      db.entities.FeedComment.filter(
        { post_id: post.id },
        "-created_date",
        50
      ),
    enabled: showComments,
  });

  const likePost = useMutation({
    mutationFn: async () => {
      const uid = user?.id || "anon";
      const newLiked = liked
        ? (post.liked_by || []).filter((id) => id !== uid)
        : [...(post.liked_by || []), uid];

      return db.entities.FeedPost.update(post.id, {
        liked_by: newLiked,
        likes: newLiked.length,
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["feed-posts"] }),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      let media_url = null;

      if (commentMedia) {
        const res = await db.integrations.Core.UploadFile({
          file: commentMedia.file,
        });
        media_url = res.file_url;
      }

      await db.entities.FeedComment.create({
        post_id: post.id,
        parent_comment_id: replyTo?.id || null,
        author_id: user?.id || "anon",
        author_name: user?.full_name || "Anónimo",
        content: commentText,
        media_url,
        likes: 0,
        liked_by: [],
      });

      await db.entities.FeedPost.update(post.id, {
        comments_count: (post.comments_count || 0) + 1,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["feed-comments", post.id],
      });
      qc.invalidateQueries({
        queryKey: ["feed-posts"],
      });
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
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
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
        <p className="text-sm whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          onClick={() => likePost.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked
              ? "text-red-500"
              : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{post.likes || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
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

      {/* Comments */}
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
