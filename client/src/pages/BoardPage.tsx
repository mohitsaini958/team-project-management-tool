import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as issueService from '../services/issue.service';
import Sidebar from '../components/layout/Sidebar';
import type { Issue, IssueStatus } from '../types';

const COLUMNS: { id: IssueStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: '#7a8290' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#5b8fd9' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#e0a840' },
  { id: 'DONE', label: 'Done', color: '#4ddac2' },
];

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#565f6f',
  MEDIUM: '#5b8fd9',
  HIGH: '#e0a840',
  URGENT: '#e0625f',
};

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => issueService.getProjectIssues(projectId!),
    enabled: !!projectId,
  });

  const getColumnIssues = (status: IssueStatus) =>
    issues.filter((i) => i.status === status).sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-screen bg-[#0c0f14] text-[#e8eaef] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-[#242b37] px-6 py-4">
          <h1 className="font-display font-semibold text-[15px]">Board</h1>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[#8b93a3] text-sm">
            Loading issues...
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4 h-full">
              {COLUMNS.map((column) => (
                <div key={column.id} className="w-72 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: column.color }}
                    />
                    <span className="text-[13px] font-medium text-[#c2c5cc]">
                      {column.label}
                    </span>
                    <span className="ml-auto text-[11px] font-mono text-[#565f6f] bg-[#181d26] px-2 py-0.5 rounded-full">
                      {getColumnIssues(column.id).length}
                    </span>
                  </div>

                  <div className="bg-[#12161d]/40 rounded-lg p-2 min-h-[120px] space-y-2">
                    {getColumnIssues(column.id).length === 0 && (
                      <p className="text-[12px] text-[#565f6f] px-2 py-3 text-center">
                        No issues
                      </p>
                    )}
                    {getColumnIssues(column.id).map((issue) => (
                      <IssueCardStatic key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Static, non-draggable card for this phase — drag-and-drop, the slide-in
// detail panel, and activity log all get added on top of this in Phase 4.
// The point right now is just: does the data render correctly, grouped
// and sorted the way the board expects.
function IssueCardStatic({ issue }: { issue: Issue }) {
  return (
    <div className="bg-[#181d26] border border-[#242b37] rounded-md p-3">
      <p className="text-[13px] font-medium leading-snug text-[#e8eaef] mb-2">
        {issue.title}
      </p>
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-mono"
          style={{ color: PRIORITY_COLOR[issue.priority] }}
        >
          {issue.priority}
        </span>
        {issue.assignee && (
          <div className="w-5 h-5 rounded-full bg-[#5b8fd9] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-white font-medium">
              {issue.assignee.name[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}