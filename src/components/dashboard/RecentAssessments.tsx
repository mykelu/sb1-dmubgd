import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, ArrowRight } from 'lucide-react';
import { AssessmentResponse } from '../../types/assessment';
import { format, parseISO } from 'date-fns';

interface RecentAssessmentsProps {
  assessments: AssessmentResponse[];
  onScheduleFollowUp?: (assessmentId: string) => void;
}

export function RecentAssessments({ assessments, onScheduleFollowUp }: RecentAssessmentsProps) {
  const sortedAssessments = [...assessments]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  const needsFollowUp = (score: number, type: string) => {
    switch (type) {
      case 'PHQ9':
        return score >= 10; // Moderate to severe depression
      case 'GAD7':
        return score >= 10; // Moderate to severe anxiety
      default:
        return false;
    }
  };

  if (assessments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Assessments</h3>
        <div className="mt-4 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No assessments taken yet</p>
          <Link
            to="/assessments"
            className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            Take your first assessment
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Assessments</h3>
        <Link
          to="/assessments/history"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {sortedAssessments.map((assessment) => {
          const requiresFollowUp = needsFollowUp(assessment.score, assessment.assessmentId);

          return (
            <div
              key={assessment.id}
              className="border-l-4 border-indigo-400 bg-indigo-50 p-4 rounded-r-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {assessment.assessmentId === 'phq9' ? 'PHQ-9 Depression Scale' : 'GAD-7 Anxiety Scale'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Score: {assessment.score} - {assessment.interpretation}
                  </p>
                  <p className="text-xs text-gray-500">
                    Completed {format(parseISO(assessment.completedAt), 'MMM d, yyyy')}
                  </p>
                </div>

                {requiresFollowUp && (
                  <div className="flex items-start">
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <button
                      onClick={() => onScheduleFollowUp?.(assessment.id)}
                      className="ml-2 text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Schedule Follow-up
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}