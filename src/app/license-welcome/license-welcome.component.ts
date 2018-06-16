import { Component, OnInit } from '@angular/core'
import { AcademyService } from '../_services'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-license-welcome',
  templateUrl: './license-welcome.component.pug',
  styleUrls: ['./license-welcome.component.scss']
})
export class LicenseWelcomeComponent implements OnInit {
  private subscriptions: Subscription[] = []
  private institutionId: string
  private institution: any

  constructor(
    private _academy: AcademyService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this._route.params.subscribe((params) => {
        this.institutionId = params['institution_id']
      })
    )

    this._academy.getInstitution(this.institutionId).pipe(take(1))
    .subscribe(data => {
      this.institution = data.institution[0]
    },
    (error) => {
      console.error(error)
    })
  }

}
