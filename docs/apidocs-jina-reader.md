Title: Reader API

URL Source: https://jina.ai/reader/

Markdown Content:
Reader API
===============



Reader
======

Convert a URL to LLM-friendly input, by simply adding `r.jina.ai` in front.


[Reader API](https://jina.ai/reader/#apiform)
---------------------------------------------

Convert a URL to LLM-friendly input, by simply adding `r.jina.ai` in front.


API Key & Billing


Usage

More


Auto preview

* * *

Use `r.jina.ai` to read a URL

This will return the main content of the page in clean, LLM-friendly text.


Enter your URL

https://r.jina.ai/

Reader URL


Use `s.jina.ai` to search a query

This will search the web and returns URLs and contents, each in clean, LLM-friendly text.

Enter your query

https://s.jina.ai/

Reader URL


Use `g.jina.ai` for grounding

This will call our grounding engine do fact-checking.


Experimental


Enter your query


https://g.jina.ai/

Reader URL

Common, Specific

Parameters


Search Parameters/Headers

Add API Key for Higher Rate Limit

Enter your Jina API key to access a higher rate limit. For latest rate limit information, please refer to the table below.


Use POST Method

Use POST instead of GET method with a URL passed in the body. Useful for building SPAs with hash-based routing.


Content Format

You can control the level of detail in the response to prevent over-filtering. The default pipeline is optimized for most websites and LLM input.

Default


Timeout

Maximum time to wait for the webpage to load. Note that this is NOT the total time for the whole end-to-end request.

Target Selector

Provide a list of CSS selector to focus on more specific parts of the page. Useful when your desired content doesn't show under the default settings.

body

.class

#id

Wait For Selector

Provide a list of CSS selector to wait for specific elements to appear before returning. Useful when your desired content doesn't show under the default settings.

body

.class

#id

Excluded Selector

Provide a list of CSS selector to remove the specified elements of the page. Useful when you want to exclude specific parts of the page like headers, footers, etc.

header

.class

#id

Remove All Images

Remove all images from the response.

Gather All Links At the End

A "Buttons & Links" section will be created at the end. This helps the downstream LLMs or web agents navigating the page or take further actions.

Gather All Images At the End

An "Images" section will be created at the end. This gives the downstream LLMs an overview of all visuals on the page, which may improve reasoning.

JSON Response

The response will be in JSON format, containing the URL, title, content, and timestamp (if available). In Search mode, it returns a list of five entries, each following the described JSON structure.

Forward Cookie

Our API server can forward your custom cookie settings when accessing the URL, which is useful for pages requiring extra authentication. Note that requests with cookies will not be cached.

[_open\_in\_new_Learn more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

<cookie-name\>\=<cookie-value\>

<cookie-name-1\>\=<cookie-value\>; domain=<cookie-1-domain\>

Image Caption

Captions all images at the specified URL, adding 'Image \[idx\]: \[caption\]' as an alt tag for those without one. This allows downstream LLMs to interact with the images in activities such as reasoning and summarizing.

Use a Proxy Server

Our API server can utilize your proxy to access URLs, which is helpful for pages accessible only through specific proxies.

[_open\_in\_new_Learn more](https://en.wikipedia.org/wiki/Proxy_server)

Bypass the Cache

Our API server caches both Read and Search mode contents for a certain amount of time. To bypass this cache, set this header to true.

Github Flavored Markdown

Opt in/out features from GFM (Github Flavored Markdown).

Enabled

_arrow\_drop\_down_

Stream Mode

Stream mode is beneficial for large target pages, allowing more time for the page to fully render. If standard mode results in incomplete content, consider using Stream mode.

[_open\_in\_new_Learn more](https://github.com/jina-ai/reader?tab=readme-ov-file#streaming-mode)

Browser Locale

Control the browser locale to render the page. Lots of websites serve different content based on the locale.

[_open\_in\_new_Learn more](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language)

Enable iframe Extraction

Extracts and processes content from all embedded iframes within the DOM tree

Enable Shadow DOM Extraction

Traverses and extracts content from all Shadow DOM roots in the document

Local PDF/HTML file

POST

Use Reader on your local PDF and HTML file by uploading them. Only support pdf and html files. For HTML, please also specify a reference URL for better parsing related CSS/JS scripts.

_upload_

Pre-Execute Custom JavaScript

POST

Executes pre-processing JavaScript code, accepting either inline code string or remote script URL endpoint

[_open\_in\_new_Learn more](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

* * *

_upload_

Request

Bash

Language

_arrow\_drop\_down_

```
curl https://r.jina.ai/https://example.com
```

_content\_copy_

* * *

_upload_

Request (javascript)

```
fetch('https://r.jina.ai/https://example.com', {
  method: 'GET',
})
```

_content\_copy_

* * *

_send_GET RESPONSE

* * *

_key_

API key

_visibility\_off__content\_copy_

* * *

Available tokens

0 _sync_

This is your unique key. Store it securely!

[What is Reader?](https://jina.ai/reader/#what_reader)
------------------------------------------------------

![Image 74](https://jina.ai/assets/explain-EQrFe5k3.svg)

Feeding web information into LLMs is an important step of grounding, yet it can be challenging. The simplest method is to scrape the webpage and feed the raw HTML. However, scraping can be complex and often blocked, and raw HTML is cluttered with extraneous elements like markups and scripts. The Reader API addresses these issues by extracting the core content from a URL and converting it into clean, LLM-friendly text, ensuring high-quality input for your agent and RAG systems.

_casino_

Enter your URL

_open\_in\_new_

Click below to fetch the source code of the page directly

* * *

Reader URL

_content\_copy__open\_in\_new_

Click below to obtain the content through our Reader API

* * *

_download_Fetch Content

* * *

Raw HTML

* * *

Reader Output

* * *

Pose a Question

_send_

Input a question and combine it with the fetched content for LLM to generate an answer

[Reader for web search](https://jina.ai/reader/#search)
-------------------------------------------------------

![Image 75](https://jina.ai/assets/explain3-CqNg2V0h.svg)

Reader allows you to feed your LLM with the latest information from the web. Simply prepend https://s.jina.ai/ to your query, and Reader will search the web and return the top five results with their URLs and contents, each in clean, LLM-friendly text. This way, you can always keep your LLM up-to-date, improve its factuality, and reduce hallucinations.

_casino_

Enter your query

Type a question that requires latest information or world knowledge.

* * *

Reader URL

_content\_copy__open\_in\_new_

If you use this URL in code, dont forget to encode the URL.

* * *

_contact\_support_Ask LLM w/o & w/ Search Grounding

* * *

_info_ Please note that unlike the demo shown above, in practice you do not search the original question on the web for grounding. What people often do is rewrite the original question or use multi-hop questions. They read the retrieved results and then generate additional queries to gather more information as needed before arriving at a final answer.

[Reader for fact-checking](https://jina.ai/reader/#grounding)
-------------------------------------------------------------

![Image 76](https://jina.ai/assets/explain5-CKbWV5a5.svg)

The new grounding endpoint offers an end-to-end, near real-time fact-checking experience. It takes a given statement, grounds it using real-time web search results, and returns a factuality score and the exact references used. You can easily ground statements to reduce LLM hallucinations or improve the integrity of human-written content.

_bolt_

Your fact-checking statement

_send_

[Reader also reads images!](https://jina.ai/reader/#read-image)
---------------------------------------------------------------

![Image 77](https://jina.ai/assets/explain2-BYDhf_rF.svg)

Images on the webpage are automatically captioned using a vision language model in the reader and formatted as image alt tags in the output. This gives your downstream LLM just enough hints to incorporate those images into its reasoning and summarizing processes. This means you can ask questions about the images, select specific ones, or even forward their URLs to a more powerful VLM for deeper analysis!

[Reader also reads PDFs!](https://jina.ai/reader/#read-pdf)
-----------------------------------------------------------

![Image 78](https://jina.ai/assets/explain4-CPLfQrjf.png)

Yes, Reader natively supports PDF reading. It's compatible with most PDFs, including those with many images, and it's lightning fast! Combined with an LLM, you can easily build a ChatPDF or document analysis AI in no time.

[_open\_in\_new_Original PDF](https://www.nasa.gov/wp-content/uploads/2023/01/55583main_vision_space_exploration2.pdf)

* * *

[_open\_in\_new_Reader Result](https://r.jina.ai/https://www.nasa.gov/wp-content/uploads/2023/01/55583main_vision_space_exploration2.pdf)

The best part? It's free!
-------------------------

Reader API is available for free and offers flexible rate limit and pricing. Built on a scalable infrastructure, it offers high accessibility, concurrency, and reliability. We strive to be your preferred grounding solution for your LLMs.

Rate Limit

Rate limits are tracked in two ways: **RPM** (requests per minute) and **TPM** (tokens per minute). Limits are enforced per IP and can be reached based on whichever threshold—RPM or TPM—is hit first.

Columns

_arrow\_drop\_down_

|  | Product | API Endpoint | Description_arrow\_upward_ | w/o API Key | w/ API Key | w/ Premium API Key | Average Latency | Token Usage Counting | Allowed Request |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|
![Image 79](https://jina.ai/assets/embedding-DzEuY8_E.svg)



 | Embedding API | `https://api.jina.ai/v1/embeddings` | Convert text/images to fixed-length vectors | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 80](https://jina.ai/assets/reranker-DudpN0Ck.svg)



 | Reranker API | `https://api.jina.ai/v1/rerank` | Tokenize and segment long text | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 81](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://r.jina.ai` | Convert URL to LLM-friendly text | 20 RPM | 200 RPM | 1000 RPM | 4.6s | Count the number of tokens in the output response. | GET/POST |
|

![Image 82](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://s.jina.ai` | Search the web and convert results to LLM-friendly text | _block_ | 40 RPM | 100 RPM | 8.7s | Count the number of tokens in the output response. | GET/POST |
|

![Image 83](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://g.jina.ai` | Grounding a statement with web knowledge | _block_ | 10 RPM | 30 RPM | 22.7s | Count the total number of tokens in the whole process. | GET/POST |
|

![Image 84](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Zero-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using zero-shot classification | _block_ | 200 RPM & 500,000 TPM | 1,000 RPM & 3,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens + label\_tokens | POST |
|

![Image 85](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Few-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using a trained few-shot classifier | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens | POST |
|

![Image 86](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API | `https://api.jina.ai/v1/train` | Train a classifier using labeled examples | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens × num\_iters | POST |
|

![Image 87](blob:https://jina.ai/d9cb1deb4878909b05c9cd0f15af4aac)



 | Segmenter API | `https://segment.jina.ai` | Tokenize and segment long text | 20 RPM | 200 RPM | 1,000 RPM | 0.3s | Token is not counted as usage. | GET/POST |

Don't panic! Every new API key contains one million free tokens!

_key_Get your API key

* * *

_attach\_money_Check the price table

[API Pricing](https://jina.ai/reader/#pricing)
----------------------------------------------

API pricing is based on token usage - input tokens for standard APIs and output tokens for Reader API. One API key gives you access to all search foundation products.

_![Image 88](https://jina.ai/J-active.svg)_

With Jina Search Foundation API

The easiest way to access all of our products. Top-up tokens as you go.

_content\_copy_

Enter the API key you wish to recharge

_error_

_visibility\_off_

Top up this API key with more tokens

Depending on your location, you may be charged in USD, EUR, or other currencies. Taxes may apply.

Please input the right API key to top up

Understand the rate limit

Rate limits are the maximum number of requests that can be made to an API within a minute per IP address (RPM). Find out more about the rate limits for each product and tier below.

_keyboard\_arrow\_down_

Rate Limit

Rate limits are tracked in two ways: **RPM** (requests per minute) and **TPM** (tokens per minute). Limits are enforced per IP and can be reached based on whichever threshold—RPM or TPM—is hit first.

Columns

_arrow\_drop\_down_

|  | Product | API Endpoint | Description_arrow\_upward_ | w/o API Key | w/ API Key | w/ Premium API Key | Average Latency | Token Usage Counting | Allowed Request |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|
![Image 89](https://jina.ai/assets/embedding-DzEuY8_E.svg)



 | Embedding API | `https://api.jina.ai/v1/embeddings` | Convert text/images to fixed-length vectors | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 90](https://jina.ai/assets/reranker-DudpN0Ck.svg)



 | Reranker API | `https://api.jina.ai/v1/rerank` | Tokenize and segment long text | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 91](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://r.jina.ai` | Convert URL to LLM-friendly text | 20 RPM | 200 RPM | 1000 RPM | 4.6s | Count the number of tokens in the output response. | GET/POST |
|

![Image 92](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://s.jina.ai` | Search the web and convert results to LLM-friendly text | _block_ | 40 RPM | 100 RPM | 8.7s | Count the number of tokens in the output response. | GET/POST |
|

![Image 93](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://g.jina.ai` | Grounding a statement with web knowledge | _block_ | 10 RPM | 30 RPM | 22.7s | Count the total number of tokens in the whole process. | GET/POST |
|

![Image 94](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Zero-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using zero-shot classification | _block_ | 200 RPM & 500,000 TPM | 1,000 RPM & 3,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens + label\_tokens | POST |
|

![Image 95](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Few-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using a trained few-shot classifier | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens | POST |
|

![Image 96](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API | `https://api.jina.ai/v1/train` | Train a classifier using labeled examples | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens × num\_iters | POST |
|

![Image 97](blob:https://jina.ai/d9cb1deb4878909b05c9cd0f15af4aac)



 | Segmenter API | `https://segment.jina.ai` | Tokenize and segment long text | 20 RPM | 200 RPM | 1,000 RPM | 0.3s | Token is not counted as usage. | GET/POST |

Auto-recharge when tokens are low

Recommended for uninterrupted service in production. When your token balance is below the threshold you set, we will automatically recharge your credit card for the same amount as your last top-up. If you purchased multiple packs in the last top-up, we will recharge only one pack.

_check_

≤ 1M Tokens

Recharge if

_arrow\_drop\_down_

FAQ
---

### [How to get my API key?](https://jina.ai/reader/#get-api-key)

 video\_not\_supported

### [What's the rate limit?](https://jina.ai/reader/#rate-limit)

Rate Limit

Rate limits are tracked in two ways: **RPM** (requests per minute) and **TPM** (tokens per minute). Limits are enforced per IP and can be reached based on whichever threshold—RPM or TPM—is hit first.

Columns

_arrow\_drop\_down_

|  | Product | API Endpoint | Description_arrow\_upward_ | w/o API Key | w/ API Key | w/ Premium API Key | Average Latency | Token Usage Counting | Allowed Request |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|
![Image 98](https://jina.ai/assets/embedding-DzEuY8_E.svg)



 | Embedding API | `https://api.jina.ai/v1/embeddings` | Convert text/images to fixed-length vectors | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 99](https://jina.ai/assets/reranker-DudpN0Ck.svg)



 | Reranker API | `https://api.jina.ai/v1/rerank` | Tokenize and segment long text | _block_ | 500 RPM & 1,000,000 TPM | 2,000 RPM & 5,000,000 TPM |

_bolt_

depends on the input size

_help_



 | Count the number of tokens in the input request. | POST |
|

![Image 100](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://r.jina.ai` | Convert URL to LLM-friendly text | 20 RPM | 200 RPM | 1000 RPM | 4.6s | Count the number of tokens in the output response. | GET/POST |
|

![Image 101](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://s.jina.ai` | Search the web and convert results to LLM-friendly text | _block_ | 40 RPM | 100 RPM | 8.7s | Count the number of tokens in the output response. | GET/POST |
|

![Image 102](https://jina.ai/assets/reader-D06QTWF1.svg)



 | Reader API | `https://g.jina.ai` | Grounding a statement with web knowledge | _block_ | 10 RPM | 30 RPM | 22.7s | Count the total number of tokens in the whole process. | GET/POST |
|

![Image 103](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Zero-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using zero-shot classification | _block_ | 200 RPM & 500,000 TPM | 1,000 RPM & 3,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens + label\_tokens | POST |
|

![Image 104](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API (Few-shot) | `https://api.jina.ai/v1/classify` | Classify inputs using a trained few-shot classifier | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens | POST |
|

![Image 105](blob:https://jina.ai/47430e9cbced04c539a17eb39573e3a9)



 | Classifier API | `https://api.jina.ai/v1/train` | Train a classifier using labeled examples | _block_ | 20 RPM & 200,000 TPM | 60 RPM & 1,000,000 TPM |

_bolt_

depends on the input size





 | Tokens counted as: input\_tokens × num\_iters | POST |
|

![Image 106](blob:https://jina.ai/d9cb1deb4878909b05c9cd0f15af4aac)



 | Segmenter API | `https://segment.jina.ai` | Tokenize and segment long text | 20 RPM | 200 RPM | 1,000 RPM | 0.3s | Token is not counted as usage. | GET/POST |

### [Do I need a commercial license?](https://jina.ai/reader/#cc-self-check)

CC BY-NC License Self-Check

* * *


Are you using our official API or official images on Azure or AWS?


Yes


Are you using a paid API key or free trial key?


Paid API key

No restrictions. Use as per your current agreement.


Free API key

Free trial key can be only used for non-commercial purposes. Please purchase a paid package for commercial use.


Are you using our official model images on AWS and Azure?

No restrictions. Use as per your current agreement.

No


Are you using these models?

jina-clip-v2

jina-embeddings-v3

jina-reranker-v2-base-multilingual

jina-colbert-v2

reader-lm-1.5b

reader-lm-0.5b

No

No restrictions apply.

Yes


Is your use commercial?


Not sure


Are you:

Using it for personal or hobby projects?

This is non-commercial. You can use the models freely.

A for-profit company using it internally?

This is commercial. Contact our sales team.

An educational institution using it for teaching?

This is typically non-commercial. You can use the models freely.

A non-profit or NGO using it for your mission?

This is typically non-commercial, but check with us if unsure.

Using it in a product or service you sell?

This is commercial. Contact our sales team.

A government entity using it for public services?

This may be commercial. Please contact us for clarification.

You can use the models freely.

Contact our sales team for licensing.

Reader-related common questions


What are the costs associated with using the Reader API?

The Reader API is free of charge and does not require an API key. Simply prepend 'https://r.jina.ai/' to your URL.

How does the Reader API function?

The Reader API uses a proxy to fetch any URL, rendering its content in a browser to extract high-quality main content.

Is the Reader API open source?

Yes, the Reader API is open source and available on the Jina AI GitHub repository.


What is the typical latency for the Reader API?


The Reader API generally processes URLs and returns content within 2 seconds, although complex or dynamic pages might require more time.

Why should I use the Reader API instead of scraping the page myself?

Scraping can be complicated and unreliable, particularly with complex or dynamic pages. The Reader API provides a streamlined, reliable output of clean, LLM-ready text.


Does the Reader API support multiple languages?


The Reader API returns content in the original language of the URL. It does not provide translation services.


What should I do if a website blocks the Reader API?


If you experience blocking issues, please contact our support team for assistance and resolution.


Can the Reader API extract content from PDF files?


Yes, the Reader API can natively extract content from PDF files.

Can the Reader API process media content from web pages?

Currently, the Reader API does not process media content, but future enhancements will include image captioning and video summarization.

Is it possible to use the Reader API on local HTML files?

No, the Reader API can only process content from publicly accessible URLs.

Does Reader API cache the content?


If you request the same URL within 5 minutes, the Reader API will return the cached content.


Can I use the Reader API to access content behind a login?

Unfortunately not.


Can I use the Reader API to access PDF on arXiv?


Yes, you can either use the native PDF support from the Reader (https://r.jina.ai/https://arxiv.org/pdf/2310.19923v4) or use the HTML version from the arXiv (https://r.jina.ai/https://arxiv.org/html/2310.19923v4)


How does image caption work in Reader?

Reader captions all images at the specified URL and adds \`Image \[idx\]: \[caption\]\` as an alt tag (if they initially lack one). This enables downstream LLMs to interact with the images in reasoning, summarizing etc.

What is the scalability of the Reader? Can I use it in production?

The Reader API is designed to be highly scalable. It is auto-scaled based on the real-time traffic and the maximum concurrency requests is now around 4000. We are maintaining it actively as one of the core products of Jina AI. So feel free to use it in production.

What is the rate limit of the Reader API?

Please find the latest rate limit information in the table below. Note that we are actively working on improving the rate limit and performance of the Reader API, the table will be updated accordingly.

API-related common questions

Can I use the same API key for embedding, reranking, reader, fine-tuning APIs?

Yes, the same API key is valid for all search foundation products from Jina AI. This includes the embedding, reranking, reader and fine-tuning APIs, with tokens shared between the all services.


Can I monitor the token usage of my API key?


Yes, token usage can be monitored in the 'Buy tokens' tab by entering your API key, allowing you to view the usage history and remaining tokens.


What should I do if I forget my API key?

If you have misplaced a topped-up key and wish to retrieve it, please contact support AT jina.ai with your registered email for assistance.


Do API keys expire?


No, our API keys do not have an expiration date. However, if you suspect your key has been compromised and wish to retire it or transfer its tokens to a new key, please contact our support team for assistance.

Why is the first request for some models slow?

This is because our serverless architecture offloads certain models during periods of low usage. The initial request activates or 'warms up' the model, which may take a few seconds. After this initial activation, subsequent requests process much more quickly.

Is user input data used for training your models?

We adhere to a strict privacy policy and do not use user input data for training our models.

Billing-related common questions


Is billing based on the number of sentences or requests?


Our pricing model is based on the total number of tokens processed, allowing users the flexibility to allocate these tokens across any number of sentences, offering a cost-effective solution for diverse text analysis requirements.


Is there a free trial available for new users?


We offer a welcoming free trial to new users, which includes one million tokens for use with any of our models, facilitated by an auto-generated API key. Once the free token limit is reached, users can easily purchase additional tokens for their API keys via the 'Buy tokens' tab.


Are tokens charged for failed requests?


No, tokens are not deducted for failed requests.


What payment methods are accepted?



Payments are processed through Stripe, supporting a variety of payment methods including credit cards, Google Pay, and PayPal for your convenience.



Is invoicing available for token purchases?



Yes, an invoice will be issued to the email address associated with your Stripe account upon the purchase of tokens.
