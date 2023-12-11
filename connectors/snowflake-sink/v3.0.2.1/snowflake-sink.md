---
description: 
author: danpi,RobertIndie,streamnativebot,yaalsn
contributors: danpi,RobertIndie,streamnativebot,yaalsn
language: Java,Shell,Dockerfile
document:
source: Private source
license: Business License
license_link: 
tags: 
alias: Snowflake Sink Connector
features: [""]
icon: "/images/connectors/snowflake-logo.png"
download: 
support: streamnative
support_link: https://streamnative.io
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: 
sn_available: "true"
id: "snowflake-sink"
---


The [Snowflake](https://www.snowflake.com/) sink connector pulls data from Pulsar topics and persists data to Snowflake. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

This document introduces how to get started with creating a Snowflake sink connector and get it up and running.

![](images/snowflake-sink.png)

## Quick start

### Prerequisites

The prerequisites for connecting a Snowflake sink connector to external systems include:

1. Prepare a snowflake account
2. Get the account URL from the `Admin - Accounts` page and click the link. It should be the format like `https://<account_identifier>.snowflakecomputing.com`.

3. Generate the public key and private key for the authentication. For more details, please check [this guide](https://docs.snowflake.com/en/user-guide/key-pair-auth#step-1-generate-the-private-key)

```sh
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
```

It will generate `rsa_key.p8` (the private key) and `rsa_key.pub` (the public key) locally. 

4. Log in and configure the public key.

See [Installing SnowSQL](https://docs.snowflake.com/en/user-guide/snowsql-install-config) to install the SnowSQL.

```sh
snowsql -a ${account_identifier} -u ${account_name}
```

The `-a` is followed by an account identifier, which is a substring of the account URL before. The `-u` is followed by your account name. After logging in, set the public key passphrase:

```sh
ALTER USER ${account_name} SET RSA_PUBLIC_KEY='MIIBIjA...';
```

You can get the public key passphrase `(MIIBIjA…)` by running the following command:

```sh
grep -v "\-\-\-" rsa_key.pub | tr -d '\n'
```

### 1. Create Snowflake objects and grant permission

Before creating the connector, you need to grant the permissions in Snowflake. Write the following content into a file, e.g. name it with `grant.sql`. The script creates a user `snservice` that will be used in the sink config later and associate it with a role `snrole` that is only used in Snowflake internally. Then it grants the necessary permissions.

```sql
CREATE DATABASE st_tuts;
CREATE SCHEMA st_tuts.demo;
CREATE ROLE snrole;
CREATE USER snservice;
GRANT ROLE snrole TO USER snservice;
ALTER USER snservice SET DEFAULT_ROLE = snrole;

GRANT USAGE ON DATABASE st_tuts TO ROLE snrole;
GRANT USAGE ON SCHEMA st_tuts.demo TO ROLE snrole;
GRANT USAGE ON WAREHOUSE compute_wh TO ROLE snrole;
GRANT CREATE TABLE ON SCHEMA st_tuts.demo TO ROLE snrole;
GRANT CREATE STAGE ON SCHEMA st_tuts.demo TO ROLE snrole;
GRANT CREATE PIPE ON SCHEMA st_tuts.demo TO ROLE snrole;
ALTER USER snservice SET RSA_PUBLIC_KEY='MIIBI...';
```

Then run the following command to execute the SQL script above.

```sh
snowsql -a ${account_identifier} -u ${account_name} -f grant.sql
```

### 2. Create a connector

Depending on the environment, there are several ways to create a Snowflake sink connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-elastic-search).

No matter how you create a Snowflake sink connector, the minimum connector configuration contains the following parameters:
```yaml
configs:
    user: "SNSERVICE"
    host: "https://<account_identifier>.snowflakecomputing.com"
    schema: "demo"
    database: "st_tuts"
    privateKey: "..."
    warehouse: "compute_wh"
    topic2table: "input-snowflake:emp_basic"
```

You can get the private key passphrase `(MIIBIjA…)` by running the following command:

```sh
grep -v '\-\-\-' rsa_key.p8 | tr -d '\n'
```

### 3. Send messages to he topic

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

``` java
   PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

   Producer<String> producer = client.newProducer(Schema.STRING)
     .topic("{{Your topic name}}")
     .create();

   String message = "hello world";
   MessageId msgID = producer.send(message);
   System.out.println("Publish " + message + " and message ID " + msgID);

   producer.flush();
   producer.close();
   client.close();
```

You can also send the message using the command line:
```sh
$ bin/pulsar-client produce pulsar-topic-name --messages "hello world"
```

### 4. Check the data on Snowflake table

First, you need to execute the following SQL command to grant the role `SNROLE` to the user you logged in.

```sh
GRANT ROLE SNROLE TO USER ${account_name};
```

Then, switch the role to `SNROLE`, under `Data - Database - ST_TUTS - DEMO - Tables` you will find table `PERSISTENT___PUBLIC_DEFAULT_INPUT_SNOWFLAKE_1118738946` is created and records the messages produced above.

![Data Sample](images/data-sample.jpg)

## Configuration Properties

This table outlines the properties and the descriptions.

| Name                       | Type    | Required | Default                                                 | Description                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------|---------|----------|---------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `user`                     | String  | Yes      | ""(empty string)                                        | The user account name of the Snowflake service.                                                                                                                                                                                                                                                                                                                |
| `privateKey`               | String  | Yes      | ""(empty string)                                        | The private key of the user.                                                                                                                                                                                                                                                                                                                                   |
| `host`                     | String  | Yes      | ""(empty string)                                        | The host URL of the snowflake service.                                                                                                                                                                                                                                                                                                                         |
| `database`                 | String  | Yes      | ""(empty string)                                        | The Snowflake database where the connector will sink data.                                                                                                                                                                                                                                                                                                     |
| `schema`                   | String  | Yes      | ""(empty string)                                        | The Snowflake schema belongs to the level below the Snowflake database and consists of a set of tables.                                                                                                                                                                                                                                                        |
| `tableName`                | String  | No       | ""(empty string)                                        | If the `autoCreateTable` option is set to `false`, the Snowflake connector will persist messages to this table.                                                                                                                                                                                                                                                |
| `warehouse`                | String  | No       | ""(empty string)                                        | The warehouse name in the snowflake. By default, no warehouse name is set.                                                                                                                                                                                                                                                                                     |
| `bufferCountRecords`       | int     | No       | 10_000                                                  | The number of records that are buffered in the memory before they are ingested to Snowflake. By default, it is set to `10_000`.                                                                                                                                                                                                                                |
| `bufferSizeBytes`          | int     | No       | 5_000_000                                               | The cumulative size (in units of bytes) of the records that are buffered in the memory before they are ingested in Snowflake as data files. By default, it is set to `5_000_000` (5 MB).                                                                                                                                                                       |
| `bufferFlushTimeInSeconds` | int     | No       | 60                                                      | The number of seconds between buffer flushes, where the flush is from the Pulsar’s memory cache to the internal stage. By default, it is set to `60` seconds.                                                                                                                                                                                                  |
| `autoCreateTable`          | boolean | No       | false                                                   | Automatically create a table when the table does not exist.                                                                                                                                                                                                                                                                                                    |
| `processingGuarantees`     | String  | No       | "ATLEAST_ONCE"                                          | Specify the processing guarantee semantics. Currently, the Snowflake connector only supports `ATLEAST_ONCE` processing guarantee semantics.                                                                                                                                                                                                                    |
| `topic2table`              | String  | No       | ""(empty string)                                        | Specify the mapping relationship between topics and tables. Each topic and the mapped table name should be separated by a colon, such as `topic1:table1,topic2:table2`.                                                                                                                                                                                        |
| `metadataField`            | String  | No       | "__message_id__,__partition__,__topic__,__event_time__" | The metadata fields for each snowflake record. You can separate multiple fields with commas. The supported metadata fields are: __schema_version__ , __partition__ , __event_time__ , __publish_time__ , __message_id__ , __sequence_id__ , __producer_name__ , __topic__. Currently, the Snowflake sink connector currently does not support custom metadata. |

## Advanced features
This section describes the advanced features of the Snowflake sink connector. For details about how to configure these features, see [how to configure](#how-to-configure).

## Delivery guarantees
The Pulsar IO connector framework provides three [delivery guarantees](https://pulsar.apache.org/docs/next/functions-concepts#processing-guarantees-and-subscription-types): `at-most-once`, `at-least-once`, and `effectively-once`.

Currently, the Snowflake sink connector only supports the `at-least-once` delivery guarantee semantic.

## Table name mapping
The Snowflake sink connector supports automatically creating a table when the table does not exist. You can configure the following options:
```
autoCreateTable=true
```

The Snowflake sink connector allows you to specify the mapping relationship between topics and tables. Each topic and its mapped table name should be separated by a colon.
The parameter `topic2table` see example below:
```
topic2table=topic1:table1,topic2:table2
```

## Metadata Fields
There are two fields in the table: metadata and content. Metadata is ancillary information in content, such as `topic`, `messageId`, `publishTime`, and so on.
By default, the following metadata fields of Pulsar will be created as the metadata:
```
metadataField=__message_id__,__partition__,__topic__,__event_time__
```
> **Note**
>
> Currently, the Snowflake sink connector does not support custom metadata.

## Data format types

The snowflake connector supports converting some Pulsar schemas, as listed in the following table.

| Pulsar Schema   | Supported |
|-----------------|-----------|
| AVRO            | Yes       |
| PRIMITIVE       | Yes       |
| JSON            | Yes       |
| KEY_VALUE       | No        |
| PROTOBUF        | No        |
| PROTOBUF_NATIVE | No        |

## Batch progress

To increase write throughput, you can configure the buffer size and latency for the Snowflake sink connector.
```
bufferCountRecords = 10_000
bufferSizeBytes = 5_000_000
bufferFlushTimeInSeconds = 120
```


