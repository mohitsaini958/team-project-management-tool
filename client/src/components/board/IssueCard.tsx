import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Issue } from '../../types';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#565f6f',
  MEDIUM: '#5b8fd9',
  HIGH: '#e0a840',
  URGENT: '#e0625f',
};

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  canEdit: boolean;
}

export default function IssueCard({ issue, onClick, canEdit }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Drag attributes/listeners only spread for editors — a VIEWER
      // can still click to open the panel, but the card never becomes
      // draggable, so there's no drag-then-silently-fail UX.
      {...(canEdit ? attributes : {})}
      {...(canEdit ? listeners : {})}
      onClick={onClick}
      className={`bg-[#181d26] border border-[#242b37] hover:border-[#2f3947] rounded-md p-3 cursor-pointer transition-colors ${
        canEdit ? '' : 'cursor-default'
      }`}
    >
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