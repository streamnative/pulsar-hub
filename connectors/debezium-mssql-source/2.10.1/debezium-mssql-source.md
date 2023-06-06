---
description: The Debezium Microsoft SQL Server source connector pulls messages from SQL Server and persists the messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v2.10.1/pulsar-io/debezium/mssql"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "Source"]
alias: Debezium Microsoft SQL Server Source
features: ["Use Debezium Microsoft SQL Server source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.10.1/connectors/pulsar-io-debezium-mssql-2.10.1.nar"
support: Apache community
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile:
id: "debezium-mssql-source"
---

The Debezium Microsoft SQL Server source connector pulls messages from the SQL Server and persists the messages to Pulsar topics.

# Configuration

## Debezium Microsoft SQL source connector

The configuration of Microsoft SQL Server Debezium source connector has the following properties.

| Name                                  | Required | Default                                             | Description                                                                                                                                                                                                                                                                |
|---------------------------------------|----------|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `task.class`                          | true     | null                                                | A source task class that is implemented in Debezium.                                                                                                                                                                                                                       |
| `database.hostname`                   | true     | null                                                | The address of a database server.                                                                                                                                                                                                                                          |
| `database.port`                       | true     | null                                                | The port number of a database server.                                                                                                                                                                                                                                      |
| `database.user`                       | true     | null                                                | The name of a database user that has the required privileges.                                                                                                                                                                                                              |
| `database.password`                   | true     | null                                                | The password for a database user that has the required privileges.                                                                                                                                                                                                         |
| `database.dbname`                     | true     | null                                                | The name of the SQL server database.                                                                                                                                                                                                                                       |
| `database.server.name`                | true     | null                                                | The logical name of a database server/cluster, which forms a namespace and it is used in all the names of Kafka topics to which the connector writes, the Kafka Connect schema names, and the namespaces of the corresponding Avro schema when the Avro Connector is used. |
| `snapshot.mode`                       | true     | null                                                | Specifies the criteria for running a snapshot when the connector starts. <br/><br/>Supported values: initial, initial_only, schema_only.                                                                                                                                   |
| `key.converter`                       | false    | org.apache.kafka.connect.json.JsonConverter         | The converter provided by Kafka Connect to convert the record key.                                                                                                                                                                                                         |
| `value.converter`                     | false    | org.apache.kafka.connect.json.JsonConverter         | The converter provided by Kafka Connect to convert the record value.                                                                                                                                                                                                       |
| `database.history`                    | false    | org.apache.pulsar.io.debezium.PulsarDatabaseHistory | The name of the database history class.                                                                                                                                                                                                                                    |
| `database.history.pulsar.topic`       | false    | debezium-history-topic                              | The name of the database history topic where the connector writes and recovers DDL statements. <br/><br/>**Note: this topic is for internal use only and should not be used by consumers.**                                                                                |
| `database.history.pulsar.service.url` | false | null | The service URL of your Pulsar cluster for the history topic. If it is not set, the `client_auth_plugin` and `client_auth_params` from the connector will be used to connect. |
| `offset.storage.topic`                | false    | debezium-offset-topic                               | Record the last committed offsets that the connector successfully completes.                                                                                                                                                                                               |
| `table.include.list`                  | false    | null                                                | The optional comma-separated list of regular expressions that match fully-qualified table identifiers for tables to be monitored.                                                                                                                                          |
| `table.exlude.list`                   | false    | null                                                | The optional comma-separated list of regular expressions that match fully-qualified table identifiers for tables to be excluded.                                                                                                                                           |
| `column.include.list`                 | false    | null                                                | The optional comma-separated list of regular expressions that match fully-qualified names of columns that should be monitored.                                                                                                                                             |
| `column.exclude.list`                 | false    | null                                                | The optional comma-separated list of regular expressions that match the fully-qualified names of columns that should be excluded.                                                                                                                                          |

## Converter options

- org.apache.kafka.connect.json.JsonConverter

    The`json-with-envelope` configuration is valid only for the `JsonConverter`. By default, the value is set to `false`. When the `json-with-envelope` value is set to `false`, the consumer uses the schema `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)`, and the message only consists of the payload.
    When the `json-with-envelope` value is set to `true`, the consumer uses the `Schema.KeyValue(Schema.BYTES, Schema.BYTES)` schema, and the message consists of the schema and the payload.

- org.apache.pulsar.kafka.shade.io.confluent.connect.avro.AvroConverter

    If you select the `AvroConverter`, the consumer uses the `Schema.KeyValue(Schema.AUTO_CONSUME(), Schema.AUTO_CONSUME(), KeyValueEncodingType.SEPARATED)` schema, and the message consists of the payload.

# Examples

Debezium [requires](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#sqlserver-overview) SQL Server with CDC enabled.
This setup is outlined in the [documentation](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#setting-up-sqlserver) and used in the [integration test](https://github.com/apache/pulsar/blob/master/tests/integration/src/test/java/org/apache/pulsar/tests/integration/io/sources/debezium/DebeziumMsSqlSourceTester.java).
For more information, see [Enable and disable change data capture in Microsoft SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/track-changes/enable-and-disable-change-data-capture-sql-server).

You can use one of the following methods to create a configuration file.

* JSON

```json
{
  "database.hostname": "localhost",
  "database.port": "1433",
  "database.user": "sa",
  "database.password": "MyP@ssw0rd!",
  "database.dbname": "MyTestDB",
  "database.server.name": "mssql",
  "snapshot.mode": "schema_only",
  "topic.namespace": "public/default",
  "task.class": "io.debezium.connector.sqlserver.SqlServerConnectorTask",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "key.converter": "org.apache.kafka.connect.json.JsonConverter",
  "typeClassName": "org.apache.pulsar.common.schema.KeyValue",
  "database.history": "org.apache.pulsar.io.debezium.PulsarDatabaseHistory",
  "database.tcpKeepAlive": "true",
  "decimal.handling.mode": "double",
  "database.history.pulsar.topic": "debezium-mssql-source-history-topic",
  "database.history.pulsar.service.url": "pulsar://127.0.0.1:6650"
}
```

* YAML

```yaml
tenant: "public"
namespace: "default"
name: "debezium-mssql-source"
inputs: [ "debezium-mssql-topic" ]
parallelism: 1

className: "org.apache.pulsar.io.debezium.mssql.DebeziumMsSqlSource"
database.dbname: "mssql"

configs:
    database.hostname: "localhost"
    database.port: "1433"
    database.user: "sa"
    database.password: "MyP@ssw0rd!"
    database.dbname: "MyTestDB"
    database.server.name: "mssql"
    snapshot.mode: "schema_only"
    topic.namespace: "public/default"
    task.class: "io.debezium.connector.sqlserver.SqlServerConnectorTask"
    value.converter: "org.apache.kafka.connect.json.JsonConverter"
    key.converter: "org.apache.kafka.connect.json.JsonConverter"
    typeClassName: "org.apache.pulsar.common.schema.KeyValue"
    database.history: "org.apache.pulsar.io.debezium.PulsarDatabaseHistory"
    database.tcpKeepAlive: "true"
    decimal.handling.mode: "double"
    database.history.pulsar.topic: "debezium-mssql-source-history-topic"
    database.history.pulsar.service.url: "pulsar://127.0.0.1:6650"
```

For the full list of configuration properties supported by Debezium, see [Debezium Connector for MS SQL](https://debezium.io/documentation/reference/1.5/connectors/sqlserver.html#sqlserver-connector-properties).

# Performance

The Debezium Microsoft SQL Server source connector supports a maximum publish throughput of 17.000 msg/s or 50 Mbit/s.
