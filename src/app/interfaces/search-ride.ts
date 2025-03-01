export interface SearchData {
  place: string;
  city?: string;
  state?: string;
  state_district?: string;
  lat?: string;
  lon?: string;
}
export interface SearchRide {
  leavingFrom: SearchData;
  goingTo: SearchData;
  date: string;
  prsnCount: number;
}
