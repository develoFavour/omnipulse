"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CannedReply } from "@/lib/services/canned-reply.service";

interface CannedReplyPickerProps {
  query: string;
  replies: CannedReply[];
  onSelect: (reply: CannedReply) => void;
  onDismiss: () => void;
}

export function CannedReplyPicker({
  query,
  replies,
  onSelect,
  onDismiss,
}: CannedReplyPickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const listRef = useRef<HTMLUListElement>(null);

  if (prevQuery !== query) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  const filtered = replies.filter((r) => {
    const q = query.toLowerCase();
    return (
      q === "" ||
      r.shortcut.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          onSelect(filtered[activeIndex]);
        }
      } else if (e.key === "Escape") {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered, activeIndex, onSelect, onDismiss]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-[#163300]" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Quick Replies
            </span>
          </div>
          <span className="text-[10px] text-gray-400">
            ↑↓ navigate • Enter to select • Esc to cancel
          </span>
        </div>
        <ul ref={listRef} className="max-h-52 overflow-y-auto py-1 divide-y divide-gray-50">
          {filtered.map((reply, i) => (
            <li
              key={reply.id}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => onSelect(reply)}
              className={cn(
                "flex items-start gap-3 px-3 py-2 cursor-pointer transition-colors",
                i === activeIndex ? "bg-[#163300]/8" : "hover:bg-gray-50"
              )}
            >
              <span className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#163300]/10 text-[#163300] shrink-0">
                /{reply.shortcut}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reply.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {reply.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
