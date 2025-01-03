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

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Set up a Milvus cluster, we can set up a local Milvus cluster using docker-compose:
 
    ```shell
    wget -q https://github.com/milvus-io/milvus/releases/download/${MILVUS_VERSION}/milvus-standalone-docker-compose.yml -O "tmp/docker-compose.yml" > /dev/null 2>&1
    docker compose -f "tmp/docker-compose.yml" up -d > /dev/null 2>&1
    ```
3. Initialize the local Milvus cluster, below is a python script to do so:
    ```python
    from pymilvus import MilvusClient, DataType
    import time

    client = MilvusClient(
    uri="http://localhost:19530",
    db_name="default"
    )

    # 3.1. Create schema
    schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
    )
    schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
    schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=65535)
    schema.add_field(field_name="title_vector", datatype=DataType.FLOAT_VECTOR, dim=8)
    schema.add_field(field_name="link", datatype=DataType.VARCHAR, max_length=65535)

    index_params = client.prepare_index_params()

    index_params.add_index(
    field_name="id",
    index_type="STL_SORT"
    )

    index_params.add_index(
    field_name="title_vector", 
    index_type="IVF_FLAT",
    metric_type="IP",
    params={ "nlist": 128 }
    )

    client.create_collection(
    collection_name="demo",
    schema=schema,
    index_params=index_params
    )

    time.sleep(5)
    ```
4. Create a JSON file like the following:

    ```json
    {
        "name": "mysink13",
        "config": {
            "connector.class": "com.milvus.io.kafka.MilvusSinkConnector",
            "topics": "mytopic",
            "public.endpoint": "http://{MILVUS_IP}:19530",
            "token": "",
            "collection.name": "demo",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "value.converter.schemas.enable": "false",
            "tasks.max": "1"
        }
    }
    ```
5. Run the following command to create the connector:

    ```shell
    kcctl create -f <filename>.json
    ```
   

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