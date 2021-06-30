---
category: User
url_path: '/user/linked'
title: 'Get users linked to the current user'
type: 'GET'
layout: null
---

Returns a list of users that are linked to the current user

### Request

* Only accessible with a valid token

Url Params

This endpoint accepts no params

### Response

```Status: 200 OK```
```{
	linkedUsers: []
}
```

```Status: 200 OK```
```{
	"linkedUsers": [
		{
			"genderId": 1,
			"firstName": "John",
			"displayName": "John Smith",
			"countryName": "No-Where Stan",
			"lastName": "Smith",
			"linkedUserIds": [],
			"personId": 7,
			"userGroupId": "bcc",
			"guardian2Id": 1,
			"birthdate": "2000-01-02T00:00:00",
			"churchName": "Svartskog",
			"hasMembership": true,
			"churchId": -99,
			"guardian1Id": 2 
		},
		{
			"linkedUserIds": [],
			"displayName": "Jane Doe",
			"firstName": "Jane",
			"countryName": "No-Where Stan",
			"churchId": -99,
			"personId": 5,
			"lastName": "Doe",
			"genderId": 2,
			"guardian1Id": 1,
			"guardian2Id": 2,
			"userGroupId": "bcc",
			"birthdate": "2010-01-02T00:00:00",
			"hasMembership": true,
			"churchName": "Svartskog"
		}
	]
}
```
