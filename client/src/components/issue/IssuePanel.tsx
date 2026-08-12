import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import * as issueService from '../../services/issue.service';
import type { IssueStatus, IssuePriority } from '../../types';
import ActivityLog from './ActivityLog';

const STATUS_OPTIONS: IssueStatus[] = ['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_OPTIONS: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface IssuePanelProps {
  issueId: string;
  projectId: string;
  onClose: () => void;
}

export default function IssuePanel({ issueId, projectId, onClose }: IssuePanelProps) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Full detail — comments and activityLogs only exist on this endpoint,
  // not on the board's list query.
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueService.getIssueById(issueId),
  });

  const invalidateBoth = () => {
    queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
    queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
  };

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof issueService.updateIssue>[1]) =>
      issueService.updateIssue(issueId, data),
    onSuccess: invalidateBoth,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => issueService.createComment(issueId, content),
    onSuccess: () => {
      setCommentText('');
      invalidateBoth();
    },
  });

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed.length === 0) return;
    commentMutation.mutate(trimmed);
  };

  if (isLoading || !issue) {
    return (
      <div className="w-[420px] flex-shrink-0 border-l border-[#242b37] bg-[#0c0f14] flex items-center justify-center">
        <p className="text-[#8b93a3] text-sm">Loading...</p>
      </div>
    );
  }

  const currentDescription = description ?? issue.description ?? '';

  return (
    <div className="w-[420px] flex-shrink-0 border-l border-[#242b37] bg-[#0c0f14] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#242b37]">
        <span className="text-[#565f6f] text-[11px] font-mono">
          ISSUE-{issue.id.slice(-6).toUpperCase()}
        </span>
        <button onClick={onClose} className="text-[#8b93a3] hover:text-[#e8eaef] transition-colors">
          <X size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <h2 className="text-[#e8eaef] text-[16px] font-semibold leading-snug">
          {issue.title}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[#565f6f] mb-1.5">Status</label>
            <select
              value={issue.status}
              onChange={(e) => updateMutation.mutate({ status: e.target.value as IssueStatus })}
              className="w-full bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4ddac2]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#565f6f] mb-1.5">Priority</label>
            <select
              value={issue.priority}
              onChange={(e) => updateMutation.mutate({ priority: e.target.value as IssuePriority })}
              className="w-full bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#4ddac2]"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-[#565f6f] mb-1.5">Description</label>
          <textarea
            value={currentDescription}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (currentDescription !== (issue.description ?? '')) {
                updateMutation.mutate({ description: currentDescription });
              }
            }}
            placeholder="Add a description..."
            rows={4}
            className="w-full bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-3 py-2 placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2] resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#565f6f] mb-1.5">Reporter</label>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#5b8fd9] flex items-center justify-center">
              <span className="text-[10px] text-white">{issue.reporter?.name?.[0]}</span>
            </div>
            <span className="text-[13px] text-[#c2c5cc]">{issue.reporter?.name}</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-wide text-[#565f6f] mb-3">
            Comments ({issue.comments.length})
          </p>

          <div className="space-y-3 mb-3">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-[#242b37] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-white">{comment.author.name[0]}</span>
                </div>
                <div>
                  <span className="text-[11.5px] text-[#8b93a3]">{comment.author.name}</span>
                  <p className="text-[13px] text-[#e8eaef] mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
            {issue.comments.length === 0 && (
              <p className="text-[12.5px] text-[#565f6f] italic">No comments yet.</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#12161d] border border-[#242b37] text-[#e8eaef] text-[13px] rounded-md px-3 py-2 placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2]"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending || commentText.trim().length === 0}
              className="bg-[#4ddac2] text-[#0c0f14] text-[13px] font-semibold px-3.5 rounded-md disabled:opacity-40"
            >
              Post
            </button>
          </form>
        </div>

        <ActivityLog entries={issue.activityLogs} />
      </div>
    </div>
  );
}