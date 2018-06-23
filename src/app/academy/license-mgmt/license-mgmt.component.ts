// library imports
import { Component, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'

// project imports
import { User } from '../../shared/datatypes'
import { AuthService, AcademyService } from '../../_services'

@Component({
  selector: 'app-license-mgmt',
  templateUrl: './license-mgmt.component.pug',
  styleUrls: ['./license-mgmt.component.scss']
})
export class LicenseMgmtComponent implements OnInit {

  public subscriptions: Subscription[] = []

  public user: User
  public licenses: any[]
  
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
      })
    )
  }

}
