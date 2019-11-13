import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import * as jsPDF from 'jspdf'
import { take } from 'rxjs/operators'
import { DropdownModule } from 'primeng/dropdown'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { CommentFilter, ProjectService } from 'src/app/_services/project.service'
import { User, Project, EdjiComment, CommentStats } from '../../../shared/datatypes'
import { AuthService, AcademyService, SocketService } from '../../../_services'
import { ALLSPARK } from '../../../app.constants'
import { EdjiDatePipe } from '../../../_pipes/edjidate.pipe'

@Component({
  selector: 'hot-reading-recap',
  templateUrl: './reading-recap.component.pug',
  styleUrls: ['./reading-recap.component.scss'],
})
export class ReadingRecapComponent implements OnInit {
  // @Input() visible: boolean = false
  /** This is a reference to the actual commentStats object which has methods for modification of properties */
  @Input() commentStats: CommentStats
  @Output() hide: EventEmitter<any> = new EventEmitter()

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
  public selectedStudent: any

  // Slide in value animates pane once component has loaded
  public slidePaneIn: boolean = false
  private teacherId: string

  constructor(
    private _projects: ProjectService,
    private _auth: AuthService,
    private _fb: FormBuilder,
    private _academy: AcademyService,
    private angulartics: Angulartics2,
    private _socket: SocketService
  ) {
    this.evaluationForm = _fb.group({
      email: [null, [Validators.required, this.emailValidator]],
      inputText: [null, Validators.required],
      name: [null, Validators.required],
    })
  }

  ngOnInit() {
    // event tracking for opening recap
    this.angulartics.eventTrack.next({
      action: 'readingRecap_opened',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Slide in once component is constructed
    setTimeout(() => {
      this.slidePaneIn = true
    }, 100)

    // Subscribe to current user
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.currentUser = user
      }),
    ),
      // Get Project from project service
      this.subscriptions.push(
        this._projects.currentProject.subscribe(
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
                // need a 1 millisecond delay for the comment stats getter to evaluate
                setTimeout(() => {
                  // only run this if we have data for any student
                  if (this.commentStats.stats.userStats && this.commentStats.stats.userStats.length > 0) {
                    if (this.students.length === 0) {
                      this.populateStudentList(true)
                    } else {
                      this.populateStudentList()
                    }
                    this.buildReport()
                  }
                }, 1)
              }
            }
          },
          error => {
            console.error(error)
          },
        ),
      )
  }

  /** Get Reading specific stats
   * @description Gets counts for this Reading, student agnostic stats
   */
  private getReadingCounts(project: Project): void {
    // handle overall reading counts here
    this.wordCount = Math.round(project.reading_id.words.length / 2)
    this.questionCount = project.reading_id.questions.length
    let wordsLength = project.reading_id.words.length
    for (let i = 0; i < wordsLength; i++) {
      let word = project.reading_id.words[i]
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
    // Loop through the user stats inside of the comment stats
    for (let i = 0; i < this.commentStats.stats.userStats.length; i++) {
      if (this.commentStats.stats.userStats[i]._id === this.currentStudent.value) {
        let userStats = this.commentStats.stats.userStats[i]
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
      }
    }

    // If there are evaluations from the teacher on the selected student, let's display it here
    this.evaluations = []
    if (this.project.report_evals && this.project.report_evals.length > 0) {
      this.project.report_evals.forEach(evaluation => {
        if (this.currentStudent.value === evaluation.user_id) {
          this.evaluations.push(evaluation)
        }
      })
    }
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
   * This method will build the list of users for the dropdown
   */
  private populateStudentList(initialPass?: boolean): void {
    let removePos = -1
    // set the dropdown filter for all students
    this.students = []
    this.commentStats.stats.userStats.forEach((student, index) => {
      if (student._id !== this.teacherId) {
        this.students.push({ label: student.fullname, value: student._id })
      }
      // if the current userStats object is our teacher, mark the index
      if (student._id === this.teacherId) {
        // mark the index of where the teacher is
        removePos = index
      }
    })
    if (initialPass) {
      // remove the teacher data from the local stats array so we don't count it in things like averages
      if (removePos > -1) {
        this.commentStats.stats.userStats.splice(removePos, 1)
      }
    }
  }

  /**
   * This gets called whenever the dropdown selection changes
   */
  public changeStudentSelection(): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'readingRecap_studentSelected',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    this.currentStudent = this.students.find(user => user.value === this.selectedStudent)
    this.buildReport()
    this.processTimeChart()
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
    let date = new Date()
    let dateVal = new EdjiDatePipe().transform(date.toDateString())
    formValue.pdfName = this.currentStudent.label + "'s Reading Report - " + dateVal
    formValue.personSharing = this.currentUser.fullname
    formValue.personSharingEmail = this.currentUser.email
    formValue.readingName = this.project.reading_id.title

    this.evalLoading = true

    // create a new evaluation to save to the project
    let evalObj = {
      createdAt: date,
      evaluation: formValue.inputText,
      user_id: this.currentStudent.value,
    }
    var projectToUpdate = this.project
    // add the new evaluation to the project
    projectToUpdate.report_evals.push(evalObj)

    // update the project with the new evaluation, create the pdf, and then email it out
    this._projects.update(projectToUpdate, this.project._id).subscribe(project => {
      // update our project so evaluation shows in the page
      this.evaluations.push(evalObj)

      setTimeout(() => {
        this.saveAsPdf().then(
          pdf => {
            // convert the pdf to a data uri string
            var pdfData = pdf.output('datauristring')

            // user our academy service to package up the email details and send it off to our api if the project successfully updated
            this._academy.sendReadingRecap(formValue, pdfData).subscribe(
              data => { },
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
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'readingRecap_feedbackGiven',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // create a new evaluation to save to the project
    let evalObj = {
      createdAt: new Date(),
      evaluation: evalData,
      user_id: this.currentStudent.value,
    }
    let projectToUpdate = {
      // Ensure "report_evals" exists and is an array
      report_evals: this.project.report_evals ? this.project.report_evals : [],
    }
    // Add the new evaluation to the project
    projectToUpdate.report_evals.push(evalObj)

    // update the project with the new evaluation, create the pdf, and then email it out
    this._projects.update(projectToUpdate, this.project._id).subscribe(project => {
      const newEval = project.report_evals[project.report_evals.length - 1]
      // update our project so evaluation shows in the page
      this.evaluations.push(newEval)
      this._socket.groupUpdateEvent({
        type: 'feedbackUpdate',
        feedback: newEval
      })
    }),
      error => {
        console.error(error)
      }
    // empty out the form
    this.evaluationForm.reset()
  }

  /** Downloads the report to the user's computer */
  public downloadPDF(): void {
    this.evalLoading = true
    this.saveAsPdf().then(
      pdf => {
        let name = this.currentStudent.label.replace(' ', '-') + '_Recap'
        pdf.save(name + '.pdf')
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
      // var doc = new jsPDF('p', 'px', 'letter')
      let ratio = htmlDoc.clientHeight / htmlDoc.clientWidth
      let width = htmlDoc.clientWidth
      let height = htmlDoc.clientHeight
      // if (ratio > 1) {
      //   height = 8.5 * ratio
      // }
      // 1in margins
      const M = 36
      console.log("Height!", height)
      var doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', // on-screen "pixels", fix for high-res screens
        format: [width + M, height + M]
      })
      // report options to pass in
      let options = {
        // pagesplit: true, // until we style page breaks, leave pagesplit disabled
        // retina: true,
        margin: {
          top: M,
          bottom: M,
          right: M,
          left: M,
        },
        height: height + 4,
        width: width + 4
      }

      // set the scale to fit the whole report width on a page
      // doc.internal.scaleFactor = 2

      // Convert the reading report to a pdf
      doc.addHTML(
        htmlDoc,
        M,
        M,
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
      return this.appliedFilter.propertyFilters.user_id.test(student._id)
    } else {
      return false
    }
  }

  /**
   * Close Report
   * - Allows for animation to close before destroying the component
   */
  public close() {
    this.slidePaneIn = false
    // Wait for slide closed to complete
    setTimeout(() => {
      this.hide.emit()
    }, 400)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    this.students = []
  }
}
