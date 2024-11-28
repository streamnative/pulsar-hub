---
description: "The official ElasticSearch Kafka Connect Sink connector."
author: ["Aiven-Open"]
contributors: ["Aiven-Open"]
language: Java
document: "https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka/blob/v7.0.0/README.md"
source: "https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka/tree/v7.0.0"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect ElasticSearch Sink
features: ["Writes data from Kafka topics to ElasticSearch"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/elasticsearch.png"
download: "https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka/releases/tag/v7.0.0"
support: Community
support_link: "https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka"
support_img: ""
owner_name: "Aiven-Open"
owner_img: ""
sn_available: true
dockerfile:
id: "kafka-connect-elasticsearch-sink"
powered_by: "Kafka Connect"
---

The ElasticSearch Kafka Connect Sink connector is a Kafka Connect connector that writes data from Kafka topics to ElasticSearch.

### Prerequisites

- A running ElasticSearch cluster

### Configuration

The ElasticSearch Kafka Connect Sink connector is configured using the following properties:

| Parameter                        | Required | Description                                                                                                                                       | Default |
|----------------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| connection.url                   | true     | List of Elasticsearch HTTP connection URLs e.g. `http://eshost1:9200, http://eshost2:9200`                                                        |         |                                                                   |
| type.name                        | true     | The Elasticsearch type name to use when indexing.                                                                                                 |         |                                                                   |
| connection.username              | false    | The username used to authenticate with Elasticsearch.                                                                                             |         |
| connection.password              | false    | The password used to authenticate with Elasticsearch.                                                                                             |         |
| batch.size                       | false    | The number of records to process as a batch when writing to Elasticsearch.                                                                        | 2000    |
| max.in.flight.requests           | false    | The maximum number of indexing requests that can be in-flight to Elasticsearch before blocking further requests.                                  | 5       |
| max.buffered.records             | false    | The maximum number of records each task will buffer before blocking acceptance of more records.                                                   | 20000   |
| linger.ms                        | false    | Linger time in milliseconds for batching.                                                                                                         | 1       |
| flush.timeout.ms                 | false    | The timeout in milliseconds to use for periodic flushing.                                                                                         | 10000   |
| max.retries                      | false    | The maximum number of retries that are allowed for failed indexing requests.                                                                      | 5       |
| retry.backoff.ms                 | false    | How long to wait in milliseconds before attempting the first retry of a failed indexing.                                                          | 100     |
| key.ignore                       | false    | Whether to ignore the record key for the purpose of forming the Elasticsearch document ID.                                                        | false   |
| topic.key.ignore                 | false    | List of topics for which `key.ignore` should be true.                                                                                             |         |
| schema.ignore                    | false    | Whether to ignore schemas during indexing.                                                                                                        | false   |
| topic.schema.ignore              | false    | List of topics for which `schema.ignore` should be true.                                                                                          |         |
| drop.invalid.message             | false    | Whether to drop kafka message when it cannot be converted to output message.                                                                      | false   |
| compact.map.entries              | false    | Defines how map entries with string keys within record values should be written to JSON.                                                          | true    |
| connection.timeout.ms            | false    | How long to wait in milliseconds when establishing a connection to the Elasticsearch server.                                                      | 1000    |
| read.timeout.ms                  | false    | How long to wait in milliseconds for the Elasticsearch server to send a response.                                                                 | 3000    |
| behavior.on.null.values          | false    | How to handle records with a non-null key and a null value, Valid options are 'ignore', 'delete', and 'fail'.                                     | ignore  |
| behavior.on.malformed.documents  | false    | How to handle records that Elasticsearch rejects due to some malformation of the document itself, Valid options are 'ignore', 'warn', and 'fail'. | fail    |

For more information about the configuration properties, see the [Official ElasticSearch Kafka Connect Sink Connector documentation](https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka/blob/v7.0.0/README.md).

