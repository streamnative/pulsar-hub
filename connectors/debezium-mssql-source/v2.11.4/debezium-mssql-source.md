---
description: The Debezium Microsoft SQL Server source connector pulls messages from SQL Server and persists the messages to Pulsar topics
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v2.11.4/pulsar-io/debezium/mssql"
license: Apache License 2.0
tags: ["Pulsar IO", "Debezium", "Source"]
alias: Debezium Microsoft SQL Server Source
features: ["Use Debezium Microsoft SQL Server source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/debezium.jpg"
download: "https://github.com/streamnative/pulsar/releases/download/v2.11.4.3/pulsar-io-debezium-mssql-2.11.4.3.nar"
support: Apache community
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
sn_available: true
id: "debezium-mssql-source"
---

The MSSQL source connector pulls messages from MSSQL and persists the messages to Pulsar topics by using debezium.

![](/images/connectors/debezium-mssql.png)

## Quick start

### Prerequisites

The prerequisites for connecting a Debezium MSSQL source connector to external systems include:

1. Create a MSSQL service: This connector uses the debezium v1.7, Please refer to this [document](https://debezium.io/releases/1.7/) to see the compatible SQL Server versions.
2. Prepare SQL Server: Please refer to this [document](https://debezium.io/documentation/reference/1.7/connectors/sqlserver.html) to complete the prepare steps.
3. Enable CDC for SQL Server: Please refer to this [document](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/enable-and-disable-change-data-capture-sql-server?view=sql-server-ver15)
4. Enable SQL Server Agent: Please refer to this [document](https://learn.microsoft.com/en-us/sql/ssms/agent/start-stop-or-pause-the-sql-server-agent-service?view=sql-server-ver16)


### 1. Prepare table and permission on SQL Server

Run the following SQL command on Microsoft SQL Server Management Studio:
```sql
CREATE DATABASE mydb;
CREATE TABLE MyTable (id INT PRIMARY KEY, name NVARCHAR(50));
GRANT SELECT ON dbo.MyTable TO {{Your hostname of SQL Server}};
```

Note that we need a primary key for CDC.

### 2. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type debezium-mssql` with `--archive /path/to/pulsar-io-debezium-mssql.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type debezium-mssql \
  --name debezium-mssql \
  --tenant public \
  --namespace default \
  --parallelism 1 \
  --source-config \
  '{
    "database.hostname": "Your hostname of SQL Server",
    "database.port": "Your port of SQL Server",
    "database.user": "Your user of SQL Server",
    "database.password": "Your password of SQL Server",
    "database.dbname": "Your dbname of SQL Server",
    "table.whitelist": "public.io-test",
    "database.server.name": "mydbserver"
  }'
```

The `--source-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.

You can set multiple tables for "table.whitelist", and the connector will send data from each table to a different topic of pulsar. The topic naming rule is: "{{database.server.name}}.{{table.name}}". For examples: "public/default/mydbserver.public.io-test".

If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/sink-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 3. Insert and update a data to table

You can insert and update using the sql:
```sql
USE mydb;
INSERT INTO dbo.testtable
           ([id]
           ,[name])
     VALUES (1, 'Zike Yang');
GO
```

### 4. Show data using Pulsar client

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

```
bin/pulsar-client \
--url "Your Pulsar serviceUrl" \
consume "persistent://public/default/mssql-test.dbo.testtable" -s "test-sub" -n 0 -p Earliest

----- got message -----
key:[eyJpZCI6MTB9], properties:[], content:{"before":null,"after":{"id":1,"name":"Zike Yang"},"source":{"version":"1.7.7.Final","connector":"sqlserver","name":"mssql-test","ts_ms":1701424975073,"snapshot":"false","db":"mydb","sequence":null,"schema":"dbo","table":"testtable","change_lsn":"00000027:000005a0:0002","commit_lsn":"00000027:000005a0:0003","event_serial_no":1},"op":"c","ts_ms":1701424977325,"transaction":null}
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