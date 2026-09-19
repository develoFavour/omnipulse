"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Megaphone, 
  UserCheck, 
  ChevronDown, 
  ChevronUp,
  Radio,
  CheckCircle2,
  UserX,
  Filter,
  Tag as TagIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/lib/api/hooks/useContacts";
import { useTags } from "@/lib/api/hooks/useTags";
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
  // Contact-specific selection
  selectedContactIds: string[];
  onToggleContact: (id: string) => void;
  onSelectAllContacts: () => void;
  onDeselectAllContacts: () => void;
}

export function AudienceIntelligence({
  selectedPlacements,
  contacts,
  destinations,
  selectedDestinationIds,
  onToggleDestination,
  onSelectAllDestinations,
  onDeselectAllDestinations,
  selectedContactIds,
  onToggleContact,
  onSelectAllContacts,
  onDeselectAllContacts,
}: AudienceIntelligenceProps) {
  const [destinationSearch, setDestinationSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const { tags } = useTags();

  const isTelegramDM = selectedPlacements.includes("telegram_dm");
  const isTelegramChannel = selectedPlacements.includes("telegram_channel");
  const isWhatsAppDM = selectedPlacements.includes("whatsapp_dm");
  const isWhatsAppStory = selectedPlacements.includes("whatsapp_story");

  const activeContacts = contacts.filter((c) => c.status === "active");

  // Contacts eligible for the current placements
  const eligibleContacts = useMemo(() => {
    return activeContacts.filter((c) => {
      if (isTelegramDM && c.channel === "telegram") return true;
      if (isWhatsAppDM && c.channel === "whatsapp") return true;
      return false;
    });
  }, [activeContacts, isTelegramDM, isWhatsAppDM]);

  // When contacts are hand-picked, only the selected ones are targets
  const isFilteringContacts = selectedContactIds.length > 0;
  const targetContacts = isFilteringContacts
    ? eligibleContacts.filter((c) => selectedContactIds.includes(c.id))
    : eligibleContacts;

  const filteredEligibleContacts = useMemo(() => {
    let list = eligibleContacts;
    if (selectedTagFilter) {
      list = list.filter((c) => c.tags?.some((t) => t.id === selectedTagFilter));
    }
    const q = contactSearch.toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.routing_value.toLowerCase().includes(q)
    );
  }, [eligibleContacts, contactSearch, selectedTagFilter]);

  const filteredDestinations = useMemo(() => {
    const q = destinationSearch.toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
    );
  }, [destinations, destinationSearch]);

  const totalPrivateReach = targetContacts.length;
  const totalGroupReach = isTelegramChannel ? selectedDestinationIds.length : 0;
  const totalCombinedReach = totalPrivateReach + totalGroupReach;

  const hasPrivatePlacements = isTelegramDM || isWhatsAppDM;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Audience Intelligence
          </h3>
        </div>
        {isFilteringContacts && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
            <Filter className="h-3 w-3" />
            {selectedContactIds.length} hand-picked
          </span>
        )}
      </div>

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
                {isFilteringContacts && (
                  <span className="text-amber-600 font-semibold ml-1">
                    ({eligibleContacts.length - selectedContactIds.length} contacts excluded by filter)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-extrabold text-gray-900 font-mono">
              {totalCombinedReach}
            </span>
            <span className="text-[10px] block font-semibold text-gray-400 uppercase">
              Direct Targets
            </span>
          </div>
        </div>

        {/* Breakdown Pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/60">
          {isTelegramDM && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#0088cc]" />
              Telegram DMs:{" "}
              <strong className="font-mono">
                {targetContacts.filter((c) => c.channel === "telegram").length}
              </strong>
              {isFilteringContacts && (
                <span className="text-[10px] text-amber-600">
                  /{eligibleContacts.filter((c) => c.channel === "telegram").length}
                </span>
              )}
            </span>
          )}
          {isTelegramChannel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Telegram Groups:{" "}
              <strong className="font-mono">{selectedDestinationIds.length}</strong>
            </span>
          )}
          {isWhatsAppDM && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#25D366]" />
              WhatsApp DMs:{" "}
              <strong className="font-mono">
                {targetContacts.filter((c) => c.channel === "whatsapp").length}
              </strong>
              {isFilteringContacts && (
                <span className="text-[10px] text-amber-600">
                  /{eligibleContacts.filter((c) => c.channel === "whatsapp").length}
                </span>
              )}
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

      {/* ── Contact Targeting (Private DM Placements) ─────────────────── */}
      {hasPrivatePlacements && eligibleContacts.length > 0 && (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Contact Targeting
              </h4>
              {isFilteringContacts ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Filtered — {selectedContactIds.length}/{eligibleContacts.length} selected
                </span>
              ) : (
                <span className="text-[10px] font-medium bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
                  All {eligibleContacts.length} contacts
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isFilteringContacts ? (
                <button
                  type="button"
                  onClick={onDeselectAllContacts}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Reset to All
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowContactPicker((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition-colors"
              >
                <Filter className="h-3 w-3" />
                {showContactPicker ? "Close Picker" : "Pick Specific Contacts"}
                {showContactPicker ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Contact picker panel */}
          {showContactPicker && (
            <div className="space-y-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search by name or number..."
                  className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              {/* Tag Segmentation Filter Chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-1 py-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                    Tags:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTagFilter(null)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors",
                      selectedTagFilter === null
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    All
                  </button>
                  {tags.map((t) => {
                    const isSelected = selectedTagFilter === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTagFilter(isSelected ? null : t.id)}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border",
                          isSelected
                            ? "text-white border-transparent shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        )}
                        style={{
                          backgroundColor: isSelected ? t.color : undefined,
                          borderColor: isSelected ? t.color : undefined,
                        }}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bulk actions */}
              <div className="flex items-center gap-3 px-1">
                <button
                  type="button"
                  onClick={onSelectAllContacts}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                >
                  Select All ({eligibleContacts.length})
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={onDeselectAllContacts}
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
                {isFilteringContacts && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] font-medium text-amber-700">
                      {selectedContactIds.length} selected
                    </span>
                  </>
                )}
              </div>

              {/* Contact list */}
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {filteredEligibleContacts.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                    <UserX className="h-5 w-5 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      No contacts match your search.
                    </p>
                  </div>
                ) : (
                  filteredEligibleContacts.map((contact) => {
                    const isChecked = selectedContactIds.includes(contact.id);
                    const isAll = selectedContactIds.length === 0; // empty = all
                    const effectivelySelected = isAll || isChecked;
                    return (
                      <div
                        key={contact.id}
                        onClick={() => onToggleContact(contact.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-150 select-none",
                          isChecked
                            ? "bg-white border-indigo-400 shadow-xs"
                            : !isFilteringContacts
                            ? "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 opacity-70"
                            : "bg-white/50 border-gray-200 hover:bg-white hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {/* Checkbox */}
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isChecked
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : !isFilteringContacts
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-300"
                            )}
                          >
                            {isChecked && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          {/* Avatar */}
                          <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {contact.first_name[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <p className="text-[10px] font-mono text-gray-400 truncate">
                              {contact.routing_value}
                            </p>
                            {contact.tags && contact.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {contact.tags.map((t) => (
                                  <span
                                    key={t.id}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white shadow-2xs"
                                    style={{ backgroundColor: t.color }}
                                  >
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Channel badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isFilteringContacts && (
                            <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              INCLUDED
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0",
                              contact.channel === "telegram"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-emerald-100 text-emerald-800"
                            )}
                          >
                            {contact.channel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <p className="text-[10px] text-gray-400 px-1">
                {isFilteringContacts
                  ? `✦ Only ${selectedContactIds.length} selected contact${selectedContactIds.length !== 1 ? "s" : ""} will receive this broadcast.`
                  : "✦ Tip: Leave all unchecked to send to every eligible contact, or pick specific recipients above."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Telegram Group Destination Picker ──────────────────────────── */}
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
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isChecked ? "border-sky-600 bg-sky-600 text-white" : "border-gray-300"
                        )}
                      >
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
    </div>
  );
}
