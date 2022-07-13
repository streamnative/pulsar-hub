---
description: The Google Cloud BigQuery sink connector pulls data from Pulsar topics and persists data to Google Cloud BigQuery tables.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-bigquery/tree/v2.10.1.2/src/main/java/org/apache/pulsar/ecosystem/io/bigquery"
license: Apache License 2.0
tags: ["Pulsar IO", "BigQuery", "Sink"]
alias: Google Cloud BigQuery Sink
features: ["Use Google Cloud BigQuery sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/google-bigquery-logo.png"
download: "https://github.com/streamnative/pulsar-io-bigquery/releases/download/v2.10.1.2/pulsar-io-bigquery-2.10.1.2.jar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-bigquery"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png" 
id: "google-bigquery-sink"
---

The [Google Cloud BigQuery](https://cloud.google.com/bigquery) sink connector pulls data from Pulsar topics and persists data to Google Cloud BigQuery tables.

![](/images/connectors/google-bigquery-sink.png)

# Features

This section describes features of the Google Cloud BigQuery sink connector. For details about how to configure these features, see [how to configure](#how-to-configure).

## Delivery guarantees

The Pulsar IO connector framework provides three [delivery guarantees](https://pulsar.apache.org/docs/next/functions-concepts#processing-guarantees-and-subscription-types): `at-most-once`, `at-least-once`, and `effectively-once`.

Currently, the Google Cloud BigQuery sink connector only provides the `at-least-once` delivery guarantee.

## Tables schema

The Google Cloud BigQuery sink connector supports automatically creating and updating a table’s schema based on the Pulsar topic schema. You can configure the following options:

```
autoCreataTables = true
autoUpdateSchema = true
```

If the Pulsar topic schema and BigQuery schema are different, the Google Cloud BigQuery sink connector updates schemas by merging them together. 
The Google Cloud BigQuery sink connector supports mapping schema structures to the BigQuery [RECORD TYPE](https://cloud.google.com/bigquery/docs/nested-repeated#example_schema).

In addition, the Google Cloud BigQuery sink connector supports writing some Pulsar-specific fields, as shown below:

```
#
# optional: __schema_version__ , __partition__   , __event_time__    , __publish_time__  
#           __message_id__     , __sequence_id__ , __producer_name__ , __key__           , __properties__ 
#
defaultSystemField = __event_time__,__message_id__
```

> **Note**
>
> The Google Cloud BigQuery sink connector does not delete any fields. If you change a field name in a Pulsar topic, the Google Cloud BigQuery sink connector will preserve both fields.

This table lists the schema types that currently are supported to be converted.

| Schema          | Supported |
|-----------------|-----------|
| AVRO            | Yes       |
| PRIMITIVE       | Yes       |
| JSON            | No        |
| KEY_VALUE       | No        |
| PROTOBUF        | No        |
| PROTOBUF_NATIVE | No        |

## Partitioned tables

> **Note**
>
> This feature is only available when `autoCreateTable` is set to `true`. If you create a table manually, you need to manually specify the partition key.

BigQuery supports [partitioned tables](https://cloud.google.com/bigquery/docs/partitioned-tables). Partitioned tables can improve query and control costs by reducing the data read from the table.
The Google Cloud BigQuery sink connector provides an option to create a partitioned table. The partitioned tables use the __event_time__ as the partition key.

```
partitioned-tables = true
```

## Clustered tables

> **Note**
>
> This feature is only available when `autoCreateTable` is set to `true`. If you create a table manually, you need to manually specify the cluster key.

[Clustered tables](https://cloud.google.com/bigquery/docs/clustered-tables) can improve the performance of certain queries, such as queries that use filter clauses and queries that aggregate data. The Google Cloud BigQuery sink connector provides an option to create a clustered table. The clustered tables use the __message_id__ as the cluster key.

```
clustered-tables = true
```

## Multiple tasks

You can leverage the Pulsar Functions scheduling mechanism to configure parallelism of the Google Cloud BigQuery sink connector. You can schedule
multiple sink instances to run on different Function worker nodes. These sink instances consume messages according to the configured subscription mode.

```
parallelism = 4
```

> **Note**
>
> This is an effective way to increase parallelism when you encounter write bottlenecks. In addition, you need to pay attention to whether the write rate is greater than [BigQuery Rate Limits](https://cloud.google.com/bigquery/quotas#streaming_inserts).

## Batch progress

To increase write throughput, the Google Cloud BigQuery sink connector supports configuring the batch size. You can set the batch size and latency using the following options.

```
batchMaxSize = 100
batchMaxTime = 4000
batchFlushIntervalTime = 2000
```

# How to get

This section describes how to build the Google Cloud BigQuery sink connector.

## Work with Function Worker

You can get the Google Cloud BigQuery sink connector using one of the following methods if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run the connector in a cluster.

- Download the JAR package from [the download page](https://github.com/streamnative/pulsar-io-bigquery/releases).

- Build it from the source code.

To build the Google Cloud BigQuery sink connector from the source code, follow these steps.

1. Clone the source code to your machine.

   ```bash
   git clone https://github.com/streamnative/pulsar-io-bigquery
   ```

2. Build the connector in the `pulsar-io-bigquery` directory.

   ```bash
   mvn clean install -DskipTests
   ```

   After the connector is successfully built, a `JAR` package is generated under the target directory.

   ```bash
   ls target
   pulsar-io-bigquery-2.10.1.2.jar
   ```

## Work with Function Mesh

You can pull the Google Cloud BigQuery sink connector Docker image from the [Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-bigquery) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the Google Cloud BigQuery sink connector, you need to configure it. This table outlines the properties and the descriptions.

| Name                          | Type    | Required | Default           | Description                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------|---------|----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `projectId`                   | String  | Yes      | "" (empty string) | The Google BigQuery project ID.                                                                                                                                                                                                                                                                                                                                         |
| `datasetName`                 | String  | Yes      | "" (empty string) | The Google BigQuery dataset name.                                                                                                                                                                                                                                                                                                                                       |
| `tableName`                   | String  | Yes      | "" (empty string) | The Google BigQuery table name.                                                                                                                                                                                                                                                                                                                                         |
| `credentialJsonString`        | String  | Yes      | "" (empty string) | The authentication JSON key. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file that contains your service account key when the `credentialJsonString` is set to an empty string. For details, see the [Google documentation](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries#before-you-begin). |
| `visibleModel`                | String  | No       | "Committed"       | The mode that controls when data written to the stream becomes visible in BigQuery for reading. For details, see the [Google documentation](https://cloud.google.com/bigquery/docs/write-api#application-created_streams). Available options are `Committed` and `Pending`.                                                                                             |
| `pendingMaxSize`              | int     | No       | 10000             | The maximum number of messages waiting to be committed in `Pending` mode.                                                                                                                                                                                                                                                                                               |
| `batchMaxSize`                | int     | No       | 20                | The maximum number of batch messages.                                                                                                                                                                                                                                                                                                                                   |
| `batchMaxTime`                | long    | No       | 5000              | The maximum batch waiting time (in units of milliseconds).                                                                                                                                                                                                                                                                                                              |
| `batchFlushIntervalTime`      | long    | No       | 2000              | The batch flush interval (in units of milliseconds).                                                                                                                                                                                                                                                                                                                    |
| `failedMaxRetryNum`           | int     | No       | 20                | The maximum retries when appending fails. By default, it sets 2 seconds for each retry.                                                                                                                                                                                                                                                                                 |
| `partitionedTables`           | boolean | No       | true              | Create a partitioned table when the table is automatically created. It will use the `__event_time__` as the partition key.                                                                                                                                                                                                                                              |
| `partitionedTableIntervalDay` | int     | No       | 7                 | The number of days between partitioning of the partitioned table.                                                                                                                                                                                                                                                                                                       |
| `clusteredTables`             | boolean | No       | true              | Create a clustered table when the table is automatically created. It will use the `__message_id__` as the cluster key.                                                                                                                                                                                                                                                  |
| `autoCreateTable`             | boolean | No       | true              | Automatically create a table if no table is available.                                                                                                                                                                                                                                                                                                                  |
| `autoUpdateTable`             | boolean | No       | true              | Automatically update the table schema if the BigQuery table schema is incompatible with the Pulsar schema.                                                                                                                                                                                                                                                              |
| `defaultSystemField`          | String  | No       | "" (empty string) | Create the system fields when the table is automatically created. You can use commas to separate multiple fields. The supported system fields are: `__schema_version__` , `__partition__` , `__event_time__`, `__publish_time__` , `__message_id__` , `__sequence_id__` , and `__producer_name__`.                                                                      |

> **Note**
>
> The provided Google Cloud credentials must have permission to access Google Cloud resources. To use the Google Cloud BigQuery sink connector, ensure the Google Cloud credentials have the following permissions to the Google BigQuery API:
>
> - bigquery.jobs.create
> - bigquery.tables.create
> - bigquery.tables.get
> - bigquery.tables.getData
> - bigquery.tables.list
> - bigquery.tables.update
> - bigquery.tables.updateData
>
> For more information about Google BigQuery API permissions, see [Google Cloud BigQuery API permissions: Access control](https://cloud.google.com/bigquery/docs/access-control).

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

* JSON

   ```json
    {
        "name": "google-bigquery-sink",
        "archive": "connectors/pulsar-io-bigquery-{{connector:version}}.jar",
        "className": "org.apache.pulsar.ecosystem.io.bigquery.BigQuerySink",
        "tenant": "public",
        "namespace": "default",
        "inputs": [
          "test-google-bigquery-pulsar"
        ],
        "parallelism": 1,
        "configs": {
          "projectId": "SECRETS",
          "datasetName": "pulsar-io-google-bigquery",
          "tableName": "test-google-bigquery-sink",
          "credentialJsonString": "SECRETS"
      }
    }
    ```

* YAML

    ```yaml
     name: google-bigquery-sink
     archive: 'connectors/pulsar-io-bigquery-{{connector:version}}.jar'
     className: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySink
     tenant: public
     namespace: default
     inputs:
       - test-google-bigquery-pulsar
     parallelism: 1
     configs:
       projectId: SECRETS
       datasetName: pulsar-io-google-bigquery
       tableName: test-google-bigquery-sink
       credentialJsonString: SECRETS
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Google Cloud BigQuery sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: google-bigquery-sink-sample
spec:
  image: streamnative/pulsar-io-bigquery:{{connector:version}}
  className: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySink
  replicas: 1
  maxReplicas: 1
  input:
    topics: 
      - persistent://public/default/test-google-bigquery-pulsar
  sinkConfig:
     projectId: SECRETS
     datasetName: pulsar-io-google-bigquery
     tableName: test-google-bigquery-sink
     credentialJsonString: SECRETS
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
    jar: connectors/pulsar-io-bigquery-{{connector:version}}.jar
  clusterName: test-pulsar
  autoAck: false
```

# How to use

You can use the Google Cloud BigQuery sink connector with Function Worker or Function Mesh.

## Work with Function Worker

> **Note**
>
> Currently, the Google Cloud BigQuery sink connector cannot run as a built-in connector as it uses the JAR package.

1. Start a Pulsar cluster in standalone mode.

    ```bash
    PULSAR_HOME/bin/pulsar standalone
    ```

2. Run the Google Cloud BigQuery sink connector.

    ```bash
    PULSAR_HOME/bin/pulsar-admin sinks localrun \
    --sink-config-file <google-bigquery-sink-config.yaml>
    --archive <pulsar-io-bigquery-{{connector:version}}.jar>
    ```

    Or, you can create a connector for the Pulsar cluster.

    ```bash
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file <google-bigquery-sink-config.yaml>
    --archive <pulsar-io-bigquery-{{connector:version}}.jar>
    ```

3. Send messages to a Pulsar topic.

    This example sends ten “hello” messages to the `test-google-pubsub-pulsar` topic in the `default` namespace of the `public` tenant.

    ```bash
    PULSAR_HOME/bin/pulsar-client produce public/default/test-google-pubsub-pulsar --messages hello -n 10
    ```

4. Query data using Google BigQuery.

    For details, see [Query a public dataset with the Google Cloud console](https://cloud.google.com/bigquery/docs/quickstarts/query-public-dataset-console).

## Work with Function Mesh

This example describes how to create a Google Cloud BigQuery sink connector for a Kubernetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare Google BigQuery service. For details, see [Getting Started with Google BigQuery](https://cloud.google.com/bigquery/docs/quickstarts).

### Step

1. Define the Google Cloud BigQuery sink connector with a YAML file and save it as `sink-sample.yaml`.

   This example shows how to publish the Google Cloud BigQuery sink connector to Function Mesh with a Docker image.

   ```yaml
   apiVersion: compute.functionmesh.io/v1alpha1
   kind: Sink
   metadata:
     name: google-bigquery-sink-sample
   spec:
     image: streamnative/pulsar-io-bigquery:{{connector:version}}
     className: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySink
     replicas: 1
     maxReplicas: 1
     input:
       topics: 
         - persistent://public/default/test-google-bigquery-pulsar
     sinkConfig:
        projectId: SECRETS
        datasetName: pulsar-io-google-bigquery
        tableName: test-google-bigquery-sink
        credentialJsonString: SECRETS
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
       jar: connectors/pulsar-io-bigquery-{{connector:version}}.jar
     clusterName: test-pulsar
     autoAck: false
   ```

2. Apply the YAML file to create the Google Cloud BigQuery sink connector.

   **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

   **Output**

    ```
    sink.compute.functionmesh.io/google-bigquery-sink-sample created
    ```

3. Check whether the Google Cloud BigQuery sink connector is created successfully.

   **Input**

    ```
    kubectl get all
    ```

   **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/google-bigquery-sink-sample-0               1/1    Running     0          77s
    ```

   After that, you can produce and consume messages using the Google Cloud BigQuery sink connector between Pulsar and Google BigQuery.