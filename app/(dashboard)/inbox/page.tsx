"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  Filter,
  ChevronDown,
  CheckCheck,
  Check,
  Clock,
  Circle,
  User,
  Phone,
  Hash,
  ArrowLeft,
  Inbox,
  Loader2,
  XCircle,
  ImagePlus,
  MoreVertical,
  UserPlus,
  Archive,
  RotateCcw,
  Play,
  Pause,
  Bot,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useInboxConversations,
  useInboxMessages,
  useInboxActions,
  useInboxWebSocket,
  type Conversation,
  type InboxMessage,
  type ConversationStatus,
} from "@/lib/api/hooks/useInbox";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { AIAssistanceToggle } from "@/components/features/ai/AIAssistanceToggle";
import { useAIAssistantConfig } from "@/lib/api/hooks/useAIAssistant";

// ─── Channel Icon Helpers ────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: string }) {
  const config: Record<string, { bg: string; icon: string; label: string }> = {
    whatsapp: { bg: "bg-emerald-500", icon: "💬", label: "WhatsApp" },
    telegram: { bg: "bg-sky-500", icon: "✈️", label: "Telegram" },
    instagram: { bg: "bg-pink-500", icon: "📸", label: "Instagram" },
    x: { bg: "bg-gray-800", icon: "𝕏", label: "X" },
  };
  const c = config[channel] ?? { bg: "bg-gray-400", icon: "💬", label: channel };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white leading-none",
        c.bg
      )}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}

function StatusDot({ status }: { status: ConversationStatus }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-500",
    waiting: "bg-amber-500",
    closed: "bg-gray-400",
  };
  return <span className={cn("h-2 w-2 rounded-full shrink-0", colors[status] ?? "bg-gray-400")} />;
}

// ─── Time Formatting ─────────────────────────────────────────────────────────

function RelativeTime({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (diffMs < 60_000) return <span>now</span>;
  if (diffMs < 86_400_000) {
    return <span>{formatDistanceToNow(d, { addSuffix: false })}</span>;
  }
  return <span>{format(d, "MMM d")}</span>;
}

function MessageTime({ date }: { date: string }) {
  return <span>{format(new Date(date), "h:mm a")}</span>;
}

// ─── Message Status Ticks ────────────────────────────────────────────────────

function MessageStatus({ status }: { status: string }) {
  switch (status) {
    case "read":
      return (
        <span title="Read" className="inline-flex">
          <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
        </span>
      );
    case "delivered":
      return (
        <span title="Delivered" className="inline-flex">
          <CheckCheck className="h-3.5 w-3.5 text-white/80" />
        </span>
      );
    case "sent":
      return (
        <span title="Sent" className="inline-flex">
          <Check className="h-3.5 w-3.5 text-white/50" />
        </span>
      );
    case "failed":
      return (
        <span title="Failed" className="inline-flex">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        </span>
      );
    default:
      return (
        <span title="Sending..." className="inline-flex">
          <Clock className="h-3.5 w-3.5 text-white/40" />
        </span>
      );
  }
}

// ─── Contact Avatar ──────────────────────────────────────────────────────────

function ContactAvatar({
  name,
  channel,
  size = "md",
}: {
  name: string;
  channel: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const gradients: Record<string, string> = {
    whatsapp: "from-emerald-500 to-emerald-600",
    telegram: "from-sky-500 to-sky-600",
    instagram: "from-pink-500 to-purple-600",
    x: "from-gray-700 to-gray-900",
  };

  return (
    <div
      className={cn(
        "relative rounded-full bg-gradient-to-br font-bold text-white flex items-center justify-center shrink-0",
        sizeClasses[size],
        gradients[channel] ?? "from-gray-400 to-gray-500"
      )}
    >
      {initials}
    </div>
  );
}

// ─── Empty States ────────────────────────────────────────────────────────────

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#e2f6d5] flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-[#163300]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No conversations yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        When your contacts message you on WhatsApp or Telegram, their conversations will appear here.
      </p>
    </div>
  );
}

function EmptyThread() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
      <div className="h-20 w-20 rounded-3xl bg-gradient-to-b from-[#e2f6d5]/60 to-[#f4f5f2] flex items-center justify-center mb-5 shadow-sm">
        <MessageSquare className="h-10 w-10 text-[#163300]/50" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Select a conversation</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Pick a conversation from the left panel to view messages and reply to your contacts.
      </p>
    </div>
  );
}

// ─── Conversation List Item ──────────────────────────────────────────────────

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const contactName = conversation.contact
    ? `${conversation.contact.first_name} ${conversation.contact.last_name}`.trim()
    : "Unknown Contact";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-200 border-b border-gray-100/80 group relative",
        isActive
          ? "bg-[#e2f6d5]/60"
          : "hover:bg-gray-50/80"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-conversation"
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#163300] rounded-r-full"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className="relative">
        <ContactAvatar name={contactName} channel={conversation.channel} size="md" />
        {conversation.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-[#163300] text-white text-[9px] font-bold flex items-center justify-center px-1">
            {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm truncate",
              conversation.unread_count > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"
            )}
          >
            {contactName}
          </span>
          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
            <RelativeTime date={conversation.last_message_at} />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate flex-1",
              conversation.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-500",
              conversation.last_message_text?.includes("deleted") && "italic text-gray-400"
            )}
          >
            {conversation.last_message_text === "[Voice message]" ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <Mic className="h-3 w-3 inline" /> Voice message
              </span>
            ) : (
              conversation.last_message_text || "No messages yet"
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {conversation.needs_human_attention && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Needs attention</span>
            )}
            <ChannelBadge channel={conversation.channel} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Voice Note Audio Player ──────────────────────────────────────────────────

function VoiceNotePlayer({
  url,
  isOutbound,
}: {
  url?: string;
  isOutbound: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatSecs = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 p-2 rounded-xl min-w-[220px] max-w-[280px] my-1",
        isOutbound ? "bg-white/10 text-white" : "bg-gray-100/90 text-gray-900 border border-gray-200"
      )}
    >
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        disabled={!url}
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm",
          isOutbound
            ? "bg-white text-[#163300] hover:bg-gray-100"
            : "bg-[#163300] text-white hover:bg-[#1e4a00]",
          !url && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
        )}
      </button>

      {/* Audio Track & Progress */}
      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={!url}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/15 accent-[#163300]"
        />
        <div className="flex items-center justify-between text-[10px] font-mono leading-none opacity-80">
          <span>{formatSecs(currentTime > 0 ? currentTime : duration)}</span>
          <div className="flex items-center gap-1.5">
            <Mic className="h-2.5 w-2.5 opacity-60" />
            <button
              onClick={cycleSpeed}
              className={cn(
                "px-1 py-0.2 rounded text-[9px] font-bold font-sans transition-colors",
                isOutbound ? "bg-white/20 hover:bg-white/30" : "bg-gray-200 hover:bg-gray-300"
              )}
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onEdit,
  onDelete,
}: {
  message: InboxMessage;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOutbound = message.direction === "outbound";
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(message.body);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Keep edit body in sync if the message is externally updated
  useEffect(() => {
    if (!editing) {
      const timer = window.setTimeout(() => setEditBody(message.body), 0);
      return () => window.clearTimeout(timer);
    }
  }, [message.body, editing]);

  const handleEditSubmit = () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === message.body) {
      setEditing(false);
      return;
    }
    onEdit(message.id, trimmed);
    setEditing(false);
  };

  // Soft-deleted messages show as a placeholder
  if (message.is_deleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex w-full", isOutbound ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[75%] rounded-2xl px-4 py-2 italic text-[13px]",
            isOutbound
              ? "bg-gray-200/60 text-gray-400"
              : "bg-gray-100 text-gray-400 border border-gray-200"
          )}
        >
          🚫 This message was deleted
        </div>
      </motion.div>
    );
  }

  const isAudio =
    message.media_type === "audio" ||
    (message.media_url && message.media_url.startsWith("data:audio")) ||
    message.body === "[Voice message]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full group/bubble", isOutbound ? "justify-end" : "justify-start")}
    >
      {/* Context menu — only visible on hover, only for outbound */}
      {isOutbound && !editing && (
        <div className="flex items-end gap-1 mr-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditBody(message.body);
              setEditing(true);
              setTimeout(() => editRef.current?.focus(), 50);
            }}
            title="Edit message"
            className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-[#163300] shadow border border-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button
            onClick={() => onDelete(message.id)}
            title="Delete message"
            className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 shadow border border-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
          </button>
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative",
          isOutbound
            ? "bg-[#163300] text-white rounded-br-md"
            : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
        )}
      >
        {message.sender_type === "bot" && (
          <div className={cn("mb-1 flex items-center gap-1 text-[10px] font-bold", isOutbound ? "text-[#bce99b]" : "text-[#163300]")}>
            <Bot className="h-3 w-3" /> AI Assistant
          </div>
        )}
        {/* Voicenote / Audio Message */}
        {isAudio ? (
          <VoiceNotePlayer url={message.media_url} isOutbound={isOutbound} />
        ) : message.media_url ? (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img
              src={message.media_url}
              alt="Media"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        ) : null}

        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={editRef}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full bg-white/10 text-white text-[13.5px] rounded-lg px-2 py-1 resize-none outline-none border border-white/30 focus:border-white/60"
              rows={2}
            />
            <div className="flex gap-1.5 justify-end">
              <button onClick={() => setEditing(false)} className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/70">Cancel</button>
              <button onClick={handleEditSubmit} className="text-[11px] px-2 py-0.5 rounded bg-white text-[#163300] font-semibold hover:bg-gray-100">Save</button>
            </div>
          </div>
        ) : (!isAudio || message.body !== "[Voice message]") && message.body ? (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
            {message.body}
          </p>
        ) : null}

        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOutbound ? "justify-end" : "justify-start"
          )}
        >
          {message.edited_at && (
            <span className={cn("text-[9px] italic", isOutbound ? "text-white/40" : "text-gray-400")}>
              edited
            </span>
          )}
          <span
            className={cn(
              "text-[10px]",
              isOutbound ? "text-white/60" : "text-gray-400"
            )}
          >
            <MessageTime date={message.created_at} />
          </span>
          {isOutbound && <MessageStatus status={message.status} />}
        </div>

        {message.error_message && (
          <p className="text-[10px] text-red-400 mt-1">{message.error_message}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Compose Bar ─────────────────────────────────────────────────────────────

function ComposeBar({
  onSend,
  isSending,
  disabled,
}: {
  onSend: (body: string) => void;
  isSending: boolean;
  disabled: boolean;
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isSending || disabled) return;
    onSend(trimmed);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, isSending, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Auto-resize textarea
  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a conversation to reply..." : "Type a message..."}
            disabled={disabled || isSending}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 focus:border-[#163300]/40 transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSending || disabled}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
            message.trim() && !isSending && !disabled
              ? "bg-[#163300] text-white hover:bg-[#1e4a00] shadow-sm hover:shadow-md active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Conversation Detail Panel ───────────────────────────────────────────────

function ConversationDetail({
  conversation,
  onStatusChange,
  onToggleAI,
  isUpdating,
	workspaceAIEnabled,
}: {
  conversation: Conversation;
  onStatusChange: (status: ConversationStatus) => void;
  onToggleAI: () => void;
  isUpdating: boolean;
	workspaceAIEnabled: boolean;
}) {
  const contactName = conversation.contact
    ? `${conversation.contact.first_name} ${conversation.contact.last_name}`.trim()
    : "Unknown Contact";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Contact Header */}
      <div className="px-5 py-6 border-b border-gray-100 text-center">
        <ContactAvatar name={contactName} channel={conversation.channel} size="lg" />
        <h3 className="mt-3 text-base font-bold text-gray-900">{contactName}</h3>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <ChannelBadge channel={conversation.channel} />
          <StatusDot status={conversation.status} />
          <span className="text-xs text-gray-500 capitalize">{conversation.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold",
            !workspaceAIEnabled ? "bg-gray-100 text-gray-600" : conversation.ai_state === "paused_by_human" ? "bg-gray-100 text-gray-600" :
              conversation.ai_state === "escalated" ? "bg-amber-100 text-amber-700" :
                "bg-[#e2f6d5] text-[#163300]"
          )}>
            <Bot className="h-3 w-3" />
            {!workspaceAIEnabled ? "AI off for workspace" : conversation.ai_state === "paused_by_human" ? "AI paused" : conversation.ai_state === "escalated" ? "Needs attention" : "AI active"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-5 py-4 space-y-3">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact Info</h4>

        {conversation.contact?.routing_value && (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-700 font-medium">{conversation.contact.routing_value}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center">
            <Hash className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span className="text-xs text-gray-500 font-mono">{conversation.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span className="text-xs text-gray-500">
            Created {format(new Date(conversation.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-2">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Actions</h4>

        <button
          type="button"
          onClick={onToggleAI}
          disabled={isUpdating || conversation.status === "closed" || !workspaceAIEnabled}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            conversation.ai_state === "paused_by_human" || conversation.ai_state === "escalated"
              ? "bg-[#e2f6d5] text-[#163300] hover:bg-[#d4f0c4]"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          {conversation.ai_state === "paused_by_human" || conversation.ai_state === "escalated" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {conversation.ai_state === "paused_by_human" || conversation.ai_state === "escalated" ? "Resume AI" : "Pause AI"}
        </button>

        {conversation.status !== "closed" && (
          <button
            onClick={() => onStatusChange("closed")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Archive className="h-3.5 w-3.5 text-gray-400" />
            Close Conversation
          </button>
        )}
        {conversation.status === "closed" && (
          <button
            onClick={() => onStatusChange("open")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
            Reopen Conversation
          </button>
        )}
        {conversation.status !== "waiting" && conversation.status !== "closed" && (
          <button
            onClick={() => onStatusChange("waiting")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            Mark as Waiting
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Inbox Page ─────────────────────────────────────────────────────────

export default function InboxPage() {
  // State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(true);
	const { config: aiConfig } = useAIAssistantConfig();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Data
  const inboxFilter = {
    channel: channelFilter,
    status: statusFilter,
    search: searchQuery,
    needs_attention: needsAttentionFilter,
    limit: 50,
  };
  const { conversations, total, isLoading, refetch: refetchConversations } = useInboxConversations(inboxFilter);
  const { messages, isLoading: isMessagesLoading, isSending, sendReply, markAsRead, refetch: refetchMessages } =
    useInboxMessages(activeConversationId);
  const { updateStatus, editMessage: editMsg, deleteMessage: deleteMsg, toggleAI, isUpdating } = useInboxActions();

  // 🔌 Real-time WebSocket — instantly pushes new messages without polling delays
  useInboxWebSocket(inboxFilter);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (activeConversationId && activeConversation && activeConversation.unread_count > 0) {
      markAsRead().then(() => refetchConversations());
    }
  }, [activeConversationId, activeConversation?.unread_count, markAsRead, refetchConversations]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setShowMobileThread(true);
  }, []);

  const handleSendReply = useCallback(
    async (body: string) => {
      try {
        await sendReply(body);
        refetchConversations();
      } catch {
        toast.error("Failed to send message. Please try again.");
      }
    },
    [sendReply, refetchConversations]
  );

  const handleStatusChange = useCallback(
    async (status: ConversationStatus) => {
      if (!activeConversationId) return;
      try {
        await updateStatus(activeConversationId, status);
        refetchConversations();
        toast.success(`Conversation ${status === "closed" ? "closed" : status === "open" ? "reopened" : "updated"}`);
      } catch {
        toast.error("Failed to update conversation status.");
      }
    },
    [activeConversationId, updateStatus, refetchConversations]
  );

  const handleAIToggle = useCallback(async () => {
    if (!activeConversation) return;
    const shouldResume = activeConversation.ai_state === "paused_by_human" || activeConversation.ai_state === "escalated";
    try {
      await toggleAI(activeConversation.id, shouldResume ? "active" : "paused_by_human", shouldResume);
      await refetchConversations();
      toast.success(shouldResume ? "AI assistance resumed for this conversation" : "AI assistance paused for 30 minutes");
    } catch {
      toast.error("Could not update AI assistance. Please try again.");
    }
  }, [activeConversation, toggleAI, refetchConversations]);

  // Unread conversation count
  const unreadCount = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count > 0 ? 1 : 0), 0),
    [conversations]
  );

  // Filter counts
  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: conversations.length };
    conversations.forEach((c) => {
      counts[c.channel] = (counts[c.channel] || 0) + 1;
    });
    return counts;
  }, [conversations]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 flex h-[calc(100vh-64px)] bg-[#f4f5f2] overflow-hidden">
      {/* ═══ LEFT: Conversation List ═══ */}
      <div
        className={cn(
          "w-full md:w-[340px] lg:w-[360px] bg-white border-r border-gray-200 flex flex-col shrink-0",
          showMobileThread ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#163300] text-white text-[11px] font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <AIAssistanceToggle compact />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#163300]/15 focus:border-[#163300]/30 transition-all"
            />
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 scrollbar-hide">
            {["all", "whatsapp", "telegram"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all shrink-0",
                  channelFilter === ch
                    ? "bg-[#163300] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {ch === "all" ? "All" : ch}
              </button>
            ))}

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {(["all", "open", "waiting", "closed"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all shrink-0",
                  statusFilter === st
                    ? "bg-[#163300] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {st}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setNeedsAttentionFilter((value) => !value)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0",
                needsAttentionFilter ? "bg-amber-600 text-white shadow-sm" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              )}
            >
              Needs attention
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 py-3.5 flex items-start gap-3 border-b border-gray-100/80 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-10 bg-gray-100 rounded" />
                    </div>
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyConversations />
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ═══ CENTER: Message Thread ═══ */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-[#f4f5f2] min-w-0",
          !showMobileThread ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowMobileThread(false)}
                className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>

              <ContactAvatar
                name={
                  activeConversation.contact
                    ? `${activeConversation.contact.first_name} ${activeConversation.contact.last_name}`.trim()
                    : "Unknown"
                }
                channel={activeConversation.channel}
                size="sm"
              />

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate">
                  {activeConversation.contact
                    ? `${activeConversation.contact.first_name} ${activeConversation.contact.last_name}`.trim()
                    : "Unknown Contact"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={activeConversation.status} />
                  <span className="text-[11px] text-gray-500 capitalize">{activeConversation.status}</span>
                  <span className="text-[11px] text-gray-300">•</span>
                  <span className="text-[11px] text-gray-500">{activeConversation.channel}</span>
                </div>
              </div>

              <button
                onClick={() => setShowDetailPanel((p) => !p)}
                className="hidden lg:flex h-8 w-8 rounded-lg items-center justify-center hover:bg-gray-100 transition-colors"
                title="Toggle details"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-gray-500">No messages in this conversation yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl mx-auto">
                  {/* Date separator for first message */}
                  {messages.length > 0 && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {format(new Date(messages[0].created_at), "EEEE, MMM d")}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    // Insert date separators between different days
                    const showDate =
                      idx > 0 &&
                      format(new Date(msg.created_at), "yyyy-MM-dd") !==
                        format(new Date(messages[idx - 1].created_at), "yyyy-MM-dd");

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center gap-3 py-2 my-2">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                              {format(new Date(msg.created_at), "EEEE, MMM d")}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        <MessageBubble
                          message={msg}
                          onEdit={(id, body) => editMsg(activeConversationId!, id, body)}
                          onDelete={(id) => deleteMsg(activeConversationId!, id)}
                        />
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Compose Bar */}
            <ComposeBar
              onSend={handleSendReply}
              isSending={isSending}
              disabled={activeConversation.status === "closed"}
            />
          </>
        ) : (
          <EmptyThread />
        )}
      </div>

      {/* ═══ RIGHT: Detail Panel ═══ */}
      <AnimatePresence>
        {showDetailPanel && activeConversation && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block border-l border-gray-200 overflow-hidden shrink-0"
          >
            <ConversationDetail
              conversation={activeConversation}
              onStatusChange={handleStatusChange}
              onToggleAI={handleAIToggle}
              isUpdating={isUpdating}
				workspaceAIEnabled={aiConfig?.is_enabled === true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
