import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
  ViewChild,
} from '@angular/core';
import { HomePageComponent } from '../home-page.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchData, SearchRide } from '../../../interfaces/search-ride';
import { BehaviorSubject, catchError, debounceTime, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationIQService } from '../../../services/locationIQ/location-iq.service';
import { RideService } from '../../../services/rides/ride.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [HomePageComponent, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
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
  @ViewChild('from') fromRef?: ElementRef;
  @ViewChild('to') toRef?: ElementRef;

  constructor(private rideService: RideService) {
    // this.rideDetails = this.searchRide.value as SearchRide;
  }

  ngAfterViewInit(): void {
    if (this.fromRef) {
      this.fromRef.nativeElement.focus();
    }
  }

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
        const searchNotFound: SearchData[] = [
          {
            place: 'We could not find that place.',
          },
        ];
        const result: SearchData[] = res.slice(0, 5).map((val: any) => {
          return {
            place: val.display_name,
            lat: val.lat,
            lon: val.lon,
          };
        });
        if (this.isLeavingFromDropDownOpen) {
          this.leavingFromData = result.length ? result : searchNotFound;
        } else if (this.isGoingToDropDownOpen) {
          this.goingToData = result.length ? result : searchNotFound;
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-btn')) {
      if (!target.closest('.leavingFromDropDown')) {
        this.isLeavingFromDropDownOpen = false;
      }
      if (!target.closest('.goingToDropDown')) {
        this.isGoingToDropDownOpen = false;
      }
    }
  }

  selectLeavingFromVal(val: SearchData) {
    this.getLocationData(val);
    this.searchRide.get('leavingFrom')?.setValue(val);
    this.leavingFrom = val.place;
    this.isLeavingFromDropDownOpen = false;
  }

  selectGoingToVal(val: SearchData) {
    this.getLocationData(val);
    this.searchRide.get('goingTo')?.setValue(val);
    this.goingTo = val.place;
    this.isGoingToDropDownOpen = false;
  }

  getLocationData(address: SearchData) {
    this.locationIqServcie
      .getLocationDetails(Number(address.lat), Number(address.lon))
      .subscribe((res: any) => {
        // console.log('res :', res);
        // console.log('address :', res.address);
        // console.log('city :', res.address.city);
        // console.log('state :', res.address.state);
        // console.log('state_district :', res.address.state_district);

        address.city = res.address?.city;
        address.state = res.address?.state;
        address.state_district = res.address?.state_district;
      });
  }

  onSearchLeavingFrom(event: any) {
    const searchText = event.target.value;
    if (searchText) {
      this.isLeavingFromDropDownOpen = true;
    }
    this.searchInput.next(searchText);
  }

  onSearchGoingTo(event: any) {
    const searchText = event.target.value;
    if (searchText) {
      this.isGoingToDropDownOpen = true;
    }
    this.searchInput.next(searchText);
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
    if (this.fromRef && typeof this.searchRide.value.leavingFrom === 'string') {
      this.fromRef.nativeElement.focus();
      return;
    } else if (
      this.toRef &&
      typeof this.searchRide.value.goingTo === 'string'
    ) {
      this.toRef.nativeElement.focus();
      return;
    }
    console.log('search ride data :', this.searchRide.value);
    console.log('typeof prsnCount :', typeof this.searchRide.value.prsnCount);
    console.log('typeof date :', typeof this.searchRide.value.date);
    this.rideService.getRides(this.searchRide.value).subscribe({
      next: (res) => {
        console.log('search ride data :', res);
      },
      error: (err) => {
        console.log('search ride error :', err);
      },
    });
  }

  showDropDown(dropDown: string) {
    // console.log('this.searchInput :', this.searchInput.value);
    if (this.searchInput.value === '') return;
    if (dropDown === 'goingTo') {
      // console.log('dropDown :', dropDown);
      this.isLeavingFromDropDownOpen = false;
      this.isGoingToDropDownOpen = true;
    } else {
      this.isLeavingFromDropDownOpen = true;
      this.isGoingToDropDownOpen = false;
    }
  }
}
