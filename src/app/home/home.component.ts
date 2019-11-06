import { Title } from '@angular/platform-browser'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ProjectService, CopyService } from '../_services'

@Component({
  selector: 'home',
  providers: [Title],
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.pug',
})
export class HomeComponent implements OnInit, OnDestroy {
  // Set our default values
  private projectCode: string
  private joinLoading: boolean = false

  private subscriptions: Subscription[] = []

  private errorObject: {
    invalidCode?: string
    loginFailed?: string
    serverError?: string
  } = {}

  public showPassModal: boolean = false
  public showPromoVideoModal: boolean = false

  // Header foci
  public focusSection: number = 0
  // TypeScript public modifiers
  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private router: Router,
    fb: FormBuilder,
    private _title: Title,
  ) {}

  ngOnInit() {
    this._title.setTitle('Edji')
  }

  public scrollToSection(section: number) {
    let el = document.getElementById('detailSection' + section)
    el && el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    })
  }

  /**
   * Validates project and then navigates to project if valid
   * @param code The project's short code
   */
  public joinSession(code: string): void {
    this.joinLoading = true
    this._project.validateProjectCode(code).subscribe(
      data => {
        this.joinLoading = false
        if (data.found) {
          this.router.navigate(['/project', data._id])
        } else {
          this.errorObject.invalidCode = "We don't think that's a real code :confused:"
        }
      },
      error => {
        this.joinLoading = false
        console.error(error)
        this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!"
      },
    )
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ''
      }
    }
  }
}
