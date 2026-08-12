import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import * as issueService from '../../services/issue.service';
import type { Issue, IssueStatus } from '../../types';
import KanbanColumn from './KanbanColumn';

const COLUMNS: { id: IssueStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: '#7a8290' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#5b8fd9' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#e0a840' },
  { id: 'DONE', label: 'Done', color: '#4ddac2' },
];

interface KanbanBoardProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onIssuesChange: (issues: Issue[]) => void;
}

export default function KanbanBoard({ issues, onIssueClick, onIssuesChange }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getColumnIssues = (status: IssueStatus) =>
    issues.filter((i) => i.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    setActiveIssue(issue || null);
  };

  // Moves the card visually between columns as the user drags —
  // this is a local-only preview, nothing is saved yet.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = issues.find((i) => i.id === activeId);
    if (!activeItem) return;

    const targetStatus =
      COLUMNS.find((c) => c.id === overId)?.id ||
      issues.find((i) => i.id === overId)?.status;

    if (!targetStatus || activeItem.status === targetStatus) return;

    onIssuesChange(
      issues.map((issue) =>
        issue.id === activeId ? { ...issue, status: targetStatus } : issue
      )
    );
  };

  // On drop: recompute order for every column, then persist via the
  // real batch reorder endpoint — one request, wrapped in a transaction
  // on the backend, instead of firing individual PATCH calls per card.
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);
    if (!event.over) return;

    const updated = [...issues];
    const changes: { id: string; status: IssueStatus; order: number }[] = [];

    COLUMNS.forEach(({ id: status }) => {
      const columnIssues = updated
        .filter((i) => i.status === status)
        .sort((a, b) => a.order - b.order);

      columnIssues.forEach((issue, index) => {
        if (issue.status !== status || issue.order !== index) {
          changes.push({ id: issue.id, status, order: index });
        }
        const target = updated.find((i) => i.id === issue.id)!;
        target.status = status;
        target.order = index;
      });
    });

    onIssuesChange(updated);

    if (changes.length === 0) return;

    try {
      await issueService.reorderIssues(changes);
    } catch {
      // Board may show a stale position until the next refetch —
      // acceptable for now; a toast/error state can be added later.
      console.error('Failed to persist issue positions');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            issues={getColumnIssues(column.id)}
            onIssueClick={onIssueClick}
          />
        ))}
      </div>
    </DndContext>
  );
}