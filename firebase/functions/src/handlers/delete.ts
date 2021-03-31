import firebaseTools from 'firebase-tools';
import handler from './handler'
import { Request } from "../types"
import { jwtCheck, adminCheck } from "../middleware";
import { logger } from '../log';

const log = logger('handler/delete');
const deleteHandler = handler();

const recursiveDelete = async (path: string) => {
    return await firebaseTools.firestore
        .delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true
    });
}
deleteHandler.post("/event/:event/question/:questionId", jwtCheck, adminCheck, async function (req: Request, res, next) {
    try {
        const { event, questionId } = req.params;
        await recursiveDelete(`events/${event}/questions/${questionId}`)
        return res.sendStatus(200)
    } catch (err) {
        log.error(err);
        return res.status(500).send({
            message: "An error occurred while deleting the question.",
            error: err,
        });
    }
});

deleteHandler.post("/event/:event", jwtCheck, adminCheck, async function (req: Request, res, next) {
    try {
        const { event } = req.params;
        await recursiveDelete(`events/${event}`)
        return res.sendStatus(200)
    } catch (err) {
        log.error(err);
        return res.status(500).send({
            message: "An error occurred while deleting the event.",
            error: err,
        });
    }
});

export { deleteHandler };
