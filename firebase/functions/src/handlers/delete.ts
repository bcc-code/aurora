import firebaseTools from 'firebase-tools'
import { Request, Response } from 'express'
import { logger } from '../log'

const log = logger('handler/delete')

const recursiveDelete = async (path: string) => {
    return await firebaseTools.firestore.delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
    })
}

export async function deleteQuestion(req: Request, res: Response) {
    try {
        const { event, questionId } = req.params
        await recursiveDelete(`events/${event}/questions/${questionId}`)
        return res.sendStatus(200)
    } catch (err) {
        log.error(err)
        return res.status(500).send({
            message: 'An error occurred while deleting the question.',
            error: err,
        })
    }
}

export async function deleteEvent(req: Request, res: Response) {
    try {
        const { event } = req.params
        await recursiveDelete(`events/${event}`)
        return res.sendStatus(200)
    } catch (err) {
        log.error(err)
        return res.status(500).send({
            message: 'An error occurred while deleting the event.',
            error: err,
        })
    }
}
