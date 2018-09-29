import { Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { Component, OnDestroy, OnInit } from '@angular/core'

import { 
    AuthService, 
    ProjectService, 
    ReadingService, 
    SocketService, 
    AudioService, 
    AcademyService
} from '../_services';
import { Project, Reading, User } from './../shared/datatypes';


@Component({
    // moduleId: module.id,
    selector: 'edji-project-page',
    styleUrls: ['project-page.component.scss'],
    templateUrl: './project-page.component.pug',
    providers: [
        // Provided for child audio comments
        AudioService
    ]
})
export class ProjectPageComponent implements OnInit, OnDestroy {

    /*
        Project Page
        Last Mod: 29 July 2017 - Nick Pumper

        The bones for where a project will sit inside of.
    */

    public project: Project = <Project>{}
    public reading: any = {}
    private subscriptions: Subscription[] = []
    private joinedRoom: boolean = false
    public error: string
    private user: User
    // private liveCount: number = 1
    private createdDate: Date
    private createDate: string
    public showLoginModal: boolean = false
    
    constructor(
        private _academy: AcademyService,
        private _router: Router,
        private _projects: ProjectService,
        private _socket: SocketService,
        private _auth: AuthService,
        private route: ActivatedRoute,
        private _readings: ReadingService,
        private _title: Title
    ) {}

    ngOnInit() {
        // this makes the window always render scrolled to the top
        this._router.events.subscribe(() => {
            window.scrollTo(0, 0);
        })

        // gets id from route
        let idParam: string = this.route.snapshot.params['id']

        /** Set the current user every time it changes */
        this.subscriptions.push(
            this._auth.getCurrentUser().subscribe((user) => {
                this.user = user
                if (!this.user.isLoggedIn) { this.showLoginModal = true }
                // Join socket + start reading timer
                if (this.user._id && this.project._id && !this.joinedRoom) {
                    this.joinRoom(this.user, this.project)
                    console.log(' joined socket ')
                }
            })
        )

        // Set current project AND subscribe to updates from that project
        this._projects.setCurrentProject(idParam)
            .subscribe(
            (project) => {
                if (project) {
                    this.project = project
                    // Join socket + start reading timer
                    if (this.user._id && this.project._id && !this.joinedRoom) {
                        this.joinRoom(this.user, this.project)
                    }

                    if (this.project.reading_id && this.project.reading_id['_id']) {
                        this.reading = this.project.reading_id
                        this._readings.setReadingObj(this.project.reading_id)

                        this._title.setTitle( 'Edji | ' + this.reading.title )
                    }
                }
            },
            (error) => {
                // TRACK EXCEPTION
                if (error.status == 404) {
                    // this means that we didn't get the project, so we'll direct them to the 404 page
                    this._router.navigate(['/not-found'])
                }
            })
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe() })
        // End socket connections
        this._socket.leaveRoom()
        this._academy.stopReadingTimer()
    }

    /**
     * Join Socket room and start reading ticks
     * @param user Current user on reading
     * @param project Group user is joining
     */
    private joinRoom(user, project): void {
        this.joinedRoom = true
        // Join Socket Room based on ID param
        this._socket.joinSocketRoom(project._id, user._id)
        // Start Reading Timer
        this._academy.startReadingTimer(user, project)
    }
}