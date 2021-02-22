const n = {
  events: "events",
  questions: "questions",
  answers: "answers",
  responses: "responses",
  gameboard: "gameboard",
  pollResults: "pollResults",
  users: "users",
  permissions: "permissions",
  checkins: "checkins",
  feedIncoming: "feed-incoming",
  feedApproved: "feed-approved",
  feedOutgoing: "feed-outgoing",
  inquiriesIncoming: "inquiries-incoming",
  inquiriesQueue: "inquiries-queue",
  competitions: "competitions",
  entries: "entries",
  banlist: "banlist",
  bukGames: "buk-games",
  distanceShards: "distanceShards",
  distancesPerChurch: "distancesPerChurch",
  pollStats: "poll-stats",
  pollStatsShardCount: 10,
  churches: "churches",
  claims: {
    uid: 'sub',
    firstName: "given_name",
    lastName: "family_name",
    personId: "https://login.bcc.no/claims/personId",
    churchId: "https://login.bcc.no/claims/churchId",
    churchName: "https://login.bcc.no/claims/churchName",
    countryName: "https://login.bcc.no/claims/countryName",
    countryIso2Code: "https://login.bcc.no/claims/CountryIso2Code",
    hasMembership: "https://login.bcc.no/claims/hasMembership",
    app_metadata: "https://members.bcc.no/app_metadata"
  }
};

export { n };
