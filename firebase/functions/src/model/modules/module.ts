import { EventRefs } from "../../types/event";

export class Module {
    event: EventRefs;

    constructor (event: EventRefs) {
        this.event = event;
    }
}