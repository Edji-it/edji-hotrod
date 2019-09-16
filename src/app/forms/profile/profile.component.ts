import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'

// Project Dependencies
import { AuthService, ProjectService, LockerService, MailchimpService, AcademyService, BumblebeeService } from '../../_services'
import { Copy } from '../../shared'
import { ALLSPARK } from '../../app.constants'
import { take } from 'rxjs/operators'
import { Title } from '@angular/platform-browser'
import { User, UserSchoolDistrict } from 'src/app/shared/datatypes';

@Component({
    selector: 'hot-profile-form',
    templateUrl: './profile.component.pug',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileFormComponent implements OnInit {
    /** The reading id that the user wanted to make a copy of */
    @Output() profileSuccess: EventEmitter<any> = new EventEmitter()

    private subscriptions: Subscription[] = []

    public profileForm: FormGroup
    public profileFormLoading: boolean = false
    public errorObject: {
        serverError?: boolean
        badName?: string
    } = {}
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

    public initials: string = ''
    public schoolInfo: UserSchoolDistrict

    // Redirect params
    public readingToAdd: string
    public readingToPreview: string
    public projectToAdd: string

    constructor(
        private _auth: AuthService,
        private _fb: FormBuilder,
        private _router: Router,
        private route: ActivatedRoute,
        private _angulartics: Angulartics2,
        private _chimp: MailchimpService,
        private _academy: AcademyService,
        private _bumble: BumblebeeService
    ) {
        // Used for prefilled values
        let userSoFar = this._auth.getUser()
        let prefillFirst = ''
        let prefillLast = ''
        if (userSoFar.fullname) {
            let i = userSoFar.fullname.indexOf(' ')
            if (i > 0) {
                prefillFirst = userSoFar.fullname.slice(0, i)
                prefillLast = userSoFar.fullname.slice(i + 1)
            } else {
                prefillFirst = userSoFar.fullname
            }
        }

        // Used for placeholder values in template
        this.userCopy = new Copy().getUserCopy()

        this.profileForm = _fb.group(
            {
                firstname: [prefillFirst, Validators.required],
                lastname: [prefillLast, Validators.required],
                accountRole: ['student', Validators.required],
                school: [null],
            }, {
                validator: this.schoolValidator
            }
        )
        // Init Initials
        this.setInitials(this.profileForm)
    }

    ngOnInit() {
        this.subscriptions.push(
            this.route.queryParams.subscribe(queryParams => {
                this.readingToAdd = queryParams['reading']
                this.readingToPreview = queryParams['preview']
                this.projectToAdd = queryParams['project']
            }),
        )
    }

    /** 
     * Validates if school is required
     * @returns error which should be assigned to the school input
     */
    private schoolValidator(group: FormGroup): any {
        let role = group.get('accountRole').value
        let school = group.get('school').value
        if (ALLSPARK.SCHOOL_IDENTITIES.includes(role) && !school) {
            return { schoolRequired: true }
        } else {
            return null
        }
    }


    getProfileName(form): string {
        let first = '<i>My</i>' // placeholder values
        let last = '<i>Profile</i>'
        if (form.controls['firstname'].value) {
            first = form.controls['firstname'].value
        }
        if (form.controls['lastname'].value) {
            last = form.controls['lastname'].value
        }
        return first + ' ' + last
    }

    setInitials(form): string {
        let initials = ''
        if (form.controls['firstname'].value) {
            initials = form.controls['firstname'].value[0]
        }
        if (form.controls['lastname'].value) {
            initials += form.controls['lastname'].value[0]
        }
        this.initials = initials
        // Update user object to display in Nav
        this.tempLocalUserUpdate("initials", initials)
        return initials
    }

    isSchoolStaff(identity: string): boolean {
        return ALLSPARK.SCHOOL_IDENTITIES.indexOf(identity) > -1
    }

    /**
     * Handles school selector output
     */
    updateSchoolInfo(schoolInfo: UserSchoolDistrict) {
        // Save school info locally to be processed by updateProfile()
        this.schoolInfo = schoolInfo
    }

    /**
     * Update local user property for display while editing (eg. initials)
     * @param property "initials"
     * @param value "AB"
     */
    tempLocalUserUpdate(property, value) {
        let user = this._auth.getUser()
        user[property] = value
        // This only updates the user locally, but will save update to DB when user finished
        this._auth.setUser(user)
    }

    /**
     * Bring the user to their dashboard, or where they were headed
     * @param data Registration user response
     */
    handleProfileCompleteRouting(data): void {
        if (this.readingToAdd) {
            this._router.navigate(['/new-reading'], { queryParams: { copyId: this.readingToAdd } })
        } else if (this.readingToPreview) {
            this._router.navigate(['/discover'], { queryParams: { preview: this.readingToPreview } })
        } else {
            // default case where nothing special happens
            this._router.navigate(['/dashboard'])
        }
    }

    /**
     * The user now has a full account!
     * - Track the event
     * @param user 
     */
    reportUserCreated(user) {
        // Track registration via GA
        this._angulartics.eventTrack.next({
            action: 'registration',
            properties: {
                category: this._auth.setAnalyticEventCategory(),
                label: this._auth.setAnalyticEventLabel(),
            },
        })
        if (!user.identities) {
            console.error("User was created without identities array")
            return
        }
        // If NOT student, add to mailing list and Pipo
        if (!user.identities.includes('student')) {
            this._chimp.addToNewUsersList(user)
            // send the data to Pipo to track registrations if they are a teacher
            this._academy.pipoEvent({
                // standard event info:
                event_name: 'registration',
                user_id: user._id,
                teacher: true,
                hero: user.hero_status || false,
                institution_id: user.institution_ids || [],
            })
        }
    }

    /**
     * Save users profile, and continue on
     */
    updateProfile(form): void {
        this.errorObject = {}
        this.profileFormLoading = true

        let user: User = this._auth.getUser()
        user.firstname = form.firstname
        user.lastname = form.lastname
        user.fullname = form.firstname + ' ' + form.lastname
        user.identities = [form.accountRole]
        user.initials = this.initials
        if (this.schoolInfo && this.isSchoolStaff(form.accountRole)) {
            user.school = this.schoolInfo
        }
        console.log(user)
        // Update user will fetch most recent user object, update properties given
        this._auth.updateUser(user)
            .pipe(take(1))
            .subscribe(
                data => {
                    this.profileFormLoading = false
                    // User Profile completion events
                    this.reportUserCreated(data.user)
                    // Bring the user to their dashboard, or where they were headed
                    this.handleProfileCompleteRouting(data)
                },
                err => {
                    this.profileFormLoading = false
                    let error = err.error
                    // If the full name has bad words
                    if (error.validationErrors.fullname === 'badWords') {
                        this.errorObject.badName = ':anguished: Would you mind choosing another name?'
                    } else {
                        console.error(err)
                        this.errorObject.serverError = true
                    }
                }
            )
    }
}