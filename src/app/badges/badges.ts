import { MessageToast } from "../_services"

/**
 * Badge requirements and copy
 */
export const BADGES: BadgeData[] = [
    {
        metric: 'readings_created',
        value_required: 1,
        toast: {
            message: '<b>Made your first reading</b><br/>Collaboration awaits!',
            id: 'firstReading',
            type: 'first-reading',
            requireDismiss: true
        }
    },
    {
        metric: 'comments_created',
        value_required: 1,
        toast: {
            type: 'first-comment',
            id: 'firstComment',
            message: '<b>Made your first comment</b><br/>Well said!',
            requireDismiss: true
        }
    }
]

interface BadgeData {
    metric: string
    value_required: number
    toast: MessageToast
}