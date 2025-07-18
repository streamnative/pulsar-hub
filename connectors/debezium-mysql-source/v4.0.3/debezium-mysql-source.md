---
description: The Debezium source connector pulls messages from MySQL and persists the messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v4.0.3/pulsar-io/debezium/mysql"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "MySQL", "Source"]
alias: Debezium MySQL Source
features: ["Use Debezium MySQL source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.png"
download: "https://github.com/streamnative/pulsar/releases/download/v4.0.3.2/pulsar-io-debezium-mysql-4.0.3.2.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
sn_available: true
id: "debezium-MySQL-source"
---

The MySQL source connector pulls messages from MySQL and persists the messages to Pulsar topics by using debezium.

![](/images/connectors/mysql-source.png)

## Quick start

### Prerequisites

The prerequisites for connecting a Debezium MySQL source connector to external systems include:

1. Create a MySQL service: This connector uses the debezium v1.9, Please refer to this [document](https://debezium.io/releases/1.9/) to see the compatible MySQL versions.
2. Prepare MySQL Database: Please refer to this [document](https://debezium.io/documentation/reference/1.9/connectors/mysql.html#setting-up-mysql) to complete the prepare steps on MySQL.
3. Configure topic retention policies: Before running the connector, you must ensure that you have set an infinite retention policy for both the `offset.storage.topic` and `database.history.pulsar.topic`. Refer to the [Used Topic On Pulsar](#used-topic-on-pulsar) section for more details.

{% callout title="Note" type="note" %}
If you are using AWS MySQL service, you need to use the [params group](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html) to set the [binlog_format](https://debezium.io/documentation/reference/1.9/connectors/mysql.html#enable-mysql-binlog) to `ROW`.
{% /callout %}


### 1. Create a table on MySQL 
Run the following SQL command on your MySQL. 

```sql
CREATE DATABASE io_database;
CREATE TABLE `io_database`.`io-test` (
    `id` INT AUTO_INCREMENT,
    `first_name` TEXT,
    `last_name` TEXT,
    `age` INT,
    PRIMARY KEY (`id`)
);
```

### 2. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type debezium-mysql` with `--archive /path/to/pulsar-io-debezium-mysql.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type debezium-mysql \
  --name debezium-mysql-source \
  --tenant public \
  --namespace default \
  --parallelism 1 \
  --source-config \
  '{
    "database.hostname": "Your hostname of MySQL",
    "database.port": "Your port of MySQL",
    "database.user": "Your user of MySQL",
    "database.password": "Your password of MySQL",
    "database.dbname": "Your dbname of MySQL",
    "table.whitelist": "public.io-test",
    "database.server.name": "mydbserver"
  }'
```

{% callout title="Note" type="note" %}
1. The `--parallelism` must be set to **1**. Debezium connectors do not support parallel consumption within a single instance. If you need to process tables in parallel, you can deploy multiple connector instances, each configured for different database schemas or tables.
2. You can set multiple tables for "table.whitelist", and the connector will send data from each table to a different topic of pulsar. The topic naming rule is: "{{database.server.name}}.{{table.name}}". For examples: "public/default/mydbserver.public.io-test".
{% /callout %}

The `--source-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.

If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/source-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 3. Insert and update a data to table

You can insert and update using the sql:
```sql
INSERT INTO `io_database`.`io-test` (`first_name`, `last_name`, `age`)
VALUES ('mysql-io-test', 'streamnative', 4);

UPDATE `io_database`.`io-test`
SET `age` = 5, `last_name` = 'sn'
WHERE `first_name` = 'mysql-io-test' AND `last_name` = 'streamnative';
```

### 4. Show data using Pulsar client

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

```
bin/pulsar-client \
--url "Your Pulsar serviceUrl" \
consume "public/default/mydbserver.io_database.io-test" -s "test-sub" -n 10 -p Earliest

----- got message -----
key:[eyJpZCI6MX0=], properties:[], content:{"before":null,"after":{"id":1,"first_name":"mysql-io-test","last_name":"streamnative","age":4},"source":{"version":"1.9.7.Final","connector":"mysql","name":"mydbserver","ts_ms":1698912778000,"snapshot":"false","db":"io_database","sequence":null,"table":"io-test","server_id":2017181175,"gtid":null,"file":"mysql-bin-changelog.000072","pos":1333,"row":0,"thread":null,"query":null},"op":"c","ts_ms":1698912778909,"transaction":null}
----- got message -----
key:[eyJpZCI6MX0=], properties:[], content:{"before":{"id":1,"first_name":"mysql-io-test","last_name":"streamnative","age":4},"after":{"id":1,"first_name":"mysql-io-test","last_name":"sn","age":5},"source":{"version":"1.9.7.Final","connector":"mysql","name":"mydbserver","ts_ms":1698912782000,"snapshot":"false","db":"io_database","sequence":null,"table":"io-test","server_id":2017181175,"gtid":null,"file":"mysql-bin-changelog.000072","pos":1677,"row":0,"thread":null,"query":null},"op":"u","ts_ms":1698912782158,"transaction":null}
```

## Configuration Properties
The configuration of Debezium source connector has the following properties.

| Name                                  | Required | Sensitive | Default | Description                                                                                                                                                                                                                                                                |
|---------------------------------------|----------|-----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database.hostname`                   | true     | false     | null    | The address of a database server.                                                                                                                                                                                                                                          |
| `database.port`                       | true     | false     | null    | The port number of a database server.                                                                                                                                                                                                                                      |
| `database.user`                       | true     | true      | null    | The name of a database user that has the required privileges.                                                                                                                                                                                                              |
| `database.password`                   | true     | true      | null    | The password for a database user that has the required privileges.                                                                                                                                                                                                         |
| `database.dbname`                     | true     | false     | null    | The database.dbname parameter in Debezium configuration is used to specify the name of the specific database that the connector should connect to.                                                                                                                         |
| `database.server.name`                | true     | false     | null    | The logical name of a database server/cluster, which forms a namespace and it is used in all the names of Kafka topics to which the connector writes, the Kafka Connect schema names, and the namespaces of the corresponding Avro schema when the Avro Connector is used. |
| `database.server.id`                  | false    | false     | null    | The connector’s identifier that must be unique within a database cluster and similar to the database’s server-id configuration property.                                                                                                                                   |
| `database.whitelist`                  | false    | false     | null    | A list of all databases hosted by this server which is monitored by the  connector.<br/><br/> This is optional, and there are other properties for listing databases and tables to include or exclude from monitoring.                                                     |
| `table.whitelist`                     | false    | false     | null    | A list of all tables hosted by this server which is monitored by the  connector.<br/><br/> This is optional, and there are other properties for listing tables and tables to include or exclude from monitoring.                                                           |
| `key.converter`                       | false    | false     | null    | The converter provided by Kafka Connect to convert record key.                                                                                                                                                                                                             |
| `value.converter`                     | false    | false     | null    | The converter provided by Kafka Connect to convert record value.                                                                                                                                                                                                           |
| `database.history`                    | false    | false     | null    | The name of the database history class.                                                                                                                                                                                                                                    |
| `database.history.pulsar.topic`       | false    | false     | null    | The name of the database history topic where the connector writes and recovers DDL statements. <br/><br/>**Note: this topic is for internal use only and should not be used by consumers.**                                                                                |
| `database.history.pulsar.service.url` | false    | false     | null    | Pulsar cluster service URL for history topic.                                                                                                                                                                                                                              |
| `pulsar.service.url`                  | false    | false     | null    | Pulsar cluster service URL.                                                                                                                                                                                                                                                |
| `offset.storage.topic`                | false    | false     | null    | Record the last committed offsets that the connector successfully completes.                                                                                                                                                                                               |

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
- One topic (`database.history.pulsar.topic`) for storing the database history information. The connector writes and recovers DDL statements on this topic.
- One per-table topic. You can set multiple tables for "table.whitelist", and the connector will send data from each table to a different topic of pulsar. The topic naming rule is: "{{database.server.name}}.{{table.name}}". For examples: "public/default/mydbserver.public.io-test".

If automatic topic creation is disabled on the Pulsar broker, you need to manually create these 4 types of topics and the destination topic.

For `offset.storage.topic` and `database.history.pulsar.topic`, If they are not specified in your connector's configuration, they will be created automatically using the following default naming convention:
- `database.history.pulsar.topic`: "{tenant}/{namespace}/{connector-name}-debezium-history-topic"
- `offset.storage.topic`: "{tenant}/{namespace}/{connector-name}-offset-storage-topic"

Here, {tenant} and {namespace} refer to the tenant and namespace where the connector is running.

Both the history and offset topics require their data to be retained indefinitely to ensure fault-tolerance and prevent data loss. Before running the connector, you must configure an infinite retention policy for both topics. Use the pulsar-admin CLI to set the retention policy:

```shell
pulsar-admin topicPolicies set-retention -s -1 -t -1 ${topic_name}
```