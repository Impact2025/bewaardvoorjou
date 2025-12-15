"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatWithAssistant, getHelpSuggestions, type ConversationMessage } from "@/lib/assistant";
import type { ChapterId } from "@/lib/types";
import { useAuth } from "@/store/auth-context";

interface AIAssistantChatProps {
  chapterId: ChapterId;
  journeyId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantChat({ chapterId, journeyId, isOpen, onClose }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();

  // Load suggestions when component mounts or chapter changes
  useEffect(() => {
    if (isOpen) {
      void loadSuggestions();

      // Add welcome message if no messages yet
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content:
              "Hallo! Ik ben je AI-assistent. Ik help je graag met vragen over het vertellen van je levensverhaal, opnametips, of wat dan ook. Stel gerust je vraag!",
          },
        ]);
      }
    }
  }, [isOpen, chapterId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await getHelpSuggestions(chapterId, session?.token);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: "user",
      content: messageText.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send to API
      const response = await chatWithAssistant(
        {
          message: messageText.trim(),
          chapter_id: chapterId,
          journey_id: journeyId,
          conversation_history: messages,
        },
        session?.token,
      );

      // Add assistant response
      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: response.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ConversationMessage = {
        role: "assistant",
        content: "Sorry, ik kon je vraag niet verwerken. Probeer het opnieuw.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    void sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      <Card className="pointer-events-auto relative w-full max-w-2xl h-[600px] flex flex-col bg-white shadow-2xl border-orange/30">
        <CardHeader className="flex flex-row items-center justify-between border-b border-orange/20 bg-gradient-to-br from-orange/10 via-orange/5 to-gold/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange to-gold rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800">AI Assistent</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Stel je vraag en krijg hulp bij je levensverhaal
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-orange/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          {/* Messages */}
          <div ref={scrollAreaRef} className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange to-orange-dark text-white"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200">
                    <Loader2 className="h-4 w-4 animate-spin text-orange" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-600 mb-2 font-medium">Veelgestelde vragen:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer hover:bg-orange/10 hover:border-orange/40 transition-colors text-xs py-1.5 px-3 border border-slate-300 text-slate-700 rounded-full bg-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 pt-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Typ je vraag..."
              disabled={isLoading}
              className="flex-1 border-slate-300 focus:border-orange focus:ring-orange"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-br from-orange to-orange-dark hover:from-orange-dark hover:to-orange text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
