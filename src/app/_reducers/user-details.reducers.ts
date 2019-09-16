import { Action, createSelector } from '@ngrx/store';
// @todo unify ngrx state on one AppState
// import { AppState } from '../reducer';
import * as publicUserActions from './user-details.actions';
import { PublicUser } from '../shared/datatypes';

export interface PublicUsersState {
    readonly loading: boolean;
    readonly entities: PublicUser[];
}

const initialState: PublicUsersState = {
    loading: false,
    entities: [],
};

const publicUserReducer = (publicUser: PublicUser, action: publicUserActions.PublicUsersActionTypes): PublicUser => {

    switch (action.type) {
        case publicUserActions.Types.UPDATE:
            return Object.assign({}, publicUser, {
                action: true
            });

        case publicUserActions.Types.UPDATE_SUCCESS:
            return Object.assign({}, action.payload, {
                action: false
            });

        default:
            return publicUser;
    }
};

export const userDetailsReducer = (state: PublicUsersState = initialState, action: publicUserActions.PublicUsersActionTypes): PublicUsersState => {

    switch (action.type) {
        case publicUserActions.Types.LIST:
            return Object.assign({}, state, { loading: true });

        case publicUserActions.Types.LIST_SUCCESS:
            console.log("Success!", action)
            return {
                loading: false,
                entities: action.payload
            };

        // Delegate to newsItemReducer
        case publicUserActions.Types.UPDATE:
        case publicUserActions.Types.UPDATE_SUCCESS:
            return Object.assign({}, state, {
                entities: state.entities.map(publicUser => {
                    // Only call sub reducer if the incoming actions id matches
                    if (publicUser._id === (action.payload.publicUser || action.payload)._id) {
                        return publicUserReducer(publicUser, action);
                    }
                    return publicUser;
                })
            });

        default:
            return state;
    }

};