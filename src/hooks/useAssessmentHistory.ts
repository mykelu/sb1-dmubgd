import { useState, useEffect } from 'react';
import { AssessmentResponse } from '../types/assessment';
import { getUserAssessmentHistory } from '../services/api/assessment';

export function useAssessmentHistory(userId: string) {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        if (!userId) {
          throw new Error('User ID is required');
        }
        const data = await getUserAssessmentHistory(userId);
        // Sort assessments by date, most recent first
        const sortedData = [...data].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        setAssessments(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId]);

  return { assessments, loading, error };
}