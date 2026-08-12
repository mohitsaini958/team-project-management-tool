import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as issueService from '../services/issue.service';
import Sidebar from '../components/layout/Sidebar';
import KanbanBoard from '../components/board/KanbanBoard';
import IssuePanel from '../components/issue/IssuePanel';
import type { Issue } from '../types';

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

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
            <KanbanBoard
              issues={localIssues}
              onIssueClick={(issue) => setSelectedIssueId(issue.id)}
              onIssuesChange={setLocalIssues}
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
    </div>
  );
}