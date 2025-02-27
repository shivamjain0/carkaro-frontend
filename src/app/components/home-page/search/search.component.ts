import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HomePageComponent } from '../home-page.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchData, SearchRide } from '../../../interfaces/search-ride';
import { BehaviorSubject, catchError, debounceTime, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationIQService } from '../../../services/locationIQ/location-iq.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [HomePageComponent, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('dateInput') dateInput: any;
  today: string = new Date().toISOString().split('T')[0];
  rideDetails: SearchRide | null = null;
  searchRide!: FormGroup;
  isLeavingFromDropDownOpen: boolean = false;
  leavingFromData: Array<SearchData> = [];
  leavingFrom: string = '';
  isGoingToDropDownOpen: boolean = false;
  goingToData: Array<SearchData> = [];
  goingTo: string = '';
  locationIqServcie = inject(LocationIQService);
  searchInput = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.searchRide = new FormGroup({
      leavingFrom: new FormControl<SearchData | null>(null),
      goingTo: new FormControl<SearchData | null>(null),
      date: new FormControl<string>(this.today),
      prsnCount: new FormControl<number>(1),
    });

    this.searchInput.pipe(debounceTime(1000)).subscribe((input) => {
      if (input) {
        this.performSearch(input);
      } else {
        this.isGoingToDropDownOpen = false;
        this.isLeavingFromDropDownOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.searchInput.complete();
  }

  performSearch(input: string) {
    this.locationIqServcie
      .searchPlace(input)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.log('error :', err);
          return of([]);
        })
      )
      .subscribe((res) => {
        const searchNotFound: SearchData = {
          place: 'We could not find that place.',
        };
        // if (res.length) {
        //   this.locationIqServcie
        //     .getLocationDetails(res[0].lat, res[0].lon)
        //     .subscribe((res: any) => {
        //       console.log('res :', res);
        //       console.log('address :', res.address);
        //       console.log('city :', res.address.city);
        //       console.log('state :', res.address.state);
        //       console.log('country :', res.address.country);
        //     });
        // }
        const result: SearchData[] = res.slice(0, 5).map((val: any) => {
          return {
            place: val.display_name,
            // state: val.address?.state,
            // state_district: val.address?.state_district,
            lat: val.lat,
            lon: val.lon,
          };
        });
        if (this.isLeavingFromDropDownOpen) {
          if (result.length) {
            this.leavingFromData = result;
          } else {
            this.leavingFromData = [];
            this.leavingFromData.push(searchNotFound);
          }
        } else if (this.isGoingToDropDownOpen) {
          if (result.length) {
            this.goingToData = result;
          } else {
            this.goingToData = [];
            this.goingToData.push(searchNotFound);
          }
        }

        console.log('result :', result);
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.leavingFromDropDown')) {
      this.isLeavingFromDropDownOpen = false;
      // this.leavingFromData = [];
    }
    if (!target.closest('.goingToDropDown')) {
      this.isGoingToDropDownOpen = false;
      // this.goingToData = [];
    }
  }

  selectLeavingFromVal(val: SearchData) {
    this.getLocationAddress(val);
    this.searchRide.get('leavingFrom')?.setValue(val);
    this.leavingFrom = val.place;
    this.isLeavingFromDropDownOpen = false;
  }

  selectGoingToVal(val: SearchData) {
    this.getLocationAddress(val);
    this.searchRide.get('goingTo')?.setValue(val);
    this.goingTo = val.place;
    this.isGoingToDropDownOpen = false;
  }

  getLocationAddress(address: SearchData) {
    this.locationIqServcie
      .getLocationDetails(Number(address.lat), Number(address.lon))
      .subscribe((res: any) => {
        console.log('res :', res);
        console.log('address :', res.address);
        console.log('city :', res.address.city);
        console.log('state :', res.address.state);
        console.log('country :', res.address.country);

        address.state = res.address?.state;
        address.state_district = res.address?.state_district;
      });
  }

  onSearchLeavingFrom(event: any) {
    const searchText = event.target.value;
    if (searchText) this.isLeavingFromDropDownOpen = true;
    this.searchInput.next(searchText);
  }

  onSearchGoingTo(event: any) {
    const searchText = event.target.value;
    if (searchText) this.isGoingToDropDownOpen = true;
    this.searchInput.next(searchText);
  }

  constructor() {
    // this.rideDetails = this.searchRide.value as SearchRide;
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

  getRides() {
    console.log(this.searchRide.value);
  }

  showDropDown(dropDown: string) {
    console.log('this.searchInput :', this.searchInput.value);
    if (this.searchInput.value === '') return;
    if (dropDown === 'goingTo') {
      this.isLeavingFromDropDownOpen = false;
      this.isGoingToDropDownOpen = true;
    } else {
      this.isLeavingFromDropDownOpen = true;
      this.isGoingToDropDownOpen = false;
    }
  }
}
