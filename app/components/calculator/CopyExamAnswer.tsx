import { useMemo, useState } from "react";

import { Button } from "~/components/ui/Button";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import { formatExamAnswer } from "~/lib/format/examAnswer";

interface CopyExamAnswerProps {
  answer: ExamAnswer;
  className?: string;
}

export function CopyExamAnswer({ answer, className = "" }: CopyExamAnswerProps) {
  const [format, setFormat] = useState<"plain" | "markdown">("plain");
  const text = useMemo(() => formatExamAnswer(answer, format), [answer, format]);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 1500);
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold">Copy Answer:</span>
        <button
          type="button"
          className={`text-xs underline ${
            format === "plain" ? "font-bold" : ""
          }`}
          onClick={() => setFormat("plain")}
        >
          Plain text
        </button>
        <span className="text-xs text-gray-500">|</span>
        <button
          type="button"
          className={`text-xs underline ${
            format === "markdown" ? "font-bold" : ""
          }`}
          onClick={() => setFormat("markdown")}
        >
          Markdown
        </button>
        <div className="ml-auto" />
        <Button type="button" variant="outline" onClick={copy}>
          {status === "copied"
            ? "Copied"
            : status === "failed"
              ? "Copy failed"
              : "Copy"}
        </Button>
      </div>

      <textarea
        className="w-full h-56 text-xs font-mono border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900"
        readOnly
        value={text}
      />
    </div>
  );
}
