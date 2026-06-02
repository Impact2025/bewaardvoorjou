"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Heart,
  Plus,
  Users,
  Calendar,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  listPods,
  createPod,
  deletePod,
  listMessages,
  postMessage,
  reactToMessage,
  type SharedPod,
  type PodMessage,
} from "@/lib/pods-client";

interface SharedPodsProps {
  journeyId: string;
  className?: string;
}

export function SharedPods({ journeyId, className }: SharedPodsProps) {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const [pods, setPods] = useState<SharedPod[]>([]);
  const [selectedPod, setSelectedPod] = useState<SharedPod | null>(null);
  const [messages, setMessages] = useState<PodMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showCreatePod, setShowCreatePod] = useState(false);
  const [newPodTitle, setNewPodTitle] = useState("");
  const [newPodDescription, setNewPodDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load pods on mount
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    listPods(journeyId, token)
      .then(setPods)
      .catch(() => setPods([]))
      .finally(() => setIsLoading(false));
  }, [token, journeyId]);

  // Load messages when pod is selected
  useEffect(() => {
    if (!selectedPod || !token) return;
    listMessages(journeyId, selectedPod.id, token)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [selectedPod, journeyId, token]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreatePod = useCallback(async () => {
    if (!newPodTitle.trim() || !token) return;
    setIsCreating(true);
    try {
      const pod = await createPod(
        journeyId,
        { title: newPodTitle.trim(), description: newPodDescription.trim() || undefined },
        token,
      );
      setPods(prev => [pod, ...prev]);
      setNewPodTitle("");
      setNewPodDescription("");
      setShowCreatePod(false);
      setSelectedPod(pod);
    } finally {
      setIsCreating(false);
    }
  }, [newPodTitle, newPodDescription, journeyId, token]);

  const handleDeletePod = useCallback(async (pod: SharedPod) => {
    if (!token) return;
    await deletePod(journeyId, pod.id, token);
    setPods(prev => prev.filter(p => p.id !== pod.id));
    if (selectedPod?.id === pod.id) setSelectedPod(null);
  }, [journeyId, token, selectedPod]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedPod || !token) return;
    setIsSending(true);
    try {
      const msg = await postMessage(journeyId, selectedPod.id, newMessage.trim(), token);
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
      // Update last_activity in pods list
      setPods(prev => prev.map(p =>
        p.id === selectedPod.id ? { ...p, last_activity: msg.created_at } : p
      ));
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedPod, journeyId, token]);

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!selectedPod || !token) return;
    const updated = await reactToMessage(journeyId, selectedPod.id, messageId, emoji, token);
    setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
  }, [selectedPod, journeyId, token]);

  if (isLoading) return <SharedPodsSkeleton />;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "#2C2416" }}>Gedeelde Ruimtes</h3>
          <p className="text-sm" style={{ color: "#6B6456" }}>Samenwerken aan jullie familiegeschiedenis</p>
        </div>
        <Button
          onClick={() => setShowCreatePod(true)}
          className="bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Ruimte
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pods List */}
        <div className="space-y-3">
          {pods.map(pod => (
            <div
              key={pod.id}
              onClick={() => setSelectedPod(pod)}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md",
                selectedPod?.id === pod.id
                  ? "border-[#FF8C42] bg-[#FFF8F3]"
                  : "border-[#E9E4DB] bg-white hover:border-[#FF8C42]/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" style={{ color: "#2C2416" }}>{pod.title}</h4>
                  {pod.description && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "#6B6456" }}>
                      {pod.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#999" }}>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {pod.members.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pod.last_activity).toLocaleDateString("nl-NL")}
                    </span>
                  </div>
                </div>
                {pod.created_by === session?.user.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); void handleDeletePod(pod); }}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Verwijder ruimte"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {pods.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#E9E4DB] p-8 text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3" style={{ color: "#D4D0C8" }} />
              <p className="font-medium text-sm mb-1" style={{ color: "#2C2416" }}>Nog geen ruimtes</p>
              <p className="text-xs mb-4" style={{ color: "#6B6456" }}>
                Maak een gedeelde ruimte aan om samen verhalen te bespreken.
              </p>
              <Button
                onClick={() => setShowCreatePod(true)}
                className="bg-[#FF8C42] hover:bg-[#F47B3B] text-white text-sm px-3 py-1.5"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Maak ruimte
              </Button>
            </div>
          )}
        </div>

        {/* Messages panel */}
        <div className="lg:col-span-2">
          {selectedPod ? (
            <div
              className="rounded-xl border flex flex-col"
              style={{ height: "520px", background: "#FFFFFF", borderColor: "#E9E4DB" }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: "#E9E4DB" }}>
                <p className="font-semibold" style={{ color: "#2C2416" }}>{selectedPod.title}</p>
                {selectedPod.description && (
                  <p className="text-sm" style={{ color: "#6B6456" }}>{selectedPod.description}</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <MessageSquare className="h-10 w-10 mx-auto mb-2" style={{ color: "#D4D0C8" }} />
                      <p className="text-sm" style={{ color: "#6B6456" }}>
                        Nog geen berichten. Begin het gesprek!
                      </p>
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ background: "#FFF0E6", color: "#FF8C42" }}
                    >
                      {msg.author_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm" style={{ color: "#2C2416" }}>
                          {msg.author_name}
                        </span>
                        <span className="text-xs" style={{ color: "#999" }}>
                          {new Date(msg.created_at).toLocaleString("nl-NL")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "#4A4239" }}>
                        {msg.content}
                      </p>
                      {/* Reactions */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {Object.entries(msg.reactions).map(([emoji, userIds]) =>
                          userIds.length > 0 ? (
                            <button
                              key={emoji}
                              onClick={() => void handleReaction(msg.id, emoji)}
                              className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                                userIds.includes(session?.user.id ?? "")
                                  ? "bg-[#FFF0E6] border-[#FF8C42] text-[#FF8C42]"
                                  : "bg-[#F5F5F4] border-[#E9E4DB] text-[#6B6456] hover:border-[#FF8C42]/50"
                              )}
                            >
                              {emoji} {userIds.length}
                            </button>
                          ) : null
                        )}
                        <button
                          onClick={() => void handleReaction(msg.id, "❤️")}
                          className="text-[#D4D0C8] hover:text-[#FF8C42] transition-colors"
                          aria-label="Hartje geven"
                        >
                          <Heart className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t" style={{ borderColor: "#E9E4DB" }}>
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Deel een herinnering of gedachte…"
                    className="flex-1 resize-none text-sm"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={!newMessage.trim() || isSending}
                    className="self-end bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border flex items-center justify-center"
              style={{ height: "520px", borderColor: "#E9E4DB", background: "#FAFAF9" }}
            >
              <div className="text-center px-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3" style={{ color: "#D4D0C8" }} />
                <p className="font-medium mb-1" style={{ color: "#2C2416" }}>Selecteer een ruimte</p>
                <p className="text-sm" style={{ color: "#6B6456" }}>
                  Kies een ruimte links om berichten te bekijken en te reageren.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Pod Modal */}
      {showCreatePod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif font-semibold text-lg" style={{ color: "#2C2416" }}>
                Nieuwe Gedeelde Ruimte
              </h3>
              <button
                onClick={() => setShowCreatePod(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                  Naam <span className="text-red-400">*</span>
                </label>
                <Input
                  value={newPodTitle}
                  onChange={(e) => setNewPodTitle(e.target.value)}
                  placeholder="Bijv. Familieverhalen"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                  Beschrijving <span className="text-slate-400 font-normal">(optioneel)</span>
                </label>
                <Textarea
                  value={newPodDescription}
                  onChange={(e) => setNewPodDescription(e.target.value)}
                  placeholder="Wat willen jullie in deze ruimte bespreken?"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowCreatePod(false)}
                  disabled={isCreating}
                >
                  Annuleren
                </Button>
                <Button
                  className="flex-1 bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
                  onClick={() => void handleCreatePod()}
                  disabled={!newPodTitle.trim() || isCreating}
                >
                  {isCreating ? "Aanmaken…" : "Aanmaken"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SharedPodsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-[#E9E4DB] p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="w-full rounded-xl bg-gray-100 animate-pulse" style={{ height: "520px" }} />
        </div>
      </div>
    </div>
  );
}

export default SharedPods;
