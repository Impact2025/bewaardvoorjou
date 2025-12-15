"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "./RecorderContext";

interface TextEditorProps {
  onGetAISuggestion: () => Promise<void>;
}

export function TextEditor({ onGetAISuggestion }: TextEditorProps) {
  const { state, setTextContent, setAiSuggestion } = useRecorder();
  const { textContent, wordCount, aiSuggestion, isGettingAISuggestion } = state;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const dismissSuggestion = () => {
    setAiSuggestion(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6">
      <div className="flex-1 flex flex-col">
        <label htmlFor="story-text" className="sr-only">
          Schrijf je verhaal
        </label>
        <textarea
          id="story-text"
          value={textContent}
          onChange={handleTextChange}
          placeholder="Begin hier te schrijven... Deel je verhaal, herinneringen en gedachten. Neem de tijd die je nodig hebt."
          className="flex-1 w-full resize-none rounded-xl border-2 border-input-border bg-white px-6 py-4 text-input text-lg leading-relaxed focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          aria-describedby="word-count"
        />
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-xs font-medium text-orange bg-orange/10 px-2 py-1 rounded-full"
              role="status"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange" aria-hidden="true" />
              Aan het schrijven
            </span>
            <span id="word-count" className="text-xs text-slate-500" aria-live="polite">
              {wordCount} {wordCount === 1 ? 'woord' : 'woorden'}
            </span>
          </div>
          {textContent.length > 20 && (
            <Button
              onClick={onGetAISuggestion}
              disabled={isGettingAISuggestion}
              variant="ghost"
              size="sm"
              className="text-xs text-orange hover:text-orange-dark"
              aria-busy={isGettingAISuggestion}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {isGettingAISuggestion ? "AI denkt mee..." : "Vraag AI om suggestie"}
            </Button>
          )}
        </div>
      </div>

      {aiSuggestion && (
        <div
          className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-left"
          role="complementary"
          aria-label="AI suggestie"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-900 mb-1">AI-suggestie</p>
                <button
                  onClick={dismissSuggestion}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  aria-label="Sluit suggestie"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-700 italic">{aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextEditor;
