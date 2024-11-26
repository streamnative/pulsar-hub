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
icon: "/images/connectors/milvus.png"
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

- If you don't already have a collection in Zilliz Cloud or Milvus cluster, create a collection with a vector field.
- Collect the `endpoint`, `token`, and `collection.name` parameters from your Zilliz Cloud instance or Milvus cluster.

### Configuration

The ElasticSearch Kafka Connect Sink connector is configured using the following *Required* properties:

Parameter | Description
-|-
`connection.url` | The endpoint of your ElasticSearch cluster.
`type.name` | The Elasticsearch type name to use when indexing.
`topics` | The Kafka topics to read from.

For more information about the configuration properties, see the [Official ElasticSearch Kafka Connect Sink Connector documentation](https://github.com/Aiven-Open/elasticsearch-connector-for-apache-kafka/blob/v7.0.0/README.md).

