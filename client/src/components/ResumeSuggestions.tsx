import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface Props {
  suggestions: string[];
}

export default function ResumeSuggestions({ suggestions }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-green-600" />
        <h3 className="text-sm font-semibold text-gray-700">AI Resume Suggestions</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg group"
          >
            <p className="text-sm text-gray-700 flex-1 leading-relaxed">{suggestion}</p>
            <button
              onClick={() => handleCopy(suggestion, i)}
              title="Copy to clipboard"
              className="flex-shrink-0 p-1 text-green-500 hover:text-green-700 transition-colors opacity-60 group-hover:opacity-100"
            >
              {copiedIndex === i ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
