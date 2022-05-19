# url-shortner

Models

Url Model
{ urlCode: { mandatory, unique, lowercase, trim }, longUrl: {mandatory, valid url}, shortUrl: {mandatory, unique} }

POST /url/shorten

Create a short URL for an original url recieved in the request body.
The baseUrl must be the application's baseUrl. Example if the originalUrl is http://abc.com/user/images/name/2 then the shortened url should be http://localhost:3000/xyz
Return the shortened unique url. Refer this for the response
Ensure the same response is returned for an original url everytime
Return HTTP status 400 for an invalid request


GET /:urlCode

Redirect to the original URL corresponding
Use a valid HTTP status code meant for a redirection scenario.
Return a suitable error for a url not found
Return HTTP status 400 for an invalid request


Testing

To test these apis create a new collection in Postman named Project 4 Url Shortner
Each api should have a new request in this collection
Each request in the collection should be rightly named. Eg Url shorten, Get Url etc
Each member of each team should have their tests in running state


Phase II

Use caching while creating the shortened url to minimize db calls.
Implement what makes sense to you and we will build understanding over the demo discussion.
Figure out if you can also use caching while redirecting to the original url from the shortedned url
Response