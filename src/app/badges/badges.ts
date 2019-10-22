import { MessageToast } from "../_services"

/**
 * Badge requirements and copy
 */
export const BADGES: BadgeData[] = [
    {
        metric: 'readings_created',
        value_required: 1,
        toast: {
            message: '<b>Success, first reading created</b><br/>Collaboration awaits!',
            id: 'firstReading',
            type: 'first-reading',
            limitToPage: 'project',
            requireDismiss: true
        }
    },
    {
        metric: 'comments_created',
        value_required: 1,
        toast: {
            type: 'first-comment',
            id: 'firstComment',
            message: '<b>Well said!</b><br/>You made your first comment',
            requireDismiss: true
        }
    }
]

interface BadgeData {
    metric: string
    value_required: number
    toast: MessageToast
}