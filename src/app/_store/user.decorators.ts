import { PublicUser, User } from "../shared/datatypes";

/**
 * User Decorators
 * - Shared data manipulators
 * - Pure functions
 */


/**
 * Get initials for name
 * - Shared function for data consistency
 * @param fullname name
 * @return initials
 */
export function generateInitialsFromName(fullname: string): string {
    let names = fullname.split(' ')
    return names[0][0] + (names[1] ? names[1][0] : '')
}