export interface Annotation {
    id: string;
    type: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    properties: {
      text?: string;
      category?: string;
      color?: string;
    };
  }

export interface AnnotationCategory {
value: string;
label: string;
color: string;
}