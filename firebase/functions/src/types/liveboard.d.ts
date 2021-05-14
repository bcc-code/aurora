export interface Gradient {
    from: string,
    to: string,
}

export interface Background {
    gradient?: Gradient,
    image?: string,
}

export enum Action {
    POST = 'post',
    FEED = 'feed',
    TESTEMONY = 'testimony',
    INQUIRY = 'inquiry',
    QUIZ = 'quizz',
    URL = 'url',
    DEEPLINK = 'deeplink',
    DONATION = 'donation',
}

export enum Icon {
    BOOK = 'book',
    CAMERA = 'camera',
    CYCLING = 'cycling',
    EXPLORE = 'explore',
    FEED = 'feed',
    FIRE = 'fire',
    GAME = 'game',
    HAPPY = 'happy',
    HEART = 'heart',
    INFO = 'information',
    LOCATION = 'location',
    PLUS = 'plus',
    POST = 'post',
    QUESTION = 'question',
    RUNNING = 'running',
    SUPPORT = 'support',
    SURVEY = 'survey',
    URL = 'url',
    VIDEO = 'video',
    NONE = '',
}

export type TransatedString = Record<string, string>

export interface Button {
    action: Action,
    color?: string,
    icon: Icon,
    label: TransatedString,
    url?: string,
}

export interface IconElement {
    name: Icon,
    color?: string,
}

export interface Liveboard {
    background?: Background
    button: Button
    icon: IconElement
    order: number
    title: TransatedString
}

