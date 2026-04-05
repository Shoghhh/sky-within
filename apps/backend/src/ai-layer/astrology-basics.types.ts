export interface AstrologyBasicsAspectTypes {
  conjunction: string;
  trine: string;
  square: string;
  opposition: string;
}

export type AstrologyBasicsConceptId =
  | 'zodiacSigns'
  | 'planets'
  | 'houses'
  | 'planetInSign'
  | 'planetInHouse'
  | 'aspects'
  | 'transits'
  | 'natalChart';

export interface AstrologyBasicsConcept {
  id: AstrologyBasicsConceptId;
  title: string;
  definition: string;
  explanation: string;
  example: string;
  summary: string;
  /** Present only for id "aspects" */
  aspectTypes?: AstrologyBasicsAspectTypes;
}

export interface AstrologyBasicsPayload {
  concepts: AstrologyBasicsConcept[];
}
