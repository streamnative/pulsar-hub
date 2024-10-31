---
description: "The official Milvus Kafka Connect Sink connector."
author: ["Zilliz"]
contributors: ["Zilliz"]
language: Java
document: "https://github.com/zilliztech/kafka-connect-milvus/blob/v0.1.3/README_OSS.md"
source: "https://github.com/zilliztech/kafka-connect-milvus/tree/v0.1.3"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect Milvus Sink
features: ["Writes data from Kafka topics to Milvus"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/milvus.png"
download: "https://github.com/zilliztech/kafka-connect-milvus/releases/tag/v0.1.3"
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

For more information about the configuration properties, see the [offical Milvus Kafka Connect Sink Connector documentation](https://github.com/zilliztech/kafka-connect-milvus/blob/v0.1.3/README_OSS.md).

### Known Issues

1. The Milvus Kafka Connect Sink connector does not support the dynamic fields feature yet, and when the dynamic fields feature enabled on the Milvus server, or enabled on the Zilliz Cloud instance, the connector will not work properly and throw below error:

```shell
2024-09-23T21:21:24,441+0000 [task-thread-mysink13-0] ERROR org.apache.kafka.connect.runtime.WorkerSinkTask - WorkerSinkTask{id=mysink13-0} Task threw an uncaught and unrecoverable exception. Task is being killed and will not recover until manually restarted. Error: 'com.google.protobuf.Internal$ProtobufList io.milvus.grpc.JSONArray.emptyList(java.lang.Class)'
java.lang.NoSuchMethodError: 'com.google.protobuf.Internal$ProtobufList io.milvus.grpc.JSONArray.emptyList(java.lang.Class)'
```

When you encounter this issue, please disable the dynamic fields feature on the Milvus server or Zilliz Cloud instance.