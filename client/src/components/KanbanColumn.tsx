import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Application, ApplicationStatus } from '../types';
import ApplicationCard from './ApplicationCard';

const COLUMN_STYLES: Record<ApplicationStatus, { wrapper: string; header: string }> = {
  Applied: {
    wrapper: 'bg-blue-50 border-blue-200',
    header: 'bg-blue-500',
  },
  'Phone Screen': {
    wrapper: 'bg-yellow-50 border-yellow-200',
    header: 'bg-yellow-500',
  },
  Interview: {
    wrapper: 'bg-purple-50 border-purple-200',
    header: 'bg-purple-500',
  },
  Offer: {
    wrapper: 'bg-green-50 border-green-200',
    header: 'bg-green-500',
  },
  Rejected: {
    wrapper: 'bg-red-50 border-red-200',
    header: 'bg-red-500',
  },
};

interface Props {
  status: ApplicationStatus;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, applications, onCardClick }: Props) {
  const styles = COLUMN_STYLES[status];

  return (
    <div className={`flex-shrink-0 w-72 rounded-xl border ${styles.wrapper} flex flex-col`}>
      <div className={`${styles.header} text-white rounded-t-xl px-4 py-3 flex items-center justify-between`}>
        <h3 className="font-semibold text-sm">{status}</h3>
        <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 min-h-[120px] transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-opacity-80' : ''
            }`}
          >
            {applications.map((app, index) => (
              <Draggable key={app._id} draggableId={app._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 last:mb-0 transition-transform ${
                      snapshot.isDragging ? 'rotate-1 shadow-xl' : ''
                    }`}
                  >
                    <ApplicationCard app={app} onClick={() => onCardClick(app)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {applications.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-center text-gray-400 mt-4">No applications</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
