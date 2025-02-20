import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationIQService {
  private apiUrl = 'https://us1.locationiq.com/v1/';
  apiKey: string = 'pk.562f97139cce452063cd4cd108d3c5e6';

  constructor(private http: HttpClient) {}

  searchPlace(query: string): Observable<any> {
    const url = `${this.apiUrl}search.php?key=${this.apiKey}&q=${query}&format=json`;
    return this.http.get<any>(url);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  degToRad(deg: number): number {
      return deg * (Math.PI / 180);
  }

  getLocationDetails(lat: number, lon: number) {
    return this.http.get(
      `${this.apiUrl}reverse.php?key=${this.apiKey}&lat=${lat}&lon=${lon}&format=json`
    );
  }
  
}
