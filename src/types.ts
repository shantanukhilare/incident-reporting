
export const ConcernType = {
  UnsafeAct: 'Unsafe Act',
  UnsafeCondition: 'Unsafe Condition',
  SafeAct: 'Safe Act'
} as const;
export type ConcernType = typeof ConcernType[keyof typeof ConcernType];

export const SeverityLevel = {
  FirstAid : 'First Aid',
  MTC : 'MTC',
  RWC : 'RWC',
  LTI : 'LTI',
  Fatal : 'Fatal'
} as const;
export type SeverityLevel = typeof SeverityLevel[keyof typeof SeverityLevel];



// export enum SeverityLevel {
//   FirstAid : 'First Aid',
//   MTC : 'MTC',
//   RWC : 'RWC',
//   LTI : 'LTI',
//   Fatal : 'Fatal'
// }

export const Step = {
  TypeSelection : 0,
  Description : 1,
  Severity : 2,
  ImageUpload : 3,
  Summary : 4
} as const;
export type Step = typeof Step[keyof typeof Step];


// export enum Step {
//   TypeSelection = 0,
//   Description = 1,
//   Severity = 2,
//   ImageUpload = 3,
//   Summary = 4
// }

export interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  previewUrl: string;
  file: File;
}

export interface ReportFormData {
  concernType: ConcernType | null;
  description: string;
  severity: SeverityLevel | null;
  images: ImageMetadata[];
  imageCount: number;
  timestamp: string;
  reportId: string;
}


export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  isActionable?: boolean;
}
