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

  /**
   * Makes call to send evaluation to the email on the form
   * @param formValue is the evaluation form data
   */
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

  /** Downloads the report to the user's computer */
  public downloadPDF(): void {
    this.evalLoading = true
    this.saveAsPdf().then(pdf => {
      pdf.save('test' + '.pdf')
      this.evalLoading = false
    }, error => {
      console.error(error)
      this.evalLoading = false
    })
  }

  private saveAsPdf(): any {
    return new Promise<any>((resolve, reject) => {
      // Get current scroll position and then scroll up to the top
      // Needed because the pdf will not export the whole report unless you are scrolled to the top
      var scrollPos = document.querySelector(".sliding-pane.from-left.reading-report.slide-in").scrollTop
      document.querySelector(".sliding-pane.from-left.reading-report.slide-in").scrollTo(0, 0)

      let htmlRef = '#readingReport'
      let htmlDoc = document.querySelector(htmlRef)
      var doc = new jsPDF('p', 'px', 'letter')
      // report options to pass in
      let options = {
        pagesplit: true,
        margin: {
          top: 10,
          bottom: 10,
          right: 20,
          left: 20
        },
        height: htmlDoc.clientHeight,
        width: htmlDoc.clientWidth
      }

      // set the scale to fit the whole report width on a page
      doc.internal.scaleFactor = 2.4

      // Convert the reading report to a pdf
      doc.addHTML(htmlDoc, 20, 10, options, success => {
        document.querySelector(".sliding-pane.from-left.reading-report.slide-in").scrollTo(0, scrollPos)
        resolve(doc)
      }, error => {
        console.error('we had an issue making the pdf')
        document.querySelector(".sliding-pane.from-left.reading-report.slide-in").scrollTo(0, scrollPos)
        reject(error)
      })
    })
  }

  // when the user clicks this from the top of the reading report, it will scroll them to the evaluation form to send it out
  public goToEvalForm(): void {
    var evalForm = document.querySelector('#evaluationForm')
    var topPos = evalForm.getBoundingClientRect().top
    document.querySelector(".sliding-pane.from-left.reading-report.slide-in").scrollTop = topPos
  }
}
