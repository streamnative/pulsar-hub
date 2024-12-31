---
description: The JDBC sink connector pulls messages from Pulsar topics and persists the messages to MySQL or SQlite.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/v4.0.1/pulsar-io/jdbc/clickhouse"
license: Apache License 2.0
tags: ["Pulsar IO", "JDBC", "Sink"]
alias: JDBC clickhouse Sink
features: ["Use JDBC sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: /images/connectors/apache-logo.png
download: "https://archive.apache.org/dist/pulsar/pulsar-4.0.1/connectors/pulsar-io-jdbc-clickhouse-4.0.1.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "jdbc-sink"
---

This document introduces how to get started with creating an JDBC Clickhouse sink connector and get it up and running.

## Quick start

### Prerequisites

The prerequisites for connecting an JDBC Clickhouse sink connector to external systems include:

1. Start a [Clickhouse server](https://clickhouse.com/docs/en/getting-started/quick-start). You can create a single-node Clickhouse cluster by executing this command:
```bash
curl https://clickhouse.com/ | sh
./clickhouse server
```

2. Create a table, you can use `./clickhouse client` to open a SQL shell.

```sql
CREATE TABLE users (
name String,
age UInt8,
city String
) ENGINE = MergeTree()
ORDER BY (name, age);
```

### 1. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--sink-type jdbc-clickhouse` with `--archive /path/to/pulsar-io-jdbc-clickhouse.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sinks create \
  --sink-type jdbc-clickhouse \
  --name jdbc-clickhouse-sink \
  --tenant public \
  --namespace default \
  --inputs "Your topic name" \
  --parallelism 1 \
  --sink-config \
  '{
    "jdbcUrl": "jdbc:clickhouse://127.0.0.1:8123/default",
    "tableName": "users"
  }'
```

The `--sink-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.
If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/sink-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 2. Send messages to the topic
{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

Note that the current implementation supports structured types of schemas, such as `Avro`, `JSON`, `Protobuf`, `Protobuf_native`, etc.

``` java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProducerTest {
    
    private String name;
    private int age;
    private String city;
    
    
    public static void main(String[] args) throws PulsarClientException {
        PulsarClient client = PulsarClient.builder()
                .serviceUrl("{{Your Pulsar URL}}")
                .build();

        Producer<ProducerTest> producer = client.newProducer(Schema.JSON(ProducerTest.class))
                        .topic("{{Your topic name}}").create();

        MessageId msgID = producer.send(new ProducerTest("John Doe", 30, "New York"));
        System.out.println("Publish message and message ID " + msgID);

        producer.flush();
        producer.close();
        client.close();
        
    }
}
```

### 3. Check data on clickhouse

```text
SELECT *
FROM users

Query id: b555a027-a781-47bc-b3dd-c7ffb30dc513

   ┌─name─────┬─age─┬─city─────┐
1. │ John Doe │  30 │ New York │
   └──────────┴─────┴──────────┘

1 row in set. Elapsed: 0.002 sec.
```

## Configuration Properties

The configuration of the JDBC sink connector has the following properties.

| Name                       | Type    | Required | Sensitive | Default            | Description                                                                                                                                                                                                                                                                                                                               |
|----------------------------|---------|----------|-----------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `userName`                 | String  | false    | true      | " " (empty string) | The username used to connect to the database specified by `jdbcUrl`.<br><br>**Note: `userName` is case-sensitive.**                                                                                                                                                                                                                       |
| `password`                 | String  | false    | true      | " " (empty string) | The password used to connect to the database specified by `jdbcUrl`. <br><br>**Note: `password` is case-sensitive.**                                                                                                                                                                                                                      |
| `jdbcUrl`                  | String  | true     | false     | " " (empty string) | The JDBC URL of the database to which the connector connects.                                                                                                                                                                                                                                                                             |
| `tableName`                | String  | true     | false     | " " (empty string) | The name of the table to which the connector writes.                                                                                                                                                                                                                                                                                      |
| `key`                      | String  | false    | false     | " " (empty string) | A comma-separated list contains the fields used in `where` condition of updating and deleting events.                                                                                                                                                                                                                                     |
| `nonKey`                   | String  | false    | false     | " " (empty string) | A comma-separated list contains the fields used in updating events.                                                                                                                                                                                                                                                                       |
| `insertMode`               | enum    | false    | false     | INSERT             | Option: INSERT, DELETE and UPDATE. If it is configured as UPSERT, the sink will use upsert semantics rather than plain INSERT/UPDATE statements. Upsert semantics refer to atomically adding a new row or updating the existing row if there is a primary key constraint violation, which provides idempotence.                           |
| `nullValueAction`          | enum    | false    | false     | FAIL               | Option: FAIL, DELETE.  How to handle records with null values, possible options are DELETE or FAIL.                                                                                                                                                                                                                                       |
| `useTransactions`          | boolean | false    | false     | false              | Enable transactions of the database.                                                                                                                                                                                                                                                                                                      |
| `excludeNonDeclaredFields` | boolean | false    | false     | false              | All the table fields are discovered automatically. 'excludeNonDeclaredFields' indicates if the table fields not explicitly listed in `nonKey` and `key` must be included in the query. By default all the table fields are included. To leverage of table fields defaults  during insertion, it is suggested to set this value to `true`. |
| `useJdbcBatch`             | boolean | false    | false     | false              | Use the JDBC batch API. This option is suggested to improve write performance.                                                                                                                                                                                                                                                            |
| `timeoutMs`                | int     | false    | false     | 500                | The JDBC operation timeout in milliseconds.                                                                                                                                                                                                                                                                                               |
| `batchSize`                | int     | false    | false     | 200                | The batch size of updates made to the database.                                                                                                                                                                                                                                                                                           |