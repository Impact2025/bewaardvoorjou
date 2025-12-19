"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import {
  Heart,
  Smile,
  Frown,
  Laugh,
  ThumbsUp,
  Lightbulb,
  Star,
  MessageCircle,
  Plus,
} from "lucide-react";

interface Reaction {
  emoji: string;
  label: string;
  icon: typeof Heart;
  color: string;
}

interface StoryReaction {
  id: string;
  user_id: string;
  user_name: string;
  emoji: string;
  created_at: string;
}

interface StoryComment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  reactions: StoryReaction[];
}

interface StoryReactionsProps {
  storyId: string; // chapter or media asset ID
  reactions: StoryReaction[];
  comments: StoryComment[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
  onAddComment: (content: string) => void;
  className?: string;
}

const AVAILABLE_REACTIONS: Reaction[] = [
  { emoji: "❤️", label: "Liefde", icon: Heart, color: "text-red-500" },
  { emoji: "😊", label: "Blij", icon: Smile, color: "text-yellow-500" },
  { emoji: "😂", label: "Grappig", icon: Laugh, color: "text-orange-500" },
  { emoji: "👍", label: "Goed", icon: ThumbsUp, color: "text-blue-500" },
  { emoji: "💡", label: "Inzicht", icon: Lightbulb, color: "text-purple-500" },
  { emoji: "⭐", label: "Favoriet", icon: Star, color: "text-amber-500" },
  { emoji: "😢", label: "Verdrietig", icon: Frown, color: "text-slate-500" },
];

export function StoryReactions({
  storyId,
  reactions,
  comments,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  className,
}: StoryReactionsProps) {
  const { session } = useAuth();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, StoryReaction[]>);

  const userReactions = reactions.filter(r => r.user_id === session?.user?.id);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = userReactions.find(r => r.emoji === emoji);

    if (existingReaction) {
      onRemoveReaction(existingReaction.id);
    } else {
      onAddReaction(emoji);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Reactions Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Existing Reactions */}
        {Object.entries(reactionGroups).map(([emoji, reactionList]) => {
          const reaction = AVAILABLE_REACTIONS.find(r => r.emoji === emoji);
          const hasUserReaction = userReactions.some(r => r.emoji === emoji);

          return (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full border text-sm transition-all hover:scale-105",
                hasUserReaction
                  ? "bg-orange-100 border-orange-300 text-orange-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className="text-base">{emoji}</span>
              <span className="font-medium">{reactionList.length}</span>
            </button>
          );
        })}

        {/* Add Reaction Button */}
        {showReactionPicker ? (
          <div className="flex gap-1">
            {AVAILABLE_REACTIONS.slice(0, 4).map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => {
                  handleReactionClick(reaction.emoji);
                  setShowReactionPicker(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                title={reaction.label}
              >
                <span>{reaction.emoji}</span>
              </button>
            ))}
            <Button
              variant="ghost"
              onClick={() => setShowReactionPicker(false)}
              className="rounded-full w-6 h-6 p-0"
            >
              ×
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowReactionPicker(true)}
            className="rounded-full w-8 h-8 p-0 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Comments Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">
            {comments.length} {comments.length === 1 ? 'reactie' : 'reacties'}
          </span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          {/* Existing Comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-800 flex-shrink-0">
                {comment.user_name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-slate-900">
                    {comment.user_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <p className="text-slate-700 text-sm mb-2">{comment.content}</p>

                {/* Comment reactions */}
                {comment.reactions.length > 0 && (
                  <div className="flex gap-1">
                    {comment.reactions.slice(0, 3).map((reaction) => (
                      <span key={reaction.id} className="text-sm" title={reaction.user_name}>
                        {reaction.emoji}
                      </span>
                    ))}
                    {comment.reactions.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{comment.reactions.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Comment */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
              U
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deel je reactie..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Reageren
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing story reactions
export function useStoryReactions(storyId: string) {
  const { session } = useAuth();
  const [reactions, setReactions] = useState<StoryReaction[]>([]);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    if (!session?.token) return;

    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
      const headers = { Authorization: `Bearer ${session.token}` };

      const response = await fetch(`${apiUrl}/sharing/reactions/${storyId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || []);
        setComments(data.comments || []);
      } else {
        setReactions([]);
        setComments([]);
      }
    } catch (err) {
      logger.error("Failed to fetch reactions", err);
      setReactions([]);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, storyId]);

  const addReaction = useCallback(async (emoji: string) => {
    if (!session?.token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
      const response = await fetch(`${apiUrl}/sharing/reactions/${storyId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const newReaction = await response.json();
        setReactions(prev => [...prev, newReaction]);
      } else {
        const newReaction: StoryReaction = {
          id: Date.now().toString(),
          user_id: session.user.id,
          user_name: session.user.displayName || "Jij",
          emoji,
          created_at: new Date().toISOString(),
        };
        setReactions(prev => [...prev, newReaction]);
      }
    } catch (err) {
      logger.error("Failed to add reaction", err);
    }
  }, [session, storyId]);

  const removeReaction = useCallback(async (reactionId: string) => {
    try {
      setReactions(prev => prev.filter(r => r.id !== reactionId));
    } catch (err) {
      logger.error("Failed to remove reaction", err);
    }
  }, []);

  const addComment = useCallback(async (content: string) => {
    if (!session?.token) return;

    try {
      const newComment: StoryComment = {
        id: Date.now().toString(),
        user_id: session.user.id,
        user_name: "Jij",
        content,
        created_at: new Date().toISOString(),
        reactions: [],
      };

      setComments(prev => [...prev, newComment]);
    } catch (err) {
      logger.error("Failed to add comment", err);
    }
  }, [session]);

  return {
    reactions,
    comments,
    isLoading,
    fetchReactions,
    addReaction,
    removeReaction,
    addComment,
  };
}

export default StoryReactions;