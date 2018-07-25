import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Subscription, Observable } from 'rxjs'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import * as jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Project Dependencies
import { CommentFilter, ProjectService } from 'src/app/_services/project.service'
import { User, Project, EdjiComment } from '../../../shared/datatypes'
import { AuthService } from '../../../_services'
import { ALLSPARK } from '../../../app.constants'

@Component({
  selector: 'hot-reading-report',
  templateUrl: './reading-report.component.pug',
  styleUrls: ['./reading-report.component.scss']
})
export class ReadingReportComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private currentUser: User
  public project: Project = <Project>{}
  public appliedFilter: CommentFilter
  public comments: EdjiComment[] = []
  public evaluationForm: FormGroup
  public evalLoading: boolean

  constructor(
    private _projects : ProjectService,
    private _auth: AuthService,
    private _fb: FormBuilder
  ) { 
    this.evaluationForm = _fb.group({
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      inputtext: [null, Validators.required],
    })
  }

  ngOnInit() {
    // Subscribe to current user
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
        this.currentUser = user
      })
    ),
    // Get Updates about applied comment filters so we can show the user
    this.subscriptions.push(
      this._projects.filterUpdates.subscribe(
        (filter) => {
          this.appliedFilter = filter
          console.log(filter)
        }
      )
    ),
    // Get Project from project service
    this.subscriptions.push(
      this._projects.currentProject.subscribe(
        (project) => {
            if (project) {
              this.project = project
              if (project && project.comments) {
                this._projects.filterByUser(this.currentUser)

                // Only handle comments that are the curent selected users'
                let commentsLength = this.project.comments.length
                for (let i=0; i<commentsLength; i++) {
                  let comment = this.project.comments[i]
                  if (this.appliedFilter.propertyFilters.user_id.test(comment.user_id)) {
                    this.comments.push(comment)
                  }
                }
              }
            }
        },
        (error) => {
            console.error(error)
        })
    )
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  /** Makes call to send evaluation to the email on the form */
  public sendEval(formValue: any): void {
    // Need a place to send this report
    console.log(formValue)
    this.evalLoading = true
    this.saveAsPdf().then(pdf => {
      console.log(pdf)
      this.evalLoading = false
    }, error => {
      console.error(error)
      this.evalLoading = false
    })
    this.evaluationForm.reset()
  }

  private saveAsPdf(): Promise<any> {
    let htmlRef = '#readingReport'
    let htmlDoc = document.querySelectorAll(htmlRef)[0]
    var doc = new jsPDF('p', 'px', 'letter')
    var specialElementHandlers = {
      '.reading-report__pdf-hidden': function(element, renderer) {
        return true
      }
    }
    let options = {
      'elementHandlers': specialElementHandlers,
      pagesplit: true,
      margin: {
        top: 10,
        bottom: 10,
        right: 20,
        left: 20
      }
    }
    console.log(htmlDoc)
    doc.internal.scaleFactor = 2.5

    return doc.addHTML(htmlDoc, 20, 10, options, success => {
      doc.save('test.pdf')
      console.log('pre-doc', doc)
      return doc
    }, error => {
      console.error('we had an issue making the pdf')
      return error
    })
  }
}
