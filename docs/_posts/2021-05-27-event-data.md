---
category: Events
url_path: '/events/data'
title: 'Get data about a specific event'
type: 'GET'

layout: null
---

Returns some data about the specific event. 

### Request

* Only accessible with a valid admin token

**Url Params**

* `eventId`: string (required) - Event ID of the event you want data for

### Response

Sends back some data about the event. It is currently only returning data we have a use for but
but can be extended on demand.

```Status: 200 OK```
```{
  "id": "ID",
  "name": "Event Name",
  "logo": "http://placekitten.com/200/300",
   "banner": "http://placekitten.com/200/300"
}```

