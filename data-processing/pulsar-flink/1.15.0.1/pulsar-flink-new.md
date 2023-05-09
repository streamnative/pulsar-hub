---
description: Pulsar Flink Connector allows Flink to read data from Pulsar and write data to Pulsar
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/flink/tree/v1.15.0.1"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "Flink", "Connector"]
alias: Pulsar Flink Connector
features: ["Pulsar Flink Connector allows Flink to read data from Pulsar and to write data to Pulsar"]
icon: "/images/data-processing/flink-logo.png"
download: "https://repo1.maven.org/maven2/io/streamnative/connectors/flink-sql-connector-pulsar/"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "pulsar-flink-new"
---

The Pulsar Flink connector is an integration of [Apache Pulsar](https://pulsar.apache.org/) and [Apache Flink](https://flink.apache.org/) (data processing engine), which allows Flink to read and write data to and from Pulsar.

![](/images/data-processing/pulsar-flink-connector.png)

The Pulsar Flink connector consists of the [Pulsar DataStream connector](#pulsar-datastream-connector) and the [Pulsar SQL connector](#pulsar-sql-connector).

# Pulsar DataStream connector

The Pulsar DataStream connector is maintained as a part of the official Flink library. For details about the Pulsar DataStream connector, see [Flink's documentation](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/pulsar/).

# Pulsar SQL connector

Currently, the Pulsar SQL connector is not delivered as a part of the official Flink binary. It is maintained by [StreamNative](https://streamnative.io/).

The Pulsar SQL connector allows you to query data from or write data into Pulsar topics using simple SQL queries or the [Flink Table API](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/tableapi/).

## Dependencies

This table outlines the Maven dependency that is added to the Pulsar SQL connector.

<table>
<tr>
<th> Maven Dependency </th> <th> SQL JAR </th>
</tr>
<tr>
<td>

```xml

<dependency>
    <groupId>io.streamnative.connectors</groupId>
    <artifactId>flink-sql-connector-pulsar</artifactId>
    <version>1.15.0.1</version>
</dependency>
```

</td>
<td> 

[SQL JAR](https://repo1.maven.org/maven2/io/streamnative/connectors/flink-sql-connector-pulsar/)

</td>
</tr>
</table>

## Pulsar SQL connector options

This table outlines options for the Pulsar SQL connector.

| Key | Default | Type | Description |
| --- | --- | --- | --- |
| `admin-url` | (none) | String | The Pulsar service HTTP URL for the admin endpoint. For example, `http://my-broker.example.com:8080` or `https://my-broker.example.com:8443` for TLS. |
| `explicit` | true | Boolean | Indicate if the table is an explicit Flink table. |
| `key.fields` |  | List&lt;String&gt; | An explicit list of physical columns from the table schema that are decoded/encoded from the key bytes of a Pulsar message. By default, this list is empty and thus a key is undefined. |
| `key.format` | (none) | String | The format that is used to deserialize and serialize the key bytes of Pulsar messages. The format identifier is used to discover a suitable format factory. |
| `service-url` | (none) | String | The Service URL for the Pulsar service. To connect to a Pulsar cluster using a client library, you need to specify a Pulsar protocol URL. You can assign a Pulsar protocol URL to a specific cluster.<br /> -This is an example URL of the `localhost:pulsar://localhost:6650`. <br /> - If you have multiple brokers, the URL is something like `pulsar://localhost:6550,localhost:6651,localhost:6652`. <br /> - A URL for a production Pulsar cluster is something like `pulsar://pulsar.us-west.example.com:6650`. <br /> - If TLS authentication is enabled, the URL is something like `pulsar+ssl://pulsar.us-west.example.com:6651`. |
| `sink.custom-topic-router` | (none) | String | (Optional) the custom topic router class URL that is used in the [Pulsar DataStream sink connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-sink). If this option is provided, the `sink.topic-routing-mode` option will be ignored. |
| `sink.message-delay-interval` | 0 ms | Duration | (Optional) the message delay delivery interval that is used in the [Pulsar DataStream sink connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-sink). |
| `sink.topic-routing-mode` | round-robin | Enum | (Optional) the topic routing mode. Available options are `round-robin` and `message-key-hash`. By default, it is set to `round-robin`. If you want to use a custom topic router, use the `sink.custom-topic-router` option to determine the partition for a particular message.<br /> - `round-robin`: the producer publishes messages across all partitions in a round-robin fashion to achieve the maximum throughput. The round-robin method is not implemented for individual messages. However, it is set to the same boundary of the `pulsar.producer.batchingMaxMessages` option to make batching take effect.<br /> - `message-key-hash`: if no key is provided, the partitioned producer will randomly pick one single topic partition and publish all messages to that partition. If a key is provided for a message, the partitioned producer will hash the key and assign the message to a particular partition. |
| `source.start.message-id` | (none) | String | (Optional) the message ID that is used to specify a starting point for the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source) to consume data. Available options are `earliest`, `latest`, and the message ID (in a format of `ledgerId:entryId:partitionId`, such as "12:2:-1"). |
| `source.start.publish-time` | (none) | Long | (Optional) the publish timestamp that is used to specify a starting point for the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source) to consume data. |
| `source.subscription-name` | flink-sql-connector-pulsar | String | The subscription name of the consumer that is used by the runtime [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source). This argument is required for constructing the consumer. |
| `source.subscription-type` | Exclusive | Enum | The [subscription type](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-subscriptions) that is supported by the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source). Currently, only `Exclusive` and `Shared` subscription types are supported. |
| `topics` | (none) | List&lt;String&gt; | Topic name(s) the table reads data from. It can be a single topic name or a list of topic names separated by a semicolon symbol (`;`) like `topic-1;topic-2`. |

## Features

This section describes some significant features for the Pulsar SQL connector.

### Available metadata

The connector metadata are the metadata specific to the external system in use. [Flink SQL](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/fsql/overview/) supports using metadata from the external system or their decoding/encoding formats as a table column.

This table outlines the Pulsar topic metadata that can be mapped by the Pulsar SQL connector to Flink table fields.

> **Note**
>
> - The `R/W` column defines whether a metadata is readable from the Pulsar topics (`R`) and/or writable to the Pulsar topics (`W`).
> - The `R` column defines that a metadata is read-only. The read-only metadata must be declared `VIRTUAL` to exclude them during an `INSERT INTO` operation.

| Key           | Data Type                 | Description | R/W |
|:--------------|:--------------------------|:------------|-----|
| topic         | STRING NOT NULL           |             | R   |
| message_size  | INT NOT NULL              |             | R   |
| producer_name | STRING NOT NULL           |             | R   |
| message_id    | BYTES NOT NULL            |             | R   |
| sequenceId    | BIGINT NOT NULL           |             | R   |
| publish_time  | TIMESTAMP_LTZ(3) NOT NULL |             | R   |
| event_time    | TIMESTAMP_LTZ(3) NOT NULL |             | R/W |

> **Note**
>
> Currently, the `properties` metadata field is not supported yet.

The extended `CREATE TABLE` example demonstrates the syntax for exposing `publish_time`, `producer_name`, and `topic` metadata fields.

```sql
CREATE TABLE user
(
  `publish_time`  TIMESTAMP(3) METADATA VIRTUAL FROM 'publish_time',
  `producer_name` STRING METADATA VIRTUAL,
  `topic`         STRING METADATA VIRTUAL,
  `uid`           BIGINT,
  `item_id`       BIGINT,
  `description`   STRING
) WITH (
    'connector' = 'pulsar',
    'topics' = 'persistent://public/default/user',
    'service-url' = 'pulsar://localhost:6650',
    'admin-url' = 'http://localhost:8080',
    'source.start.message-id' = 'earliest' ,
    'format' = 'json'
);
```

### Key and value formats

You can serialize or deserialize the key and the value of a Pulsar message to or from raw bytes using one of the Flink official [formats](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/table/formats/overview/). For details about how to configure the key and value formats, see [configure key and value formats](#configure-key-and-value-formats).

#### Value format

If the key of a Pulsar message is absent or ignored, you should use the `format` option (a synonym for `value.format`) to designate a decoded/encoded format for the Pulsar message. For details, see the [formats documentation](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/table/formats/overview/). All format options are prefixed with the format identifier, such as `json.ignore-parse-errors`.

```sql
CREATE TABLE users
(
  `uid`         BIGINT,
  `item_id`     BIGINT,
  `description` STRING
) WITH (
    'connector' = 'pulsar',
    'topics' = 'persistent://public/default/users',
    'service-url' = 'pulsar://localhost:6650',
    ...
    'format' = 'json',
    'json.ignore-parse-errors' = 'true'
);
```

You can use the value format to deserialize a Pulsar message to the following Flink data types:

```text
ROW<`uid` BIGINT, `item_id` BIGINT, `description` STRING>
```

#### Key format

The deserialized or serialized key of a Pulsar message can be mapped to a Flink table field. The key format includes the fields that are listed in the `key.fields` option. You can use the semicolon symbol (`;`) to separate multiple fields. Thus, the key format is configured with the following data type:

```text
ROW<`uid` BIGINT, `item_id` BIGINT>
```

And all the key fields are excluded in the value format's data type:

```text
ROW<`description` STRING>
```

### Topic and partition discovery

The `topics` and `topic-pattern` options specify the topics and topic pattern for the [Pulsar DataStream connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/) to consume or produce data. 

- `topics`: a list of topics that are separated using the semicolon symbol (`;`) like `topic-1;topic-2`. 

- `topic-pattern`: uses the regular expression to discover the matched topics. For example, if the `topic-pattern` is set to `test-topic-[0-9]`, then all topics whose names match the specified regular expression (starting with `test-topic-` and ending with a single digit) will be subscribed to by the consumer when running a query job.

By default, the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source) dynamically checks topic changes every 30 seconds, such as the number of topic partitions and topics. To disable automatic topic and partition discovery, you can set a negative value for the `pulsar.source.partitionDiscoveryIntervalMs` option. For details, see [Pulsar DataStream connector documentation](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/datastream/pulsar/).

### Starting position

You can use the `source.start.message-id` or `source.start-publish-time` option to designate the starting position for the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source).

You can configure one of the following values for the `source.start.message-id` option:

- `earliest`
- `latest`
- A message ID (in `<ledgerId>:<entryId>:<partitionIndex>` format)

You can configure the `source.start.publish-time` option with a Long type timestamp value.

The `source.start.message-id` and `source.start-publish-time` options are exclusive. If both options are configured, the validation will fail. By default, the [Pulsar DataStream source connector](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/datastream/pulsar/#pulsar-source) uses the `StartCursor.earliest()` option.

### Sink topic router

The Pulsar DataStream connector supports designating a topic router. In the Pulsar SQL connector, you can configure the sink topic router using the `sink.topic-routing-mode` or `sink.custom-topic-router` option.

- `sink.topic-routing-mode`: the built-in topic router implementation. Available values are `round-robin` and `message-key-hash`.
- `sink.custom-topic-router`: the full class name of the custom topic router. Make sure that the custom topic router implementation is set on the classpath.

The `sink.topic-routing-mode` and `sink.custom-topic-router` options are exclusive. If both options are configured, the validation will fail.

### Data type mapping

[Pulsar Schema](https://pulsar.apache.org/docs/schema-get-started/) describes how to deserialize data from and serialize data to a message stored in Pulsar topics. Flink SQL also has its own data types as well as the deserialization and serialization framework. The Pulsar SQL connector provides multiple choices to map a Pulsar schema to Flink data types to transfer data between Flink SQL and Pulsar.

Flink SQL uses [formats](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/table/formats/overview/) to decode and encode data from external systems, such as [flink-csvs](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/table/formats/csv/), [flink-json](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/table/formats/json/), and [flink-avro](https://nightlies.apache.org/flink/flink-docs-release-1.15/docs/connectors/table/formats/avro/). If you want to read a Pulsar topic with a predefined Pulsar schema (JSON, CSV, or Avro schema), you can use the related Flink format.

This table outlines the recommended Flink format for each Pulsar Schema. To use the `avro` and `json` format, you should add `flink-avro` and `flink-json` to your dependencies if they are not added yet. (By default, the JAR package of the Pulsar SQL connector is bundled with them).

| Pulsar schema   | Flink  format     |
|-----------------|-------------------|
| AVRO            | avro              |
| JSON            | json              |
| PROTOBUF        | Not supported yet |
| PROTOBUF_NATIVE | Not supported yet |
| AUTO_CONSUME    | Not supported yet |
| AUTO_PUBLISH    | Not supported yet |
| NONE/BYTES      | raw               |
| BOOLEAN         | raw               |
| STRING          | raw               |
| DOUBLE          | raw               |
| FLOAT           | raw               |
| INT8            | raw               |
| INT16           | raw               |
| INT32           | raw               |
| INT64           | raw               |
| LOCAL_DATE      | Not supported yet |
| LOCAL_TIME      | Not supported yet |
| LOCAL_DATE_TIME | Not supported yet |

> **Note**
>
> When Flink writes data to a Pulsar topic with the Avro format, the Pulsar consumer cannot consume data with the Avro schema.

## PulsarCatalog

PulsarCatalog supports configuring the Pulsar cluster as the metadata storage for Flink tables.

### Explicit tables and native tables

PulsarCatalog defines two different kinds of tables: `explicit` tables and `native` tables.

- An `explicit` table is a table explicitly created using the `CREATE` statements or table API. It is like the common use pattern in other SQL connectors. You can create a table and then query data from or write data to the table.
- A `native` table is automatically created by PulsarCatalog. PulsarCatalog scans all non-system topics in a Pulsar cluster, and then maps each topic into a Flink table without using the `CREATE` statements.

#### Explicit tables

PulsarCatalog uses the Pulsar `SchemaInfo` to store the Flink schema bytes for an `explicit table`.

For each `explicit` table, PulsarCatalog creates a **placehoder** topic under a preconfigured tenant in the Pulsar cluster. The default value for such a preconfigured tenant is named `__flink_catalog`, but you can use the `catalog-tenant` option to specify a different tenant name. The Flink database is then mapped to a namespace with the same name. Finally, the **placehoder** topic that saves the Flink table schema information is named as `table_<FLINK_TABLE_NAME>`.

For example, if you create a table `users` under the `testdb` database, then a topic named `table_users` is created under the `__flink_catalog` tenant in the`testdb` namespace.

The table like `table_users` is called a **placeholder topic**, because these topics do not have any producer or consumer. Therefore, no data would flow in or out of these topics. You can use the schema information of such topics to store the Flink table metadata.

For the JSON format, the Flink table schema is serialized and then stored under the `schema` key. Other table options from `CREATE TABLE xxx WITH ()` statements are stored under the `properties` key.

You can use the `pulsar-admin` CLI tool to retrieve the JSON format of a topic schema:

```bash
pulsar-admin schemas get persistent://<tenant>/<namespace>/<topic>
```

#### Native tables

A `native` table does not have any **placeholder topic**. Instead, PulsarCatalog maps the Pulsar schema of the `native table` to a Flink table schema when creating a SQL job.

This table outlines the Flink formats that are used for a native table's Pulsar schema.

| Pulsar schema   | Flink data type                           | Flink format      | Work or not |
|-----------------|-------------------------------------------|-------------------|-------------|
| AVRO            | It is decided by the Avro format.         | avro              | Yes         |
| JSON            | It is decided by the JSON format.         | json              | Yes         |
| PROTOBUF        | Not supported yet                         | /                 | No          |
| PROTOBUF_NATIVE | It is decided by the Protobuf definition. | Not supported yet | No          |
| AUTO_CONSUME    | Not supported yet                         | /                 | No          |
| AUTO_PUBLISH    | Not supported yet                         | /                 | No          |
| NONE/BYTES      | DataTypes.BYTES()                         | raw               | Yes         |
| BOOLEAN         | DataTypes.BOOLEAN()                       | raw               | Yes         |
| LOCAL_DATE      | DataTypes.DATE()                          | /                 | No          |
| LOCAL_TIME      | DataTypes.TIME()                          | /                 | No          |
| LOCAL_DATE_TIME | DataTypes.TIMESTAMP(3)                    | /                 | No          |
| STRING          | DataTypes.STRING()                        | raw               | Yes         |
| DOUBLE          | DataTypes.DOUBLE()                        | raw               | Yes         |
| FLOAT           | DataTypes.FLOAT()                         | raw               | Yes         |
| INT8            | DataTypes.TINYINT()                       | raw               | Yes         |
| INT16           | DataTypes.SMALLINT()                      | raw               | Yes         |
| INT32           | DataTypes.INT()                           | raw               | Yes         |
| INT64           | DataTypes.BIGINT()                        | raw               | Yes         |

> **Note**
>
> Even if there are corresponding Flink data formats for the `LOCAL_DATE`, `LOCAL_TIME`, and `LOCAL_DATE_TIME` options, the `raw` format is not able to decode messages with these Pulsar schemas. In this case, the auto schema mapping will fail.

#### Comparison

After a `native` table is created, you can query data from existing Pulsar topics. PulsarCatalog automatically reads the topic's schema and decides which decoded/encoded format to use. However, the `native` table does not support watermarks and primary keys. Therefore, you cannot use the `native` table to do window aggregation. A `native` table maps `tenant/namespace` to a database and the topic name to the table name.

To fully manage a table, you can use the `explicit` table to define watermark fields, specify metadata fields, and specify a custom format. The usage is similar to creating a Pulsar table in `GenericInMemoryCatalog`. You can bind an `explicit` table to a Pulsar topic and each Pulsar topic can be bound to multiple Flink tables (including the `native` table).

### PulsarCatalog options

<table class="configuration table table-bordered">
  <thead>
    <tr>
      <th class="text-left" style="width: 20%">Key</th>
      <th class="text-left" style="width: 15%">Default</th>
      <th class="text-left" style="width: 5%">Type</th>
      <th class="text-left" style="width: 55%">Description</th>
      <th class="text-left" style="width: 5%">Required</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><h5>catalog-admin-url</h5></td>
      <td style="word-wrap: break-word;">"http://localhost:8080"</td>
      <td>String</td>
      <td>(Required) The admin URL of the Pulsar cluster.</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><h5>catalog-auth-params</h5></td>
      <td style="word-wrap: break-word;">(none)</td>
      <td>String</td>
      <td>The authentication parameters for accessing the Pulsar cluster.</td>
      <td></td>
    </tr>
    <tr>
      <td><h5>catalog-auth-plugin</h5></td>
      <td style="word-wrap: break-word;">(none)</td>
      <td>String</td>
      <td>The name of the authentication plugin for accessing the Pulsar cluster.</td>
      <td></td>
    </tr>
    <tr>
      <td><h5>catalog-service-url</h5></td>
      <td style="word-wrap: break-word;">"pulsar://localhost:6650"</td>
      <td>String</td>
      <td>(Required) The service URL of the Pulsar cluster.</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><h5>catalog-tenant</h5></td>
      <td style="word-wrap: break-word;">"__flink_catalog"</td>
      <td>String</td>
      <td>The Pulsar tenant that stores all table information.</td>
      <td></td>
    </tr>
    <tr>
      <td><h5>default-database</h5></td>
      <td style="word-wrap: break-word;">"default"</td>
      <td>String</td>
      <td>The default database when using PulsarCatalog. It will be created if it does not exist.</td>
      <td></td>
    </tr>
  </tbody>
</table>

### Create PulsarCatalog

You can create PulsarCatalog using any of the following ways:

- SQL query statements
- Flink [Table API](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/common/)

This example shows how to create PulsarCatalog using the SQL query statements.

```sql
CREATE
CATALOG pulsar
  WITH (
    'type' = 'pulsar-catalog',
    'catalog-admin-url' = '<ADMIN_URL>',
    'catalog-service-url' = '<SERVICE_URL>'
);
```

This example shows how to create PulsarCatalog  using the Flink [Table API](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/common/).

```java
Catalog pulsarCatalog = new PulsarCatalog();
tableEnv.registerCatalog("pulsar",pulsarCatalog);
```

> **Note**
>
> If you use the SQL Client and configure catalogs in `sql-clients-defaults.yaml` YAML file, make sure that this file has been removed due to [FLIP-163](https://cwiki.apache.org/confluence/display/FLINK/FLIP-163%3A+SQL+Client+Improvements) and this file is no longer available for Flink 1.15.

## Examples

This section lists some examples about the Pulsar SQL connector.

### Create a table

This example shows how to use the Pulsar SQL connector to create a table in a JSON encoding/decoding format.

```sql
CREATE TABLE users
(
  `user_id`  BIGINT,
  `item_id`  BIGINT,
  `description` STRING,
  `ts`       TIMESTAMP(3) METADATA FROM 'timestamp'
) WITH (
    'connector' = 'pulsar',
    'topics' = 'persistent://public/default/users',
    'service-url' = 'pulsar://localhost:6650',
    'admin-url' = 'http://localhost:8080',
    'format' = 'json'
)
```

### Configure key and value formats

This example shows how to specify and configure the key format and value formats. The format options are prefixed with either the `key` or `value` plus the format identifier.

```sql
CREATE TABLE users
(
  `uid`         BIGINT,
  `item_id`     BIGINT,
  `description` STRING
) WITH (
    'connector' = 'pulsar',
    'topics' = 'persistent://public/default/users',
    'service-url' = 'pulsar://localhost:6650',
    'admin-url' = 'http://localhost:8080',
    'key.format' = 'json',
    'key.json.ignore-parse-errors' = 'true',
    'key.fields' = 'uid;item_id',
    'value.format' = 'json',
    'value.json.fail-on-missing-field' = 'false',
```
