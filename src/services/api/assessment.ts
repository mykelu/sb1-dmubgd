import { Assessment, AssessmentResponse } from '../../types/assessment';
import { EventEmitter } from '../../utils/eventEmitter';
import { PHQ9_TEMPLATE, GAD7_TEMPLATE } from '../../types/assessment';
import { saveAssessmentResponse, getUserAssessmentHistory as getStoredUserHistory } from '../storage/assessmentStorage';

// Real-time event emitter for assessment updates
export const assessmentEvents = new EventEmitter();

// Assessment templates storage
const assessmentTemplates = new Map<string, Assessment>([
  ['phq9', PHQ9_TEMPLATE],
  ['gad7', GAD7_TEMPLATE],
]);

// Mock assessment responses for testing
const mockAssessments: AssessmentResponse[] = [
  {
    id: 'mock-1',
    assessmentId: 'phq9',
    userId: 'current-user',
    responses: [
      { questionId: 'phq9_1', value: 2 },
      { questionId: 'phq9_2', value: 3 },
    ],
    score: 15,
    interpretation: 'Moderately severe depression - Active treatment with pharmacotherapy and/or psychotherapy',
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'mock-2',
    assessmentId: 'gad7',
    userId: 'current-user',
    responses: [
      { questionId: 'gad7_1', value: 2 },
      { questionId: 'gad7_2', value: 2 },
    ],
    score: 12,
    interpretation: 'Moderate anxiety - Consider counseling, follow-up and/or pharmacotherapy',
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
];

export async function getAssessmentTemplates(): Promise<Assessment[]> {
  return Array.from(assessmentTemplates.values());
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  return assessmentTemplates.get(id) || null;
}

export async function submitAssessmentResponse(
  response: Omit<AssessmentResponse, 'id' | 'score' | 'interpretation' | 'completedAt'>
): Promise<AssessmentResponse> {
  const assessment = await getAssessmentById(response.assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Calculate score based on assessment type
  const score = calculateScore(assessment, response.responses);
  const interpretation = interpretScore(assessment, score);

  const completeResponse: AssessmentResponse = {
    id: crypto.randomUUID(),
    assessmentId: response.assessmentId,
    userId: response.userId,
    responses: response.responses,
    score,
    interpretation,
    completedAt: new Date().toISOString(),
  };

  // Store the response
  saveAssessmentResponse(completeResponse);
  
  // Emit real-time event
  assessmentEvents.emit('responseSubmitted', completeResponse);
  
  return completeResponse;
}

export async function getUserAssessmentHistory(userId: string): Promise<AssessmentResponse[]> {
  // For testing, return mock data
  if (userId === 'current-user') {
    return mockAssessments;
  }
  return getStoredUserHistory(userId);
}

function calculateScore(assessment: Assessment, responses: AssessmentResponse['responses']): number {
  switch (assessment.scoring.calculation) {
    case 'sum':
      return responses.reduce((total, response) => total + Number(response.value), 0);
    case 'average':
      return Math.round(
        responses.reduce((total, response) => total + Number(response.value), 0) / responses.length
      );
    default:
      return 0;
  }
}

function interpretScore(assessment: Assessment, score: number): string {
  const range = assessment.scoring.ranges.find(r => score >= r.min && score <= r.max);
  return range?.description || 'Score interpretation not available';
}