import { Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

// Internal
import { ProjectStore } from 'src/app/_store'
import { Project } from '../../shared/datatypes'
import { UtilToolService } from './../../_services'

@Component({
  selector: 'share-code',
  templateUrl: './share-code.component.pug',
  styleUrls: ['./share-code.component.scss'],
})
export class ShareCodeComponent implements OnInit, OnDestroy {
  public show: boolean = false
  private codeLetters: any
  private subscriptions: Subscription[] = []
  public currentProject: Project
  private shareUrl = ''

  // Messaging vars
  public showIntroAlert: boolean
  public showOnNewReading: boolean

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private projectStore: ProjectStore,
  ) {}

  ngOnInit() {
    // Subscribe to current Project data
    this.subscriptions.push(
      this.projectStore.currentProject.subscribe(
        project => {
          this.currentProject = project
          this.shareUrl = `${location.origin}/${this.currentProject.code}`
        },
        error => {
          console.error(error)
        },
      ),
      this.route.queryParams.subscribe(
        params => {
          console.log(params)
          // Handle new reading
          if (params.readingCodeModal) {
            this.show = true
          } else {
            this.show = false
          }
          // Handle first reading tutorial
          if (params.readingCodeModal && params.guide === 'welcome') {
            this.showIntroAlert = true
          }
        }
      )
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  private isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val)
  }

  private navProject(project_id) {
    this._util.shareCodeModalClose()
    this.router.navigate(['project', project_id])
  }

  private navDashboard() {
    this._util.shareCodeModalClose()
    this.router.navigate(['dashboard'])
  }

  /**
   * Close modal
   */
  public close(): void {
    // Clear param
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { readingCodeModal: null },
      queryParamsHandling: 'merge',
    })
  }
}
