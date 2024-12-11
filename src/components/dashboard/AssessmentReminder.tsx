import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';

interface AssessmentReminderProps {
  assessmentType: string;
  lastCompletedDate: string;
  severity: string;
}

export function AssessmentReminder({ assessmentType, lastCompletedDate, severity }: AssessmentReminderProps) {
  const getFollowUpDate = () => {
    const baseDate = new Date(lastCompletedDate);
    switch (severity) {
      case 'severe':
        return addDays(baseDate, 1); // Next day for severe cases
      case 'moderate':
        return addDays(baseDate, 2); // 2 days for moderate cases
      default:
        return addDays(baseDate, 3); // 3 days for mild cases
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Follow-up Assessment Recommended
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Based on your last {assessmentType} results, we recommend taking a follow-up assessment on{' '}
              <strong>{format(getFollowUpDate(), 'MMMM d, yyyy')}</strong>.
            </p>
          </div>
          <div className="mt-3">
            <Link
              to="/assessments"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}