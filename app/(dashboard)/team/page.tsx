"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  User,
  Mail,
  Clock,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import {
  teamService,
  TenantMember,
  TeamInvitation,
  RoleType,
} from "@/lib/services/team.service";
import { authService } from "@/lib/services/auth.service";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function TeamManagementPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);

  // Edit Role Modal State
  const [editingMember, setEditingMember] = useState<TenantMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>("member");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Remove Member State
  const [removingMember, setRemovingMember] = useState<TenantMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Revoke Invitation State
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      const [teamData, authData] = await Promise.all([
        teamService.listTeam(),
        authService.syncUser().catch(() => null),
      ]);

      setMembers(teamData.members || []);
      setInvitations(teamData.invitations || []);

      if (authData?.user) {
        setCurrentUserRole(authData.user.role || "member");
        setCurrentUserId(authData.user.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to load team data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeamData();
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      const res = await teamService.inviteMember(inviteEmail, inviteRole);
      toast.success(res.message || "Invitation sent successfully via Brevo!");
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      fetchTeamData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to dispatch invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId);
    try {
      await teamService.revokeInvitation(invitationId);
      toast.success("Invitation successfully revoked");
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to revoke invitation");
    } finally {
      setRevokingId(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;
    setIsUpdatingRole(true);
    try {
      await teamService.updateMemberRole(editingMember.id, selectedRole);
      toast.success(`Role updated to ${selectedRole}`);
      setEditingMember(null);
      fetchTeamData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update member role");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    setIsRemoving(true);
    try {
      await teamService.removeMember(removingMember.id);
      toast.success("Team member successfully removed");
      setRemovingMember(null);
      fetchTeamData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const isOwner = currentUserRole.toLowerCase() === "owner";
  const isAdmin = currentUserRole.toLowerCase() === "admin";
  const canInvite = isOwner || isAdmin;

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200">
            <User className="h-3.5 w-3.5 text-gray-500" />
            Member
          </span>
        );
    }
  };

  const getDisplayEmail = (member: TenantMember, isCurrentUser: boolean) => {
    if (member.email && !member.email.includes("@placeholder.com")) {
      return member.email;
    }
    if (isCurrentUser && user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress;
    }
    return `Team Member (${member.user_id.slice(0, 10)}...)`;
  };

  const getInitials = (email: string, isCurrentUser = false) => {
    if (isCurrentUser && user?.fullName) {
      const parts = user.fullName.trim().split(" ");
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (!email || email.includes("@placeholder.com")) return "TM";
    const parts = email.split("@")[0].split(".");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (email: string) => {
    const colors = [
      "bg-indigo-600",
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-slate-700",
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-gray-500">Loading workspace team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Team &amp; Access Controls
              </h1>
              <p className="text-sm text-gray-500">
                Manage workspace members, collaborate on campaigns, and enforce role permissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            title="Refresh team members"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {canInvite && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Invite Teammate
            </button>
          )}
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <Crown className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Workspace Owner</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Full administrative control, billing &amp; plan management, workspace settings, role assignments, and member deletion.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Workspace Admin</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Manages broadcasts, templates, contacts, WhatsApp/Telegram channels, and invites new collaborators with the member role.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              <User className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Team Member</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Can compose, schedule, and view broadcasts, explore audience directory, and inspect campaign performance analytics.
          </p>
        </div>
      </div>

      {/* Active Team Members Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Active Members</h2>
            <span className="rounded-full bg-gray-200/70 px-2 py-0.5 text-xs font-medium text-gray-700">
              {members.length}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Your current role: <strong className="text-gray-900 capitalize">{currentUserRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teammate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                {isOwner && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => {
                const isCurrentUser = member.user_id === currentUserId;
                return (
                  <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full ${getAvatarBg(
                            getDisplayEmail(member, isCurrentUser)
                          )} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                        >
                          {getInitials(member.email, isCurrentUser)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {getDisplayEmail(member, isCurrentUser)}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">ID: {member.user_id.slice(0, 14)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(member.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setSelectedRole(member.role);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 hover:underline px-2 py-1"
                          >
                            Change Role
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => setRemovingMember(member)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Pending Invitations</h2>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium">
              {invitations.length}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Invited via Brevo transactional email
          </span>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">No pending invitations</p>
            <p className="text-xs text-gray-400 mt-1">
              Invite coworkers or agency staff to grant them access to this workspace.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  {canInvite && (
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(inv.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.inviter_email || "Teammate"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="h-3 w-3" />
                        {new Date(inv.expires_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    {canInvite && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          disabled={revokingId === inv.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {revokingId === inv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Revoke
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              Invite Teammate
            </DialogTitle>
            <DialogDescription>
              We'll send a branded invitation link via Brevo to grant them access to this workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div>
              <label htmlFor="invite-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Collaborator Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Permission Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInviteRole("member")}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    inviteRole === "member"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">Member</span>
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-[11px] text-gray-500 leading-snug">
                    Can draft broadcasts and view contacts &amp; analytics.
                  </span>
                </button>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setInviteRole("admin")}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      inviteRole === "admin"
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">Admin</span>
                      <Shield className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-[11px] text-gray-500 leading-snug">
                      Manages channels, campaigns, and invites members.
                    </span>
                  </button>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching via Brevo...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Workspace Role</DialogTitle>
            <DialogDescription>
              Update permissions for <strong>{editingMember?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {[
              {
                id: "owner",
                title: "Owner",
                icon: Crown,
                desc: "Full administrative access, billing, and team management.",
              },
              {
                id: "admin",
                title: "Admin",
                icon: Shield,
                desc: "Manages broadcasts, channels, contacts, and invites members.",
              },
              {
                id: "member",
                title: "Member",
                icon: User,
                desc: "Drafts broadcasts, views directory, and monitors statistics.",
              },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id as RoleType)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setEditingMember(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateRole}
              disabled={isUpdatingRole}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {isUpdatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removingMember?.email}</strong> from this workspace? They will immediately lose access to all campaigns, templates, and connected channels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
