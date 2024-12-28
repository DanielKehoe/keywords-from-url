# DataForSEO API Authentication

See the API Authentication Documentation web page at https://docs.dataforseo.com/v3/auth/?javascript

Create an account with DataForSEO and then use the credentials from your account dashboard to access DataForSEO APIs. Note that the API password is generated automatically by DataForSEO and is different from your account password.

DataForSEO is using the Basic Authentication, which makes it possible to call our APIs with almost any programming language, Postman app, REST API platforms, and all major frameworks.

Regardless of the programming language, your unique API token should be passed in the ‘Authorization’ header within the request in the following format:
Authorization: Basic 
login:password

Instead of “login” and “password”, use your API credentials encoded in Base64.
For instance, the Base64-encoded ‘login:password’ value will have the following format:
bG9naW46cGFzc3dvcmQ=

So the whole string will look as follows:
Authorization: Basic bG9naW46cGFzc3dvcmQ=

Check the examples for PHP, Python, and C# on the right to see how it works with a particular programming language.

Note that it is not possible to pass the login and password in URL parameters. Also, you do not have to make a separate authentication call to obtain API credentials. Basic authentication is the only way to access DataForSEO API; credentials should always be passed in the header of the request.

# Methods
 
DataForSEO Labs API supports only the Live method of data retrieval. It doesn’t require making separate POST and GET requests to the corresponding endpoints and delivers instant results.

You can send up to 2000 API calls per minute. Contact us if you would like to raise the limit.
Note that the maximum number of requests that can be sent simultaneously is limited to 30.

# Filters for DataForSEO Labs API
‌‌
Here you will find all the necessary information about filters that can be used with DataForSEO Labs API endpoints.
https://docs.dataforseo.com/v3/dataforseo_labs/filters/?javascript

Please, keep in mind that filters are associated with a certain object in the result array, and should be specified accordingly.

We recommend learning more about how to use filters in this Help Center article.
https://dataforseo.com/help-center/using-filters

# Data encoding

All data you send to DataForSEO API should be UTF-8 encoded.

If you use one of the Clients listed in the first table, gzip will be the default format of data exchange. You will see Content-Encoding: gzip in the header.

All the responses are returned in the JSON format by default, but we also support responses in the XML format – just append .xml to the end of your request. In addition to that, you can request HTML results from endpoints that return HTML-encoded results by appending .html to the end of the request’s URL path.

For example, the following requests will return response encoded in XML or HTML accordingly:
https://api.dataforseo.com/v3/appendix/user_data.xml
https://api.dataforseo.com/v3/serp/google/organic/task_get/html/09061543-1535-0066-0000-6240830f56ba.html

# Rate Limits

Each of DataForSEO APIs has a certain rate limit, which you can find in the HTTP header of every endpoint.

Rate limit HTTP headers we use:
X-RateLimit-Limit – the rate limit ceiling per minute for the given endpoint;
X-RateLimit-Remaining – the number of requests remaining in the current rate limit window.

If your system requires rate limits to be increased, please contact our support team.