# Title: Prerequisites

URL Source: https://developers.google.com/webmaster-tools/v1/prereqs

Markdown Content:
This document describes the things you should do before writing your first client application.

Get a Google Account
--------------------

You need a [Google Account](https://www.google.com/accounts/NewAccount) to use this API. Your account must have the appropriate Search Console permission on a given property in order to call that method on that property. For example, in order to run [searchAnalytics.query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) you need read permissions on that property.

Try out Google Search Console
-----------------------------

This API documentation assumes that you've used [Google Search Console](https://search.google.com/search-console/), and that you're familiar with web programming concepts and web data formats.

If you haven't used Google Search Console, then try out the [user interface](https://search.google.com/search-console/) before starting to code. Each API represents the functionality of a report in Search Console. You should [read the documentation for the equivalent report](https://support.google.com/webmasters/topic/9456557) before using an API in order to understand the data you receive.

Create a project and credentials for your client
------------------------------------------------

Before you can send requests to Google Search Console, you need to tell Google about your client and activate access to the API. You do this by using the Google API Console to create a project, which is a named collection of settings and API access information, and register your application.

All Search Console APIs except the Testing Tools API require OAuth2 credentials. The Python and Java quickstart guides provide details on how to create a project and get credentials for your client.

Understand REST basics
----------------------

There are two ways to invoke the API:

*   Sending HTTP requests and parsing the responses.
*   Using [client libraries](https://developers.google.com/webmaster-tools/v1/libraries).

If you decide not to use client libraries, you'll need to understand the basics of REST.

#### REST basics

REST is a style of software architecture that provides a convenient and consistent approach to requesting and modifying data.

The term REST is short for "[Representational State Transfer](https://en.wikipedia.org/wiki/Representational_state_transfer)." In the context of Google APIs, it refers to using HTTP verbs to retrieve and modify representations of data stored by Google.

In a RESTful system, resources are stored in a data store; a client sends a request that the server perform a particular action (such as creating, retrieving, updating, or deleting a resource), and the server performs the action and sends a response, often in the form of a representation of the specified resource.

In Google's RESTful APIs, the client specifies an action using an HTTP verb such as `POST`, `GET`, `PUT`, or `DELETE`. It specifies a resource by a globally-unique URI of the following form:

https://www.googleapis.com/apiName/apiVersion/resourcePath?parameters
Because all API resources have unique HTTP-accessible URIs, REST enables data caching and is optimized to work with the web's distributed infrastructure.

You may find the [method definitions](https://tools.ietf.org/html/rfc7231#section-4.3) in the HTTP 1.1 standards documentation useful; they include specifications for `GET`, `POST`, `PUT`, and `DELETE`.

### REST in the Google Search Console API

The Google Search Console API operations map directly to REST HTTP verbs.

The format for most Google Search Console API URIs are something like this:

VERB https://www.googleapis.com/webmasters/v3/resourcePath?parameters
The full set of URIs and verbs used for each method are given in the [Google Search Console API Reference](https://developers.google.com/webmaster-tools/v1/api_reference_index) overview.

Understand JSON basics
----------------------

The Google Search Console API returns data in JSON format.

[JSON](http://en.wikipedia.org/wiki/JSON) (JavaScript Object Notation) is a common, language-independent data format that provides a simple text representation of arbitrary data structures. For more information, see [json.org](http://www.json.org/).

# Title: Authorize Requests

URL Source: https://developers.google.com/webmaster-tools/v1/how-tos/authorizing

Markdown Content:
Search Console API auth requirements
------------------------------------

Every request your application sends to the Google Search Console API must include an authorization token. The token also identifies your application to Google.

Your application must use [OAuth 2.0](https://developers.google.com/identity/protocols/OAuth2) to authorize requests. No other authorization protocols are supported. If your application uses [Sign In With Google](https://developers.google.com/identity/gsi/web), some aspects of authorization are handled for you.

Authorizing requests with OAuth 2.0
-----------------------------------

All requests to the Google Search Console API must be authorized by an authenticated user.

The details of the authorization process, or "flow," for OAuth 2.0 vary somewhat depending on what kind of application you're writing. The following general process applies to all application types:

1.  When you create your application, you register it using the [Google API Console](https://console.cloud.google.com/). Google then provides information you'll need later, such as a client ID and a client secret.
2.  Activate the Google Search Console API in the Google API Console. (If the API isn't listed in the API Console, then skip this step.)
3.  When your application needs access to user data, it asks Google for a particular **scope** of access.
4.  Google displays a **consent screen** to the user, asking them to authorize your application to request some of their data.
5.  If the user approves, then Google gives your application a short-lived **access token**.
6.  Your application requests user data, attaching the access token to the request.
7.  If Google determines that your request and the token are valid, it returns the requested data.

Some flows include additional steps, such as using **refresh tokens** to acquire new access tokens. For detailed information about flows for various types of applications, see Google's [OAuth 2.0 documentation](https://developers.google.com/identity/protocols/OAuth2).

Here's the OAuth 2.0 scope information for the Google Search Console API:

| Scope | Meaning |
| --- | --- |
| `https://www.googleapis.com/auth/webmasters` | Read/write access. |
| `https://www.googleapis.com/auth/webmasters.readonly` | Read-only access. |

To request access using OAuth 2.0, your application needs the scope information, as well as information that Google supplies when you register your application (such as the client ID and the client secret).

**Tip:** The Google APIs client libraries can handle some of the authorization process for you. They are available for a variety of programming languages; check the [page with libraries and samples](https://developers.google.com/webmaster-tools/v1/libraries) for more details.

* * *

Acquiring and using an API key
------------------------------

Requests to the Search Console Testing Tools API for public data must be accompanied by an identifier, which can be an [API key](https://developers.google.com/console/help/generating-dev-keys) or an [access token](https://developers.google.com/accounts/docs/OAuth2).

To acquire an API key:

1.  Open the [Credentials page](https://console.cloud.google.com/apis/credentials) in the API Console.
2.  This API supports two types of credentials. Create whichever credentials are appropriate for your project:
    *   **OAuth 2.0:** Whenever your application requests private user data, it must send an OAuth 2.0 token along with the request. Your application first sends a client ID and, possibly, a client secret to obtain a token. You can generate OAuth 2.0 credentials for web applications, service accounts, or installed applications.

        For more information, see the [OAuth 2.0 documentation](https://developers.google.com/identity/protocols/OAuth2).

    *   **API keys:** A request that does not provide an OAuth 2.0 token must send an API key. The key identifies your project and provides API access, quota, and reports.

        The API supports several types of restrictions on API keys. If the API key that you need doesn't already exist, then create an API key in the Console by clicking **[Create credentials](https://console.cloud.google.com/apis/credentials)  \> API key**. You can restrict the key before using it in production by clicking **Restrict key** and selecting one of the **Restrictions**.


To keep your API keys secure, follow the [best practices for securely using API keys](https://cloud.google.com/docs/authentication/api-keys).

After you have an API key, your application can append the query parameter `key=yourAPIKey` to all request URLs.

The API key is safe for embedding in URLs; it doesn't need any encoding.


# Title: Query your Google Search analytics data

URL Source: https://developers.google.com/webmaster-tools/v1/how-tos/search_analytics

Markdown Content:
You can run queries over your Google Search data to see how often your property appears in Google Search results, with what queries, whether from desktop or smartphones, and much more. You can use the results to improve your property's search performance, for example:

*   See how your search traffic changes over time, where it's coming from, and what search queries are most likely to show your property.
*   Learn which queries are made on smartphones, and use this to improve your mobile targeting.
*   See which pages have the highest (and lowest) click-through rate from Google search results.

Search query data is exposed using the `searchanalytics.[query()](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)` method. The `query()` method exposes all the data available in the [Performance report](https://search.google.com/search-console/performance/search-analytics) in Search Console. Before running any queries, you should [read the Performance report documentation](https://support.google.com/webmasters/answer/6155685) to learn what data is exposed and what it means.

This page shows how to perform common queries with different request parameters.

Getting started
---------------

### Verify the presence of data

Before running a query, you should first test for the presence of data in that time range. Omit filters, sorting, row limits, and any other parameters except start date, end date, and "date" as the only dimension.

**Code**

request = {
      'startDate': flags.start\_date,
      'endDate': flags.end\_date,
      'dimensions': \['date'\]
  }
**Output**

python search\_analytics\_api\_sample.py 'https://www.example.com/' '2015-05-01' '2015-05-15'
Available dates:
Keys                              Clicks         Impressions                 CTR            Position
2015-05-01                       22823.0            373911.0     0.0610385893969        8.1829472789
2015-05-02                       16075.0            299718.0     0.0536337490574       8.14173322924
2015-05-03                       18794.0            337759.0      0.055643224903       8.07772405769
2015-05-04                       31894.0            468076.0     0.0681385074219        7.4104611217
2015-05-05                       34392.0            482919.0      0.071216912153       7.20689805123
2015-05-06                       35650.0            484353.0     0.0736033430164       7.11683214515
2015-05-07                       33994.0            465812.0     0.0729779395979       6.91755472165
2015-05-08                       27328.0            413007.0     0.0661683700276       7.22172747677
2015-05-09                       16637.0            297302.0     0.0559599329974       8.01876206685
2015-05-10                       19167.0            332607.0     0.0576265682923       7.87882696395
2015-05-11                       35358.0            499888.0      0.070731843933       7.11701821208
2015-05-12                       35952.0            486583.0      0.073886675038       6.80677294521
2015-05-13                       34417.0            480777.0      0.071586203167       6.86552185317
2015-05-14                       32029.0            457187.0     0.0700566726525       6.92575904389
2015-05-15                       27071.0            415973.0     0.0650787430915       7.27105605412

### Try different dates

We see that we have data for that segment of time, so it's safe to move forward. It's important to do this before running your actual query. For example, running this same query for a different range returns this:

python search\_analytics\_api\_sample.py 'https://www.example.com/' '2015-06-01' '2015-06-15'
Available dates:
Keys                              Clicks         Impressions                 CTR            Position
2015-06-01                       31897.0            468486.0     0.0680852789624       6.81207122518
2015-06-02                       32975.0            460266.0     0.0716433540605       6.62655942433
2015-06-03                       32779.0            459599.0     0.0713208688444       6.58126758326
2015-06-04                       30116.0            435308.0     0.0691831990223       6.71409668557
2015-06-05                       25188.0            380444.0     0.0662068530454       7.00998570092
2015-06-06                       14829.0            272324.0     0.0544535186028        7.6309910254
2015-06-07                       17896.0            318094.0      0.056260099216       7.56606223318
2015-06-08                       33377.0            487274.0     0.0684973957158       6.77552260125
2015-06-09                       33885.0            484241.0     0.0699754874123       6.70545451542
2015-06-10                       32622.0            466250.0     0.0699667560322       6.64417372654
2015-06-11                       31317.0            447306.0     0.0700124746818       6.61534832978
2015-06-12                       25932.0            393791.0      0.065852190629       7.15718998149
2015-06-13                       15451.0            275493.0     0.0560849095984       7.69994518917
2015-06-14                       18358.0            318193.0     0.0576945438775       7.34048517724
Look carefully, and you'll notice that the data ends on the 14th; no data for the 15th.

You might find it useful to use the [APIs explorer](https://developers.google.com/webmaster-tools/v1/searchanalytics/query#try-it) in free-form edit mode to test your queries quickly (click the dropdown arrow on the side of the request body field and click "Freeform editor").

After you've verified the range of valid dates, you can start grouping by other dimensions, adding filters, row count limits, and so on:

### Top 10 queries, sorted by click count, descending

**Code**

request = {
    'startDate': flags.start\_date,
    'endDate': flags.end\_date,
    'dimensions': \['query'\],
    'rowLimit': 10
}
**Output**

Top Queries:
Keys                              Clicks         Impressions                 CTR            Position
seo                               3523.0            270741.0     0.0130124362398       5.86615252215
hreflang                          3207.0              5496.0      0.583515283843       1.10080058224
robots.txt                        2650.0             23005.0      0.115192349489       4.30367311454
301 redirect                      2637.0              7814.0      0.337471205529         1.621192731
googlebot                         2572.0              6421.0      0.400560660333       1.15823080517
google seo                        2260.0             11205.0      0.201695671575       1.38295403838
google sitemap                    1883.0              4288.0      0.439132462687       1.21175373134
canonical url                     1882.0              3714.0      0.506731287022       1.12762520194
sitemap                           1453.0             22982.0       0.06322339222       3.78074144983

### Top 10 pages, sorted by click count, descending

**Code**

request = {
    'startDate': flags.start\_date,
    'endDate': flags.end\_date,
    'dimensions': \['page'\],
    'rowLimit': 10
}

**Output**

Top Pages:
Keys                              Clicks         Impressions                 CTR            Position
https://www.example.com/21       10538.0             62639.0      0.168233847922       3.63031019014
https://www.example.com/65        9740.0             82375.0      0.118239757208       5.61003945372
https://www.example.com/15        9220.0            128101.0     0.0719744576545       5.32300294299
https://www.example.com/41        8859.0            426633.0     0.0207649197319       1.62309057199
https://www.example.com/53        8791.0            829679.0     0.0105956641062       14.4941887164
https://www.example.com/46        7390.0             82303.0     0.0897901656076        5.7723290767
https://www.example.com/27        7169.0             64013.0      0.111992876447       4.98709637105
https://www.example.com/80        6047.0             84233.0     0.0717889663196       4.10592048247
https://www.example.com/9         5886.0             59704.0     0.0985863593729        4.0897594801
https://www.example.com/8         5043.0             66869.0     0.0754161120998       4.57651527614

### Top 10 queries in India, sorted by click count, descending

Note that the filter operator "equals" is omitted, as it is the default operator.

**Code**

request = {
    'startDate': flags.start\_date,
    'endDate': flags.end\_date,
    'dimensions': \['query'\],
    'dimensionFilterGroups': \[{
         'filters': \[{
              'dimension': 'country',
              'expression': 'ind'
          }\]
      }\],
      'rowLimit': 10
  }

**Output**

Top queries in India:
Keys                              Clicks         Impressions                 CTR            Position
googlebot                          250.0               429.0      0.582750582751                 1.0
search console                     238.0             34421.0    0.00691438366114       1.00101682113
dns error                          189.0               850.0      0.222352941176       1.38470588235
google seo                         165.0               552.0      0.298913043478       1.04166666667
canonical url                      141.0               282.0                 0.5                 1.0
301 redirect                       132.0               557.0      0.236983842011       1.78276481149
google search console              126.0             16898.0    0.00745650372825       1.03929459108
robots.txt                         117.0              1046.0      0.111854684512        3.9206500956
canonical tag                      111.0               223.0      0.497757847534                 1.0

### Top 10 mobile queries in India, sorted by click count, descending

**Code**

request = {
    'startDate': flags.start\_date,
    'endDate': flags.end\_date,
    'dimensions': \['query'\],
    'dimensionFilterGroups': \[{
        'filters': \[{
            'dimension': 'country',
            'expression': 'ind'
          }, {
            'dimension': 'device',
            'expression': 'MOBILE'
       }\]
    }\],
    'rowLimit': 10
}
**Output**

Top mobile queries in India:
Keys                              Clicks         Impressions                 CTR            Position
search console                      26.0              1004.0     0.0258964143426       1.00298804781
dns error                           24.0               111.0      0.216216216216       1.27927927928
google seo                          18.0                69.0      0.260869565217       1.02898550725
eliminar                            16.0               134.0      0.119402985075                 1.0
googlebot                           11.0                24.0      0.458333333333                 1.0
404                                  9.0               214.0     0.0420560747664       8.64018691589
robots.txt                           9.0                40.0               0.225               4.025
google search console                8.0               438.0     0.0182648401826       1.04337899543
seo                                  8.0               111.0     0.0720720720721       4.96396396396

### Query a slice of rows

You can query for a specific slice of rows by specifying a (zero-based) start row number and the number of rows to return. Specifying an invalid start row number will return an error, but specifying more rows than are available will return all available rows.

### Top 11-20 mobile queries for the date range, sorted by click count, descending

**Code**

request = {
      'startDate': flags.start\_date,
      'endDate': flags.end\_date,
      'dimensions': \['query'\],
      'dimensionFilterGroups': \[{
          'filters': \[{
              'dimension': 'device',
              'expression': 'mobile'
          }\]
      }\],
      'rowLimit': 10,
      'startRow': 10
  }
**Output**

Top 11-20 Mobile Queries:
Keys                              Clicks         Impressions                 CTR            Position
dns error                         1220.0             15064.0        0.0809877854       3.13448726206
google seo                        1161.0              7923.0         0.146535403       2.31479556195
sitemap                            926.0             12478.0        0.0742106107        5.8130025067
googlebot                          903.0              7822.0         0.115443621        4.6910285792
robots.txt                         799.0             24868.0        0.0321296445       5.92759215963
404                                520.0             12777.0        0.0406981295       5.80352636506
seo                                506.0              2925.0         0.172991453       2.50413960996
search console                     487.0               981.0         0.496432212       1.00036102455
canonical url                      326.0              4087.0        0.0797651089       3.23664971157
301 redirect                       261.0              3165.0         0.082464455       3.63074363869

### Getting more than 25,000 rows

If your query has more than 25,000 rows of data, you can request data in batches of 25,000 rows at a time by sending multiple queries and incrementing the startRow value each time. Count the number of retrieved rows; if you get less than the number of rows requested, you have retrieved all the data. If your request ends exactly on the data boundary (for example, there are 25,000 rows and you requested startRow=0 and rowLimit=25000), on your next call you will get an empty response.

#### Top 1-25,000 mobile queries for the date range, sorted by click count, descending

**Code**

request = {
      'startDate': flags.start\_date,
      'endDate': flags.end\_date,
      'dimensions': \['query'\],
      'dimensionFilterGroups': \[{
          'filters': \[{
              'dimension': 'device',
              'expression': 'mobile'
          }\]
      }\],
      'rowLimit': 25000,
      'startRow': 0
  }

#### Top 25,001-50,000 mobile queries for the date range, sorted by click count, descending

**Code**

request = {
      'startDate': flags.start\_date,
      'endDate': flags.end\_date,
      'dimensions': \['query'\],
      'dimensionFilterGroups': \[{
          'filters': \[{
              'dimension': 'device',
              'expression': 'mobile'
          }\]
      }\],
      'rowLimit': 25000,
      'startRow': 25000
  }

### Getting all your data

See [Query all your search traffic](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data).
