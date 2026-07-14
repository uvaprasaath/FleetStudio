import { useState } from "react";
import type { DiffFile } from "../../services/api";
import chevrondown from "../../assets/chevron-down.svg";
import { monoSpace } from "../../lib/constants";

export interface FileDiffBoxProps {
  file: DiffFile;
}

export function FileDiffBox({ file }: FileDiffBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filePath = file.headFile?.path || file.baseFile?.path || '';

  return (
    <>
      {/* File Header / Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <span className="text-link shrink-0">
              <img height="10" width="6.8" src={chevrondown} alt="Chevron Down" />
          </span>
          <span className="font-courier font-bold text-[13px] text-link truncate" title={filePath}>
            {filePath}
          </span>
        </div>

      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-[#E7EBF1] border">
          {file.hunks.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No content differences found in this file.
            </div>
          ) : (
            file.hunks.map((hunk, hunkIdx) => (
              <div  key={hunkIdx}>
                {/* Hunk Header */}
                <div className={`bg-white text-code-primary py-2 px-4 ${monoSpace} tracking-wide select-none`}>
                  {hunk.header}
                </div>
                {/* Lines mapping */}
                <div className="flex flex-col ">
                  {hunk.lines.map((line, lineIdx) => (
                    <DiffLine
                      key={lineIdx}
                      baseLineNumber={line.baseLineNumber}
                      headLineNumber={line.headLineNumber}
                      content={line.content}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

// Helper to format date into "X days ago" or similar friendly format
export function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  } catch {
    return 'some time ago';
  }
}

// Single Common Diff Line Component
interface DiffLineProps {
  baseLineNumber: number | null;
  headLineNumber: number | null;
  content: string;
}

function DiffLine({ baseLineNumber, headLineNumber, content }: DiffLineProps) {
  const isAddition = headLineNumber !== null && baseLineNumber === null;
  const isDeletion = baseLineNumber !== null && headLineNumber === null;

  let bgClass = 'bg-white hover:bg-zinc-50/50';
  let numClass = 'text-code-secondary';
  let modifier = ' ';
  let newLineColor = 'bg-white'

  if (isAddition) {
    bgClass = 'bg-diff-add-bg hover:bg-diff-add-bg';
    newLineColor = 'bg-diff-add-bg'
    modifier = '+';
  } else if (isDeletion) {
    bgClass = 'bg-diff-del-bg hover:bg-diff-del-bg';
    newLineColor = 'bg-diff-del-bg'
    modifier = '-';
  }else if(isAddition === isDeletion){
    bgClass = 'bg-white';
    newLineColor = 'bg-hunk-bg'
  }

  return (
    <div className={`flex w-full items-stretch ${bgClass} `}>
      {/* Original Line Number */}
      <div className={`w-8 text-right pr-1 shrink-0 py-0.5 ${numClass} ${monoSpace}`}>
        {baseLineNumber !== null ? baseLineNumber : ''}
      </div>
      {/* New Line Number */}
      <div className={`w-8 text-right pr-1 shrink-0 py-0.5 ${numClass} ${newLineColor} ${monoSpace}`}>
        {headLineNumber !== null ? headLineNumber : ''}
      </div>
      {/* Modifier prefix (+/-) */}
      <div className={`w-6 text-center shrink-0 select-none text-code-primary py-0.5 ${monoSpace}`}>
        {modifier}
      </div>
      {/* Code Content Line */}
      <div className={`pl-4 pr-4 whitespace-pre-wrap break-all ${monoSpace} py-0.5 text-code-primary`}>
        {content}
      </div>
    </div>
  );
}