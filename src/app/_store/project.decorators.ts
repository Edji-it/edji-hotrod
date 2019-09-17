import { Project } from "../shared/datatypes";

/**
 * Decorators
 * - Shared data manipulators
 * - Pure functions
 */


/**
 * Determine if project is archived, and adds flag
 * @param project to determine if archive
 * @return project with updated flag
 */
export function decorateArchivedProject(project: Project): Project {
    let teacher = project.teacher
    // Identify and set archived
    if (teacher && !teacher.hero_status && teacher.archive_readings_before) {
        /**
         * Readings are "archived" if all are true:
         * - Updated date is prior to archived before date
         * - Readings before Hero v2 (2019-01-01) are "legacy" and not archived
         * - Teacher is NOT Hero
         */
        let archivedBefore = new Date(teacher.archive_readings_before)
        let projectDate = new Date(project.createdAt)
        if (projectDate < archivedBefore && projectDate > new Date('2019-01-01')) {
            project.archived = true
        }
    }
    return project
}