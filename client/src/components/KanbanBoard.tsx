import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Application, ApplicationStatus, KANBAN_COLUMNS } from '../types';
import * as applicationsApi from '../api/applications';
import KanbanColumn from './KanbanColumn';

interface Props {
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanBoard({ applications, onCardClick }: Props) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.updateApplication(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previous = queryClient.getQueryData<Application[]>(['applications']);
      queryClient.setQueryData<Application[]>(['applications'], (old) =>
        old ? old.map((a) => (a._id === id ? { ...a, status } : a)) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['applications'], context.previous);
      }
      toast.error('Failed to move card');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    updateMutation.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
