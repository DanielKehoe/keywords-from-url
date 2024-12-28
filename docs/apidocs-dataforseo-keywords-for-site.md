# DataForSEO Keywords For Site API Documentation

See the API Documentation web page at https://docs.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live/?javascript

## Overview
The Keywords For Site endpoint provides a list of keywords relevant to a target domain. Each keyword is supplied with relevant categories, search volume data for the last month, cost-per-click, competition, and search volume trend values for the past 12 months.

Datasource: DataForSEO Keyword Database segmented by relevant domains from Google Ads API and supplemented by data from DataForSEO SERP Database.

Search algorithm: relevance-based search for keywords that fall into the same category as the target domain.

Examples:
Specified target domain:
“letslevitate.com”
Resulting keyword ideas:
•”xvt blades”,
•”scar blades falcon”,
•”palatine blades”,
•”blades macomb il”

## Endpoint
```
POST https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live
```

All POST data should be sent in the JSON format (UTF-8 encoding). The task setting is done using the POST method. When setting a task, you should send all task parameters in the task array of the generic POST array. You can send up to 2000 API calls per minute. The maximum number of requests that can be sent simultaneously is limited to 30.

You can specify the number of results you want to retrieve, as well as sort and filter the results.

## Authentication
Uses Basic Authentication with your DataForSEO credentials.

```javascript
const credentials = Buffer.from('your-login:your-password').toString('base64');
```

## Request Headers
```javascript
{
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
}
```

## Request Body Parameters
The request body should be an array containing at least one task object with the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| target | string | Yes | Domain to analyze (e.g., "apple.com") |
| location_code | number | Yes | Geographic location code (e.g., 2840 for US) |
| language_code | string | Yes | Language of keywords (e.g., "en") |
| include_serp_info | boolean | No | Include SERP data in response |
| include_subdomains | boolean | No | Include data from subdomains |
| filters | array | No | Array of filter conditions |
| order_by | array | No | Array of sorting parameters |
| limit | number | No | Number of results to return |

Description of the fields for setting a task:

Field name	Type	Description
target	string	target domain
required field
the domain name of the target website
the domain should be specified without https://
location_name	string	full name of the location
required field if you don’t specify location_code
Note: it is required to specify either location_name or location_code
you can receive the list of available locations with their location_name by making a separate request to the
https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages
example:
United Kingdom
location_code	integer	unique location identifier
required field if you don’t specify location_name
Note: it is required to specify either location_name or location_code
you can receive the list of available locations with their location_code by making a separate request to the
https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages
example:
2840
language_name	string	full name of the language
optional field
if you use this field, you don’t need to specify language_code
you can receive the list of available languages with their language_name by making a separate request to the
https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages
ignore this field to get the results for all available languages
example:
English
language_code	string	language code
optional field
if you use this field, you don’t need to specify language_name
you can receive the list of available languages with their language_code by making a separate request to the
https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages
ignore this field to get the results for all available languages
example:
en
include_serp_info	boolean	include data from SERP for each keyword
optional field
if set to true, we will return a serp_info array containing SERP data (number of search results, relevant URL, and SERP features) for every keyword in the response
default value: false
include_subdomains	boolean	indicates if the subdomains will be included in the search
optional field
if set to false, the subdomains will be ignored
default value: true
include_clickstream_data	boolean	include or exclude data from clickstream-based metrics in the result
optional field
if the parameter is set to true, you will receive clickstream_keyword_info, keyword_info_normalized_with_clickstream, and keyword_info_normalized_with_bing fields in the response
default value: false
with this parameter enabled, you will be charged double the price for the request
learn more about how clickstream-based metrics are calculated in this help center article

ignore_synonyms	boolean	ignore highly similar keywords
optional field
if set to true only core keywords will be returned, all highly similar keywords will be excluded;
default value: false
limit	integer	the maximum number of keywords in the results array
optional field
default value: 100
maximum value: 1000
offset	integer	offset in the results array of returned keywords
optional field
default value: 0
if you specify the 10 value, the first ten keywords in the results array will be omitted and the data will be provided for the successive keywords
offset_token	string	offset token for subsequent requests
optional field
provided in the identical filed of the response to each request;
use this parameter to avoid timeouts while trying to obtain over 10,000 results in a single request;
by specifying the unique offset_token value from the response array, you will get the subsequent results of the initial task;
offset_token values are unique for each subsequent task
Note: if the offset_token is specified in the request, all other parameters except limit will not be taken into account when processing a task.
filters	array	array of results filtering parameters
optional field
you can add several filters at once (8 filters maximum)
you should set a logical operator and, or between the conditions
the following operators are supported:
regex, not_regex, <, <=, >, >=, =, <>, in, not_in, ilike, not_ilike, like, not_like
you can use the % operator with like and not_like, as well as ilike and not_ilike to match any string of zero or more characters
note that you can not filter the results by relevance
example:
["keyword_info.search_volume",">",0]
[["impressions_info.daily_impressions_average","in",[0,1000]],
"and",
["impressions_info.ad_position_average","<",3]][["impressions_info.ad_position_average",">",0],
"and",
[["impressions_info.cpc_max","<",0.5],"or",["impressions_info.daily_clicks_max",">=",10]]]
for more information about filters, please refer to Dataforseo Labs – Filters or this help center guide
order_by	array	results sorting rules
optional field
you can use the same values as in the filters array to sort the results
possible sorting types:
asc – results will be sorted in the ascending order
desc – results will be sorted in the descending order
you should use a comma to set up a sorting parameter
example:
["keyword_info.competition,desc"]
default rule:
["relevance,desc"]
relevance is used as the default sorting rule to provide you with the closest keyword ideas. We recommend using this sorting rule to get highly-relevant search terms. Note that relevance is only our internal system identifier, so it can not be used as a filter, and you will not find this field in the result array. The relevance score is based on a similar principle as used in the Keywords For Keywords endpoint.note that you can set no more than three sorting rules in a single request
you should use a comma to separate several sorting rules
example:
["keyword_info.search_volume,desc","keyword_info.cpc,asc"]
tag	string	user-defined task identifier
optional field
the character limit is 255
you can use this parameter to identify the task and match it with the result
you will find the specified tag value in the data object of the response

## Example JavaScript Implementation

```javascript
const post_array = [];
post_array.push({
  "target": "apple.com",
  "location_code": 2840,
  "language_code": "en",
  "include_serp_info": true,
  "include_subdomains": true,
  "filters": ["keyword_properties.keyword_difficulty", ">", 0],
  "order_by": ["keyword_info.search_volume,desc"],
  "limit": 3
});
const axios = require('axios');
axios({
  method: 'post',
  url: 'https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live',
  auth: {
    username: 'login',
    password: 'password'
  },
  data: post_array,
  headers: {
    'content-type': 'application/json'
  }
}).then(function (response) {
  var result = response['data']['tasks'];
  // Result data
  console.log(result);
}).catch(function (error) {
  console.log(error);
});
```

## Response Structure

As a response of the API server, you will receive JSON-encoded data containing a tasks array with the information specific to the set tasks.

Field name	Type	Description
version	string	the current version of the API
status_code	integer	general status code
you can find the full list of the response codes here
Note: we strongly recommend designing a necessary system for handling related exceptional or error conditions
status_message	string	general informational message
you can find the full list of general informational messages here
time	string	execution time, seconds
cost	float	total tasks cost, USD
tasks_count	integer	the number of tasks in the tasks array
tasks_error	integer	the number of tasks in the tasks array returned with an error
tasks	array	array of tasks
        id	string	task identifier
unique task identifier in our system in the UUID format
        status_code	integer	status code of the task
generated by DataForSEO; can be within the following range: 10000-60000
you can find the full list of the response codes here
        status_message	string	informational message of the task
you can find the full list of general informational messages here
        time	string	execution time, seconds
        cost	float	cost of the task, USD
        result_count	integer	number of elements in the result array
        path	array	URL path
        data	object	contains the same parameters that you specified in the POST request
        result	array	array of results
            se_type	string	search engine type
            target	string	target domain in a POST array
            location_code	integer	location code in a POST array
            language_code	string	language code in a POST array
            total_count	integer	total number of results in our database relevant to your request
            items_count	integer	the number of results returned in the items array
            offset	integer	current offset value
            offset_token	string	offset token for subsequent requests
you can use the string provided in this field to get the subsequent results of the initial task;
note: offset_token values are unique for each subsequent task
           items	array	contains keyword ideas and related data
                se_type	string	search engine type
                keyword	string	returned keyword idea
                location_code	integer	location code in a POST array
                language_code	string	language code in a POST array
                keyword_info	object	keyword data for the returned keyword idea
                    se_type	string	search engine type
                    last_updated_time	string	date and time when keyword data was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00
                    competition	float	competition
represents the relative amount of competition associated with the given keyword. This value is based on Google Ads data and can be between 0 and 1 (inclusive)
                    competition_level	string	competition level
represents the relative level of competition associated with the given keyword in paid SERP only;
possible values: LOW, MEDIUM, HIGH
if competition level is unknown, the value is null;
learn more about the metric in this help center article
                    cpc	float	cost-per-click
represents the average cost per click (USD) historically paid for the keyword
                    search_volume	integer	average monthly search volume rate
represents the (approximate) number of searches for the given keyword idea on google.com
                    low_top_of_page_bid	float	minimum bid for the ad to be displayed at the top of the first page
indicates the value greater than about 20% of the lowest bids for which ads were displayed (based on Google Ads statistics for advertisers)
the value may differ depending on the location specified in a POST request
                    high_top_of_page_bid	float	maximum bid for the ad to be displayed at the top of the first page
indicates the value greater than about 80% of the lowest bids for which ads were displayed (based on Google Ads statistics for advertisers)
the value may differ depending on the location specified in a POST request
                    categories	array	product and service categories
you can download the full list of possible categories
                    monthly_searches	array	monthly searches
represents the (approximate) number of searches on this keyword idea (as available for the past twelve months), targeted to the specified geographic locations
                        year	integer	year
                        month	integer	month
                        search_volume	integer	monthly average search volume rate
                clickstream_keyword_info	object	clickstream data for the returned keyword
to retrieve results for this field, the parameter include_clickstream_data must be set to true
                    search_volume	integer	monthly average clickstream search volume rate
                    last_updated_time	string	date and time when the clickstream dataset was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
                    gender_distribution	object	distribution of estimated clickstream-based metrics by gender
learn more about how the metric is calculated in this help center article
                        female	integer	number of female users in the relevant clickstream dataset
                        male	integer	number of male users in the relevant clickstream dataset
                    age_distribution	object	distribution of clickstream-based metrics by age
learn more about how the metric is calculated in this help center article
                        18-24	integer	number of users in the relevant clickstream dataset that fall within the 18-24 age range
                        25-34	integer	number of users in the relevant clickstream dataset that fall within the 25-34 age range
                        35-44	integer	number of users in the relevant clickstream dataset that fall within the 35-44 age range
                        45-54	integer	number of users in the relevant clickstream dataset that fall within the 45-54 age range
                        55-64	integer	number of users in the relevant clickstream dataset that fall within the 55-64 age range
                    monthly_searches	array	monthly clickstream search volume rates
array of objects with clickstream search volume rates in a certain month of a year
                        year	integer	year
                        month	integer	month
                        search_volume	integer	clickstream-based search volume rate in a certain month of a year
                keyword_properties	object	additional information about the keyword
                        se_type	string	search engine type
                        core_keyword	string	main keyword in a group
contains the main keyword in a group determined by the synonym clustering algorithm
if the value is null, our database does not contain any keywords the corresponding algorithm could identify as synonymous with keyword
                    synonym_clustering_algorithm	string	the algorithm used to identify synonyms
possible values:
keyword_metrics – indicates the algorithm based on keyword_info parameters
text_processing – indicates the text-based algorithm
if the value is null, our database does not contain any keywords the corresponding algorithm could identify as synonymous with keyword
                      keyword_difficulty	integer	difficulty of ranking in the first top-10 organic results for a keyword
indicates the chance of getting in top-10 organic results for a keyword on a logarithmic scale from 0 to 100;
calculated by analysing, among other parameters, link profiles of the first 10 pages in SERP;
learn more about the metric in this help center guide
                      detected_language	string	detected language of the keyword
indicates the language of the keyword as identified by our system
                    is_another_language	boolean	detected language of the keyword is different from the set language
if true, the language set in the request does not match the language determined by our system for a given keyword
                impressions_info	object	impressions data for the returned keyword idea
Note that all data in the impressions_info object is deprecated and provided only as legacy to avoid maintenance issues
daily_impressions values provide a more accurate alternative to Google search volume data;
the 999 bid is used to mitigate account-specific factors Google considers when calculating impressions
learn more about impressions in this help center article

                    se_type	string	search engine type
                    last_updated_time	string	date and time when impressions data was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00
                    bid	integer	the maximum CPC
it stands for the price you are willing to pay for an ad. The higher value, the higher positions and price you will getwe return the results for the 999 bid value to provide the highest number of impressions and level down the account-specific factors
                    match_type	string	type of keyword match
can take the following values: exact, broad, phrase
                    ad_position_min	float	the minimum ad position
represents the minimum position of the advertisement
                    ad_position_max	float	the maximum ad position
represents the maximum position of the advertisement
                    ad_position_average	float	the average ad position
represents the average position of the advertisement
                    cpc_min	float	the minimum value of cost-per-click
the minimum cost-per-click (USD) for the keyword given that a bid is set to 999;
note: this field does not represent an actual CPC value;
you can find an actual CPC value for a keyword in the cpc field of the keyword_info object
                    cpc_max	float	the maximum value of cost-per-click
the maximum cost-per-click (USD) for the keyword given that a bid is set to 999;
note: this field does not represent an actual CPC value;
you can find an actual CPC value for a keyword in the cpc field of the keyword_info object
                    cpc_average	float	the average value of cost-per-click
the average cost-per-click (USD) for the keyword given that a bid is set to 999;
note: this field does not represent an actual CPC value;
you can find an actual CPC value for a keyword in the cpc field of the keyword_info object
                    daily_impressions_min	float	the minimum value of daily impressions
represents the minimum number of daily impressions of the advertisement given that that a bid is set to 999; provides a more accurate alternative to Google search volume data
                    daily_impressions_max	float	the maximum value of daily impressions
represents the maximum number of daily impressions of the advertisement given that that a bid is set to 999; provides a more accurate alternative to Google search volume data
                    daily_impressions_average	float	the average value of daily impressions
represents the average number of daily impressions of the advertisement given that that a bid is set to 999; provides a more accurate alternative to Google search volume data
                    daily_clicks_min	float	the minimum value of daily clicks
represents the minimum number of daily clicks on the advertisement
                    daily_clicks_max	float	the maximum value of daily clicks
represents the maximum number of daily clicks on the advertisement
                    daily_clicks_average	float	the average value of daily clicks
represents the average number of daily clicks on the advertisement
                    daily_cost_min	float	the minimum daily charge value
represents the minimum daily cost of the advertisement (USD)
                    daily_cost_max	float	the maximum daily charge value
represents the maximum daily cost of the advertisement (USD)
                    daily_cost_average	float	the average daily charge value
represents the average daily cost of the advertisement (USD)
               serp_info	object	SERP data
the value will be null if you didn’t set the field include_serp_info to true in the POST array or if there is no SERP data for this keyword in our database
                    se_type	string	search engine type
                    check_url	string	direct URL to search engine results
you can use it to make sure that we provided accurate results
                    serp_item_types	array	types of search results in SERP
contains types of search results (items) found in SERP
possible item types:
answer_box, app, carousel, multi_carousel, featured_snippet, google_flights, google_reviews, images, jobs, knowledge_graph, local_pack, map, organic, paid, people_also_ask, related_searches, people_also_search, shopping, top_stories, twitter, video, events, mention_carousel, recipes, top_sights, scholarly_articles, popular_products, podcasts, questions_and_answers, find_results_on, stocks_box;
note that the actual results will be returned only for organic, paid, featured_snippet, and local_pack elements
                    se_results_count	string	number of search results for the returned keyword
                    last_updated_time	string	date and time when SERP data was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00
                    previous_updated_time	string	previous to the most recent date and time when SERP data was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-10-15 12:57:46 +00:00
             avg_backlinks_info	object	backlink data for the returned keyword
this object provides the average number of backlinks, referring pages and domains, as well as the average rank values among the top-10 webpages ranking organically for the keyword
                    se_type	string	search engine type
                    backlinks	float	average number of backlinks
                    dofollow	float	average number of dofollow links
                    referring_pages	float	average number of referring pages
                    referring_domains	float	average number of referring domains
                    referring_main_domains	float	average number of referring main domains
                    rank	float	average rank
learn more about the metric and its calculation formula in this help center article
                    main_domain_rank	float	average main domain rank
learn more about the metric and its calculation formula in this help center article
                    last_updated_time	string	date and time when backlink data was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00
                search_intent_info	object	search intent info for the returned keyword
learn about search intent in this help center article
                     se_type	string	search engine type
possible values: google
                     main_intent	string	main search intent
possible values: informational, navigational, commercial, transactional
                     foreign_intent	array	supplementary search intents
possible values: informational, navigational, commercial, transactional
                    last_updated_time	string	date and time when search intent data was last updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00
                keyword_info_normalized_with_bing	object	contains keyword search volume normalized with Bing search volume
                        last_updated_time	string	date and time when the dataset was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00

                        search_volume	integer	current search volume rate of a keyword
                        is_normalized	boolean	keyword info is normalized
if true, values are normalized with Bing data
                        monthly_searches	integer	monthly search volume rates
array of objects with search volume rates in a certain month of a year
                            year	integer	year
                            month	integer	month
                            search_volume	integer	search volume rate in a certain month of a year
                keyword_info_normalized_with_clickstream	object	contains keyword search volume normalized with clickstream data
                        last_updated_time	string	date and time when the dataset was updated
in the UTC format: “yyyy-mm-dd hh-mm-ss +00:00”
example:
2019-11-15 12:57:46 +00:00

                        search_volume	integer	current search volume rate of a keyword
                        is_normalized	boolean	keyword info is normalized
if true, values are normalized with clickstream data
                        monthly_searches	integer	monthly search volume rates
array of objects with search volume rates in a certain month of a year
                            year	integer	year
                            month	integer	month
                            search_volume	integer	search volume rate in a certain month of a year




The API returns a JSON object with the following structure:

```javascript
{
    "version": string,
    "status_code": number,
    "status_message": string,
    "time": string,
    "cost": number,
    "tasks_count": number,
    "tasks_error": number,
    "tasks": [
        {
            "id": string,
            "status_code": number,
            "status_message": string,
            "time": string,
            "cost": number,
            "result_count": number,
            "path": array,
            "data": {
                // Request parameters
            },
            "result": [
                {
                    "se_type": string,
                    "target": string,
                    "location_code": number,
                    "language_code": string,
                    "total_count": number,
                    "items_count": number,
                    "offset": number,
                    "offset_token": string,
                    "items": [
                        {
                            "se_type": string,
                            "keyword": string,
                            "location_code": number,
                            "language_code": string,
                            "keyword_info": {
                                "se_type": string,
                                "last_updated_time": string,
                                "competition": number,
                                "competition_level": string,
                                "cpc": number,
                                "search_volume": number,
                                "low_top_of_page_bid": number,
                                "high_top_of_page_bid": number,
                                "categories": array,
                                "monthly_searches": array
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Error Handling
The API uses standard HTTP status codes and includes detailed error information in the response:

```javascript
{
    "status_code": number,    // Error code
    "status_message": string  // Error description
}
```

## Rate Limiting and Usage
- Refer to your DataForSEO account for specific rate limits and pricing
- Each request consumes credits based on the amount of data retrieved
- Cost information is included in the response

## Best Practices
1. Always implement proper error handling
2. Cache results when possible to avoid unnecessary API calls
3. Use filters to limit results to relevant data
4. Implement retry logic for failed requests
5. Monitor credit usage through the cost field in responses

## Support
For additional support or questions, contact DataForSEO support or visit:
https://app.dataforseo.com/api-access
