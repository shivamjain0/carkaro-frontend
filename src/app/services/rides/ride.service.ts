import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchRide } from '../../interfaces/search-ride';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  private apiURL: string = 'http://localhost:3000/rides';
  constructor(private readonly http: HttpClient) {}

  getRides(searchRideData: SearchRide) {
    const searchRideParams = new HttpParams()
      .set('leavingFrom', JSON.stringify(searchRideData['leavingFrom']))
      .set('goingTo', JSON.stringify(searchRideData['goingTo']))
      .set('date', searchRideData['date'])
      .set('prsnCount', searchRideData['prsnCount']);

    console.log('params data :', searchRideParams);
    return this.http.get<any>(`${this.apiURL}`, { params: searchRideParams });
  }
}
