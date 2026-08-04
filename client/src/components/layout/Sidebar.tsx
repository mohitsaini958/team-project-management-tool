import { NavLink, useParams } from 'react-router-dom';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { slug } = useParams<{ slug: string }>();
  const { workspace, isLoading } = useWorkspace();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex-shrink-0 bg-[#12161d] border-r border-[#242b37] flex flex-col h-screen">
      <div className="px-4 py-4 border-b border-[#242b37]">
        <div className="flex items-center gap-2 font-display font-semibold text-sm text-[#e8eaef]">
          <div className="w-4 h-4 relative flex-shrink-0">
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#7a8290] top-0 left-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#5b8fd9] top-0 right-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#e0a840] bottom-0 left-0" />
            <span className="absolute w-[7px] h-[7px] rounded-sm bg-[#4ddac2] bottom-0 right-0" />
          </div>
          {isLoading ? 'Loading...' : workspace?.name || 'Workspace'}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="text-[10.5px] font-mono uppercase tracking-wide text-[#565f6f] px-2 mb-2">
          Projects
        </div>

        {isLoading && (
          <div className="px-2 py-1.5 text-[13px] text-[#565f6f]">Loading...</div>
        )}

        {workspace?.projects?.length === 0 && (
          <div className="px-2 py-1.5 text-[13px] text-[#565f6f]">No projects yet</div>
        )}

        {workspace?.projects?.map((project) => (
          <NavLink
            key={project.id}
            to={`/workspace/${slug}/project/${project.id}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                isActive
                  ? 'bg-[#181d26] text-[#e8eaef]'
                  : 'text-[#8b93a3] hover:bg-[#181d26] hover:text-[#e8eaef]'
              }`
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#5b8fd9]"
            />
            <span className="truncate">{project.name}</span>
            {project._count && (
              <span className="ml-auto text-[11px] text-[#565f6f]">
                {project._count.issues}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-[#242b37] space-y-1">
        <NavLink
          to={`/workspace/${slug}/settings`}
          className={({ isActive }) =>
            `block px-2 py-1.5 rounded-md text-[13px] transition-colors ${
              isActive
                ? 'bg-[#181d26] text-[#e8eaef]'
                : 'text-[#8b93a3] hover:bg-[#181d26] hover:text-[#e8eaef]'
            }`
          }
        >
          Settings
        </NavLink>

        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[12px] text-[#565f6f] truncate">{user?.email}</span>
          <button
            onClick={logout}
            className="text-[12px] text-[#565f6f] hover:text-[#e0625f] flex-shrink-0"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}