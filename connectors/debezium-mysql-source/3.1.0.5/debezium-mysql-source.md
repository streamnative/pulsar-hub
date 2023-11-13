---
description: The Debezium source connector pulls messages from MySQL and persists the messages to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar/tree/v3.1.0.5/pulsar-io/debezium/mysql"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "MySQL", "Source"]
alias: Debezium MySQL Source
features: ["Use Debezium MySQL source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://github.com/streamnative/pulsar/releases/download/v3.1.0.5/pulsar-io-debezium-mysql-3.1.0.5.nar"
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
Depending on the environment, there are several ways to create a Debezium MySQL source connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
  Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
  Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-elastic-search).

No matter how you create a Debezium MySQL source connector, the minimum connector configuration contains the following parameters:
```yaml
configs:
    database.hostname: {{Your hostname of MySQL}}
    database.port: {{Your port of MySQL}}
    database.user: {{Your user of MySQL}}
    database.password: {{Your password of MySQL}}
    database.dbname: {{Your dbname of MySQL}}
    # You can set multiple tables, and the connector will send data from each table to a different topic of pulsar, 
    # and the topic naming role is: {{database.server.name}}.{{table.name}}. For examples: "public/default/mydbserver.public.io-test"
    table.whitelist: "public.io-test" 
    database.server.name: "mydbserver"
```

> * The configuration structure varies depending on how you create the Debezium mysql source connector.
    >  For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

### 4. Insert and update a data to table

You can insert and update using the sql:
```sql
INSERT INTO `io_database`.`io-test` (`first_name`, `last_name`, `age`)
VALUES ('mysql-io-test', 'streamnative', 4);

UPDATE `io_database`.`io-test`
SET `age` = 5, `last_name` = 'sn'
WHERE `first_name` = 'mysql-io-test' AND `last_name` = 'streamnative';
```

### 3. Show data using Pulsar client

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

| Name                                  | Required | Default | Description                                                                                                                                                                                                                                                                |
|---------------------------------------|----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database.hostname`                   | true     | null    | The address of a database server.                                                                                                                                                                                                                                          |
| `database.port`                       | true     | null    | The port number of a database server.                                                                                                                                                                                                                                      |
| `database.user`                       | true     | null    | The name of a database user that has the required privileges.                                                                                                                                                                                                              |
| `database.password`                   | true     | null    | The password for a database user that has the required privileges.                                                                                                                                                                                                         |
| `database.dbname`                     | true     | null    | The database.dbname parameter in Debezium configuration is used to specify the name of the specific database that the connector should connect to.                                                                                                                         |
| `database.server.name`                | true     | null    | The logical name of a database server/cluster, which forms a namespace and it is used in all the names of Kafka topics to which the connector writes, the Kafka Connect schema names, and the namespaces of the corresponding Avro schema when the Avro Connector is used. |
| `database.server.id`                  | false    | null    | The connector’s identifier that must be unique within a database cluster and similar to the database’s server-id configuration property.                                                                                                                                   |
| `database.whitelist`                  | false    | null    | A list of all databases hosted by this server which is monitored by the  connector.<br/><br/> This is optional, and there are other properties for listing databases and tables to include or exclude from monitoring.                                                     |
| `key.converter`                       | false    | null    | The converter provided by Kafka Connect to convert record key.                                                                                                                                                                                                             |
| `value.converter`                     | false    | null    | The converter provided by Kafka Connect to convert record value.                                                                                                                                                                                                           |
| `database.history`                    | false    | null    | The name of the database history class.                                                                                                                                                                                                                                    |
| `database.history.pulsar.topic`       | false    | null    | The name of the database history topic where the connector writes and recovers DDL statements. <br/><br/>**Note: this topic is for internal use only and should not be used by consumers.**                                                                                |
| `database.history.pulsar.service.url` | false    | null    | Pulsar cluster service URL for history topic.                                                                                                                                                                                                                              |
| `pulsar.service.url`                  | false    | null    | Pulsar cluster service URL.                                                                                                                                                                                                                                                |
| `offset.storage.topic`                | false    | null    | Record the last committed offsets that the connector successfully completes.                                                                                                                                                                                               |

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