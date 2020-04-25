---
description: The Twitter Firehose source connector receives tweets from Twitter Firehose and writes the tweets to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: ""
source: "https://github.com/apache/pulsar/tree/v2.3.2/pulsar-io/twitter/src/main/java/org/apache/pulsar/io/twitter"
license: Apache License 2.0
tags: ["Pulsar IO", "Twitter", "Source"]
alias: Twitter Source
features: ["Use twitter source connector to sync data to Pulsar"]
icon: https://img.icons8.com/color/48/000000/twitter.png
download: "https://archive.apache.org/dist/pulsar/pulsar-2.3.2/connectors/pulsar-io-twitter-2.3.2.nar"
support: Apache community
dockerfile: ""
id: "twitter-source"
---

The Twitter Firehose source connector receives tweets from Twitter Firehose and writes the tweets to Pulsar topics.

# Configuration

The configuration of the Twitter Firehose source connector has the following properties.

## Property

| Name | Type|Required | Default | Description 
|------|----------|----------|---------|-------------|
| `consumerKey` | String|true | " " (empty string) | The twitter OAuth consumer key.<br><br>For more information, see [Access tokens](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens). |
| `consumerSecret` | String |true | " " (empty string)  | The twitter OAuth consumer secret. |
| `token` | String|true | " " (empty string)  | The twitter OAuth token. |
| `tokenSecret` | String|true | " " (empty string) | The twitter OAuth secret. |
| `guestimateTweetTime`|Boolean|false|false|Most firehose events have null createdAt time.<br><br>If `guestimateTweetTime` set to true, the connector estimates the createdTime of each firehose event to be current time.
| `clientName` |  String |false | openconnector-twitter-source| The twitter firehose client name. |
| `clientHosts` |String| false | Constants.STREAM_HOST | The twitter firehose hosts to which client connects. |
| `clientBufferSize` | int|false | 50000 | The buffer size for buffering tweets fetched from twitter firehose. |

> For more information about OAuth credentials, see [Twitter developers portal](https://developer.twitter.com/en.html).
