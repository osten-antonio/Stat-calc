export type ExamAnswerFormat = "plain" | "markdown";

export interface ExamAnswerSection {
  title: string;
  lines: string[];
}

export interface ExamAnswer {
  title?: string;
  sections: ExamAnswerSection[];
  finalAnswer: string;
}

function joinNonEmpty(lines: string[]): string {
  return lines.filter((l) => l.trim().length > 0).join("\n");
}

export function formatExamAnswer(answer: ExamAnswer, format: ExamAnswerFormat): string {
  const title = answer.title?.trim();

  if (format === "markdown") {
    const parts: string[] = [];
    if (title) parts.push(`# ${title}`);

    for (const section of answer.sections) {
      parts.push(`## ${section.title}`);
      parts.push(joinNonEmpty(section.lines));
    }

    parts.push("## Final Answer");
    parts.push("```text");
    parts.push(answer.finalAnswer.trim());
    parts.push("```");

    return parts.join("\n\n").trim() + "\n";
  }

  const plainParts: string[] = [];
  if (title) plainParts.push(title.toUpperCase());

  answer.sections.forEach((section, idx) => {
    plainParts.push(`Step ${idx + 1}: ${section.title}`);
    plainParts.push(joinNonEmpty(section.lines));
  });

  plainParts.push("FINAL ANSWER:");
  plainParts.push(answer.finalAnswer.trim());

  return plainParts.join("\n\n").trim() + "\n";
}
