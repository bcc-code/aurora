export const Components = {
    PROFILEPICTURES: 'profile-pictures',
    FEEDPICTURES: 'feed-pictures',
    QUESTION: 'question',
    INQUIRY: 'inquiry',
    WORLDMAP: 'world-map',
    PROGRAM: 'program',
    INFORMATION: 'information',
    CHECKINSCOUNT: 'checkins-count',
    DONATION: 'donation',
    BUKGAMES: 'buk-games',
    WWR: 'wwr',
    VERSE: 'verse',
    DEFAULTTEXT: 'default-text',
    DONATIONSLIST: 'donations-list',
    DONATIONSTOP5: 'donations-top-5',
}

Object.slice = (obj, list) =>
    Object.keys(obj)
        .filter( key => list.includes(obj[key]) )
        .reduce( (res, key) => (res[key] = obj[key], res), {} );

export const ScreenLRComponents = Object.slice(Components, ['world-map', 'profile-pictures', 'feed-pictures', 'question', 'inquiry', 'donations-top-5'])
export const ScreenMComponents = Object.slice(Components, ['world-map', 'question', 'inquiry'])
export const ScreenEComponents = Object.slice(Components, ['world-map', 'feed-pictures', 'inquiry', 'question', 'wwr', 'buk-games', 'donations-list'])
export const ScreenFComponents = Object.slice(Components, ['program', 'information', 'question', 'checkins-count', 'donation', 'inquiry', 'verse'])
export const ScreenAComponents = Object.slice(Components, ['information', 'default-text', 'question', 'donation', 'wwr'])
