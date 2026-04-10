import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Columns } from 'lucide-react';
import { Application } from '../types';
import * as applicationsApi from '../api/applications';
import Navbar from '../components/Navbar';
import KanbanBoard from '../components/KanbanBoard';
import ApplicationModal from '../components/ApplicationModal';

export default function KanbanPage() {
  // undefined = closed, null = create new, Application = view/edit existing
  const [modalState, setModalState] = useState<Application | null | undefined>(undefined);

  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.getApplications,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-6 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {applications.length === 0
                ? 'Track your job search here'
                : `${applications.length} application${applications.length !== 1 ? 's' : ''} tracked`}
            </p>
          </div>
          <button
            onClick={() => setModalState(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Application
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 font-medium">Failed to load applications</p>
            <p className="text-gray-400 text-sm mt-1">Please check your connection and refresh</p>
          </div>
        )}

        {!isLoading && !isError && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Columns size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your board is empty</h3>
            <p className="text-gray-400 text-sm mb-6">
              Click &ldquo;Add Application&rdquo; to start. Paste a job description and let AI fill
              in the details.
            </p>
            <button
              onClick={() => setModalState(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors"
            >
              <Plus size={18} />
              Add Your First Application
            </button>
          </div>
        )}

        {!isLoading && !isError && applications.length > 0 && (
          <KanbanBoard
            applications={applications}
            onCardClick={(app) => setModalState(app)}
          />
        )}
      </main>

      {modalState !== undefined && (
        <ApplicationModal app={modalState} onClose={() => setModalState(undefined)} />
      )}
    </div>
  );
}
