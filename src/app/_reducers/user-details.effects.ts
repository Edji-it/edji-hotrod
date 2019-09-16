import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { UserDetailsService, ProjectService } from '../_services';

@Injectable()
export class UserDetailsEffects {

    loadPublicUsers$ = createEffect(() => {
        // let currentProject = this._project.currentProjectSource.value
        // let student_ids: string[] = currentProject.students_ids
        // let temp_ids: string[] = currentProject.temp_ids

        return this.actions$.pipe(
            ofType('[PublicUsers] List'),
            mergeMap((action) => this._users.getUserDetails(action)
                .pipe(
                    map(users => ({ type: '[PublicUsers] List Success', payload: users })),
                    catchError(() => of({ type: '[PublicUsers] List ERROR' }))
                )
            )
        )
    }
    );

    constructor(
        private actions$: Actions,
        private _users: UserDetailsService
    ) { }
}