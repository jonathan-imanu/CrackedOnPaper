export interface Resume {
  ID: string;
  Name: string;
  OwnerUserID: string;
  Industry: string;
  YoeBucket: string;
  CurrentEloInt: number;
  BattlesCount: number;
  LastMatchedAt: string | null;
  InFlight: boolean;
  CreatedAt: string;
  PdfStorageKey: string;
  PdfSizeBytes: number;
  PdfMime: string;
  ImageKeyPrefix: string;
  PageCount: number;
  ImageReady: boolean;
  Slot: number;
}
