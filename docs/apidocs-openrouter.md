# Title: Quick Start | OpenRouter

URL Source: https://openrouter.ai/docs/quick-start

Markdown Content:
Quick Start
-----------

OpenRouter provides an OpenAI-compatible completion API to 0 models & providers that you can call directly, or using the OpenAI SDK. Additionally, some third-party SDKs are available.

In the examples below, the [OpenRouter-specific headers](https://openrouter.ai/docs/requests#request-headers) are optional. Setting them allows your app to appear on the OpenRouter leaderboards.

Using the OpenAI SDK
--------------------

```
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: $OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": $YOUR_APP_NAME, // Optional. Shows in rankings on openrouter.ai.
  }
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })

  console.log(completion.choices[0].message)
}
main()
```

Using the OpenRouter API directly
---------------------------------

```
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": `${YOUR_SITE_URL}`, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": `${YOUR_SITE_NAME}`, // Optional. Shows in rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })
});
```

Using third-party SDKs
----------------------

For information about using third-party SDKs and frameworks with OpenRouter, please see our [frameworks documentation](https://openrouter.ai/docs/frameworks).

# Title: Principles | OpenRouter

URL Source: https://openrouter.ai/docs/principles

Markdown Content:
Principles
----------

OpenRouter helps developers source and optimize AI usage. We believe the future is multi-model and multi-provider.

_How will you source your intelligence?_

OpenRouter Provides
-------------------

**Price and Performance**. OpenRouter scouts for the best prices, the lowest latencies, and the highest throughput across dozens of providers, and lets you choose how to [prioritize](https://openrouter.ai/docs/provider-routing) them.

**Standardized API**. No need to change your code when switching between models or providers. You can even let users your [choose and pay for their own](https://openrouter.ai/docs/oauth).

**Real-World Insights**. Be the first to take advantage of new models. See real-world data of [how often models are used](https://openrouter.ai/rankings) for different purposes. Learn from your peers in our [Discord channel](https://discord.com/channels/1091220969173028894/1094454198688546826).

**Consolidated Billing**. Simple and transparent billing, regardless of how many providers you use.

**Higher Availability**. Fallback providers, and automatic, smart routing means your requests still work even when providers go down.

**Higher Rate Limits**. OpenRouter works directly with providers to provide better rate limits and more throughput.

# Title: API Keys | OpenRouter

URL Source: https://openrouter.ai/docs/api-keys

Markdown Content:
API Keys
--------

Users or developers can cover model costs with normal API keys. This allows you to use `curl` or the [OpenAI SDK](https://platform.openai.com/docs/frameworks) directly with OpenRouter. Just [create an API key](https://openrouter.ai/keys), set the `api_base`, and optionally set a [referrer header](https://openrouter.ai/docs/format) to make your app discoverable to others on OpenRouter.

**Note:** API keys on OpenRouter are more powerful than keys used directly for model APIs. They allow users to set credit limits for apps, and they can be used in [OAuth](https://openrouter.ai/docs/oauth) flows.

Example code:

```
import openai

openai.api_base = "https://openrouter.ai/api/v1"
openai.api_key = $OPENROUTER_API_KEY

response = openai.ChatCompletion.create(
  model="openai/gpt-3.5-turbo",
  messages=[...],
  headers={
    "HTTP-Referer": $YOUR_SITE_URL, # Optional, for including your app on openrouter.ai rankings.
      "X-Title": $YOUR_APP_NAME, # Optional. Shows in rankings on openrouter.ai.
  },
)

reply = response.choices[0].message
```

To stream with Python, [see this example from OpenAI](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_stream_completions.ipynb).

If your key has been exposed
----------------------------

You must protect your API keys and never commit them to public repositories.

OpenRouter is a GitHub secret scanning partner, and has other methods to detect exposed keys. If we determine that your key has been compromised, you will receive an email notification.

If you receive such a notification or suspect your key has been exposed, immediately visit:

[https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)

to delete the compromised key and create a new one. Using environment variables and keeping keys out of your codebase is strongly recommended.

#Title: Requests | OpenRouter

URL Source: https://openrouter.ai/docs/requests

Markdown Content:
Requests
--------

OpenRouter's request and response schemas are very similar to the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat/create), with a few small differences. At a high level, **OpenRouter normalizes the schema across models** and providers so you only need to learn one.

Request Body
------------

Here is the request schema as a TypeScript type. This will be the body of your POST request to the `/api/v1/chat/completions` endpoint (see the [quick start](https://openrouter.ai/docs/quick-start) above for an example).

```
// Definitions of subtypes are below
type Request = {
  // Either "messages" or "prompt" is required
  messages?: Message[];
  prompt?: string;

  // If "model" is unspecified, uses the user's default
  model?: string; // See "Supported Models" section

  // Allows to force the model to produce specific output format.
  // See models page and note on this docs page for which models support it.
  response_format?: { type: 'json_object' };

  stop?: string | string[];
  stream?: boolean; // Enable streaming

  // See LLM Parameters (openrouter.ai/docs/parameters)
  max_tokens?: number; // Range: [1, context_length)
  temperature?: number; // Range: [0, 2]

  // Tool calling
  // Will be passed down as-is for providers implementing OpenAI's interface.
  // For providers with custom interfaces, we transform and map the properties.
  // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
  // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
  tools?: Tool[];
  tool_choice?: ToolChoice;

  // Advanced optional parameters
  seed?: number; // Integer only
  top_p?: number; // Range: (0, 1]
  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
  frequency_penalty?: number; // Range: [-2, 2]
  presence_penalty?: number; // Range: [-2, 2]
  repetition_penalty?: number; // Range: (0, 2]
  logit_bias?: { [key: number]: number };
  top_logprobs: number; // Integer only
  min_p?: number; // Range: [0, 1]
  top_a?: number; // Range: [0, 1]

  // Reduce latency by providing the model with a predicted output
  // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs
  prediction?: { type: 'content'; content: string; };

  // OpenRouter-only parameters
  // See "Prompt Transforms" section: openrouter.ai/docs/transforms
  transforms?: string[];
  // See "Model Routing" section: openrouter.ai/docs/model-routing
  models?: string[];
  route?: 'fallback';
  // See "Provider Routing" section: openrouter.ai/docs/provider-routing
  provider?: ProviderPreferences;
};

// Subtypes:

type TextContent = {
  type: 'text';
  text: string;
};

type ImageContentPart = {
  type: 'image_url';
  image_url: {
    url: string; // URL or base64 encoded image data
    detail?: string; // Optional, defaults to 'auto'
  };
};

type ContentPart = TextContent | ImageContentPart;

type Message =
  | {
      role: 'user' | 'assistant' | 'system';
      // ContentParts are only for the 'user' role:
      content: string | ContentPart[];
      // If "name" is included, it will be prepended like this
      // for non-OpenAI models: `{name}: {content}`
      name?: string;
    }
  | {
      role: 'tool';
      content: string;
      tool_call_id: string;
      name?: string;
    };

type FunctionDescription = {
  description?: string;
  name: string;
  parameters: object; // JSON Schema object
};

type Tool = {
  type: 'function';
  function: FunctionDescription;
};

type ToolChoice =
  | 'none'
  | 'auto'
  | {
      type: 'function';
      function: {
        name: string;
      };
    };
```

The `response_format` parameter ensures you receive a structured response from the LLM. The parameter is only supported by OpenAI models, Nitro models, and some others - check the providers on the model page on openrouter.ai/models to see if it's supported, and set `require_parameters` to true in your Provider Preferences. See openrouter.ai/docs/provider-routing

Request Headers
---------------

OpenRouter allows you to specify an optional `HTTP-Referer` header to identify your app and make it discoverable to users on [openrouter.ai](https://openrouter.ai/). You can also include an optional `X-Title` header to set or modify the title of your app. Example:

```
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": `${YOUR_SITE_URL}`, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": `${YOUR_SITE_NAME}`, // Optional. Shows in rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "mistralai/mixtral-8x7b-instruct",
    "messages": [

      {"role": "user", "content": "Who are you?"},

    ],
  })
});
```

**Model routing:** If the `model` parameter is omitted, the user or payer's default is used. Otherwise, remember to select a value for `model` from the [supported models](https://openrouter.ai/models) or [API](https://openrouter.ai/api/v1/models), and include the organization prefix. OpenRouter will select the least expensive and best GPUs available to serve the request, and fall back to other providers or GPUs if it receives a 5xx response code or if you are rate-limited.

**Streaming:** [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format) are supported as well, to enable streaming _for all models_. Simply send `stream: true` in your request body. The SSE stream will occasionally contain a "comment" payload, which you should ignore (noted below).

**Non-standard parameters:** If the chosen model doesn't support a request parameter (such as `logit_bias` in non-OpenAI models, or `top_k` for OpenAI), then the parameter is ignored. The rest are forwarded to the underlying model API.

**Assistant Prefill:** OpenRouter supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.

To use this features, simply include a message with `role: "assistant"` at the end of your `messages` array. Example:

```
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": `${YOUR_SITE_URL}`, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": `${YOUR_SITE_NAME}`, // Optional. Shows in rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "mistralai/mixtral-8x7b-instruct",
    "messages": [

      {"role": "user", "content": "Who are you?"},
      {"role": "assistant", "content": "I'm not sure, but my best guess is"},
    ],
  })
});
```

Images & Multimodal Requests
----------------------------

Multimodal requests are only available via the `/api/v1/chat/completions` API with a multi-part `messages` parameter. The `image_url` can either be a URL or a data-base64 encoded image. Example:

```
...
"messages": [
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "What's in this image?"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
        }
      }
    ]
  }
]
```

Sample LLM's response:

```
{
  "choices": [
    {
      "role": "assistant",
      "content": "This image depicts a scenic natural landscape featuring a long wooden boardwalk that stretches out through an expansive field of green grass. The boardwalk provides a clear path and invites exploration through the lush environment. The scene is surrounded by a variety of shrubbery and trees in the background, indicating a diverse plant life in the area."
    }
  ]
}
```

### Uploading base64 encoded images

For locally stored images, you can send them to the model using base64 encoding. Here's an example:

```
import { readFile } from 'fs/promises';

const getFlowerImage = async (): Promise<string> => {
  const imagePath = new URL('flower.jpg', import.meta.url);
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
};

...

'messages': [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: "What's in this image?",
      },
      {
        type: 'image_url',
        image_url: {
          url: `${await getFlowerImage()}`,
        },
      },
    ],
  },
];
```

When sending data-base64 string, ensure it contains the content-type of the image. Example:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII
```

Supported content types are:

*   image/png
*   image/jpeg
*   image/webp

Tool Calls
----------

Tool calls (also known as function calling) allow you to give an LLM access to external tools. The LLM does not call the tools directly. Instead, it suggests the tool to call. The user then calls the tool separately and provides the results back to the LLM. Finally, the LLM formats the response into an answer to the user's original question.

An example of the five-turn sequence:

1.  The user asks a question, while supplying a list of available `tools` in a JSON schema format:

```
...
"messages": [{
  "role": "user",
  "content": "What is the weather like in Boston?"
}],
"tools": [{
"type": "function",
"function": {
    "name": "get_current_weather",
    "description": "Get the current weather in a given location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "The city and state, e.g. San Francisco, CA"
        },
        "unit": {
          "type": "string",
          "enum": [
            "celsius",
            "fahrenheit"
          ]
        }
      },
      "required": [
        "location"
      ]
    }
  }
}],
```

2.  The LLM responds with tool suggestion, together with appropriate arguments:

```
// Some models might include their reasoning in content
"message": {
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_9pw1qnYScqvGrCH58HWCvFH6",
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "arguments": "{ \"location\": \"Boston, MA\"}"
      }
    }
  ]
},
```

3.  The user calls the tool separately:

```
const weather = await getWeather({ location: 'Boston, MA' });
console.log(weather); // { "temperature": "22", "unit": "celsius", "description": "Sunny"}
```

4.  The user provides the tool results back to the LLM:

```
...
"messages": [
  {
    "role": "user",
    "content": "What is the weather like in Boston?"
  },
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [
      {
        "id": "call_9pw1qnYScqvGrCH58HWCvFH6",
        "type": "function",
        "function": {
          "name": "get_current_weather",
          "arguments": "{ \"location\": \"Boston, MA\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "name": "get_current_weather",
    "tool_call_id": "call_9pw1qnYScqvGrCH58HWCvFH6",
    "content": "{\"temperature\": \"22\", \"unit\": \"celsius\", \"description\": \"Sunny\"}"
  }
],
```

5.  The LLM formats the tool result into a natural language response:

```
...
"message": {
  "role": "assistant",
  "content": "The current weather in Boston, MA is sunny with a temperature of 22°C."
}
```

OpenRouter standardizes the tool calling interface. However, different providers and models may support less tool calling features and arguments. (ex: `tool_choice`, `tool_use`, `tool_result`)

Stream Cancellation
-------------------

For some providers, streaming requests can be canceled by aborting the connection or simply disconnecting.

When aborting the connection to a provider that supports stream cancellation, the model will stop processing the request, and billing will stop as soon as the upstream provider detects the disconnection.

If you're using the Fetch API, you can use the AbortController to cancel the stream. Here's an example:

```
const controller = new AbortController();

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: ...,
  body: ...,
  signal: controller.signal
})

...

// Later, to cancel the stream:
controller.abort();
```

**NOTE**: Aborting/disconnecting from a non-stream request or a stream request to a provider that does not support stream cancellation will not halt the model's processing in the background. You will still be billed for the rest of the completion.

# Title: Responses | OpenRouter

URL Source: https://openrouter.ai/docs/responses

Markdown Content:
Responses
---------

Responses are largely consistent with the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat). This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

At a high level, **OpenRouter normalizes the schema across models** and providers so you only need to learn one.

Response Body
-------------

Note that `finish_reason` will vary depending on the model provider. The `model` property tells you which model was used inside the underlying API.

Here's the response schema as a TypeScript type:

```
// Definitions of subtypes are below

type Response = {
  id: string;
  // Depending on whether you set "stream" to "true" and
  // whether you passed in "messages" or a "prompt", you
  // will get a different output shape
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
  created: number; // Unix timestamp
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';

  system_fingerprint?: string; // Only present if the provider supports it

  // Usage data is always returned for non-streaming.
  // When streaming, you will get one usage object at
  // the end accompanied by an empty choices array.
  usage?: ResponseUsage;
};
```

```
// If the provider returns usage, we pass it down
// as-is. Otherwise, we count using the GPT-4 tokenizer.

type ResponseUsage = {
  /** Including images and tools if any */
  prompt_tokens: number;
  /** The tokens generated */
  completion_tokens: number;
  /** Sum of the above two fields */
  total_tokens: number;
}
```

```
// Subtypes:
type NonChatChoice = {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
};

type NonStreamingChoice = {
  finish_reason: string | null; // Depends on the model. Ex: 'stop' | 'length' | 'content_filter' | 'tool_calls'
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type StreamingChoice = {
  finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type ErrorResponse = {
  code: number; // See "Error Handling" section
  message: string;
  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
};

type ToolCall = {
  id: string;
  type: 'function';
  function: FunctionCall;
};
```

Here's an example:

```
{
  "id": "gen-xxxxxxxxxxxxxx",
  "choices": [
    {
      "finish_reason": "stop", // Different models provide different reasons here
      "message": {
        // will be "delta" if streaming
        "role": "assistant",
        "content": "Hello there!"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 4,
    "total_tokens": 4
  },
  "model": "openai/gpt-3.5-turbo" // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used
}
```

Querying Cost and Stats
-----------------------

The token counts that are returned in the completions API response are NOT counted with the model's native tokenizer. Instead it uses a normalized, model-agnostic count.

For precise token accounting using the model's native tokenizer, use the `/api/v1/generation` endpoint.

You can use the returned `id` to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for _all models and requests_, streaming and non-streaming.

```
const generation = await fetch(
  "https://openrouter.ai/api/v1/generation?id=$GENERATION_ID",
  { headers }
)

await generation.json()
// OUTPUT:
{
  data: {
    "id": "gen-nNPYi0ZB6GOK5TNCUMHJGgXo",
    "model": "openai/gpt-4-32k",
    "streamed": false,
    "generation_time": 2,
    "created_at": "2023-09-02T20:29:18.574972+00:00",
    "tokens_prompt": 24,
    "tokens_completion": 29,
    "native_tokens_prompt": 24,
    "native_tokens_completion": 29,
    "num_media_prompt": null,
    "num_media_completion": null,
    "origin": "https://localhost:47323/",
    "total_cost": 0.00492,
    "cache_discount": null,
    ...
  }
};
```

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.

SSE Streaming Comments
----------------------

For SSE streams, we occasionally need to send an [SSE comment](https://html.spec.whatwg.org/multipage/server-sent-events.html#authoring-notes) to indicate that OpenRouter is processing your request. This helps prevent connections from timing out. The comment will look like this:

Comment payload can be safely ignored per the [SSE specs](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation). However, you can leverage it to improve UX as needed, e.g. by showing a dynamic loading indicator.

Some SSE client implementations might not parse the payload according to spec, which leads to an uncaught error when you `JSON.stringify` the non-JSON payloads. We recommend the following clients:

*   [eventsource-parser](https://github.com/rexxars/eventsource-parser)
*   [OpenAI SDK](https://www.npmjs.com/package/openai)
*   [Vercel AI SDK](https://www.npmjs.com/package/ai)

# Title: Parameters | OpenRouter

URL Source: https://openrouter.ai/docs/parameters

Markdown Content:
Parameters
----------

Sampling parameters shape the token generation process of the model. You may send any parameters from the following list, as well as others, to OpenRouter.

OpenRouter will default to the values listed below if certain parameters are absent from your request (for example, `temperature` to 1.0). We will also transmit some provider-specific parameters, such as `safe_prompt` for Mistral or `raw_mode` for Hyperbolic directly to the respective providers if specified.

Please refer to the model’s provider section to confirm which parameters are supported. For detailed guidance on managing provider-specific parameters, [click here](https://openrouter.ai/provider-routing#required-parameters-_beta_).

Temperature
-----------

*   Key: `temperature`

*   Optional, **float**, 0.0 to 2.0

*   Default: 1.0

*   Explainer Video: [Watch](https://youtu.be/ezgqHnWvua8)


This setting influences the variety in the model's responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.

Top P
-----

*   Key: `top_p`

*   Optional, **float**, 0.0 to 1.0

*   Default: 1.0

*   Explainer Video: [Watch](https://youtu.be/wQP-im_HInk)


This setting limits the model's choices to a percentage of likely tokens: only the top tokens whose probabilities add up to P. A lower value makes the model's responses more predictable, while the default setting allows for a full range of token choices. Think of it like a dynamic Top-K.

Top K
-----

*   Key: `top_k`

*   Optional, **integer**, 0 or above

*   Default: 0

*   Explainer Video: [Watch](https://youtu.be/EbZv6-N8Xlk)


This limits the model's choice of tokens at each step, making it choose from a smaller set. A value of 1 means the model will always pick the most likely next token, leading to predictable results. By default this setting is disabled, making the model to consider all choices.

Frequency Penalty
-----------------

*   Key: `frequency_penalty`

*   Optional, **float**, -2.0 to 2.0

*   Default: 0.0

*   Explainer Video: [Watch](https://youtu.be/p4gl6fqI0_w)


This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.

Presence Penalty
----------------

*   Key: `presence_penalty`

*   Optional, **float**, -2.0 to 2.0

*   Default: 0.0

*   Explainer Video: [Watch](https://youtu.be/MwHG5HL-P74)


Adjusts how often the model repeats specific tokens already used in the input. Higher values make such repetition less likely, while negative values do the opposite. Token penalty does not scale with the number of occurrences. Negative values will encourage token reuse.

Repetition Penalty
------------------

*   Key: `repetition_penalty`

*   Optional, **float**, 0.0 to 2.0

*   Default: 1.0

*   Explainer Video: [Watch](https://youtu.be/LHjGAnLm3DM)


Helps to reduce the repetition of tokens from the input. A higher value makes the model less likely to repeat tokens, but too high a value can make the output less coherent (often with run-on sentences that lack small words). Token penalty scales based on original token's probability.

Min P
-----

*   Key: `min_p`

*   Optional, **float**, 0.0 to 1.0

*   Default: 0.0


Represents the minimum probability for a token to be considered, relative to the probability of the most likely token. (The value changes depending on the confidence level of the most probable token.) If your Min-P is set to 0.1, that means it will only allow for tokens that are at least 1/10th as probable as the best possible option.

Top A
-----

*   Key: `top_a`

*   Optional, **float**, 0.0 to 1.0

*   Default: 0.0


Consider only the top tokens with "sufficiently high" probabilities based on the probability of the most likely token. Think of it like a dynamic Top-P. A lower Top-A value focuses the choices based on the highest probability token but with a narrower scope. A higher Top-A value does not necessarily affect the creativity of the output, but rather refines the filtering process based on the maximum probability.

Seed
----

*   Key: `seed`

*   Optional, **integer**


If specified, the inferencing will sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed for some models.

Max Tokens
----------

*   Key: `max_tokens`

*   Optional, **integer**, 1 or above


This sets the upper limit for the number of tokens the model can generate in response. It won't produce more than this limit. The maximum value is the context length minus the prompt length.

Logit Bias
----------

*   Key: `logit_bias`

*   Optional, **map**


Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.

Logprobs
--------

*   Key: `logprobs`

*   Optional, **boolean**


Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned.

Top Logprobs
------------

*   Key: `top_logprobs`

*   Optional, **integer**


An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.

Response Format
---------------

*   Key: `response_format`

*   Optional, **map**


Forces the model to produce specific output format. Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the message the model generates is valid JSON.

**Note**: when using JSON mode, you should also instruct the model to produce JSON yourself via a system or user message.

Structured Outputs
------------------

*   Key: `structured_outputs`

*   Optional, **boolean**


If the model can return structured outputs using response\_format json\_schema.

Stop
----

*   Key: `stop`

*   Optional, **array**


Stop generation immediately if the model encounter any token specified in the stop array.

Tool Choice
-----------

*   Key: `tool_choice`

*   Optional, **array**


Controls which (if any) tool is called by the model. 'none' means the model will not call any tool and instead generates a message. 'auto' means the model can pick between generating a message or calling one or more tools. 'required' means the model must call one or more tools. Specifying a particular tool via {"type": "function", "function": {"name": "my\_function"}} forces the model to call that tool.

# Title: Structured Outputs | OpenRouter

URL Source: https://openrouter.ai/docs/structured-outputs

Markdown Content:
Structured Outputs
------------------

OpenRouter supports structured outputs for compatible models, ensuring responses follow a specific JSON Schema format. This feature is particularly useful when you need consistent, well-formatted responses that can be reliably parsed by your application.

Overview
--------

Structured outputs allow you to:

*   Enforce specific JSON Schema validation on model responses
*   Get consistent, type-safe outputs
*   Avoid parsing errors and hallucinated fields
*   Simplify response handling in your application

Using Structured Outputs
------------------------

To use structured outputs, include a response\_format parameter in your request, with type set to json\_schema and the json\_schema object containing your schema:

```
{
  "messages": [
    { "role": "user", "content": "What's the weather like in London?" }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "weather",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City or location name"
          },
          "temperature": {
            "type": "number",
            "description": "Temperature in Celsius"
          },
          "conditions": {
            "type": "string",
            "description": "Weather conditions description"
          }
        },
        "required": ["location", "temperature", "conditions"],
        "additionalProperties": false
      }
    }
  }
}
```

The model will respond with a JSON object that strictly follows your schema:

```
{
  "location": "London",
  "temperature": 18,
  "conditions": "Partly cloudy with light drizzle"
}
```

Model Support
-------------

Structured outputs are supported by select models, including:

You can find a list of models that support structured outputs on the [models page](https://openrouter.ai/models?order=newest&supported_parameters=structured_outputs).

*   OpenAI models (GPT-4o and later versions) [Docs](https://platform.openai.com/docs/guides/structured-outputs)
*   All Fireworks provided models [Docs](https://docs.fireworks.ai/structured-responses/structured-response-formatting#structured-response-modes)

To ensure your chosen model supports structured outputs:

1.  Check the model's supported parameters on the [models page](https://openrouter.ai/models)
2.  Set `require_parameters: true` in your provider preferences (see [Provider Routing](https://openrouter.ai/docs/provider-routing))
3.  Include `ResponseFormat` and set `type: json_schema` in the required parameters

Best Practices
--------------

1.  **Include descriptions**: Add clear descriptions to your schema properties to guide the model

2.  **Use strict mode**: Always set `strict: true` to ensure the model follows your schema exactly


Example Implementation
----------------------

Here's a complete example using the Fetch API:

```
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_API_KEY',
    'HTTP-Referer': 'https://your-app.com',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4',
    messages: [
      { role: 'user', content: 'What is the weather like in London?' },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'weather',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City or location name',
            },
            temperature: {
              type: 'number',
              description: 'Temperature in Celsius',
            },
            conditions: {
              type: 'string',
              description: 'Weather conditions description',
            },
          },
          required: ['location', 'temperature', 'conditions'],
          additionalProperties: false,
        },
      },
    },
  }),
});

const data = await response.json();
const weatherInfo = data.choices[0].message.content;
```

Streaming with Structured Outputs
---------------------------------

Structured outputs are also supported with streaming responses. The model will stream valid partial JSON that, when complete, forms a valid response matching your schema.

To enable streaming with structured outputs, simply add `stream: true` to your request:

```
{
  "stream": true,
  "response_format": {
    "type": "json_schema",
    // ... rest of your schema
  }
}
```

Error Handling
--------------

When using structured outputs, you may encounter these scenarios:

1.  **Model doesn't support structured outputs**: The request will fail with an error indicating lack of support
2.  **Invalid schema**: The model will return an error if your JSON Schema is invalid

# Title: Errors | OpenRouter

URL Source: https://openrouter.ai/docs/errors

Markdown Content:
Errors
------

For errors, OpenRouter returns a JSON response with the following shape:

```
type ErrorResponse = {
  error: {
    code: number;
    message: string;
    metadata?: Record<string, unknown>;
  };
};
```

The HTTP Response will have the same status code as `error.code`, forming a request error if:

*   Your original request is invalid
*   Your API key/account is out of credits

Otherwise, the returned HTTP response status will be `200` and any error occured while the LLM is producing the output will be emitted in the response body or as an SSE data event.

Example code for printing errors in JavaScript:

```
const request = await fetch('https://openrouter.ai/...');
console.log(request.status); // Will be an error code unless the model started processing your request
const response = await request.json();
console.error(response.error?.status); // Will be an error code
console.error(response.error?.message);
```

Error Codes
-----------

*   **400**: Bad Request (invalid or missing params, CORS)
*   **401**: Invalid credentials (OAuth session expired, disabled/invalid API key)
*   **402**: Your account or API key has insufficient credits. Add more credits and retry the request.
*   **403**: Your chosen model requires moderation and your input was flagged
*   **408**: Your request timed out
*   **429**: You are being rate limited
*   **502**: Your chosen model is down or we received an invalid response from it
*   **503**: There is no available model provider that meets your routing requirements

Moderation Errors
-----------------

If your input was flagged, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

```
type ModerationErrorMetadata = {
  reasons: string[]; // Why your input was flagged
  flagged_input: string; // The text segment that was flagged, limited to 100 characters. If the flagged input is longer than 100 characters, it will be truncated in the middle and replaced with ...

  provider_name: string; // The name of the provider that requested moderation
  model_slug: string;
};
```

Provider Errors
---------------

If the model provider encounters an error, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

```
type ProviderErrorMetadata = {
  provider_name: string; // The name of the provider that encountered the error
  raw: unknown; // The raw error from the provider
};
```

When No Content is Generated
----------------------------

Occasionally, the model may not generate any content. This typically occurs when:

*   The model is warming up from a cold start
*   The system is scaling up to handle more requests

Warm-up times usually range from a few seconds to a few minutes, depending on the model and provider.

If you encounter persistent no-content issues, consider implementing a simple retry mechanism or trying again with a different provider or model that has more recent activity.

Additionally, be aware that in some cases, you may still be charged for the prompt processing cost by the upstream provider, even if no content is generated.
