---
category: Events
url_path: '/events/list'
title: 'Get list of open events'
type: 'GET'

layout: null
---

Returns a list of events with some basic data

### Request

* Only accessible with a valid admin token

**Url Params**

This endpoint accepts no params

### Response

Returns a list of events

```Status: 200 OK```
```[
	{
		"id": "5",
			"order": 1,
			"name": "This is for you Michal"
	},
	{
		"order": 2,
		"name": "Påske",
		"id": "0"
	},
	{
		"order": 3,
		"name": "Event with template",
		"id": "1001"
	},
	{
		"id": "6",
		"name": "Still a test",
		"order": 4
	},
	{
		"name": "Påskestevnet 2021",
		"order": 6,
		"id": "1003"
	},
	{
		"order": 7,
		"name": "Påskemorgen",
		"id": "1004"
	},
	{
		"name": "Test",
		"order": 8,
		"id": "1005"
	},
	{
		"name": "Test2",
		"order": 9,
		"id": "1006"
	},
	{
		"order": 10,
		"name": "FKTB test",
		"id": "1007"
	},
	{
		"order": 11,
		"name": "BRMA",
		"id": "1008"
	},
	{
		"order": 13,
		"name": "Søndagsmøte",
		"id": "1010"
	},
	{
		"order": 14,
		"name": "Mock up",
		"id": "1011"
	},
	{
		"name": "MD Test 3",
		"order": 15,
		"id": "1012"
	}
]
```
