import { useState, FormEvent } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useWorkspace } from '../hooks/useWorkspace';
import { useCurrentRole } from '../hooks/useCurrentRole';
import * as workspaceService from '../services/workspace.service';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import type { Role } from '../types';

const ROLE_COLOR: Record<Role, string> = {
  OWNER: '#4ddac2',
  MEMBER: '#5b8fd9',
  VIEWER: '#7a8290',
};

export default function SettingsPage() {
  const { workspace, isLoading } = useWorkspace();
  const currentRole = useCurrentRole();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER');
  const [error, setError] = useState<string | null>(null);

  // Matches the backend rule exactly: OWNER or MEMBER can invite,
  // only OWNER can remove.
  const canInvite = currentRole === 'OWNER' || currentRole === 'MEMBER';
  const canRemove = currentRole === 'OWNER';

  const inviteMutation = useMutation({
    mutationFn: () => workspaceService.inviteMember(workspace!.id, { email, role }),
    onSuccess: () => {
      setEmail('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace!.slug] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Could not invite member'),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => workspaceService.removeMember(workspace!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace!.slug] });
    },
  });

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Enter a valid email address');
    inviteMutation.mutate();
  };

  if (isLoading || !workspace) {
    return (
      <div className="flex h-screen bg-[#0c0f14] items-center justify-center text-[#8b93a3] text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0c0f14] text-[#e8eaef] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />

        <main className="flex-1 overflow-y-auto p-6 max-w-2xl">
          <h2 className="text-[14px] font-medium text-[#c2c5cc] mb-4">Members</h2>

          <div className="border border-[#242b37] rounded-lg overflow-hidden mb-6">
            {workspace.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between px-4 py-3 border-b border-[#242b37] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#181d26] border border-[#242b37] flex items-center justify-center">
                    <span className="text-[11px] text-[#c2c5cc]">
                      {member.user.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#e8eaef]">{member.user.name}</p>
                    <p className="text-[11.5px] text-[#565f6f]">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="text-[10.5px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full border"
                    style={{
                      color: ROLE_COLOR[member.role],
                      borderColor: ROLE_COLOR[member.role] + '40',
                    }}
                  >
                    {member.role}
                  </span>

                  {canRemove && member.role !== 'OWNER' && (
                    <button
                      onClick={() => removeMutation.mutate(member.userId)}
                      disabled={removeMutation.isPending}
                      className="text-[11.5px] text-[#565f6f] hover:text-[#e0625f] disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {canInvite && (
            <>
              <h2 className="text-[14px] font-medium text-[#c2c5cc] mb-3">Invite a member</h2>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="flex-1 bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-3 py-2 placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2]"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'MEMBER' | 'VIEWER')}
                  className="bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-2.5 py-2 focus:outline-none focus:border-[#4ddac2]"
                >
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="bg-[#4ddac2] text-[#0c0f14] text-[13px] font-semibold px-4 rounded-md disabled:opacity-50"
                >
                  {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
                </button>
              </form>
              {error && <p className="text-[12px] text-[#e0625f] mt-2">{error}</p>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}