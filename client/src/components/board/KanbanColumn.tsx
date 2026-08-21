import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue, IssueStatus } from '../../types';
import IssueCard from './IssueCard';

interface Column {
  id: IssueStatus;
  label: string;
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  canEdit: boolean;
}

export default function KanbanColumn({ column, issues, onIssueClick, canEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ background: column.color }} />
        <span className="text-[13px] font-medium text-[#c2c5cc]">{column.label}</span>
        <span className="ml-auto text-[11px] font-mono text-[#565f6f] bg-[#181d26] px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`rounded-lg p-2 min-h-[120px] transition-colors ${
          isOver ? 'bg-[#181d26]/60' : 'bg-[#12161d]/40'
        }`}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {issues.length === 0 && (
              <p className="text-[12px] text-[#565f6f] px-2 py-3 text-center">No issues</p>
            )}
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
                canEdit={canEdit}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}