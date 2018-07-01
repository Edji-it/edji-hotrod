// library imports
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

// project imports
import { User } from '../../shared/datatypes'
import { AuthService, AcademyService } from '../../_services'

@Component({
  selector: 'app-license-mgmt',
  templateUrl: './license-mgmt.component.pug',
  styleUrls: ['./license-mgmt.component.scss']
})
export class LicenseMgmtComponent implements OnInit, OnDestroy {

  public subscriptions: Subscription[] = []

  public user: User
  public licenses: any[]
  public currentAcademy: any
  
  constructor(
    private _auth: AuthService,
    private _academy: AcademyService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      // Set the current user every time it changes 
      this._auth.getCurrentUser().subscribe((user) => {
        this.user = user
        console.log(user)
      }),
      // get the licenses the user can manage
      this._academy.getLicenses().subscribe((licenses) => {
        this.licenses = licenses
        console.log(licenses)
      }),
      // get the current academy name
      this._academy.getInstitution(this._academy.currentInstitution).subscribe((academy) => {
        this.currentAcademy = academy.institution
        console.log(this.currentAcademy)
      })
    )
  }

  public expand(licenseId: string) {
    let d = document.getElementById(licenseId)
    if (d.className.indexOf('show')===-1) {
      d.className += " show"
    } else {
      console.log(d)
      document.getElementById(licenseId).className.replace('show', '')
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
