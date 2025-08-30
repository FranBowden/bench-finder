export interface Bench {
  id: number;
  lat: number;
  lng: number;
  tags?: Record<string, string>;
  imageUrl?: string;
  distance?: number;
}
