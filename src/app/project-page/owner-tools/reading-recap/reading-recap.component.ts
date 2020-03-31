import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import * as jsPDF from 'jspdf'
import { take } from 'rxjs/operators'
import { DropdownModule } from 'primeng/dropdown'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { CommentFilter } from 'src/app/_services/project.service'
import { User, Project, EdjiComment, CommentStats, Reading } from '../../../shared/datatypes'
import { AuthService, AcademyService, SocketService, ReadingService } from '../../../_services'
import { ALLSPARK } from '../../../app.constants'
import { EdjiDatePipe } from '../../../_pipes/edjidate.pipe'
import { ProjectStore } from 'src/app/_store'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'hot-reading-recap',
  templateUrl: './reading-recap.component.pug',
  styleUrls: ['./reading-recap.component.scss'],
})
export class ReadingRecapComponent implements OnInit {
  private commentStats: CommentStats
  private _visible: boolean
  @Input()
  set visible(visible: boolean) {
    let madeVisible: boolean = visible !== this._visible && visible
    this._visible = visible
    if (madeVisible) {
      // Slide in once component is constructed
      setTimeout(() => {
        this.slidePaneIn = true
      }, 50)
    }
  }
  get visible(): boolean {
    return this._visible
  }

  private subscriptions: Subscription[] = []
  public currentUser: User
  public project: any
  public evaluations: any = []
  public appliedFilter: CommentFilter = <CommentFilter>{}
  public currentStudent: any = {}
  public comments: EdjiComment[] = []
  public readingTimeData: any
  public evaluationForm: FormGroup
  public evalLoading: boolean
  public wordCount: number = 0
  public questionCount: number = 0
  public imageCount: number = 0
  public chartTimeReading: any = {
    min: 0,
    max: 0,
    avg: 0,
    val: 0,
  }
  public chartComments: any = {
    min: 0,
    max: 0,
    avg: 0,
    val: 0,
  }
  public commentCountByType: any = {
    emoji: 0,
    text: 0,
    audio: 0,
    reply: 0,
  }

  public students: any[] = []
  public selectedStudent: string = ''

  // Slide in value animates pane once component has loaded
  public slidePaneIn: boolean = false
  private teacherId: string

  constructor(
    private projectStore: ProjectStore,
    private readingService: ReadingService,
    private _auth: AuthService,
    private _fb: FormBuilder,
    private _academy: AcademyService,
    private angulartics: Angulartics2,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.evaluationForm = _fb.group({
      email: [null, [Validators.required, this.emailValidator]],
      inputText: [null, Validators.required],
      name: [null, Validators.required],
    })
  }

  ngOnInit() {
    // Get Project from project service
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.currentUser = user
      }),
      this.projectStore.commentStats.subscribe(stats => {
        this.commentStats = stats
        // default to first student in students list
        if (!this.selectedStudent && stats.stats.userStats[0] && stats.stats.userStats[0]._id) {
          console.log('selecting default student')
          this.selectedStudent = stats.stats.userStats[0]._id
        }
        this.buildReport()
      }),
      this.projectStore.currentProject.subscribe(
        project => {
          if (project) {
            this.project = project
            this.teacherId = project.teacher_id
            // need to wait until we have the project loaded before we can proceed
            if (project && project.comments) {
              // Get Reading counts
              this.getReadingCounts(project)
              // Get time on reading data
              this._academy
                .getTimeOnReading(this.project._id)
                .pipe(take(1))
                .subscribe(
                  readingTimeData => {
                    this.readingTimeData = readingTimeData.time_on_reading
                    this.processTimeChart()
                  },
                  error => {
                    console.error(error)
                  },
                )
            }
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Check for recap opened via url
      this.route.queryParams.subscribe(params => {
        if (params['recap']) {
          if (params['recap'] !== 'true' && this.students && this.selectedStudent !== params['recap']) {
            // SET USER BY ID
            this.selectedStudent = params['recap']
            this.changeStudentSelection()
          }
          if (!this.visible) {
            // event tracking for opening recap
            this.angulartics.eventTrack.next({
              action: 'readingRecap_opened',
              properties: {
                category: this._auth.setAnalyticEventCategory(),
                label: this._auth.setAnalyticEventLabel(),
              },
            })
          }
          this.visible = true
        } else {
          // Close recap
          this.slidePaneIn = false
          setTimeout(() => {
            this.visible = this.slidePaneIn
          }, 400)
        }
      }),
    )
  }

  /** Get Reading specific stats
   * @description Gets counts for this Reading, student agnostic stats
   */
  private getReadingCounts(reading: Reading): void {
    if (!reading || !reading.words) return
    // handle overall reading counts here
    this.wordCount = Math.round((reading.words.length || 0) / 2)
    this.questionCount = reading.questions ? reading.questions.length : 0
    let wordsLength = reading.words.length
    for (let i = 0; i < wordsLength; i++) {
      let word = reading.words[i]
      if (word && word.styles && word.styles.includes('img')) {
        this.imageCount += 1
      }
    }
  }

  /**
   * all logic for displaying any metrics on the report should go in here
   * when we change student selections, this will get called to re-build the metrics on the report
   */
  private buildReport(): void {
    if (!this.commentStats.stats.userStats) return
    // populate the student list
    this.students = this.commentStats.stats.userStats.map(s => ({ label: s.fullname, value: s._id }))
    // Load selected student if not loaded
    if (this.selectedStudent && !this.currentStudent) {
      this.changeStudentSelection()
    }
    const userStats = this.commentStats.findStudent(this.currentStudent.value)
    if (!userStats) return

    // Comments by the filtered user for displaying on the report right-out
    this.comments = userStats.comments
    // Comment count gauge chart setup
    this.chartComments = {
      min: this.commentStats.stats.comment_min,
      max: this.commentStats.stats.comment_max,
      avg: this.commentStats.stats.comment_avg,
      val: userStats.comment_count,
    }
    // Comment count by type horizontal bar chart setup
    this.commentCountByType = {
      emoji: userStats.emoji_comment_count,
      text: userStats.text_comment_count,
      audio: userStats.audio_comment_count,
      reply: userStats.reply_count,
    }

    // If there are evaluations from the teacher on the selected student, let's display it here
    this.evaluations = this.projectStore.getFeedbackByStudent(this.currentStudent.value)
  }

  // Process the time on reading data for the selected user
  private processTimeChart(): void {
    if (this.readingTimeData && this.readingTimeData.users.length > 0) {
      const correctionFactor = 60
      const userTimeVal = this.readingTimeData.users.find(user => this.currentStudent.value === user.user_id)
      // set the stats values for max, min, and average
      this.chartTimeReading = {
        min: Math.round(this.readingTimeData.min / correctionFactor),
        max: Math.round(this.readingTimeData.max / correctionFactor),
        avg: Math.round(this.readingTimeData.avg / correctionFactor),
        val: userTimeVal ? Math.round(userTimeVal.reading_time / correctionFactor) : null,
      }
    }
  }

  /**
   * This gets called whenever the dropdown selection changes
   */
  public changeStudentSelection(event?: any): void {
    if (event) {
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'readingRecap_studentSelected',
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    this.currentStudent = this.students.find(user => user.value === this.selectedStudent)
    if (this.currentStudent) {
      this.buildReport()
      this.processTimeChart()
    }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { emailIncorrect: true }
  }

  /**
   * Makes call to send evaluation to the email on the form
   * @param formValue is the evaluation form data
   */
  public sendEval(formValue: any): void {
    // set the pdf name here and data
    const date = new Date()
    const dateVal = new EdjiDatePipe().transform(date.toDateString())
    formValue.pdfName = this.currentStudent.label + "'s Reading Report - " + dateVal
    formValue.personSharing = this.currentUser.fullname
    formValue.personSharingEmail = this.currentUser.email
    formValue.readingName = this.project.reading_id.title

    this.evalLoading = true

    // create a new evaluation to save to the project
    const evalObj = {
      createdAt: date,
      evaluation: formValue.inputText,
      user_id: this.currentStudent.value,
    }
    const projectToUpdate = this.project
    // add the new evaluation to the project
    projectToUpdate.report_evals.push(evalObj)

    // update the project with the new evaluation, create the pdf, and then email it out
    this.projectStore.update(projectToUpdate, this.project._id).subscribe(project => {
      // update our project so evaluation shows in the page
      this.evaluations.push(evalObj)

      setTimeout(() => {
        this.saveAsPdf().then(
          pdf => {
            // convert the pdf to a data uri string
            var pdfData = pdf.output('datauristring')

            // user our academy service to package up the email details and send it off to our api if the project successfully updated
            this._academy.sendReadingRecap(formValue, pdfData).subscribe(
              data => {},
              error => {
                console.error(error)
              },
            )
            this.evalLoading = false
          },
          error => {
            console.error(error)
            this.evalLoading = false
          },
        )
      }, 1)
    }),
      error => {
        console.error(error)
      }
    // empty out the form
    this.evaluationForm.reset()
  }

  public addEvaluationOnly(evalData: any): void {
    // create a new evaluation to save to the project
    const evalObj: Partial<EdjiComment> = {
      data: evalData,
      user_id: this.currentUser._id,
      recipient_id: this.currentStudent.value,
    }

    // update the project with the new evaluation, create the pdf, and then email it out
    this.projectStore.saveFeedback(evalObj)
    // empty out the form
    this.evaluationForm.reset()
  }

  /** Downloads the report to the user's computer */
  public downloadPDF(): void {
    this.evalLoading = true
    this.saveAsPdf().then(
      pdf => {
        pdf.save('test' + '.pdf')
        this.evalLoading = false
      },
      error => {
        console.error(error)
        this.evalLoading = false
      },
    )
  }

  private saveAsPdf(): any {
    return new Promise<any>((resolve, reject) => {
      // Get current scroll position and then scroll up to the top
      // Needed because the pdf will not export the whole report unless you are scrolled to the top
      var scrollPos = document.querySelector('.sliding-pane.from-left.reading-recap.slide-in').scrollTop
      document.querySelector('.sliding-pane.from-left.reading-recap.slide-in').scrollTo(0, 0)

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
          left: 20,
        },
        height: htmlDoc.clientHeight,
        width: htmlDoc.clientWidth,
      }

      // set the scale to fit the whole report width on a page
      doc.internal.scaleFactor = 2.4

      // Convert the reading report to a pdf
      doc.addHTML(
        htmlDoc,
        20,
        10,
        options,
        success => {
          document.querySelector('.sliding-pane.from-left.reading-recap.slide-in').scrollTo(0, scrollPos)
          resolve(doc)
        },
        error => {
          console.error('we had an issue making the pdf')
          document.querySelector('.sliding-pane.from-left.reading-recap.slide-in').scrollTo(0, scrollPos)
          reject(error)
        },
      )
    })
  }

  // when the user clicks this from the top of the reading report, it will scroll them to the evaluation form to send it out
  public goToEvalForm(): void {
    var evalForm = document.querySelector('#evaluationForm')
    var topPos = evalForm.getBoundingClientRect().top
    document.querySelector('.sliding-pane.from-left.reading-recap.slide-in').scrollTop = topPos
  }

  /**
   * Is Student Filtered
   */
  public isStudentFiltered(student: any): boolean {
    if (this.appliedFilter && this.appliedFilter.propertyFilters.user_id) {
      return this.appliedFilter.propertyFilters.user_id === student._id
    } else {
      return false
    }
  }

  /**
   * Close Report
   * - Allows for animation to close before destroying the component
   */
  public close() {
    // Clear URL params
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { recap: null },
      queryParamsHandling: 'merge',
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    this.students = []
  }
}
