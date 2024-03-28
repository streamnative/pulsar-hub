---
description: The Debezium MongoDB source connector pulls messages from MongoDB and persists the messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v3.2.1/pulsar-io/debezium/mongodb"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "Source"]
alias: Debezium MongoDB Source
features: ["Use Debezium MongoDB source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://github.com/streamnative/pulsar/releases/download/v3.2.1.2/pulsar-io-debezium-mongodb-3.2.1.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
sn_available: true
id: "debezium-mongodb-source"
---

The Debezium MongoDB source connector pulls messages from MongoDB and persists the messages to Pulsar topics.

![](/images/connectors/debezium-mongodb.png)

## Quick start

### Prerequisites

The prerequisites for connecting a Debezium MongoDB source connector to external systems include:

1. Create a MongoDB service: This connector uses the debezium v1.9, Please refer to this [document](https://debezium.io/releases/1.9/) to see the compatible MongoDB versions.
2. Prepare MongoDB Database: Please refer to this [document](https://debezium.io/documentation/reference/1.9/connectors/mongodb.html#setting-up-mongodb) to complete the prepare steps on MongoDB.


### 1. Prepare MongoDB service

Initialize MongoDB replica set and insert some test data. You can use the following command to start a MongoDB service for the testing purpose.

```sh
docker run -d -p 27017:27017 --name mongodb mongo:latest --replSet rs0
```

Shell into the container:

```sh
docker exec -it mongodb mongosh
```

Initialize replica sets:

```sh
rs.initiate({_id: "rs0", members: [{ _id: 0, host: "localhost:27017" }]})
```

### 2. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type debezium-mongodb` with `--archive /path/to/pulsar-io-debezium-mongodb.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type debezium-mongodb \
  --name debezium-mongodb \
  --tenant public \
  --namespace default \
  --parallelism 1 \
  --source-config \
  '{
    "mongodb.hosts": "rs0/localhost:27017",
    "mongodb.name": "debezium",
    "mongodb.task.id": "1",
    "database.whitelist": "inventory"
  }'
```

The `--source-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.

If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/sink-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 3. Insert and update a data to the collection

Start the mongosh and run:

```
use inventory;
db.customers.insert([ { _id: NumberLong("1"), first_name: 'Bob', last_name: 'Hopper', email: 'thebob@example.com', unique_id: UUID() }] );
```

### 4. Show data using Pulsar client

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

```sh
bin/pulsar-client \
--url "Your Pulsar serviceUrl" \
consume "persistent://public/default/debezium.inventory.customers" -s "test-sub" -n 0 -p Earliest

----- got message -----
key:[eyJpZCI6IjQifQ==], properties:[], content:{"after":"{\"_id\": {\"$numberLong\": \"1\"},\"first_name\": \"Bob\",\"last_name\": \"Hopper\",\"email\": \"thebob@example.com\",\"unique_id\": {\"$binary\": \"xQezJ8i5QTGDG9NXlVFUEw==\",\"$type\": \"04\"}}","patch":null,"filter":null,"updateDescription":null,"source":{"version":"1.9.7.Final","connector":"mongodb","name":"debezium","ts_ms":1701329265000,"snapshot":"false","db":"inventory","sequence":null,"rs":"rs0","collection":"customers","ord":1,"h":null,"tord":null,"stxnid":null,"lsid":null,"txnNumber":null},"op":"c","ts_ms":1701329265295,"transaction":null}
```

## Configuration Properties
The configuration of Debezium Mongodb source connector has the following properties.

| Name                                  | Required | Sensitive | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------------------------------------|----------|-----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mongodb.hosts`                       | true     | false     | null    | The comma-separated list of hostname and port pairs (in the form 'host' or 'host:port') of the MongoDB servers in the replica set. The list contains a single hostname and a port pair. If mongodb.members.auto.discover is set to false, the host and port pair are prefixed with the replica set name (e.g., rs0/localhost:27017).                                                                                                                                                                                                |
| `mongodb.name`                        | true     | false     | null    | A unique name that identifies the connector and/or MongoDB replica set or shared cluster that this connector monitors. Each server should be monitored by at most one Debezium connector, since this server name prefixes all persisted Kafka topics emanating from the MongoDB replica set or cluster.                                                                                                                                                                                                                             |
| `mongodb.user`                        | false    | true      | null    | Name of the database user to be used when connecting to MongoDB. This is required only when MongoDB is configured to use authentication.                                                                                                                                                                                                                                                                                                                                                                                            |
| `mongodb.password`                    | false    | true      | null    | Password to be used when connecting to MongoDB. This is required only when MongoDB is configured to use authentication.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `mongodb.task.id`                     | true     | false     | null    | The taskId of the MongoDB connector that attempts to use a separate task for each replica set.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `database.whitelist`                  | false    | false     | null    | A list of all databases hosted by this server which is monitored by the  connector.<br/><br/> By default, all databases are monitored.                                                                                                                                                                                                                                                                                                                                                                                              |
| `key.converter`                       | false    | false     | null    | The converter provided by Kafka Connect to convert record key.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `value.converter`                     | false    | false     | null    | The converter provided by Kafka Connect to convert record value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `database.history.pulsar.topic`       | false    | false     | null    | The name of the database history topic where the connector writes and recovers DDL statements. <br/><br/>**Note: this topic is for internal use only and should not be used by consumers.**                                                                                                                                                                                                                                                                                                                                         |
| `database.history.pulsar.service.url` | false    | false     | null    | Pulsar cluster service URL for history topic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `offset.storage.topic`                | false    | false     | null    | Record the last committed offsets that the connector successfully completes. By default, it's `topicNamespace + "/" + sourceName + "-debezium-offset-topic"`. eg. `persistent://public/default/debezium-mongodb-source-debezium-offset-topic`                                                                                                                                                                                                                                                                                       |
| `json-with-envelope`                  | false    | false     | false   | The`json-with-envelope` config is valid only for the JsonConverter. By default, the value is set to false. When the `json-with-envelope` value is set to false, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message only consists of the payload. When the `json-with-envelope` value is set to true, the consumer uses the schema `Schema.KeyValue(Schema.BYTES, Schema.BYTES)`, and the message consists of the schema and the payload. |

For more configuration properties, plesae see [Debezium MongoDB connector configuration properties](https://debezium.io/documentation/reference/1.9/connectors/mongodb.html#mongodb-connector-properties)

## Advanced features

### Converter options

- org.apache.kafka.connect.json.JsonConverter

  The`json-with-envelope` config is valid only for the JsonConverter. By default, the value is set to false. When the `json-with-envelope` value is set to false, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message only consists of the payload.
  When the `json-with-envelope` value is set to true, the consumer uses the schema `Schema.KeyValue(Schema.BYTES, Schema.BYTES)`, and the message consists of the schema and the payload.

- org.apache.pulsar.kafka.shade.io.confluent.connect.avro.AvroConverter

  If you select the AvroConverter, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message consists of the payload.


### Used topic on Pulsar
Currently, the destination topic (specified by the `destination-topic-name` option ) is a required configuration but it is not used for the Debezium connector to save data. The Debezium connector saves data on the following 4 types of topics:

- One topic for storing the database metadata messages. It is named with the database server name ( `database.server.name`), like `public/default/database.server.name`.
- One topic (`offset.storage.topic`) for storing the offset metadata messages. The connector saves the last successfully-committed offsets on this topic.
- (Option) One topic (`database.history.pulsar.topic`) for storing the database history information. The connector writes and recovers DDL statements on this topic.
- One per-table topic. The connector writes change events for all operations that occur in a table to a single Pulsar topic that is specific to that table. For examples: "public/default/mydbserver.public.io-test"
        If automatic topic creation is disabled on the Pulsar broker, you need to manually create these 4 types of topics and the destination topic.
