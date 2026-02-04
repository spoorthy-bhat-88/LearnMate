import { useEffect, useState } from 'react';
import { Calendar, Trash2, BookOpen, CheckCircle2 } from 'lucide-react';
import { LearningSummary } from '../types';
import { getSummaries, deleteSummary } from '../services/storage';

interface Props {
  onSelectSummary: (summary: LearningSummary) => void;
}

export default function SummaryHistory({ onSelectSummary }: Props) {
  const [summaries, setSummaries] = useState<LearningSummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<LearningSummary | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = () => {
    const stored = getSummaries();
    setSummaries(stored.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this learning summary?')) {
      deleteSummary(id);
      loadSummaries();
      if (selectedSummary?.id === id) {
        setSelectedSummary(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (summaries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Learning History Yet
          </h2>
          <p className="text-gray-600">
            Start learning a new topic to see your progress here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summaries List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning History</h2>
        {summaries.map(summary => (
          <div
            key={summary.id}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedSummary?.id === summary.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedSummary(summary)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {summary.topic}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(summary.date)}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all"
                      style={{ width: `${summary.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {summary.progress}%
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(summary.id);
                }}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Details */}
      <div className="lg:col-span-2">
        {selectedSummary ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedSummary.topic}
              </h2>
              <p className="text-gray-600">{formatDate(selectedSummary.date)}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all"
                    style={{ width: `${selectedSummary.progress}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-primary-600">
                  {selectedSummary.progress}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Learning Steps
              </h3>
              {selectedSummary.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    step.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {index + 1}. {step.title}
                      </h4>
                      <p className="text-gray-700 text-sm">{step.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Learning Session
            </h3>
            <p className="text-gray-600">
              Choose a topic from the list to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
