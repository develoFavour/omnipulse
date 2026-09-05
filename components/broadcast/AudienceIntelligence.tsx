"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  CheckSquare, 
  Square, 
  Megaphone, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Radio,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/lib/api/hooks/useContacts";
import { TelegramDestination } from "@/lib/services/telegram-destination.service";
import { ChannelPlacement } from "./ChannelPlacementSelector";

interface AudienceIntelligenceProps {
  selectedPlacements: ChannelPlacement[];
  contacts: Contact[];
  destinations: TelegramDestination[];
  selectedDestinationIds: string[];
  onToggleDestination: (id: string) => void;
  onSelectAllDestinations: () => void;
  onDeselectAllDestinations: () => void;
}

export function AudienceIntelligence({
  selectedPlacements,
  contacts,
  destinations,
  selectedDestinationIds,
  onToggleDestination,
  onSelectAllDestinations,
  onDeselectAllDestinations,
}: AudienceIntelligenceProps) {
  const [destinationSearch, setDestinationSearch] = useState("");
  const [showRecipientList, setShowRecipientList] = useState(false);

  const isTelegramDM = selectedPlacements.includes("telegram_dm");
  const isTelegramChannel = selectedPlacements.includes("telegram_channel");
  const isWhatsAppDM = selectedPlacements.includes("whatsapp_dm");
  const isWhatsAppStory = selectedPlacements.includes("whatsapp_story");

  const activeContacts = contacts.filter((c) => c.status === "active");
  const targetContacts = activeContacts.filter((c) => {
    if (isTelegramDM && c.channel === "telegram") return true;
    if (isWhatsAppDM && c.channel === "whatsapp") return true;
    return false;
  });

  const filteredDestinations = destinations.filter((d) =>
    d.title.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    d.type.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const totalPrivateReach = targetContacts.length;
  const totalGroupReach = isTelegramChannel ? selectedDestinationIds.length : 0;
  const totalCombinedReach = totalPrivateReach + totalGroupReach;

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="rounded-2xl border border-gray-200/90 bg-gray-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Total Audience Reach
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Opt-in
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {totalCombinedReach} destination{totalCombinedReach === 1 ? "" : "s"} will receive this transmission
                {isWhatsAppStory ? " (+ WhatsApp Story Viewers)" : ""}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xl font-extrabold text-gray-900 font-mono">
                {totalCombinedReach}
              </span>
              <span className="text-[10px] block font-semibold text-gray-400 uppercase">
                Direct Targets
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/60">
          {isTelegramDM && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#0088cc]" />
              Telegram DMs: <strong className="font-mono">{targetContacts.filter(c => c.channel === "telegram").length}</strong>
            </span>
          )}
          {isTelegramChannel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Telegram Groups: <strong className="font-mono">{selectedDestinationIds.length}</strong>
            </span>
          )}
          {isWhatsAppDM && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#25D366]" />
              WhatsApp DMs: <strong className="font-mono">{targetContacts.filter(c => c.channel === "whatsapp").length}</strong>
            </span>
          )}
          {isWhatsAppStory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-emerald-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              WhatsApp Story: <strong>Direct Share Ready</strong>
            </span>
          )}
        </div>
      </div>

      {/* Telegram Group Destination Picker (shown when Telegram Community placement is active) */}
      {isTelegramChannel && (
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/30 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-sky-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950">
                Targeted Telegram Groups & Channels
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAllDestinations}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 transition-colors"
              >
                Select All ({destinations.length})
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={onDeselectAllDestinations}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder="Search groups, supergroups, and broadcast channels..."
              className="w-full bg-white border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          {/* Destination Grid */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {filteredDestinations.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-medium">
                  {destinations.length === 0
                    ? "No Telegram groups discovered yet. Add your bot as an admin to a group to broadcast."
                    : "No groups match your search filter."}
                </p>
              </div>
            ) : (
              filteredDestinations.map((dest) => {
                const isChecked = selectedDestinationIds.includes(dest.id);
                return (
                  <div
                    key={dest.id}
                    onClick={() => onToggleDestination(dest.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-150 select-none",
                      isChecked
                        ? "bg-white border-sky-400 shadow-xs"
                        : "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        isChecked ? "border-sky-600 bg-sky-600 text-white" : "border-gray-300"
                      )}>
                        {isChecked && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {dest.title}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400">
                          ID: {dest.telegram_chat_id}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 shrink-0">
                      {dest.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Recipient Roster Drawer Toggle */}
      {targetContacts.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowRecipientList(!showRecipientList)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">
                View Target Recipients Roster ({targetContacts.length})
              </span>
            </div>
            {showRecipientList ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {showRecipientList && (
            <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 p-2">
              {targetContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {contact.first_name[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="font-semibold text-gray-900 truncate">
                      {contact.first_name} {contact.last_name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {contact.routing_value}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                    {contact.channel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
