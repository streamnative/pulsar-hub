---
description: 
author: danpi,streamnativebot,yaalsn,Huanli-Meng
contributors: danpi,streamnativebot,yaalsn,Huanli-Meng
language: Java,Shell,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-snowflake"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-snowflake/blob/master/LICENSE"
tags: 
alias: Snowflake Sink Connector
features: [""]
icon: /images/connectors/snowflake-logo.png
download: "https://api.github.com/repos/streamnative/pulsar-io-snowflake/tarball/refs/tags/v2.11.0.1"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-snowflake
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-snowflake"
sn_available: true
id: "snowflake-sink"
---


The [Snowflake](https://www.snowflake.com/) sink connector pulls data from Pulsar topics and persists data to Snowflake.

![](images/snowflake-sink.png)

# Features
This section describes the features of the Snowflake sink connector. For details about how to configure these features, see [how to configure](#how-to-configure).

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
{% callout title="Note" type="note" %}
Currently, the Snowflake sink connector does not support custom metadata.
{% /callout %}

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

# How to get

This section describes how to get the Snowflake sink connector.

## Work with Function Worker

You can get the Snowflake sink connector using one of the following methods if you
use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run the connector in a cluster.

- Download the NAR package
  from [the download page](https://github.com/streamnative/pulsar-io-snowflake/releases/download/v2.11.0.1/pulsar-io-snowflake-2.11.0.1.nar)
  .

- Build it from the source code.

To build the Snowflake sink connector from the source code, follow these steps.

1. Clone the source code to your machine.

   ```bash
   git clone https://github.com/streamnative/pulsar-io-snowflake
   ```

2. Build the connector in the `pulsar-io-snowflake` directory.

   ```bash
   mvn clean install -DskipTests
   ```

   After the connector is successfully built, a `NAR` package is generated under the target directory.

   ```bash
   ls target
   pulsar-io-snowflake-2.11.0.1.nar
   ```

## Work with Function Mesh

You can pull the Snowflake sink connector Docker image from the [Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-snowflake) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the Snowflake sink connector, you need to configure it. This table outlines the properties and the descriptions.

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

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

* JSON

   ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "snowflake-sink",
        "archive": "connectors/pulsar-io-snowflake-2.11.0.1.nar",
        "inputs": [
          "test-snowflake-pulsar"
        ],
        "parallelism": 1,
        "retainOrdering": true,
        "processingGuarantees": "ATLEAST_ONCE",
        "sourceSubscriptionName": "sf_sink_sub",
        "configs": {
          "user": "TEST",
          "host": "ry77682.us-central1.gcp.snowflakecomputing.com:443",
          "schema": "DEMO",
          "warehouse": "SNDEV",
          "database": "TESTDB",
          "privateKey": "SECRETS"
      }
    }
    ```

* YAML

    ```yaml
    tenant: public
    namespace: default
    name: snowflake-sink
    parallelism: 1
    inputs:
      - test-snowflake-pulsar
    archive: connectors/pulsar-io-snowflake-2.11.0.1.nar
    sourceSubscriptionName: sf_sink_sub
    retainOrdering: true
    processingGuarantees: ATLEAST_ONCE
    configs:
      user: TEST
      host: ry77682.us-central1.gcp.snowflakecomputing.com:443
      schema: DEMO
      warehouse: SNDEV
      database: TESTDB
      privateKey: SECRETS
    ```

## Work with Function Mesh
You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Snowflake sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: snowflake-sink-sample
spec:
  image: streamnative/pulsar-io-snowflake:2.11.0.1
  replicas: 1
  maxReplicas: 1
  retainOrdering: true
  input:
    topics: 
      - persistent://public/default/test-snowflake-pulsar
  sinkConfig:
    user: TEST
    host: ry77682.us-central1.gcp.snowflakecomputing.com:443
    schema: DEMO
    warehouse: SNDEV
    database: TESTDB
    privateKey: SECRETS
  pulsar:
    pulsarConfig: "test-pulsar-sink-config"
  resources:
    limits:
      cpu: "0.2"
      memory: 1.1G
    requests:
      cpu: "0.1"
      memory: 1G
  java:
    jar: connectors/pulsar-io-snowflake-2.11.0.1.nar
  clusterName: test-pulsar
  autoAck: false
```

# How to use

You can use the Snowflake sink connector with Function Worker or Function Mesh.

## Work with Function Worker

You can use the Snowflake sink connector as a standalone connector or a built-in connector as below.

### Use it as standalone connector

If you already have a Pulsar cluster, you can use the Snowflake sink connector as a standalone connector directly.

This example shows how to create a Snowflake sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](https://pulsar.apache.org/tools/pulsar-admin/2.10.0-SNAPSHOT/#-em-create-em--30) command.

```
PULSAR_HOME/bin/pulsar-admin sinks create \
--sink-config-file <snowflake-sink-config.yaml >
```

### Use it as built-in connector

You can make the Snowflake sink connector as a built-in one and use it on a standalone cluster.

This example describes how to use the Snowflake sink connector to fetch data from Pulsar topics and save data to Snowflake tables in standalone mode.

#### Prerequisites

- Install Pulsar locally. For details, see [set up a standalone Pulsar locally](https://pulsar.apache.org/docs/getting-started-standalone/).

#### Steps

1. Copy the NAR package to the Pulsar connectors directory.

    ```
    cp pulsar-io-snowflake-2.11.0.1.nar PULSAR_HOME/connectors/pulsar-io-snowflake-2.11.0.1.nar
    ```

2. Start a Pulsar cluster in standalone mode.
    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

3. Run the Snowflake sink connector locally.
    ```
    PULSAR_HOME/bin/pulsar-admin sinks localrun \
    --sink-config-file <snowflake-sink-config.yaml>
    ```

   Or, you can create a connector for the Pulsar cluster.
    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file <snowflake-sink-config.yaml>
    ```

4. Send messages to a Pulsar topic.

   This example sends ten “hello” messages to the `test-snowflake-pulsar` topic in the `default` namespace of the `public` tenant.

     ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-snowflake-pulsar --messages hello -n 10
     ```

5. Query the data from the Snowflake table. For details, see [Snowflake Quick Tour](https://docs.snowflake.com/en/user-guide/ui-snowsight-quick-tour.html).


## Work with Function Mesh

This example describes how to create a Snowflake sink connector for a Kubernetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare Snowflake service. For details, see [Getting Started with Snowflake](https://docs.snowflake.com/en/user-guide-getting-started.html).

### Step

1. Define the Snowflake sink connector with a YAML file and save it as `sink-sample.yaml`.

   This example shows how to publish the Snowflake sink connector to Function Mesh with a Docker image.

    ```yaml
     apiVersion: compute.functionmesh.io/v1alpha1
     kind: Sink
     metadata:
       name: snowflake-sink-sample
     spec:
       image: streamnative/pulsar-io-snowflake:2.11.0.1
       className: org.apache.pulsar.ecosystem.io.snowflake.SnowflakeSinkConnector
       replicas: 1
       maxReplicas: 1
       retainOrdering: true
       input:
         topics: 
           - persistent://public/default/test-snowflake-pulsar
       sinkConfig:
          user: TEST
          host: ry77682.us-central1.gcp.snowflakecomputing.com:443
          schema: DEMO
          warehouse: SNDEV
          database: TESTDB
          privateKey: SECRETS
       pulsar:
         pulsarConfig: "test-pulsar-sink-config"
       resources:
         limits:
          cpu: "0.2"
          memory: 1.1G
         requests:
          cpu: "0.1"
          memory: 1G
       java:
         jar: connectors/pulsar-io-snowflake-2.11.0.1.nar
       clusterName: test-pulsar
       autoAck: false
    ```

2. Apply the YAML file to create the Snowflake sink connector.

   **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

   **Output**

    ```
    sink.compute.functionmesh.io/snowflake-sink-sample created
    ```

3. Check whether the Snowflake sink connector is created successfully.

   **Input**

    ```
    kubectl get all
    ```

   **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/snowflake-sink-sample-0                   1/1    Running     0          77s
    ```

   After that, you can produce and consume messages using the Snowflake sink connector between Pulsar and Snowflake.


