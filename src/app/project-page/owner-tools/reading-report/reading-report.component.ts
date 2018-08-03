import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import * as jsPDF from 'jspdf'

// Project Dependencies
import { CommentFilter, ProjectService } from 'src/app/_services/project.service'
import { User, Project, EdjiComment, CommentStats } from '../../../shared/datatypes'
import { AuthService, AcademyService } from '../../../_services'
import { ALLSPARK } from '../../../app.constants'
import { EdjiDatePipe } from '../../../_pipes/edjidate.pipe'

@Component({
  selector: 'hot-reading-report',
  templateUrl: './reading-report.component.pug',
  styleUrls: ['./reading-report.component.scss']
})
export class ReadingReportComponent implements OnInit {
  @Input() visible: boolean = false
  /** This is a reference to the actual commentStats object which has methods for modification of properties */
  @Input() commentStats: CommentStats
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private currentUser: User
  public project: Project = <Project>{}
  public appliedFilter: CommentFilter = <CommentFilter>{}
  public comments: EdjiComment[] = []
  public evaluationForm: FormGroup
  public evalLoading: boolean
  public wordCount: number = 0
  public questionCount: number = 0
  public imageCount: number = 0
  public chartTimeReading: any = {
    min: 1, 
    max: 4, 
    avg: 2, 
    val: 3
  }
  public chartComments: any = {
    min: 1, 
    max: 4, 
    avg: 2, 
    val: 3
  }
  public commentCountByType: any = {
    emoji: 0,
    text: 0,
    audio: 0,
    reply: 0
  }

  constructor(
    private _projects : ProjectService,
    private _auth: AuthService,
    private _fb: FormBuilder,
    private _academy: AcademyService
  ) { 
    this.evaluationForm = _fb.group({
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      inputText: [null, Validators.required],
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
              console.log(project)
              // handle filter here
              if (project && project.comments) {
                // hacky manually designate the filter
                this._projects.filterByUser(this.currentUser)

                // handle counts here
                this.wordCount = Math.round(project.reading_id.words.length / 2)
                this.questionCount = project.reading_id.questions.length
                let wordsLength =  project.reading_id.words.length
                for (let i=0;i<wordsLength;i++) {
                  let word = project.reading_id.words[i]
                  if (word && word.styles && word.styles.includes('img')) {
                    this.imageCount+=1
                  }
                }
              }
            }
        },
        (error) => {
            console.error(error)
        })
    )

    // Temp hacky way to set the current filtered user since I'm hacking the filter to be on for now
    // (get rid of setTimeout once we finalize the filter selection on report opening)
    setTimeout(() => {
      if (this.commentStats.stats.userStats) {
        for (let i = 0; i < this.commentStats.stats.userStats.length; i++){
          if (this.isStudentFiltered(this.commentStats.stats.userStats[i])) {
            let userStats = this.commentStats.stats.userStats[i]
            // Comments by the filtered user for displaying on the report right-out
            this.comments = userStats.comments
            // Comment count gauge chart setup
            this.chartComments = {
              min: this.commentStats.stats.comment_min,
              max: this.commentStats.stats.comment_max,
              avg: this.commentStats.stats.comment_avg,
              val: userStats.comment_count
            }
            // Comment count by type horizontal bar chart setup
            this.commentCountByType = {
              emoji: userStats.emoji_comment_count,
              text: userStats.text_comment_count,
              audio: userStats.audio_comment_count,
              reply: userStats.reply_count
            }
          }
        }
      }
    }, 1000)
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
    // set the pdf name here
    let date = new Date()
    let dateVal = new EdjiDatePipe().transform(date.toDateString())
    formValue.pdfName = this.appliedFilter.displayName + "'s Reading Report - " + dateVal
    formValue.personSharing = this.currentUser.fullname

    this.evalLoading = true
    this.saveAsPdf().then(pdf => {
      // convert the pdf to a data uri string
      var pdfData = pdf.output('datauristring')

      // user our academy service to package up the email details and send it off to our api
      this._academy.sendReadingReport(formValue, pdfData)
      .subscribe(
        data => {
          console.log(data)
        },
        error => {
          console.error(error)
        })
      this.evalLoading = false
    }, error => {
      console.error(error)
      this.evalLoading = false
    })
    // empty out the form
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

  /**
   * Is Student Filtered
   */
  public isStudentFiltered(student: any) : boolean {
    if (this.appliedFilter && this.appliedFilter.propertyFilters.user_id) {
      return this.appliedFilter.propertyFilters.user_id.test(student._id)
    } else {
      return false
    }
  }
}
