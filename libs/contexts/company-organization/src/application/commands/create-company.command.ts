export interface CreateCompanyCommand {
  actorUserId: string;
  name: string;
  industryId: string | null;
  cityId: string | null;
  companyType: string | null;
  establishedYear: number | null;
  description: string | null;
  whatWeOffer: string | null;
  awardsRecognition: string | null;
  keyProductsServices: string | null;
  recruitmentHighlights: string | null;
  placementStats: string | null;
  inquiryEmail: string | null;
}
