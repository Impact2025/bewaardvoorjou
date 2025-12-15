"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";
import {
  MessageSquare,
  Heart,
  Plus,
  Users,
  Calendar,
  Edit3,
  Send,
  MoreVertical,
  Trash2,
} from "lucide-react";

interface SharedPod {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  members: string[];
  is_active: boolean;
  last_activity: string;
}

interface PodMessage {
  id: string;
  pod_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  reactions: { [emoji: string]: string[] }; // emoji -> user_ids
}

interface SharedPodsProps {
  journeyId: string;
  className?: string;
}

export function SharedPods({ journeyId, className }: SharedPodsProps) {
  const { session } = useAuth();
  const [pods, setPods] = useState<SharedPod[]>([]);
  const [selectedPod, setSelectedPod] = useState<SharedPod | null>(null);
  const [messages, setMessages] = useState<PodMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePod, setShowCreatePod] = useState(false);
  const [newPodTitle, setNewPodTitle] = useState("");
  const [newPodDescription, setNewPodDescription] = useState("");

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPods([
        {
          id: "1",
          title: "Familieverhalen",
          description: "Deel herinneringen over onze familiegeschiedenis",
          created_by: "owner",
          created_at: "2025-01-15T10:00:00Z",
          members: ["owner", "spouse", "child1"],
          is_active: true,
          last_activity: "2025-01-20T14:30:00Z",
        },
        {
          id: "2",
          title: "Vakantie Herinneringen",
          description: "Onze mooiste vakanties en reizen samen",
          created_by: "spouse",
          created_at: "2025-01-18T09:15:00Z",
          members: ["owner", "spouse"],
          is_active: true,
          last_activity: "2025-01-19T16:45:00Z",
        },
      ]);

      setMessages([
        {
          id: "1",
          pod_id: "1",
          author_id: "owner",
          author_name: "Jan",
          content: "Herinneren jullie je nog die keer dat we allemaal gingen kamperen in de Ardennen?",
          created_at: "2025-01-20T10:00:00Z",
          reactions: { "❤️": ["spouse", "child1"], "👍": ["child1"] },
        },
        {
          id: "2",
          pod_id: "1",
          author_id: "spouse",
          author_name: "Marie",
          content: "Ja! Dat was zo leuk. Weet je nog dat het de hele nacht regende?",
          created_at: "2025-01-20T10:15:00Z",
          reactions: { "😄": ["owner", "child1"] },
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreatePod = () => {
    if (!newPodTitle.trim()) return;

    const newPod: SharedPod = {
      id: Date.now().toString(),
      title: newPodTitle,
      description: newPodDescription,
      created_by: "owner",
      created_at: new Date().toISOString(),
      members: ["owner"],
      is_active: true,
      last_activity: new Date().toISOString(),
    };

    setPods(prev => [newPod, ...prev]);
    setNewPodTitle("");
    setNewPodDescription("");
    setShowCreatePod(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPod) return;

    const message: PodMessage = {
      id: Date.now().toString(),
      pod_id: selectedPod.id,
      author_id: "owner",
      author_name: "Jan",
      content: newMessage,
      created_at: new Date().toISOString(),
      reactions: {},
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: msg.reactions[emoji]?.includes("owner")
                  ? msg.reactions[emoji].filter(id => id !== "owner")
                  : [...(msg.reactions[emoji] || []), "owner"]
              }
            }
          : msg
      )
    );
  };

  if (isLoading) {
    return <SharedPodsSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Gedeelde Ruimtes</h3>
          <p className="text-sm text-slate-600">
            Samenwerken aan jullie familiegeschiedenis
          </p>
        </div>
        <Button onClick={() => setShowCreatePod(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Ruimte
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pods List */}
        <div className="space-y-4">
          {pods.map(pod => (
            <Card
              key={pod.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedPod?.id === pod.id && "ring-2 ring-orange-300"
              )}
              onClick={() => setSelectedPod(pod)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{pod.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {pod.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {pod.members.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(pod.last_activity).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>
                  {pod.is_active && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {pods.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h4 className="font-medium text-slate-900 mb-2">Nog geen ruimtes</h4>
                <p className="text-slate-600 mb-4">
                  Creëer je eerste gedeelde ruimte om samen verhalen te delen.
                </p>
                <Button onClick={() => setShowCreatePod(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Creëer Ruimte
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          {selectedPod ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedPod.title}
                </CardTitle>
                <p className="text-sm text-slate-600">{selectedPod.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(msg => msg.pod_id === selectedPod.id)
                    .map(message => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-800">
                          {message.author_name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-slate-900">
                              {message.author_name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(message.created_at).toLocaleString('nl-NL')}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-2">{message.content}</p>

                          {/* Reactions */}
                          <div className="flex items-center gap-2">
                            {Object.entries(message.reactions).map(([emoji, userIds]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors",
                                  userIds.includes("owner")
                                    ? "bg-orange-100 border-orange-300 text-orange-800"
                                    : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => handleReaction(message.id, "❤️")}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Deel een herinnering of gedachte..."
                      className="flex-1 resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h4 className="font-medium text-slate-900 mb-2">Selecteer een ruimte</h4>
                <p className="text-slate-600">
                  Kies een gedeelde ruimte om berichten te bekijken en deel te nemen aan het gesprek.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Pod Modal */}
      {showCreatePod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Nieuwe Gedeelde Ruimte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Titel
                </label>
                <Input
                  value={newPodTitle}
                  onChange={(e) => setNewPodTitle(e.target.value)}
                  placeholder="Bijv. Familieverhalen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beschrijving
                </label>
                <Textarea
                  value={newPodDescription}
                  onChange={(e) => setNewPodDescription(e.target.value)}
                  placeholder="Wat willen jullie in deze ruimte delen?"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowCreatePod(false)}
                >
                  Annuleren
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreatePod}
                  disabled={!newPodTitle.trim()}
                >
                  Creëren
                </Button>
              </div>
            </CardContent>
          </Card>
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
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SharedPods;