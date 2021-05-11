---
category: Utils
url_path: '/utils/signedDonationURL'
title: 'Get signed donations URL'
type: 'GET'

layout: null
---

Get signed donations URL

### Request

* The headers must include a **valid authentication token**.

```Authentication: Bearer <JWT>```

### Response

Sends back a collection of things.

```Status: 200 OK```
```json
{
  "url": "https://donation.bcc.no/donation"
}
```

