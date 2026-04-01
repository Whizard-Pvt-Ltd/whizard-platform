export enum ContactRole {
  HrCoordinator           = 'HR_COORDINATOR',
  CommunicationCoordinator = 'COMMUNICATION_COORDINATOR',
  RecruitmentHead         = 'RECRUITMENT_HEAD',
  TrainingCoordinator     = 'TRAINING_COORDINATOR',
  InternshipMentor        = 'INTERNSHIP_MENTOR',
}

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  [ContactRole.HrCoordinator]:            'HR Coordinators',
  [ContactRole.CommunicationCoordinator]: 'Communication Coordinator',
  [ContactRole.RecruitmentHead]:          'Recruitment Head',
  [ContactRole.TrainingCoordinator]:      'Training Coordinator',
  [ContactRole.InternshipMentor]:         'Internship Mentor',
};
