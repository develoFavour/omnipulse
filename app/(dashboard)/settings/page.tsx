import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAppStore } from "@/lib/store";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { teamService } from "@/lib/services/team.service";
import { profileService } from "@/lib/services/profile.service";
import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { notificationPreferencesService } from "@/lib/services/notification-preferences.service";
import { mediaService } from "@/lib/services/media.service";
import { workspaceSettingsService, type WorkspaceSettings } from "@/lib/services/workspace-settings.service";
import { apiKeyService, type ApiKey } from "@/lib/services/api-key.service";
import { channelService, type ChannelResponse } from "@/lib/services/channel.service";
import { cn } from "@/lib/utils";
import {
  Building2, User, Users, Bell, CreditCard, Plug, Shield, Trash2,
  Check, X, Eye, EyeOff, Copy, Plus, ChevronRight, AlertTriangle,
  Loader2, KeyRound, Smartphone, Globe, MailCheck, Lock, Pencil, Save, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import type { TenantMember } from "@/lib/services/team.service";

type Section = "workspace" | "profile" | "team" | "notifications" | "billing" | "integrations" | "security" | "danger";
interface NavItem { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; ownerOnly?: boolean; adminAndOwner?: boolean; }
const navItems: NavItem[] = [
  { id: "workspace", label: "Workspace", icon: Building2, ownerOnly: true },
  { id: "profile", label: "Profile", icon: User },
  { id: "team", label: "Team & Roles", icon: Users, adminAndOwner: true },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plan", icon: CreditCard, ownerOnly: true },
  { id: "integrations", label: "Integrations", icon: Plug, adminAndOwner: true },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2, ownerOnly: true },
];

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden", className)}>{children}</div>;
}
function CardSection({ title, children, noBorder }: { title?: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className={cn("px-6 py-5", !noBorder && "border-b border-gray-100 last:border-0")}>
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>}
      {children}
    </div>
  );
}
function InputField({ label, id, value, onChange, placeholder, type = "text", disabled, hint }: {
  label: string; id: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={cn("w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all duration-150", disabled && "cursor-not-allowed bg-gray-50 text-gray-400")} />
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
function SaveButton({ onClick, loading, disabled }: { onClick: () => void; loading?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className={cn("inline-flex items-center gap-2 rounded-lg bg-[#163300] px-4 py-2 text-sm font-bold text-[#9fe870] hover:bg-[#163300]/90 active:scale-95 transition-all duration-150 shadow-sm", (loading || disabled) && "cursor-not-allowed opacity-60")}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Save Changes
    </button>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#163300] focus:ring-offset-2", checked ? "bg-[#163300]" : "bg-gray-200")}>
      <span className={cn("inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform duration-200", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

// ── Workspace Section ──────────────────────────────────────────────────────────
function WorkspaceSection() {
  const { isOwner } = usePermissions();
  const tenant = useAppStore((s) => s.tenant);
  const renameWorkspace = useAppStore((s) => s.renameWorkspace);
  const [name, setName] = useState(tenant?.company_name ?? "");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>({ logo_url: "", timezone: "UTC", language: "en-US" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  useEffect(() => { workspaceSettingsService.get().then(setSettings).catch(() => toast.error("Failed to load workspace settings")).finally(() => setLoadingSettings(false)); }, []);
  useEffect(() => { setName(tenant?.company_name ?? ""); }, [tenant?.company_name]);
  const handleSave = async () => {
    if (!name.trim() || name.trim() === tenant?.company_name) return;
    setSaving(true);
    try { await renameWorkspace(name.trim()); toast.success("Workspace name updated"); }
    catch { toast.error("Failed to update workspace name"); }
    finally { setSaving(false); }
  };
  if (!isOwner) {
    return (
      <div>
        <SectionHeader title="Workspace Settings" description="View your workspace configuration." />
        <Card>
          <CardSection noBorder>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#163300] text-xl font-bold text-[#9fe870]">{tenant?.company_name?.charAt(0)?.toUpperCase() ?? "W"}</div>
              <div>
                <p className="text-base font-semibold text-gray-900">{tenant?.company_name ?? "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Only the workspace owner can modify this.</p>
              </div>
            </div>
          </CardSection>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <SectionHeader title="Workspace Settings" description="Manage your workspace identity and general configuration." />
      <Card>
        <CardSection title="Identity">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {settings.logo_url ? <img src={settings.logo_url} alt="Workspace logo" className="h-16 w-16 rounded-2xl object-cover shadow-md" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#163300] text-2xl font-bold text-[#9fe870] shadow-md">{name.charAt(0)?.toUpperCase() ?? "W"}</div>}
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"><Pencil className="h-3 w-3 text-gray-500" /><input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploadingLogo} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be 2MB or smaller"); return; } setUploadingLogo(true); try { const uploaded = await mediaService.uploadImage(file); const updated = await workspaceSettingsService.update({ ...settings, logo_url: uploaded.url }); setSettings(updated); toast.success("Workspace logo updated"); } catch { toast.error("Failed to upload workspace logo"); } finally { setUploadingLogo(false); event.target.value = ""; } }} /></label>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Workspace Logo</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2MB. Displays in workspace switcher.</p>
            </div>
          </div>
          <div className="space-y-4">
            <InputField label="Workspace Name" id="ws-name" value={name} onChange={setName} placeholder="e.g. Acme Agency" hint="This is how your workspace appears to all team members." />
            <InputField label="Workspace ID" id="ws-id" value={tenant?.id ?? "—"} disabled hint="Unique identifier — cannot be changed." />
          </div>
        </CardSection>
        <CardSection noBorder>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Changes apply to all team members immediately.</p>
            <SaveButton onClick={handleSave} loading={saving} />
          </div>
        </CardSection>
      </Card>
      <Card className="mt-4">
        <CardSection title="Regional Settings">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <select value={settings.timezone} onChange={(event) => setSettings((current) => ({ ...current, timezone: event.target.value }))} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all">
                <option value="Africa/Lagos">UTC+01:00 – Lagos (WAT)</option>
                <option value="Europe/London">UTC+00:00 – London (GMT)</option>
                <option value="America/New_York">UTC-05:00 – New York (EST)</option>
                <option value="Asia/Kolkata">UTC+05:30 – Mumbai (IST)</option>
                <option value="UTC">UTC – Coordinated Universal Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <select value={settings.language} onChange={(event) => setSettings((current) => ({ ...current, language: event.target.value }))} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all">
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr-FR">French</option>
                <option value="es-ES">Spanish</option>
              </select>
            </div>
          </div>
        </CardSection>
        <CardSection noBorder>
          <div className="flex justify-end"><SaveButton loading={loadingSettings} onClick={async () => { try { await workspaceSettingsService.update(settings); toast.success("Regional settings saved"); } catch { toast.error("Failed to save regional settings"); } }} /></div>
        </CardSection>
      </Card>
    </div>
  );
}

// ── Profile Section ────────────────────────────────────────────────────────────
function ProfileSection() {
  const { user: clerkUser } = useUser();
  const user = useAppStore((s) => s.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileService.getProfile().then((profile) => {
      setFirstName(profile.first_name ?? clerkUser?.firstName ?? ""); setLastName(profile.last_name ?? clerkUser?.lastName ?? ""); setEmail(profile.email ?? user?.email ?? "");
    }).catch(() => { setFirstName(clerkUser?.firstName ?? ""); setLastName(clerkUser?.lastName ?? ""); setEmail(user?.email ?? ""); }).finally(() => setLoading(false));
  }, [user?.email, clerkUser?.firstName, clerkUser?.lastName]);
  const handleProfileSave = async () => {
    setSaving(true);
    try { await clerkUser?.update({ firstName: firstName.trim(), lastName: lastName.trim() }); await profileService.updateProfile({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() }); toast.success("Profile updated"); }
    catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };
  const handlePasswordChange = async () => {
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    if (!clerkUser) return;
    try { await clerkUser.updatePassword({ currentPassword: currentPw, newPassword: newPw }); }
    catch { toast.error("Failed to update password. Check your current password."); setSaving(false); return; }
    setSaving(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Password changed successfully");
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be 2MB or smaller");
      return;
    }
    setUploadingAvatar(true);
    try {
      await clerkUser?.setProfileImage({ file });
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to update profile photo");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div>;
  return (
    <div>
      <SectionHeader title="Profile Settings" description="Manage your personal information and credentials." />
      <Card>
        <CardSection title="Personal Information">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {clerkUser?.imageUrl ? <img src={clerkUser.imageUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover shadow-md" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-2xl font-bold text-white shadow-md">{user?.email?.charAt(0)?.toUpperCase() ?? "U"}</div>}
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin text-[#163300]" /> : <Pencil className="h-3 w-3 text-gray-500" />}
                <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploadingAvatar} onChange={handleAvatarFile} />
              </label>
            </div>
            <div><p className="text-sm font-semibold text-gray-900">Profile Photo</p><p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2MB.</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" id="profile-first" value={firstName} onChange={setFirstName} placeholder="First name" />
            <InputField label="Last Name" id="profile-last" value={lastName} onChange={setLastName} placeholder="Last name" />
          </div>
          <div className="mt-4">
            <InputField label="Email Address" id="profile-email" type="email" value={email} disabled placeholder="you@company.com" hint="Managed via Clerk — email updates require verification via your account portal." />
          </div>
        </CardSection>
        <CardSection noBorder><div className="flex justify-end"><SaveButton onClick={handleProfileSave} loading={saving} /></div></CardSection>
      </Card>
      <Card className="mt-4">
        <CardSection title="Password">
          {clerkUser && !clerkUser.passwordEnabled ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">Social Login Active:</span> You are signed in via an external OAuth provider (such as Google). Password management is handled by your provider.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all" />
                <button onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <InputField label="Confirm New Password" id="profile-confirm-pw" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Re-enter new password" />
            </div>
          )}
        </CardSection>
        {clerkUser?.passwordEnabled && (
          <CardSection noBorder>
            <div className="flex justify-end">
              <button onClick={handlePasswordChange} className="inline-flex items-center gap-2 rounded-lg bg-[#163300] px-4 py-2 text-sm font-bold text-[#9fe870] hover:bg-[#163300]/90 active:scale-95 transition-all duration-150 shadow-sm">
                <Lock className="h-4 w-4" />Update Password
              </button>
            </div>
          </CardSection>
        )}
      </Card>
    </div>
  );
}

// ── Team Section ───────────────────────────────────────────────────────────────
function TeamSection() {
  const { canManageTeam, canInviteMembers, canRemoveMembers, isOwner, isAdmin } = usePermissions();
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const load = useCallback(async () => {
    try { const data = await teamService.listTeam(); setMembers(data.members ?? []); }
    catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try { await teamService.inviteMember(inviteEmail, inviteRole); toast.success(`Invitation sent to ${inviteEmail}`); setInviteEmail(""); }
    catch { toast.error("Failed to send invitation"); }
    finally { setInviting(false); }
  };
  const handleRemove = async (id: string, email: string) => {
    try { await teamService.removeMember(id); setMembers((prev) => prev.filter((m) => m.id !== id)); toast.success(`${email} removed`); }
    catch { toast.error("Failed to remove member"); }
  };
  const roleColors: Record<string, string> = { owner: "bg-violet-100 text-violet-700", admin: "bg-blue-100 text-blue-700", member: "bg-gray-100 text-gray-600" };
  if (!canManageTeam) {
    return (
      <div>
        <SectionHeader title="Team & Roles" description="View your workspace team members." />
        <Card><CardSection noBorder><p className="text-sm text-gray-500">Contact your workspace admin to manage team settings.</p></CardSection></Card>
      </div>
    );
  }
  return (
    <div>
      <SectionHeader title="Team & Roles" description="Manage members, send invitations, and assign roles." />
      {canInviteMembers && (
        <Card className="mb-4">
          <CardSection title="Invite a Team Member">
            <div className="flex gap-3">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInvite()} placeholder="colleague@company.com" className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/20 transition-all" />
              {(isOwner || isAdmin) && (
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "admin" | "member")} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#163300] focus:outline-none">
                  {isOwner && <option value="admin">Admin</option>}
                  <option value="member">Member</option>
                </select>
              )}
              <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="inline-flex items-center gap-2 rounded-lg bg-[#163300] px-4 py-2.5 text-sm font-bold text-[#9fe870] hover:bg-[#163300]/90 disabled:opacity-50 transition-all">
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Invite
              </button>
            </div>
          </CardSection>
        </Card>
      )}
      <Card>
        <CardSection title="Current Members" noBorder>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div>
          ) : members.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No members found.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2f6d5] text-sm font-bold text-[#163300]">{m.email.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.email}</p>
                      <p className="text-xs text-gray-400">Joined {new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && m.role !== "owner" ? (
                      <select
                        value={m.role}
                        onChange={async (e) => {
                          const newRole = e.target.value as "admin" | "member";
                          try {
                            await teamService.updateMemberRole(m.id, newRole);
                            setMembers((prev) => prev.map((item) => (item.id === m.id ? { ...item, role: newRole } : item)));
                            toast.success(`Role updated to ${newRole}`);
                          } catch {
                            toast.error("Failed to update member role");
                          }
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold capitalize text-gray-700 focus:border-[#163300] focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", roleColors[m.role] ?? "bg-gray-100 text-gray-600")}>{m.role}</span>
                    )}
                    {canRemoveMembers && m.role !== "owner" && (
                      <button onClick={() => handleRemove(m.id, m.email)} className="ml-1 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardSection>
      </Card>
    </div>
  );
}

// ── Notifications Section ──────────────────────────────────────────────────────
type NotifKey = "broadcast_completed" | "broadcast_failed" | "new_member_joined" | "invitation_accepted" | "contact_synced" | "campaign_scheduled" | "weekly_report";
interface NotifSetting { key: NotifKey; label: string; description: string; email: boolean; inApp: boolean; }
const defaultNotifs: NotifSetting[] = [
  { key: "broadcast_completed", label: "Broadcast Completed", description: "When a broadcast campaign finishes sending", email: true, inApp: true },
  { key: "broadcast_failed", label: "Broadcast Failed", description: "When a broadcast encounters a delivery error", email: true, inApp: true },
  { key: "new_member_joined", label: "New Member Joined", description: "When someone accepts a workspace invitation", email: false, inApp: true },
  { key: "invitation_accepted", label: "Invitation Accepted", description: "When a sent invitation is accepted", email: true, inApp: false },
  { key: "contact_synced", label: "Contacts Synced", description: "After a channel contact sync completes", email: false, inApp: true },
  { key: "campaign_scheduled", label: "Campaign Scheduled", description: "When a broadcast is queued for future delivery", email: true, inApp: true },
  { key: "weekly_report", label: "Weekly Analytics Report", description: "A weekly summary of your workspace performance", email: true, inApp: false },
];
function NotificationsSection() {
  const [notifs, setNotifs] = useState<NotifSetting[]>(defaultNotifs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { notificationPreferencesService.get().then((saved) => { if (saved.length) setNotifs(defaultNotifs.map((item) => { const match = saved.find((p) => p.key === item.key); return match ? { ...item, email: match.email, inApp: match.in_app } : item; })); }).catch(() => toast.error("Failed to load notification preferences")).finally(() => setLoading(false)); }, []);
  const toggle = (key: NotifKey, channel: "email" | "inApp") => {
    setNotifs((prev) => prev.map((n) => (n.key === key ? { ...n, [channel]: !n[channel] } : n)));
  };
  return (
    <div>
      <SectionHeader title="Notification Preferences" description="Choose how and when you receive alerts about workspace activity." />
      <Card>
        {loading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#163300]" /></div>}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Event</span>
          <div className="flex gap-10 pr-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400"><MailCheck className="h-3.5 w-3.5" /> Email</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400"><Bell className="h-3.5 w-3.5" /> In-App</span>
          </div>
        </div>
        {notifs.map((n, idx) => (
          <div key={n.key} className={cn("flex items-center justify-between px-6 py-4", idx !== notifs.length - 1 && "border-b border-gray-50")}>
            <div>
              <p className="text-sm font-medium text-gray-900">{n.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.description}</p>
            </div>
            <div className="flex gap-14 pr-1">
              <Toggle checked={n.email} onChange={() => toggle(n.key, "email")} />
              <Toggle checked={n.inApp} onChange={() => toggle(n.key, "inApp")} />
            </div>
          </div>
        ))}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
          <SaveButton loading={saving} onClick={async () => { setSaving(true); try { await notificationPreferencesService.update(notifs.map((item) => ({ key: item.key, email: item.email, in_app: item.inApp }))); toast.success("Notification preferences saved"); } catch { toast.error("Failed to save notification preferences"); } finally { setSaving(false); } }} />
        </div>
      </Card>
    </div>
  );
}

// ── Billing Section ────────────────────────────────────────────────────────────
function BillingSection() {
  const { canManageBilling } = usePermissions();
  if (!canManageBilling) {
    return (
      <div>
        <SectionHeader title="Billing & Plan" description="View your workspace subscription." />
        <Card><CardSection noBorder><p className="text-sm text-gray-500">Only the workspace owner can access billing settings.</p></CardSection></Card>
      </div>
    );
  }
  const plans = [
    { name: "Starter", price: "$0", description: "For solo operators", features: ["1 workspace", "2 channels", "500 contacts", "1,000 msgs/mo"], current: false },
    { name: "Growth", price: "$49", description: "For scaling agencies", features: ["3 workspaces", "5 channels", "10,000 contacts", "50,000 msgs/mo"], current: true },
    { name: "Enterprise", price: "Custom", description: "For large agencies", features: ["Unlimited workspaces", "Unlimited channels", "Unlimited contacts", "Priority support"], current: false },
  ];
  return (
    <div>
      <SectionHeader title="Billing & Plan" description="Manage your subscription plan and payment method." />
      <Card className="mb-4">
        <CardSection title="Current Usage">
          <div className="grid grid-cols-3 gap-6">
            {[{ label: "Messages Sent", value: "18,432", limit: "50,000", pct: 37 }, { label: "Contacts", value: "4,201", limit: "10,000", pct: 42 }, { label: "Active Channels", value: "3", limit: "5", pct: 60 }].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.value} / {item.limit}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#163300] transition-all" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardSection>
      </Card>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {plans.map((plan) => (
          <div key={plan.name} className={cn("rounded-2xl border p-5 transition-all", plan.current ? "border-[#9fe870] bg-[#e2f6d5]/40 shadow-sm" : "border-gray-200 bg-white hover:border-[#9fe870]/40")}>
            {plan.current && <span className="inline-flex items-center gap-1 rounded-full bg-[#163300] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9fe870] mb-3"><Check className="h-2.5 w-2.5" /> Current Plan</span>}
            <p className="text-base font-bold text-gray-900">{plan.name}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{plan.price}{plan.price !== "Custom" && <span className="text-sm font-medium text-gray-400">/mo</span>}</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">{plan.description}</p>
            <ul className="space-y-1.5 mb-5">
              {plan.features.map((f) => <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="h-3 w-3 text-[#163300] shrink-0" />{f}</li>)}
            </ul>
            {!plan.current && <button onClick={() => toast.info(`Upgrade to ${plan.name} coming soon`)} className="w-full rounded-lg border border-[#9fe870]/40 bg-white px-3 py-2 text-xs font-semibold text-[#163300] hover:bg-[#e2f6d5]/50 transition-colors">{plan.price === "Custom" ? "Contact Sales" : "Upgrade"}</button>}
          </div>
        ))}
      </div>
      <Card>
        <CardSection title="Payment Method">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"><CreditCard className="h-5 w-5 text-gray-400" /></div>
              <div>
                <p className="text-sm font-medium text-gray-900">**** **** **** 4242</p>
                <p className="text-xs text-gray-400">Expires 12/2027</p>
              </div>
            </div>
            <button className="text-sm font-medium text-[#163300] hover:underline transition-colors">Update card</button>
          </div>
        </CardSection>
      </Card>
    </div>
  );
}

// ── Integrations Section ───────────────────────────────────────────────────────
function IntegrationsSection() {
  const { canManageChannels } = usePermissions();
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    try {
      const list = await channelService.getChannels();
      setChannels(list ?? []);
    } catch {
      // Keep empty fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const hasWhatsApp = channels.some((c) => c.platform_name === "whatsapp" && c.status === "active");
  const hasTelegram = channels.some((c) => c.platform_name === "telegram" && c.status === "active");
  const whatsappChannel = channels.find((c) => c.platform_name === "whatsapp" && c.status === "active");
  const telegramChannel = channels.find((c) => c.platform_name === "telegram" && c.status === "active");

  const handleDisconnect = async (platform: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    setDisconnecting(platform);
    try {
      await channelService.disconnectChannel(platform);
      toast.success(`${name} disconnected`);
      await loadChannels();
    } catch {
      toast.error(`Failed to disconnect ${name}`);
    } finally {
      setDisconnecting(null);
    }
  };

  const integrations = [
    {
      id: "whatsapp",
      name: "WhatsApp Multi-Device",
      description: hasWhatsApp ? `Linked: ${whatsappChannel?.sender_identity || "Active Session"}` : "Broadcast and direct messages via WhatsApp Web QR link",
      status: hasWhatsApp ? "connected" : "disconnected",
      icon: "💬",
      isLiveChannel: true,
    },
    {
      id: "telegram",
      name: "Telegram Bot Gateway",
      description: hasTelegram ? `Linked: @${telegramChannel?.sender_identity || "Bot"}` : "Broadcast to Telegram groups, channels, and individual subscribers",
      status: hasTelegram ? "connected" : "disconnected",
      icon: "✈️",
      isLiveChannel: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get workspace notifications in Slack (Planned connector)",
      status: "disconnected",
      icon: "🔔",
      isLiveChannel: false,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows with 5,000+ external apps (Planned connector)",
      status: "disconnected",
      icon: "⚡",
      isLiveChannel: false,
    },
    {
      id: "google_sheets",
      name: "Google Sheets",
      description: "Export audience contacts and dispatch telemetry (Planned connector)",
      status: "disconnected",
      icon: "📊",
      isLiveChannel: false,
    },
    {
      id: "webhooks",
      name: "Inbound Webhooks",
      description: "Receive real-time event payloads to any external HTTP endpoint",
      status: "disconnected",
      icon: "🔗",
      isLiveChannel: false,
    },
  ];

  return (
    <div>
      <SectionHeader title="Integrations & Connected Apps" description="Manage active delivery pipelines and external integrations." />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#163300]" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {integrations.map((item) => (
            <Card key={item.name}>
              <CardSection noBorder>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl border border-gray-100">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed max-w-[200px]">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", item.status === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                      {item.status}
                    </span>
                    {canManageChannels && (
                      item.isLiveChannel ? (
                        item.status === "connected" ? (
                          <button
                            onClick={() => handleDisconnect(item.id, item.name)}
                            disabled={disconnecting === item.id}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {disconnecting === item.id ? "Disconnecting..." : "Disconnect"}
                          </button>
                        ) : (
                          <Link
                            href={APP_ROUTES.DASHBOARD.CONNECTIONS}
                            className="text-xs font-bold text-[#163300] hover:underline transition-colors"
                          >
                            Connect →
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={() => toast.info(`${item.name} connector is coming soon.`)}
                          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Configure
                        </button>
                      )
                    )}
                  </div>
                </div>
              </CardSection>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Security Section ──────────────────────────────────────────────────────────
function SecuritySection() {
  const { openUserProfile } = useClerk();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiKeyService.list();
      setKeys(data);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const res = await apiKeyService.create(keyName.trim());
      setNewlyCreatedKey(res.key);
      setKeyName("");
      toast.success("API key generated successfully");
      fetchKeys();
    } catch {
      toast.error("Failed to generate API key");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await apiKeyService.revoke(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Security & API Access"
        description="Manage API credentials, authentication, and workspace access security."
      />

      {/* Account Authentication & 2FA */}
      <Card className="mb-8">
        <CardSection title="Authentication & 2FA">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e2f6d5]">
                <Shield className="h-5 w-5 text-[#163300]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Account Credentials & Two-Factor Auth</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-lg">
                  Password changes, connected accounts, active sessions, and multi-factor authentication (2FA) are securely managed through your unified identity profile.
                </p>
              </div>
            </div>
            <button
              onClick={() => openUserProfile?.()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 transition-all"
            >
              <Lock className="h-3.5 w-3.5 text-gray-600" />
              Manage Security in Profile
            </button>
          </div>
        </CardSection>
      </Card>

      {/* API Keys */}
      <Card>
        <CardSection>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">REST API Keys</h3>
              <p className="text-xs text-gray-500 mt-1">
                Keys used to authenticate external integrations and services directly with OmniPulse API.
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setNewlyCreatedKey(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#163300] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1f4700] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Key
            </button>
          </div>
        </CardSection>

        {/* Newly created key disclosure alert */}
        {newlyCreatedKey && (
          <div className="mx-6 my-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900">Copy your secret API key now</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  This key will never be displayed again. If you lose it, you will need to revoke it and generate a new one.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-mono text-gray-800 select-all overflow-x-auto">
                    {newlyCreatedKey}
                  </code>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 transition-colors"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-green-700" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal / Form to create a key */}
        {showCreateModal && (
          <div className="mx-6 my-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <form onSubmit={handleCreateKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900">New API Key Details</h4>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Production Webhook Server, Zapier Sync"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9fe870]"
                  required
                />
                <button
                  type="submit"
                  disabled={creating || !keyName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#163300] px-4 py-2 text-xs font-bold text-white hover:bg-[#1f4700] disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        )}

        <CardSection noBorder>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8">
              <KeyRound className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-xs font-medium text-gray-500">No active API keys found</p>
              <p className="text-xs text-gray-400 mt-0.5">Generate an API key to securely query OmniPulse from external servers.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {keys.map((k) => (
                <div key={k.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{k.name}</span>
                      <code className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {k.prefix}...
                      </code>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Last used: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(k.id)}
                    disabled={revokingId === k.id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {revokingId === k.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardSection>
      </Card>
    </div>
  );
}

// ── Danger Zone Section ────────────────────────────────────────────────────────
function DangerSection() {
  const { canDeleteWorkspace } = usePermissions();
  const tenant = useAppStore((s) => s.tenant);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  if (!canDeleteWorkspace) {
    return (
      <div>
        <SectionHeader title="Danger Zone" description="Destructive workspace actions." />
        <Card><CardSection noBorder><p className="text-sm text-gray-500">Only the workspace owner can perform destructive actions.</p></CardSection></Card>
      </div>
    );
  }
  const expectedName = tenant?.company_name ?? "";
  const canDelete = confirmInput === expectedName;
  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try { await apiClient.delete(ENDPOINTS.WORKSPACES.DELETE); useAppStore.getState().resetAuth(); toast.success("Workspace deleted"); window.location.href = "/"; }
    catch { toast.error("Failed to delete workspace"); setDeleting(false); setConfirmInput(""); }
  };
  return (
    <div>
      <SectionHeader title="Danger Zone" description="Irreversible and destructive actions. Proceed with extreme caution." />
      <Card className="border-red-200">
        <CardSection noBorder>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">Delete Workspace</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Permanently deletes this workspace and all associated data — members, campaigns, contacts, channels, and templates.{" "}
                <strong>This action cannot be undone.</strong>
              </p>
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-red-700">
                  Type <span className="font-mono bg-red-100 px-1 py-0.5 rounded">{expectedName}</span> to confirm deletion:
                </p>
                <input value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} placeholder={expectedName} className={cn("w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-mono placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all", canDelete ? "border-red-400 focus:ring-red-400/20" : "border-gray-200 focus:border-red-300 focus:ring-red-200/20")} />
                <button onClick={handleDelete} disabled={!canDelete || deleting} className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all", canDelete ? "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200" : "cursor-not-allowed bg-gray-100 text-gray-400")}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Permanently Delete Workspace
                </button>
              </div>
            </div>
          </div>
        </CardSection>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const sectionComponents: Record<Section, React.ComponentType> = {
  workspace: WorkspaceSection,
  profile: ProfileSection,
  team: TeamSection,
  notifications: NotificationsSection,
  billing: BillingSection,
  integrations: IntegrationsSection,
  security: SecuritySection,
  danger: DangerSection,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("workspace");
  const { isOwner, isAdmin } = usePermissions();
  const visibleNav = navItems.filter((item) => {
    if (item.ownerOnly) return isOwner;
    if (item.adminAndOwner) return isOwner || isAdmin;
    return true;
  });
  useEffect(() => {
    const visible = visibleNav.map((i) => i.id);
    if (!visible.includes(activeSection)) { setActiveSection(visible[0] ?? "profile"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, isAdmin]);
  const ActiveSection = sectionComponents[activeSection];
  return (
    <div className="min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your workspace, profile, team, billing, and security preferences.</p>
      </div>
      <div className="flex gap-8 items-start">
        <aside className="w-56 shrink-0 sticky top-4">
          <nav className="space-y-0.5">
            {visibleNav.map((item) => {
              const isActive = item.id === activeSection;
              const isDanger = item.id === "danger";
              return (
                <button key={item.id} id={`settings-nav-${item.id}`} onClick={() => setActiveSection(item.id)}
                  className={cn("w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-all duration-150",
                    isActive ? isDanger ? "bg-red-50 text-red-600" : "bg-[#e2f6d5] text-[#163300] font-bold"
                    : isDanger ? "text-red-500 hover:bg-red-50 hover:text-red-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")}>
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? isDanger ? "text-red-500" : "text-[#163300]" : isDanger ? "text-red-400" : "text-gray-400")} />
                  {item.label}
                  {isActive && <ChevronRight className={cn("ml-auto h-3.5 w-3.5", isDanger ? "text-red-400" : "text-[#163300]")} />}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}
