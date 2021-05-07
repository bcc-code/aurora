---
description: Utility function for auxiliary systems
---

# Utils

{% hint style="danger" %}
Get signed donations URL is currently only implemented as a dummy. The interfaces are correct but it does not have the described functionality yet
{% endhint %}

{% api-method method="get" host="<FIREBASE URL>" path="/utils/signedDonationURL" %}
{% api-method-summary %}
Get signed donations URL
{% endapi-method-summary %}

{% api-method-description %}
This endpoint validates the users credentials and if the user has access it will generate a short lived URL for donations that can log the user in without going through the login process.  
This is used by the App to provide seamless donation experience.  
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=true %}
JWT Bearer tokeas
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```
{
  "url": "https://donation.bcc.no/donation"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```
{
  "error": {
    "name": "UnauthorizedError",
    "message": "invalid token",
    "code": "invalid_token",
    "status": 401,
    "inner": {
      "name": "JsonWebTokenError",
      "message": "invalid token"
    }
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

