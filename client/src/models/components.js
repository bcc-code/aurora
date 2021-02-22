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
    WWR: 'wwr'
}

Object.slice = (obj, list) => 
    Object.keys(obj)
          .filter( key => list.includes(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

export const ScreenLRComponents = Object.slice(Components, ['profile-pictures', 'feed-pictures', 'question', 'inquiry'])
export const ScreenMComponents = Object.slice(Components, ['world-map', 'question', 'inquiry'])
export const ScreenEComponents = Object.slice(Components, ['world-map', 'feed-pictures', 'inquiry', 'question', 'wwr', 'buk-games'])
export const ScreenFComponents = Object.slice(Components, ['program', 'information', 'question', 'checkins-count', 'donation', 'inquiry'])
export const ScreenAComponents = Object.slice(Components, ['information', 'question', 'donation', 'wwr'])