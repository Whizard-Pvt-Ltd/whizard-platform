import type { ContactRole } from '../value-objects/contact-role.vo.js';
import type { MediaRole } from '../value-objects/media-role.vo.js';
import { CollegeStatus } from '../value-objects/college-status.vo.js';

export interface CollegeMediaItem {
  mediaAssetId: string;
  mediaRole: MediaRole;
  sortOrder: number;
}

export interface CollegeContactItem {
  userId: string;
  role: ContactRole;
}

export interface CollegeProps {
  id: string;
  tenantId: string;
  collegeCode: string;
  name: string;
  affiliatedUniversity: string;
  cityId: string | null;
  collegeType: string;
  establishedYear: number | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  status: CollegeStatus;
  isActive: boolean;
  createdBy: string;
  clubIds: string[];
  programIds: string[];
  mediaItems: CollegeMediaItem[];
  contacts: CollegeContactItem[];
}

export class College {
  readonly id: string;
  readonly tenantId: string;
  readonly collegeCode: string;
  private _name: string;
  private _affiliatedUniversity: string;
  private _cityId: string | null;
  private _collegeType: string;
  private _establishedYear: number | null;
  private _description: string | null;
  private _degreesOffered: string | null;
  private _placementHighlights: string | null;
  private _inquiryEmail: string | null;
  private _status: CollegeStatus;
  readonly isActive: boolean;
  readonly createdBy: string;
  private _clubIds: string[];
  private _programIds: string[];
  private _mediaItems: CollegeMediaItem[];
  private _contacts: CollegeContactItem[];

  private constructor(props: CollegeProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.collegeCode = props.collegeCode;
    this._name = props.name;
    this._affiliatedUniversity = props.affiliatedUniversity;
    this._cityId = props.cityId;
    this._collegeType = props.collegeType;
    this._establishedYear = props.establishedYear;
    this._description = props.description;
    this._degreesOffered = props.degreesOffered;
    this._placementHighlights = props.placementHighlights;
    this._inquiryEmail = props.inquiryEmail;
    this._status = props.status;
    this.isActive = props.isActive;
    this.createdBy = props.createdBy;
    this._clubIds = props.clubIds;
    this._programIds = props.programIds;
    this._mediaItems = props.mediaItems;
    this._contacts = props.contacts;
  }

  static create(props: Omit<CollegeProps, 'status' | 'isActive' | 'clubIds' | 'programIds' | 'mediaItems' | 'contacts' | 'collegeCode'> & { cityName?: string | null }): College {
    const year = new Date().getFullYear();
    const city = (props.cityName ?? 'UNK').toUpperCase().replace(/\s+/g, '-').slice(0, 10);
    const suffix = props.id.replace(/-/g, '').slice(0, 8).toUpperCase();
    const collegeCode = `${city}-${year}-${suffix}`;

    return new College({
      ...props,
      collegeCode,
      status: CollegeStatus.Draft,
      isActive: true,
      clubIds: [],
      programIds: [],
      mediaItems: [],
      contacts: [],
    });
  }

  static reconstitute(props: CollegeProps): College {
    return new College(props);
  }

  get name(): string { return this._name; }
  get affiliatedUniversity(): string { return this._affiliatedUniversity; }
  get cityId(): string | null { return this._cityId; }
  get collegeType(): string { return this._collegeType; }
  get establishedYear(): number | null { return this._establishedYear; }
  get description(): string | null { return this._description; }
  get degreesOffered(): string | null { return this._degreesOffered; }
  get placementHighlights(): string | null { return this._placementHighlights; }
  get inquiryEmail(): string | null { return this._inquiryEmail; }
  get status(): CollegeStatus { return this._status; }
  get clubIds(): string[] { return [...this._clubIds]; }
  get programIds(): string[] { return [...this._programIds]; }
  get mediaItems(): CollegeMediaItem[] { return [...this._mediaItems]; }
  get contacts(): CollegeContactItem[] { return [...this._contacts]; }

  update(fields: {
    name?: string;
    affiliatedUniversity?: string;
    cityId?: string | null;
    collegeType?: string;
    establishedYear?: number | null;
    description?: string | null;
    degreesOffered?: string | null;
    placementHighlights?: string | null;
    inquiryEmail?: string | null;
    clubIds?: string[];
    programIds?: string[];
    mediaItems?: CollegeMediaItem[];
    contacts?: CollegeContactItem[];
  }): void {
    if (fields.name !== undefined) this._name = fields.name;
    if (fields.affiliatedUniversity !== undefined) this._affiliatedUniversity = fields.affiliatedUniversity;
    if (fields.cityId !== undefined) this._cityId = fields.cityId;
    if (fields.collegeType !== undefined) this._collegeType = fields.collegeType;
    if (fields.establishedYear !== undefined) this._establishedYear = fields.establishedYear;
    if (fields.description !== undefined) this._description = fields.description;
    if (fields.degreesOffered !== undefined) this._degreesOffered = fields.degreesOffered;
    if (fields.placementHighlights !== undefined) this._placementHighlights = fields.placementHighlights;
    if (fields.inquiryEmail !== undefined) this._inquiryEmail = fields.inquiryEmail;
    if (fields.clubIds !== undefined) this._clubIds = fields.clubIds;
    if (fields.programIds !== undefined) this._programIds = fields.programIds;
    if (fields.mediaItems !== undefined) this._mediaItems = fields.mediaItems;
    if (fields.contacts !== undefined) this._contacts = fields.contacts;
  }

  publish(): void {
    this._status = CollegeStatus.Published;
  }

  canPublish(): boolean {
    return (
      !!this._name &&
      !!this._affiliatedUniversity &&
      !!this._collegeType &&
      !!this._description
    );
  }
}
