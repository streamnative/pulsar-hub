---
description: "The official Milvus Kafka Connect Sink connector."
author: ["Zilliz"]
contributors: ["Zilliz"]
language: Java
document: "https://github.com/zilliztech/kafka-connect-milvus/blob/v3.2.3/README_OSS.md"
source: "https://github.com/zilliztech/kafka-connect-milvus/tree/v3.2.3"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect Milvus Sink
features: ["Writes data from Kafka topics to Milvus"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/milvus.png"
download: "https://github.com/zilliztech/kafka-connect-milvus/releases/tag/v3.2.3"
support: Community
support_link: "https://github.com/zilliztech/kafka-connect-milvus"
support_img: ""
owner_name: "Zilliz"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-milvus-sink"
powered_by: "Kafka Connect"
---

The Milvus Kafka Connect Sink connector is a Kafka Connect connector that writes data from Kafka topics to Milvus.

### Prerequisites

- If you don't already have a collection in Zilliz Cloud or Milvus cluster, create a collection with a vector field.
- Collect the `endpoint`, `token`, and `collection.name` parameters from your Zilliz Cloud instance or Milvus cluster.

### Configuration

The Milvus Kafka Connect Sink connector is configured using the following *Required* properties:

Parameter | Description
-|-
`public.endpoint` | The endpoint of your Zilliz Cloud instance or Milvus cluster.
`token` | The token of your Zilliz Cloud instance or Milvus cluster.
`collection.name` | The name of the collection to write to.
`topics` | The Kafka topics to read from.

For more information about the configuration properties, see the [offical Milvus Kafka Connect Sink Connector documentation](https://github.com/zilliztech/kafka-connect-milvus/blob/v3.2.3/README_OSS.md).

