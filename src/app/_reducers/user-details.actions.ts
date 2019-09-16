import { Action } from '@ngrx/store';
import { Response } from '@angular/http';
import { PublicUser } from '../shared/datatypes';

export const Types = {
    LIST: '[PublicUsers] List',
    LIST_SUCCESS: '[PublicUsers] List Success',
    LIST_ERROR: '[PublicUsers] List ERROR',

    UPDATE: '[PublicUsers] Update',
    UPDATE_SUCCESS: '[PublicUsers] Update Success',
    UPDATE_ERROR: '[PublicUsers] Update Error',
};

/**
 * List
 */
export class List implements Action {
    type = Types.LIST;
    students_ids: string[]
    temp_ids: string[]
    constructor(public payload?: any) {
        this.students_ids = payload.students_ids
        this.temp_ids = payload.temp_ids
    }
}
export class ListSuccess implements Action {
    type = Types.LIST_SUCCESS;
    constructor(public payload: PublicUser[]) { }
}
export class ListError implements Action {
    type = Types.LIST_ERROR;
    constructor(public payload: Response) { }
}

/**
 * Update
 */
export class Update implements Action {
    type = Types.UPDATE;
    constructor(public payload: PublicUser) { }
}
export class UpdateSuccess implements Action {
    type = Types.UPDATE_SUCCESS;
    constructor(public payload: PublicUser) { }
}
export class UpdateError implements Action {
    type = Types.UPDATE_ERROR;
    constructor(public payload: Response) { }
}


export type PublicUsersActionTypes =
    List
    | ListSuccess
    | ListError
    | Update
    | UpdateSuccess
    | UpdateError;