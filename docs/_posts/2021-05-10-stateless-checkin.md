---
category: Checkin
url_path: '/checkin/stateless'
title: 'Checkin to an event'
type: 'POST'

layout: null
---

This allows checkins without specifying the eventID.

### Request

* The headers must include a **valid authentication token**.

**Url Params**

* `platform`: string (optional) - Provide a string for analytics purposes

```Authentication: Bearer <JWT>```

### Response

Sends back a collection of things.

```Status: 200 OK```
```{
	"canCheckin": true,
	"checkedIn": true,
	"personId": 92929389932,
	"firstName": "John",
	"lastName": "Smith",
	"profilePicture": "<URL>",
	"age": 293,
	"linkedUsers": []
}```

