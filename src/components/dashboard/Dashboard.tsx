import React from 'react';
import { WelcomeCard } from './WelcomeCard';
import { UpcomingAppointments } from './UpcomingAppointments';
import { RecentAssessments } from './RecentAssessments';
import { AssessmentReminder } from './AssessmentReminder';
import { NotificationBadge } from './NotificationBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useAssessmentHistory } from '../../hooks/useAssessmentHistory';

export function Dashboard() {
  const { state: { user } } = useAuth();
  const { assessments, loading, error } = useAssessmentHistory(user?.id || 'current-user');

  const getLatestAssessment = () => {
    if (!assessments.length) return null;
    return assessments[0]; // Assessments are already sorted by date in the hook
  };

  const needsFollowUp = (assessment: any) => {
    if (!assessment) return false;
    const score = assessment.score;
    const type = assessment.assessmentId;

    switch (type) {
      case 'phq9':
        return score >= 10; // Moderate to severe depression
      case 'gad7':
        return score >= 10; // Moderate to severe anxiety
      default:
        return false;
    }
  };

  const getSeverity = (assessment: any) => {
    if (!assessment) return 'none';
    const score = assessment.score;
    
    if (score >= 15) return 'severe';
    if (score >= 10) return 'moderate';
    return 'mild';
  };

  const latestAssessment = getLatestAssessment();
  const pendingFollowUps = assessments.filter(a => needsFollowUp(a)).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <WelcomeCard />
        <NotificationBadge count={pendingFollowUps} />
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingAppointments />
        
        <div className="space-y-6">
          <RecentAssessments 
            assessments={assessments}
            onScheduleFollowUp={(id) => {
              // Handle follow-up scheduling
              console.log('Schedule follow-up for:', id);
            }}
          />

          {latestAssessment && needsFollowUp(latestAssessment) && (
            <AssessmentReminder
              assessmentType={latestAssessment.assessmentId === 'phq9' ? 'PHQ-9' : 'GAD-7'}
              lastCompletedDate={latestAssessment.completedAt}
              severity={getSeverity(latestAssessment)}
            />
          )}
        </div>
      </div>
    </div>
  );
}