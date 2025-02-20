import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HomePageComponent } from '../home-page.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchRide } from '../../../interfaces/search-ride';
import { BehaviorSubject, catchError, debounceTime, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationIQService } from '../../../services/locationIQ/location-iq.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [HomePageComponent, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('dateInput') dateInput: any;
  today: string = new Date().toISOString().split('T')[0];
  rideDetails: SearchRide;
  searchRide = new FormGroup({
    leavingFrom: new FormControl<string>(''),
    goingTo: new FormControl<string>(''),
    date: new FormControl<string>(this.today),
    prsnCount: new FormControl<number>(1),
  });
  isLeavingFromDropDownOpen: boolean = false;
  leavingFromData: Array<string> = [];
  leavingFrom: string = '';
  isGoingToDropDownOpen: boolean = false;
  goingToData: Array<string> = [];
  goingTo: string = '';
  locationIqServcie = inject(LocationIQService);
  searchInput = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.searchInput.pipe(debounceTime(1000))
    .subscribe((input) => {
      if(input) {
        this.performSearch(input);
      } else {
        this.isGoingToDropDownOpen = false;
        this.isLeavingFromDropDownOpen = false;
      }
    })
  }

  ngOnDestroy(): void {
    this.searchInput.complete(); 
  }

  performSearch(input: string) {
    this.locationIqServcie.searchPlace(input)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        console.log("error :", err);
        return of([]);
      })
    ).subscribe((res) => {
      const searchNotFound = ['We could not find that place.'];
      if(res.length) {
        this.locationIqServcie.getLocationDetails(res[0].lat, res[0].lon)
        .subscribe((res: any) => {
          console.log("address :", res.address);
          console.log("city :", res.address.city);
          console.log("state :", res.address.state);
          console.log("country :", res.address.country);
        })
      }
      const result = res.slice(0,5).map((val: any) => val.display_name);
      if(this.isLeavingFromDropDownOpen){
        if(result.length) {
          this.leavingFromData = result;
        } else {  
          this.leavingFromData = searchNotFound;
        }
      }
      if(this.isGoingToDropDownOpen) {
        if(result.length) {
          this.goingToData = result;
        } else {
          this.goingToData = searchNotFound;
        }
      }

      console.log("result :", result)
    })
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.leavingFromDropDown')) {
      this.isLeavingFromDropDownOpen = false;
      this.leavingFromData = [];
    }
    if(!target.closest('.goingToDropDown')) {
      this.isGoingToDropDownOpen = false;
      this.goingToData = [];
    }
  }
  
  selectLeavingFromVal(val: string) {
    this.leavingFrom = val;
    this.isLeavingFromDropDownOpen = false;
  }

  selectGoingToVal(val: string) {
    this.goingTo = val;
    this.isGoingToDropDownOpen = false;
  }
  // searchPlace
  onSearchLeavingFrom (event: any) {
    const searchText = event.target.value;
    // console.log("serach text :", searchText)
    if(searchText) this.isLeavingFromDropDownOpen = true;
    this.searchInput.next(searchText);
  }
  
  onSearchGoingTo (event: any) {
    const searchText = event.target.value;
    if(searchText) this.isGoingToDropDownOpen = true;
    this.searchInput.next(searchText);
  }
  constructor() {
    this.rideDetails = this.searchRide.value as SearchRide;
  }

  openCalender() {
    this.dateInput.nativeElement.showPicker();
  }

  incPrsnCnt() {
    const currentCount: number = this.searchRide.get('prsnCount')?.value ?? 1;
    if (currentCount < 7) {
      this.searchRide.patchValue({ prsnCount: currentCount + 1 });
    }
  }

  decPrsnCnt() {
    const currentCount: number = this.searchRide.get('prsnCount')?.value ?? 1;
    if (currentCount > 1) {
      this.searchRide.patchValue({ prsnCount: currentCount - 1 });
    }  
  }
}
