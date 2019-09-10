import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router } from '@angular/router'

// Project Dependencies
import { AuthService, ProjectService, LockerService } from '../../_services'
import { Copy } from '../../shared'
import { ALLSPARK } from '../../app.constants'
import { take } from 'rxjs/operators'
import { Title } from '@angular/platform-browser'

@Component({
    selector: 'hot-profile-form',
    templateUrl: './profile.component.pug',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileFormComponent implements OnInit {
    /** The reading id that the user wanted to make a copy of */
    @Input() readingToAdd: string
    @Input() projectToAdd: string
    /** The project id that the user wanted to add to the dashboard */
    @Input() tempUserId: string
    @Input() referralId: string
    @Input() noRedirect: boolean

    @Output() registerSuccess: EventEmitter<any> = new EventEmitter()

    private subscriptions: Subscription[] = []

    public profileForm: FormGroup
    public profileFormLoading: boolean = false
    // public errorObject: {
    //     duplicateUsername?: boolean
    //     duplicateEmail?: boolean
    //     serverError?: boolean
    //     badName?: string
    //     badUsername?: string
    // } = {}
    // public successObject: {
    //     referral?: boolean
    // } = {}
    // public userReferral: any = {}

    public userCopy: any

    public moreIdentities = [
        { name: 'administrator', id: 'typeAdministratorInput', displayName: ':clipboard: Administrator', emoji: ':clipboard:' },
        { name: 'coach', id: 'typeTechCoachInput', displayName: ':computer: Tech Coach', emoji: ':computer:' },
        { name: 'business', id: 'typeBusinessInput', displayName: ':briefcase: Business', emoji: ':briefcase:' },
        { name: 'personal', id: 'typePersonalInput', displayName: ':books: Personal', emoji: ':books:' },
        { name: 'robot', id: 'typeRobotInput', displayName: ':robot_face: Robot', emoji: ':robot_face:' },
        { name: 'other', id: 'typeOtherInput', displayName: ':sparkles: Other', emoji: ':sparkles:' },
    ]

    public showMoreIdentities: boolean

    constructor(
        private _auth: AuthService,
        private _project: ProjectService,
        private _fb: FormBuilder,
        private _title: Title,
        private _locker: LockerService,
        private _router: Router,
    ) {
        this.userCopy = new Copy().getUserCopy()

        this.profileForm = _fb.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                accountRole: ['student', Validators.required],
                school: [null, Validators.required],
            }
        )
    }

    ngOnInit() { }

    getProfileName(form): string {
        let first = '<i>My</i>'
        let last = '<i>Profile</i>'
        if (form.controls['firstName'].value) {
            first = form.controls['firstName'].value
        }
        if (form.controls['lastName'].value) {
            last = form.controls['lastName'].value
        }
        return first + ' ' + last
    }

    getInitials(form): string {
        let initials = ''
        if (form.controls['firstName'].value) {
            initials = form.controls['firstName'].value[0]
        }
        if (form.controls['lastName'].value) {
            initials += form.controls['lastName'].value[0]
        }
        return initials
    }

    isSchoolStaff(identity: string): boolean {
        return ['teacher', 'administrator', 'coach'].indexOf(identity) > -1
    }
}