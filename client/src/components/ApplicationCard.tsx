import React from 'react';
import { Building2, Briefcase, Calendar, MapPin } from 'lucide-react';
import { Application } from '../types';

interface Props {
  app: Application;
  onClick: () => void;
}

export default function ApplicationCard({ app, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all select-none"
    >
      <div className="flex items-start gap-2 mb-1.5">
        <Building2 size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
          {app.company}
        </p>
      </div>
      <div className="flex items-start gap-2 mb-3">
        <Briefcase size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-gray-600 text-sm leading-tight line-clamp-1">{app.role}</p>
      </div>

      {app.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {app.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
          {app.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{app.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
        </div>
        {app.location && (
          <div className="flex items-center gap-1">
            <MapPin size={11} />
            <span className="line-clamp-1 max-w-[80px]">{app.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
