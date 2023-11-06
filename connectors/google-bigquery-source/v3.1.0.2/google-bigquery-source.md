---
description: BigQuery Connector integrates Apache Pulsar with Google BigQuery.
author: shibd,danpi,codelipenghui,Huanli-Meng
contributors: shibd,danpi,codelipenghui,Huanli-Meng
language: Java,Shell,Dockerfile
document:
source: Private Source
license: Business License
license_link: "https://github.com/streamnative/pulsar-io-bigquery/blob/master/LICENSE"
tags: 
alias: Google Cloud BigQuery Source Connector
features: ["BigQuery Connector integrates Apache Pulsar with Google BigQuery."]
icon: "/images/connectors/google-bigquery-logo.png"
download:
support: streamnative
support_link:
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile:
sn_available: "true"
id: "google-bigquery-source"
---


The [Google Cloud BigQuery](https://cloud.google.com/bigquery) Source Connector feeds data from Google Cloud BigQuery tables and writes data to Pulsar topics.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-bigquery/v3.1.0.2/docs/google-bigquery-source.png)

# How to get

This section describes how to build the Google Cloud BigQuery source connector.

## Work with Function Worker

You can get the Google Cloud BigQuery source connector using one of the following methods:

- Download the JAR package from [the download page](https://github.com/streamnative/pulsar-io-bigquery/releases).
- Build it from the source code.

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
   pulsar-io-bigquery-3.1.0.2.jar
   ```

## Work with Function Mesh

You can pull the Google Cloud BigQuery source connector Docker image from [the Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-bigquery) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the Google Cloud BigQuery source connector, you need to configure it. This table lists the properties and the descriptions.


| Name                         | Type   | Required | Default           | Description                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------|--------|----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `projectId`                  | String | Yes      | "" (empty string) | The Google BigQuery project ID.                                                                                                                                                                                                                                                                                                                                         |
| `datasetName`                | String | Yes      | "" (empty string) | The Google BigQuery dataset name.                                                                                                                                                                                                                                                                                                                                       |
| `tableName`                  | String | Yes      | "" (empty string) | The Google BigQuery table name.                                                                                                                                                                                                                                                                                                                                         |
| `credentialJsonString`       | String | No       | "" (empty string) | The authentication JSON key. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file that contains your service account key when the `credentialJsonString` is set to an empty string. For details, see the [Google documentation](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries#before-you-begin). |
| `queueSize`                  | int    | No       | "" (empty string) | The buffer queue size of the source. It is used for storing records before they are sent to Pulsar topics. By default, it is set to `10000`.                                                                                                                                                                                                                                |
| `snapshotTime`               | long   | No       | -1                | The snapshot time of the table. If it is not set, it is interpreted as now.                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                      |
| `sql`                        | String | No       | "" (empty string) | The SQL query on BigQuery. The computed result is saved in a temporary table. The temporary table has a configurable expiration time, and the BigQuery source connector automatically deletes the temporary table when the data is transferred completely. The `projectId` and `datasetName` gets values from the configuration file, and the `tableName` is generated by UUID.                            |                                                                                                                                                                                                                                                                                                                     |
| `expirationTimeInMinutes`    | int    | No       | 1440              | The expiration time in minutes until the table is expired and auto-deleted.                                                                                                                                                                                                                                                                                             |
| `maxParallelism`             | int    | No       | 1                 | The maximum parallelism for reading. In fact, the number may be less if the BigQuery source connector deems the data small enough.                                                                                                                                                                                                            |
| `selectedFields`             | String | No       | "" (empty string) | Names of the fields in the table that should be read.                                                                                                                                                                                                                                                                                                                   |
| `filters`                    | String | No       | "" (empty string) | A list of clauses that can filter the result of the table.                                                                                                                                                                                                                                                                                                              |
| `checkpointIntervalSeconds`  | int    | No       | 60                | The checkpoint interval (in units of seconds). By default, it is set to 60s.                                                                                                                                                                                                                                                                                             |

> **Note**
>
> The provided Google Cloud credentials must have permission to access Google Cloud resources. To use the Google Cloud BigQuery source connector, ensure the Google Cloud credentials have the following permissions to the Google BigQuery API:
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

* YAML

    ```yaml
      name: google-bigquery-source
      className: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySource
      namespace: default
      topicName: google-bigquery-source-test
      parallelism: 1
      archive: connectors/pulsar-io-bigquery-source.jar
      batchSourceConfig: 
        discoveryTriggererClassName: org.apache.pulsar.ecosystem.io.bigquery.source.BigQueryOnceTrigger
      configs:
        # projectId is BigQuery project id.
        #
        # This field is *required*.
        #
        projectId: bigquery-dev-001
        # datasetName is BigQuery dataset name.
        #
        # This field is *required*.
        #
        datasetName: babynames
        # tableName is BigQuery table name.
        #
        # This field is *required*.
        #
        tableName: names2021
        credentialJsonString: SECRETS
    ```

* JSON

    ```json
    {
        "name": "source-test-source",
        "className": "org.apache.pulsar.ecosystem.io.bigquery.BigQuerySource",
        "namespace": "default",
        "topicName": "google-bigquery-source-test",
        "parallelism": 1,
        "archive": "connectors/pulsar-io-bigquery-source.jar",
        "batchSourceConfig": {
        "discoveryTriggererClassName": "org.apache.pulsar.ecosystem.io.bigquery.source.BigQueryOnceTrigger"
        },
        "configs": {
            "projectId": "bigquery-dev-001",
            "datasetName": "babynames",
            "tableName": "names2021",
            "credentialJsonString": "SECRETS"
        }
    }
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Google Cloud BigQuery source connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar IO source CRD configurations, see [source CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/source-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Source
metadata:
  name: google-bigquery-source-sample
spec:
  image: streamnative/pulsar-io-bigquery:3.1.0.2
  className: org.apache.pulsar.functions.source.batch.BatchSourceExecutor
  replicas: 1
  maxReplicas: 1
  output:
      producerConf:
        maxPendingMessages: 1000
        maxPendingMessagesAcrossPartitions: 50000
        useThreadLocalProducers: true
      topic: persistent://public/default/google-bigquery-pulsar-source
  sourceConfig:
      __BATCHSOURCECLASSNAME__: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySource
      __BATCHSOURCECONFIGS__: '{"discoveryTriggererClassName":"org.apache.pulsar.ecosystem.io.bigquery.source.BigQueryOnceTrigger"}'
      projectId: SECRETS
      datasetName: pulsar-io-google-bigquery
      tableName: test-google-bigquery-source
      credentialJsonString: SECRETS
  pulsar:
      pulsarConfig: "test-pulsar-source-config"
  resources:
      limits:
        cpu: "0.2"
        memory: 1.1G
      requests:
        cpu: "0.1"
        memory: 1G
  java:
      jar: connectors/pulsar-io-bigquery-3.1.0.2.jar
  clusterName: pulsar
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-pulsar-source-config
data:
  webServiceURL: http://pulsar-broker.default.svc.cluster.local:8080
  brokerServiceURL: pulsar://pulsar-broker.default.svc.cluster.local:6650
```

# How to use

You can use the Google Cloud BigQuery source connector with Function Worker or Function Mesh.

## Work with Function Worker

You can use the Google Cloud BigQuery source connector as a non built-in connector or a built-in connector as below.

### Use it as non built-in connector

If you already have a Pulsar cluster, you can use the Google Cloud BigQuery source connector as a non built-in connector directly.

This example shows how to create a Google Cloud BigQuery source connector on a Pulsar cluster using the [`pulsar-admin sources create`](https://pulsar.apache.org/tools/pulsar-admin/2.10.0-SNAPSHOT/#-em-create-em--40) command.

```
PULSAR_HOME/bin/pulsar-admin sources create \
--source-config-file <google-bigquery-source-config.yaml >
--
```

### Use it as built-in connector

You can make the Google Cloud BigQuery source connector as a built-in connector and use it on a standalone cluster or an on-premises cluster.

#### Standalone cluster

This example describes how to use the Google Cloud BigQuery source connector to feed data from Google Cloud BigQuery and write data to Pulsar topics in the standalone mode.

##### Prerequisites

- Install the `gcloud` CLI tool. For details, see [installing Cloud SDK](https://cloud.google.com/sdk/docs/install).
- Install Pulsar locally. For details, see [set up a standalone Pulsar locally](https://pulsar.apache.org/docs/getting-started-standalone/).
- Prepare test data. For details, see [download the source public data file](https://cloud.google.com/bigquery/docs/quickstarts/load-data-bq#download_the_source_public_data_file).

##### Steps

1. Load data to Google Cloud BigQuery table.
    1. Create a dataset named `babynames`.
        ```
        bq mk babynames
        ```
    2. Load data into a table.
        ```
        bq load babynames.names2021 yob2021.txt name:string,gender:string,count:integer
        ```
   For more information, see [Getting Started with Google Cloud BigQuery by the command-line tool](https://cloud.google.com/bigquery/docs/quickstarts/load-data-bq).

2. Copy the JAR package to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-bigquery-3.1.0.2.jar PULSAR_HOME/connectors/pulsar-io-google-bigquery-3.1.0.2.jar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Consume the message from the Pulsar topic.

    ```
    PULSAR_HOME/bin/pulsar-client consume -s topic-sub -st auto_consume -n 0 public/default/google-bigquery-source-test
    ```

5. Run the Google Cloud BigQuery source connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sources localrun --source-config-file <google-bigquery-source-config.yaml>
    ```

   Now you can see the message from the Pulsar consumer like this.
    ```
   ----- got message -----
   key:[null], properties:[], content:{gender=F, name=Evelyn, count=9434}
    ```

#### On-premises cluster

This example explains how to create a Google Cloud BigQuery source connector in an on-premises cluster.

1. Copy the JAR package of the Google Cloud BigQuery connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-bigquery-3.1.0.2.jar $PULSAR_HOME/connectors/pulsar-io-google-bigquery-3.1.0.2.jar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sources reload
    ```

3. Check whether the Google Cloud BigQuery source connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sources available-sources
    ```

4. Create a Google Cloud BigQuery source connector on a Pulsar cluster using the [`pulsar-admin sources create`](https://pulsar.apache.org/tools/pulsar-admin/2.10.0-SNAPSHOT/#-em-create-em--40) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sources create \
    --source-config-file <google-bigquery-source-config.yaml>
    ```

## Work with Function Mesh

This example describes how to create a Google Cloud BigQuery source connector for a Kuberbetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare Google Cloud BigQuery service. For details, see [Getting Started with Google Cloud BigQuery by the command-line tool](https://cloud.google.com/bigquery/docs/quickstarts/load-data-bq).

### Step

1. Define the Google Cloud BigQuery source connector with a YAML file and save it as `source-sample.yaml`.

   This example shows how to publish the Google Cloud BigQuery source connector to Function Mesh with a Docker image.

   ```yaml  
   apiVersion: compute.functionmesh.io/v1alpha1
   kind: Source
   metadata:
      name: google-bigquery-source-sample
   spec:
      image: streamnative/pulsar-io-bigquery:3.1.0.2
      className: org.apache.pulsar.functions.source.batch.BatchSourceExecutor
      replicas: 1
      maxReplicas: 1
      output:
         producerConf:
            maxPendingMessages: 1000
            maxPendingMessagesAcrossPartitions: 50000
            useThreadLocalProducers: true
         topic: persistent://public/default/google-bigquery-pulsar-source
      sourceConfig:
         __BATCHSOURCECLASSNAME__: org.apache.pulsar.ecosystem.io.bigquery.BigQuerySource
         __BATCHSOURCECONFIGS__: '{"discoveryTriggererClassName":"org.apache.pulsar.ecosystem.io.bigquery.source.BigQueryOnceTrigger"}'
         projectId: SECRETS
         datasetName: pulsar-io-google-bigquery
         tableName: test-google-bigquery-source
         credentialJsonString: SECRETS
      pulsar:
         pulsarConfig: "test-pulsar-source-config"
      resources:
         limits:
            cpu: "0.2"
            memory: 1.1G
         requests:
            cpu: "0.1"
            memory: 1G
      java:
         jar: connectors/pulsar-io-bigquery-3.1.0.2.jar
      clusterName: pulsar
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
      name: test-pulsar-source-config
   data:
      webServiceURL: http://pulsar-broker.default.svc.cluster.local:8080
      brokerServiceURL: pulsar://pulsar-broker.default.svc.cluster.local:6650
   ```

2. Apply the YAML file to create the Google Cloud BigQuery source connector.

   **Input**

    ```
    kubectl apply -f <path-to-source-sample.yaml>
    ```

   **Output**

    ```
    source.compute.functionmesh.io/google-bigquery-source-sample created
    ```

3. Check whether the Google Cloud BigQuery source connector is created successfully.

   **Input**

    ```
    kubectl get all
    ```

   **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/google-bigquery-source-sample-0               1/1    Running     0          77s
    ```


