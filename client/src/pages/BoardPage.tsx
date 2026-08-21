import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as issueService from '../services/issue.service';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import KanbanBoard from '../components/board/KanbanBoard';
import IssuePanel from '../components/issue/IssuePanel';
import { useCurrentRole } from '../hooks/useCurrentRole';
import type { Issue } from '../types';

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const currentRole = useCurrentRole();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showNewIssue, setShowNewIssue] = useState(false);

  // Local copy of issues that KanbanBoard can mutate instantly during drag,
  // without waiting for a server round-trip on every frame.
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => issueService.getProjectIssues(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  // VIEWER can look at the board but never create or edit — mirrors the
  // backend's requireWorkspaceRole(["OWNER", "MEMBER"]) check on create.
  const canEdit = currentRole === 'OWNER' || currentRole === 'MEMBER';

  return (
    <div className="flex h-screen bg-[#0c0f14] text-[#e8eaef] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Board"
          action={
            canEdit && (
              <button
                onClick={() => setShowNewIssue(true)}
                className="bg-[#4ddac2] text-[#0c0f14] text-[12.5px] font-semibold px-3 py-1.5 rounded-md transition-transform hover:-translate-y-px"
              >
                + New Issue
              </button>
            )
          }
        />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[#8b93a3] text-sm">
            Loading issues...
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-6">
            <KanbanBoard
              issues={localIssues}
              onIssueClick={(issue) => setSelectedIssueId(issue.id)}
              onIssuesChange={setLocalIssues}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>

      {selectedIssueId && (
        <IssuePanel
          issueId={selectedIssueId}
          projectId={projectId!}
          onClose={() => setSelectedIssueId(null)}
        />
      )}

      {showNewIssue && (
        <NewIssueModal
          projectId={projectId!}
          onClose={() => setShowNewIssue(false)}
          onCreated={() => {
            setShowNewIssue(false);
            queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
          }}
        />
      )}
    </div>
  );
}

function NewIssueModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => issueService.createIssue(projectId, { title }),
    onSuccess: onCreated,
    onError: (err: any) => setError(err.response?.data?.message || 'Could not create issue'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters');
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="bg-[#12161d] border border-[#242b37] rounded-xl p-6 w-full max-w-sm">
        <h2 className="font-display font-semibold text-lg mb-4">New issue</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fix login redirect bug"
            className="w-full bg-[#0c0f14] border border-[#242b37] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2] mb-1"
          />
          {error && <p className="text-xs text-[#e0625f] mt-1.5 mb-2">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#242b37] rounded-lg py-2.5 text-[13.5px] font-medium text-[#8b93a3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[#4ddac2] text-[#0c0f14] rounded-lg py-2.5 text-[13.5px] font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}