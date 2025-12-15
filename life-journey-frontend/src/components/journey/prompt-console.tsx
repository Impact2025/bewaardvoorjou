"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAssistantPrompt } from "@/lib/assistant";
import type { ChapterId } from "@/lib/types";
import { useAuth } from "@/store/auth-context";

interface PromptConsoleProps {
  chapterId: ChapterId;
}

export function PromptConsole({ chapterId }: PromptConsoleProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { session } = useAuth();

  useEffect(() => {
    startTransition(() => {
      void fetchAssistantPrompt(chapterId, [], session?.token).then(setPrompt);
    });
  }, [chapterId, session?.token]);

  return (
    <Card className="bg-gradient-to-br from-orange/15 via-orange/10 to-gold/15 border-orange/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-800">AI-interviewer</CardTitle>
          <CardDescription className="text-slate-600">
            Korte, open vragen afgestemd op hoofdstuk {chapterId}.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          className="border-orange/30 hover:bg-orange/10 hover:text-orange-dark"
          onClick={() =>
            startTransition(() => {
              void fetchAssistantPrompt(chapterId, [], session?.token).then(setPrompt);
            })
          }
          disabled={isPending}
        >
          <RefreshCw className="h-4 w-4" />
          Nieuwe vraag
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-pretty text-base text-slate-800">{prompt}</p>
        <p className="text-xs text-slate-600">
          De AI checkt altijd of je wil verdiepen en vat daarna samen. Je kunt vragen markeren als favoriet tijdens het gesprek.
        </p>
      </CardContent>
    </Card>
  );
}
