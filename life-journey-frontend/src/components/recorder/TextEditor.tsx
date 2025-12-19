"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "./RecorderContext";

interface TextEditorProps {
  onGetAISuggestion: () => Promise<void>;
}

export function TextEditor({ onGetAISuggestion }: TextEditorProps) {
  const { state, setTextContent, setAiSuggestion } = useRecorder();
  const { textContent, wordCount, aiSuggestion, isGettingAISuggestion, currentQuestion } = state;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const dismissSuggestion = () => {
    setAiSuggestion(null);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Current AI Question - integrated into editor */}
      {currentQuestion && (
        <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-r-lg">
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {currentQuestion}
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <label htmlFor="story-text" className="sr-only">
          Schrijf je verhaal
        </label>
        <textarea
          id="story-text"
          value={textContent}
          onChange={handleTextChange}
          placeholder="Begin hier te schrijven... Neem de tijd, elk woord telt."
          className="flex-1 min-h-[280px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 text-base leading-relaxed shadow-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 hover:border-slate-300"
          aria-describedby="word-count"
        />

        {/* Footer with word count and AI suggestion button */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span id="word-count" className="text-xs text-slate-500" aria-live="polite">
            {wordCount} {wordCount === 1 ? 'woord' : 'woorden'}
          </span>
          {textContent.length > 20 && (
            <Button
              onClick={onGetAISuggestion}
              disabled={isGettingAISuggestion}
              variant="ghost"
              size="sm"
              className="text-xs text-orange hover:text-orange-dark h-7"
              aria-busy={isGettingAISuggestion}
            >
              <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
              {isGettingAISuggestion ? "AI denkt..." : "AI suggestie"}
            </Button>
          )}
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div
          className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-left"
          role="complementary"
          aria-label="AI suggestie"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-700">Suggestie</p>
                <button
                  onClick={dismissSuggestion}
                  className="text-xs text-slate-400 hover:text-slate-600"
                  aria-label="Sluit suggestie"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-600 italic">{aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextEditor;
