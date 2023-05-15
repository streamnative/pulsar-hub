---
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-google-pubsub"
alias: Google Cloud Pub/Sub Sink Connector
---

The [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) sink connector pulls data from Pulsar topics and persists data to Google Cloud Pub/Sub topics.

![](/docs/google-pubsub-sink.png)

# How to get

This section describes how to build the Google Cloud Pub/Sub sink connector.

## Work with Function Worker

You can get the Google Cloud Pub/Sub sink connector using one of the following methods if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

- Download the NAR package from [the download page](https://github.com/streamnative/pulsar-io-google-pubsub/releases/download/v2.10.4.2/pulsar-io-google-pubsub-2.10.4.2.nar).

- Build it from the source code.

To build the Google Cloud Pub/Sub sink connector from the source code, follow these steps.

  1. Clone the source code to your machine.

     ```bash
     git clone https://github.com/streamnative/pulsar-io-google-pubsub
     ```

  2. Build the connector in the `pulsar-io-google-pubsub` directory.
     
     ```bash
     mvn clean install -DskipTests
     ```

     After the connector is successfully built, a `NAR` package is generated under the target directory. 

     ```bash
     ls target
     pulsar-io-google-pubsub-2.10.4.2.nar
     ```

## Work with Function Mesh

You can pull the Google Cloud Pub/Sub sink connector Docker image from the [Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-google-pubsub) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure 

Before using the Google Cloud Pub/Sub sink connector, you need to configure it. This table lists the properties and the descriptions.

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `pubsubEndpoint` | String | false | "" (empty string) | The Google Cloud Pub/Sub end-point URL. |
| `pubsubCredential` | String | false | "" (empty string) | The credential (JSON string) for accessing the Google Cloud. |
| `pubsubProjectId` | String | true | "" (empty string) | The Google Cloud project ID. |
| `pubsubTopicId` | String | true | " " (empty string) | The topic ID. It is used to read messages from or write messages to Google Cloud Pub/Sub topics. |
| `pubsubSchemaId` | String | false | "" (empty string) | The schema ID. You must set the schema ID when creating a schema for Google Cloud Pub/Sub topics. |
| `pubsubSchemaType` | String | false | "" (empty string) | The schema type. You must set the schema type when creating a schema for Google Cloud Pub/Sub topics. Currently, only the AVRO format is supported. |
| `pubsubSchemaEncoding` | String | false | "" (empty string) | The encoding of the schema. You must set the schema encoding when creating a schema for Google Cloud Pub/Sub topics. Currently, only the JSON format is supported. |
| `pubsubSchemaDefinition` | String | false | "" (empty string) |  The definition of the schema. It is used to create a schema to or parse messages from Google Cloud Pub/Sub topics. |

> **Note**
>
> The provided Google Cloud credentials must have permissions to access Google Cloud resources. To use the Google Cloud Pub/Sub sink connector, ensure the Google Cloud credentials have the following permissions to Google Cloud Pub/Sub API:
>
> - projects.topics.create
> - projects.topics.get
> - projects.topics.publish
>
> For more information about Google Cloud Pub/Sub API permissions, see [Google Cloud Pub/Sub API permissions: Access control](https://cloud.google.com/pubsub/docs/access-control).

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

* JSON

   ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "google-pubsub-sink",
        "inputs": [
          "test-google-pubsub-pulsar"
        ],
        "archive": "connectors/pulsar-io-google-pubsub-2.10.4.2.nar",
        "parallelism": 1,
        "configs": {
          "pubsubCredential": "SECRETS",
          "pubsubProjectId": "pulsar-io-google-pubsub",
          "pubsubTopicId": "test-google-pubsub-sink"
      }
    }
    ```

* YAML

    ```yaml
    tenant: public
    namespace: default
    name: google-pubsub-sink
    inputs:
      - test-google-pubsub-pulsar
    archive: connectors/pulsar-io-google-pubsub-2.10.4.2.nar
    parallelism: 1
    configs:
      pubsubCredential: 'SECRETS'
      pubsubProjectId: pulsar-io-google-pubsub
      pubsubTopicId: test-google-pubsub-sink
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Google Cloud Pub/Sub sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: google-pubsub-sink-sample
spec:
  image: streamnative/pulsar-io-google-pubsub:2.10.4.2
  className: org.apache.pulsar.ecosystem.io.pubsub.PubsubSink
  replicas: 1
  maxReplicas: 1
  input:
    topics: 
      - persistent://public/default/destination
  sinkConfig:
    pubsubCredential: 'SECRETS'
    pubsubProjectId: pulsar-io-google-pubsub
    pubsubTopicId: test-google-pubsub-sink
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
    jar: connectors/pulsar-io-google-pubsub-2.10.4.2.nar
  clusterName: test-pulsar
  autoAck: true
```

# How to use

You can use the Google Cloud Pub/Sub sink connector with Function Worker or Function Mesh.

## Work with Function Worker

You can use the Google Cloud Pub/Sub sink connector as a non built-in connector or a built-in connector.

::: tabs

@@@ Use it as non built-in connector

If you already have a Pulsar cluster, you can use the Google Cloud Pub/Sub sink connector as a non built-in connector directly.

This example shows how to create a Google Cloud Pub/Sub sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

```
PULSAR_HOME/bin/pulsar-admin sinks create \
--sink-config-file <google-pubsub-sink-config.yaml>
```

@@@

@@@ Use it as built-in connector

You can make the Google Cloud Pub/Sub sink connector as a built-in connector and use it on a standalone cluster or an on-premises cluster.

### Standalone cluster

This example describes how to use the Google Cloud Pub/Sub sink connector to pull data from Pulsar topics and persist data to Google Cloud Pub/Sub in standalone mode.

#### Prerequisites

- Install the `gcloud` CLI tool. For details, see [installing Cloud SDK](https://cloud.google.com/sdk/docs/install).
- Install Pulsar locally. For details, see [set up a standalone Pulsar locally](https://pulsar.apache.org/docs/en/standalone/#install-pulsar-using-binary-release).

#### Steps

1. Prepare Google Cloud PubSub service.

    For more information, see [Getting Started with Google Cloud Pub/Sub](https://console.cloud.google.com/cloudpubsub?tutorial=pubsub_quickstart).

2. Copy the NAR package to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-pubsub-2.10.4.2.nar PULSAR_HOME/connectors/pulsar-io-google-pubsub-2.10.4.2.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the Google Cloud Pub/Sub sink connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sink localrun \
    --sink-config-file <google-pubsub-sink-config.yaml>
    ```

5. Send messages to Pulsar topics.

    This example sends ten “hello” messages to the `test-google-pubsub-pulsar` topic in the `default` namespace of the `public` tenant.

    ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-google-pubsub-pulsar --messages hello -n 10
    ```

6. Consume messages from the Google Cloud Pub/Sub using the [gcloud CLI tool](https://cloud.google.com/sdk/docs/install).

    ```
    gcloud pubsub subscriptions pull test-google-pubsub-sink
    ```

    Now you can see the messages containing "hello" from the gcloud CLI.

### On-premises cluster

This example explains how to create a Google Cloud Pub/Sub sink connector in an on-premises cluster.

1. Copy the NAR package of the Google Cloud Pub/Sub sink connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-pubsub-2.10.4.2.nar $PULSAR_HOME/connectors/pulsar-io-google-pubsub-2.10.4.2.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the Google Cloud Pub/Sub sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create a Google Cloud Pub/Sub sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file <google-pubsub-sink-config.yaml>
    ```

@@@

:::

## Work with Function Mesh

This example describes how to create a Google Cloud Pub/Sub sink connector for a Kuberbetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare Google Cloud PubSub service. For details, see [Getting Started with Google Cloud Pub/Sub](https://console.cloud.google.com/cloudpubsub?tutorial=pubsub_quickstart).

### Step

1. Define the Google Cloud Pub/Sub sink connector with a YAML file and save it as `sink-sample.yaml`.

    This example shows how to publish the Google Cloud Pub/Sub sink connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Sink
    metadata:
      name: google-pubsub-sink-sample
    spec:
      image: streamnative/pulsar-io-google-pubsub:2.10.4.2
      className: org.apache.pulsar.ecosystem.io.pubsub.PubsubSink
      replicas: 1
      maxReplicas: 1
      input:
        topics: 
          - persistent://public/default/destination
        typeClassName: “[B”
      sinkConfig:
        pubsubCredential: 'SECRETS'
        pubsubProjectId: pulsar-io-google-pubsub
        pubsubTopicId: test-google-pubsub-sink
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
        jar: connectors/pulsar-io-google-pubsub-2.10.4.2.nar
      clusterName: test-pulsar
      autoAck: true
    ```

2. Apply the YAML file to create the Google Cloud Pub/Sub sink connector.

    **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

    **Output**

    ```
    sink.compute.functionmesh.io/google-pubsub-sink-sample created
    ```

3. Check whether the Google Cloud Pub/Sub sink connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/google-pubsub-sink-sample-0               1/1    Running     0          77s
    ```

    After that, you can produce and consume messages using the Google Cloud Pub/Sub sink connector between Pulsar and Google Cloud Pub/Sub.