import type { ContactRole } from '../value-objects/contact-role.vo.js';
import type { MediaRole } from '../value-objects/media-role.vo.js';
import { CompanyStatus } from '../value-objects/company-status.vo.js';

export interface CompanyMediaItem {
  mediaAssetId: string;
  mediaRole: MediaRole;
  sortOrder: number;
}

export interface CompanyContactItem {
  userId: string;
  role: ContactRole;
}

export interface CompanyClubItem {
  clubId: string;
  isParent: boolean;
}

export interface CompanyProps {
  id: string;
  tenantId: string;
  industryId: string | null;
  companyCode: string;
  name: string;
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
  status: CompanyStatus;
  isActive: boolean;
  createdBy: string;
  clubs: CompanyClubItem[];
  mediaItems: CompanyMediaItem[];
  contacts: CompanyContactItem[];
}

export class Company {
  readonly id: string;
  readonly tenantId: string;
  private _industryId: string | null;
  readonly companyCode: string;
  private _name: string;
  private _cityId: string | null;
  private _companyType: string | null;
  private _establishedYear: number | null;
  private _description: string | null;
  private _whatWeOffer: string | null;
  private _awardsRecognition: string | null;
  private _keyProductsServices: string | null;
  private _recruitmentHighlights: string | null;
  private _placementStats: string | null;
  private _inquiryEmail: string | null;
  private _status: CompanyStatus;
  readonly isActive: boolean;
  readonly createdBy: string;
  private _clubs: CompanyClubItem[];
  private _mediaItems: CompanyMediaItem[];
  private _contacts: CompanyContactItem[];

  private constructor(props: CompanyProps) {
    this.id                    = props.id;
    this.tenantId              = props.tenantId;
    this._industryId           = props.industryId;
    this.companyCode           = props.companyCode;
    this._name                 = props.name;
    this._cityId               = props.cityId;
    this._companyType          = props.companyType;
    this._establishedYear      = props.establishedYear;
    this._description          = props.description;
    this._whatWeOffer          = props.whatWeOffer;
    this._awardsRecognition    = props.awardsRecognition;
    this._keyProductsServices  = props.keyProductsServices;
    this._recruitmentHighlights = props.recruitmentHighlights;
    this._placementStats       = props.placementStats;
    this._inquiryEmail         = props.inquiryEmail;
    this._status               = props.status;
    this.isActive              = props.isActive;
    this.createdBy             = props.createdBy;
    this._clubs                = props.clubs;
    this._mediaItems           = props.mediaItems;
    this._contacts             = props.contacts;
  }

  static create(props: Omit<CompanyProps, 'status'>): Company {
    return new Company({ ...props, status: CompanyStatus.Draft });
  }

  static reconstitute(props: CompanyProps): Company {
    return new Company(props);
  }

  get name()                 { return this._name; }
  get industryId()           { return this._industryId; }
  get cityId()               { return this._cityId; }
  get companyType()          { return this._companyType; }
  get establishedYear()      { return this._establishedYear; }
  get description()          { return this._description; }
  get whatWeOffer()          { return this._whatWeOffer; }
  get awardsRecognition()    { return this._awardsRecognition; }
  get keyProductsServices()  { return this._keyProductsServices; }
  get recruitmentHighlights(){ return this._recruitmentHighlights; }
  get placementStats()       { return this._placementStats; }
  get inquiryEmail()         { return this._inquiryEmail; }
  get status()               { return this._status; }
  get clubs()                { return [...this._clubs]; }
  get mediaItems()           { return [...this._mediaItems]; }
  get contacts()             { return [...this._contacts]; }

  update(fields: Partial<Omit<CompanyProps, 'id' | 'tenantId' | 'companyCode' | 'status' | 'isActive' | 'createdBy'>>): void {
    if (fields.name               !== undefined) this._name                = fields.name;
    if (fields.industryId         !== undefined) this._industryId          = fields.industryId;
    if (fields.cityId             !== undefined) this._cityId              = fields.cityId;
    if (fields.companyType        !== undefined) this._companyType         = fields.companyType;
    if (fields.establishedYear    !== undefined) this._establishedYear     = fields.establishedYear;
    if (fields.description        !== undefined) this._description         = fields.description;
    if (fields.whatWeOffer        !== undefined) this._whatWeOffer         = fields.whatWeOffer;
    if (fields.awardsRecognition  !== undefined) this._awardsRecognition   = fields.awardsRecognition;
    if (fields.keyProductsServices !== undefined) this._keyProductsServices = fields.keyProductsServices;
    if (fields.recruitmentHighlights !== undefined) this._recruitmentHighlights = fields.recruitmentHighlights;
    if (fields.placementStats     !== undefined) this._placementStats      = fields.placementStats;
    if (fields.inquiryEmail       !== undefined) this._inquiryEmail        = fields.inquiryEmail;
    if (fields.clubs              !== undefined) this._clubs               = fields.clubs;
    if (fields.mediaItems         !== undefined) this._mediaItems          = fields.mediaItems;
    if (fields.contacts           !== undefined) this._contacts            = fields.contacts;
  }

  publish(): void {
    this._status = CompanyStatus.Published;
  }

  addMedia(item: CompanyMediaItem): void {
    this._mediaItems = [...this._mediaItems, item];
  }

  removeMedia(mediaAssetId: string): void {
    this._mediaItems = this._mediaItems.filter(m => m.mediaAssetId !== mediaAssetId);
  }

  setContact(userId: string, role: ContactRole): void {
    const exists = this._contacts.find(c => c.userId === userId && c.role === role);
    if (!exists) {
      this._contacts = [...this._contacts, { userId, role }];
    }
  }

  isMandatoryComplete(): boolean {
    return !!this._name && !!this._industryId && !!this._cityId;
  }
}
