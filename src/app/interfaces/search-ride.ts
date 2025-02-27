export interface SearchData {
  place: string;
  state?: string;
  state_district?: string;
  lat?: string;
  lon?: string;
  // country?: string
}
export interface SearchRide {
  leavingFrom: SearchData;
  goingTo: SearchData;
  date: string;
  prsnCount: number;
}
