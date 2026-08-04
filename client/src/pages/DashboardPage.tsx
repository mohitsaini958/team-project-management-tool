import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import * as workspaceService from '../services/workspace.service';
import * as projectService from '../services/project.service';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],                  
    queryFn: workspaceService.getMyWorkspaces,
  });

  // Free tier is one workspace — use the first one as "current" for now.
  // If they have none yet (brand new account), show the create-workspace flow.
  const currentWorkspace = workspaces[0];

  const { data: workspaceDetail } = useQuery({
    queryKey: ['workspace', currentWorkspace?.slug],
    queryFn: () => workspaceService.getWorkspaceBySlug(currentWorkspace!.slug),
    enabled: !!currentWorkspace,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center text-[#8b93a3] text-sm">
        Loading...
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <CreateWorkspacePrompt
        show={showNewWorkspace}
        onOpen={() => setShowNewWorkspace(true)}
        onClose={() => setShowNewWorkspace(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['workspaces'] })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f14] text-[#e8eaef]">
      <header className="border-b border-[#242b37] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-semibold text-[15px]">
          <div className="w-4 h-4 relative">
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#7a8290] top-0 left-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#5b8fd9] top-0 right-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#e0a840] bottom-0 left-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#4ddac2] bottom-0 right-0" />
          </div>
          {currentWorkspace.name}
        </div>
        <button onClick={logout} className="text-[13px] text-[#565f6f] hover:text-[#e0625f]">
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-semibold text-xl">Projects</h1>
          <button
            onClick={() => setShowNewProject(true)}
            className="bg-[#4ddac2] text-[#0c0f14] text-[13.5px] font-semibold px-3.5 py-2 rounded-lg transition-transform hover:-translate-y-px"
          >
            + New Project
          </button>
        </div>

        {(!workspaceDetail?.projects || workspaceDetail.projects.length === 0) && (
          <div className="border border-dashed border-[#242b37] rounded-xl p-10 text-center">
            <p className="text-[#8b93a3] text-sm">
              No projects yet. Create your first one to get started.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workspaceDetail?.projects?.map((project) => (
            <button
              key={project.id}
              onClick={() =>
                navigate(`/workspace/${currentWorkspace.slug}/project/${project.id}`)
              }
              className="text-left bg-[#12161d] border border-[#242b37] rounded-xl p-4 hover:border-[#2f3947] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 bg-[#5b8fd9]"
                />
                <span className="font-medium text-[14.5px]">{project.name}</span>
              </div>
              {project.description && (
                <p className="text-[12.5px] text-[#8b93a3] mb-2 line-clamp-2">
                  {project.description}
                </p>
              )}
              <p className="text-[11.5px] text-[#565f6f] font-mono">
                {project._count?.issues ?? 0} issues
              </p>
            </button>
          ))}
        </div>
      </main>

      {showNewProject && (
        <NewProjectModal
          workspaceId={currentWorkspace.id}
          onClose={() => setShowNewProject(false)}
          onCreated={() => {
            setShowNewProject(false);
            queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace.slug] });
          }}
        />
      )}
    </div>
  );
}

function NewProjectModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => projectService.createProject(workspaceId, { name }),
    onSuccess: onCreated,
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Could not create project'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="bg-[#12161d] border border-[#242b37] rounded-xl p-6 w-full max-w-sm">
        <h2 className="font-display font-semibold text-lg mb-4">New project</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">
            Project name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Frontend Redesign"
            className="w-full bg-[#0c0f14] border border-[#242b37] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:ring-[3px] focus:ring-[#4ddac2]/20 focus:border-[#4ddac2] mb-1"
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

function CreateWorkspacePrompt({
  show,
  onOpen,
  onClose,
  onCreated,
}: {
  show: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => workspaceService.createWorkspace({ name, slug }),
    onSuccess: onCreated,
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Could not create workspace'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return setError('Name must be at least 3 characters');
    if (slug.trim().length < 3) return setError('Slug must be at least 3 characters');
    if (!/^[a-z0-9-]+$/.test(slug)) return setError('Slug can only contain lowercase letters, numbers, and hyphens');
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {!show ? (
          <>
            <h1 className="font-display font-semibold text-xl mb-2 text-[#e8eaef]">
              Create your first workspace
            </h1>
            <p className="text-[#8b93a3] text-[13.5px] mb-6">
              A workspace holds your projects and team.
            </p>
            <button
              onClick={onOpen}
              className="bg-[#4ddac2] text-[#0c0f14] font-semibold text-[14px] px-5 py-2.5 rounded-lg"
            >
              Create workspace
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="text-left bg-[#12161d] border border-[#242b37] rounded-xl p-6">
            <label className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Frontend Team"
              className="w-full bg-[#0c0f14] border border-[#242b37] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2] mb-4"
            />
            <label className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">
              URL slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="frontend-team"
              className="w-full bg-[#0c0f14] border border-[#242b37] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:border-[#4ddac2]"
            />
            {error && <p className="text-xs text-[#e0625f] mt-2">{error}</p>}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#4ddac2] text-[#0c0f14] font-semibold text-[14px] py-2.5 rounded-lg mt-5 disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating...' : 'Create workspace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}