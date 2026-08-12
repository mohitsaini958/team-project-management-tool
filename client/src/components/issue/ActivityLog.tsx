import type { ActivityLogEntry } from '../../types';

interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

export default function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <div>
        <p className="text-[11px] font-mono uppercase tracking-wide text-[#565f6f] mb-2">
          Activity
        </p>
        <p className="text-[12.5px] text-[#565f6f] italic">
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-wide text-[#565f6f] mb-3">
        Activity
      </p>
      <div className="space-y-2.5">
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-2 items-start">
            <div className="w-5 h-5 rounded-full bg-[#242b37] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] text-white">{entry.user.name[0]}</span>
            </div>
            <div className="text-[12.5px] leading-relaxed">
              <p>
                <span className="text-[#c2c5cc] font-medium">{entry.user.name}</span>
                <span className="text-[#565f6f]">
                  {' '}· {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p className="text-[#8b93a3] mt-0.5">{entry.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}