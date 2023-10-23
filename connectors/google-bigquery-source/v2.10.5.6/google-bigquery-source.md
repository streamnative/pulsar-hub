---
description: BigQuery Connector integrates Apache Pulsar with Google BigQuery.
author: shibd,danpi,codelipenghui,Huanli-Meng
contributors: shibd,danpi,codelipenghui,Huanli-Meng
language: Java,Shell,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-bigquery"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-bigquery/blob/master/LICENSE"
tags: 
alias: Google Cloud BigQuery Source Connector
features: ["BigQuery Connector integrates Apache Pulsar with Google BigQuery."]
icon: "/images/connectors/google-bigquery-logo.png"
download: "https://api.github.com/repos/streamnative/pulsar-io-bigquery/tarball/refs/tags/v2.10.5.6"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-bigquery
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-bigquery"
sn_available: "true"
id: "google-bigquery-source"
---


The [Google Cloud BigQuery](https://cloud.google.com/bigquery) Source Connector feeds data from Google Cloud BigQuery tables and writes data to Pulsar topics.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-bigquery/v2.10.5.6/docs/google-bigquery-source.png)

## Quick start

### Prerequisites

The prerequisites for connecting an Google BigQuery source connector to external systems include:

1. Create GoogleBigQuery, DataSet and Table in Google Cloud. You can set the schema of the table, and this connector will convert the Avro schema to Pulsar.
2. Create the [Gcloud ServiceAccount](https://cloud.google.com/iam/docs/service-accounts-create) and create a public key certificate.
3. Create the [Gcloud Role](https://cloud.google.com/iam/docs/creating-custom-roles), ensure the Google Cloud role have the following permissions to the Google [BigQuery API](https://cloud.google.com/bigquery/docs/access-control):
```text
- bigquery.readsessions.create
- bigquery.readsessions.getData
- bigquery.readsessions.update
- bigquery.jobs.create
- bigquery.tables.get
- bigquery.tables.getData
```
4. Grant the service account the above role permissions.


### 1. Write data to Google Bigquery

You can use SQL to insert some data to a table. For examples:

```sql
INSERT INTO `{{Your dataset name}}.{{Your table name}}` (message, info)
VALUES
  ("message-1", "This is a message-1."),
  ("message-2", "This is a message-2."),
  ("message-3", "This is a message-3."),
  ("message-4", "This is a message-4."),
  ("message-5", "This is a message-5."),
  ("message-6", "This is a message-6."),
  ("message-7", "This is a message-7."),
  ("message-8", "This is a message-8."),
  ("message-9", "This is a message-9."),
  ("message-10", "This is a message-10.");
```

{% callout title="Note" type="note" %}

This connector will create a snapshot of BigQueryTable to synchronize data when it starts, so you must make sure that there is data in the table before starting the connector. 

In other words, it will only synchronize the data before the start-up, and once the data synchronization is complete, the current implementation will not discover new data to synchronize.

{% /callout %}


### 2. Create a connector

Depending on the environment, there are several ways to create an Google BigQuery source connector:

- [Create Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create Connector with Function worker](https://pulsar.apache.org/docs/3.0.x/io-quickstart/).
  Using this way requires you to download a **JAR** package to create a built-in or non-built-in connector. You can download the version you need from [here](https://github.com/streamnative/pulsar-io-bigquery/releases).
- [Create Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
  Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-bigquery/tags)

No matter how you create an Google BigQuery source connector, the minimum configuration contains the following parameters.

```yaml
   batchSourceConfig:
     discoveryTriggererClassName: org.apache.pulsar.ecosystem.io.bigquery.source.BigQueryOnceTrigger
   configs:
     projectId: {{Your BigQuery project id}}
     datasetName: {{Your Bigquery DataSet name}}
     tableName: {{Your Bigquery Table name}}
     credentialJsonString: {{Public key certificate you created above}}
```

> * The configuration structure varies depending on how you create the Google BigQuery source connector.
    >   For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.


### 3. Show data by Pulsar Consumer

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

This connector will register the Google BigQuery table schema to pulsar. You can use `AUTO_CONSUMER` to consume the data. For example:

```java
    public static void main(String[] args) {
        PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

        Consumer<GenericRecord> consumer = client.newConsumer(Schema.AUTO_CONSUME())
                                                 .topic("{{The topic name that you specified when you created the connector}}")
                                                 .subscriptionName(subscription)
                                                 .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
                                                 .subscribe();

        for (int i = 0; i < 10; i++) {
            Message<GenericRecord> message = consumer.receive(10, TimeUnit.SECONDS);
            GenericRecord value = message.getValue();
            for (Field field : value.getFields()) {
                Object fieldValue = value.getField(field);
                System.out.print(field.getName() + ":" + fieldValue + " ");
            }
            System.out.println();
            consumer.acknowledge(message);
        }
        client.close();  
    }
    // output
    // message:message-1 info:This is a message-1.
    // message:message-2 info:This is a message-2.
    // message:message-3 info:This is a message-3.
    // message:message-4 info:This is a message-4.
    // message:message-5 info:This is a message-5.
    // message:message-6 info:This is a message-6.
    // message:message-7 info:This is a message-7.
    // message:message-8 info:This is a message-8.
    // message:message-9 info:This is a message-9.
    // message:message-10 info:This is a message-10.
```


## Configuration Properties

Before using the Google Cloud BigQuery source connector, you need to configure it. This table outlines the properties and the descriptions.

| Name                        | Type    | Required | Default           | Description                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------|---------|----------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `projectId`                 | String  | Yes      | "" (empty string) | The Google BigQuery project ID.                                                                                                                                                                                                                                                                                                                                                 |
| `datasetName`               | String  | Yes      | "" (empty string) | The Google BigQuery dataset name.                                                                                                                                                                                                                                                                                                                                               |
| `tableName`                 | String  | Yes      | "" (empty string) | The Google BigQuery table name.                                                                                                                                                                                                                                                                                                                                                 |
| `credentialJsonString`      | String  | No       | "" (empty string) | The authentication JSON key. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file that contains your service account key when the `credentialJsonString` is set to an empty string. For details, see the [Google documentation](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries#before-you-begin).         |
| `maxParallelism`            | int     | No       | 1                 | The maximum parallelism for reading. In fact, the number may be less if the BigQuery source connector deems the data small enough.                                                                                                                                                                                                                                              |
| `forceUpdate`               | Boolean | No       | false             | "if forceUpdate=true,a new session will be created. The connector will transmit the data again.                                                                                                                                                                                                                                                                                 |
| `queueSize`                 | int     | No       | 10000             | The buffer queue size of the source. It is used for storing records before they are sent to Pulsar topics. By default, it is set to `10000`.                                                                                                                                                                                                                                    |
| `sql`                       | String  | No       | "" (empty string) | The SQL query on BigQuery. The computed result is saved in a temporary table. The temporary table has a configurable expiration time, and the BigQuery source connector automatically deletes the temporary table when the data is transferred completely. The `projectId` and `datasetName` gets values from the configuration file, and the `tableName` is generated by UUID. |                                                                                                                                                                                                                                                                                                                     |
| `expirationTimeInMinutes`   | int     | No       | 1440              | The expiration time in minutes until the table is expired and auto-deleted.                                                                                                                                                                                                                                                                                                     |
| `selectedFields`            | String  | No       | "" (empty string) | Names of the fields in the table that should be read.                                                                                                                                                                                                                                                                                                                           |
| `filters`                   | String  | No       | "" (empty string) | A list of clauses that can filter the result of the table.                                                                                                                                                                                                                                                                                                                      |
| `checkpointIntervalSeconds` | int     | No       | 60                | The checkpoint interval (in units of seconds). By default, it is set to 60s.                                                                                                                                                                                                                                                                                                    |

