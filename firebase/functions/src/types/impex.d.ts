export interface ExportRequest {
    eventId?: string,
    exportName?: string,
    eventData?: boolean,
    screens?: boolean,
    liveboard?: boolean,
    desk?: boolean,
    program?: boolean,
    feed?: boolean,
    gameboard?: boolean,
}

export interface ImportRequest {
    eventId?: string,
    importFrom?: string,
    eventData?: boolean,
    screens?: boolean,
    liveboard?: boolean,
    clearLiveboard?: boolean,
    desk?: boolean,
    program?: boolean,
    feed?: boolean,
    gameboard?: boolean,
}
