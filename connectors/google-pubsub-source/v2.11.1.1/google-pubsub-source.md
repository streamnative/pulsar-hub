---
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-google-pubsub"
alias: Google Cloud Pub/Sub Source Connector
---

The [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) source connector feeds data from Google Cloud Pub/Sub topics and writes data to Pulsar topics.

![](/docs/google-pubsub-source.png)

# How to get

This section describes how to build the Google Cloud Pub/Sub source connector.

## Work with Function Worker

You can get the Google Cloud Pub/Sub source connector using one of the following methods if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

- Download the NAR package of the connector from the [download page](https://github.com/streamnative/pulsar-io-google-pubsub/releases/download/v2.11.1.1/pulsar-io-google-pubsub-2.11.1.1.nar).

- Build the connector from the source code.

To build the Google Cloud Pub/Sub source connector from the source code, follow these steps.

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
     pulsar-io-google-pubsub-2.11.1.1.nar
     ```

## Work with Function Mesh

You can pull the Google Cloud Pub/Sub source connector Docker image from [the Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-google-pubsub) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the Google Cloud Pub/Sub source connector, you need to configure it. This table lists the properties and the descriptions.

| Name | Type | Required | Default | Description
|------|----------|----------|---------|-------------|
| `pubsubEndpoint` | String | false | "" (empty string) | The Google Cloud Pub/Sub end-point URL. |
| `pubsubCredential` | String | false | "" (empty string) | The credential (JSON string) for accessing the Google Cloud.  |
| `pubsubProjectId` | String | true | "" (empty string) | The Google Cloud project ID. |
| `pubsubTopicId` | String | true | " " (empty string) | The topic ID. It is used to read messages from or write messages to Google Cloud Pub/Sub topics. |
| `pubsubSchemaId` | String | false | "" (empty string) | The schema ID. You must set the schema ID when creating a schema for Google Cloud Pub/Sub topics. |
| `pubsubSchemaType` | String | false | "" (empty string) | The schema type. You must set the schema type when creating a schema for Google Cloud Pub/Sub topics. Currently, only the AVRO format is supported. |
| `pubsubSchemaEncoding` | String | false | "" (empty string) | The encoding of the schema. You must set the schema encoding when creating a schema for Google Cloud Pub/Sub topics. Currently, only the JSON format is supported.|
| `pubsubSchemaDefinition` | String | false | "" (empty string) |  The definition of the schema. It is used to create a schema to or parse messages from Google Cloud Pub/Sub topics. |

> **Note**
>
> The provided Google Cloud credentials must have permissions to access Google Cloud resources. To use the Google Cloud Pub/Sub source connector, ensure the Google Cloud credentials have the following permissions to Google Cloud Pub/Sub API:
> 
> - projects.subscriptions.get
> - projects.subscriptions.create
> - projects.subscriptions.pull
> - projects.subscriptions.acknowledge
> 
> For more information about Google Cloud Pub/Sub API permissions, see [Google Cloud Pub/Sub API permissions: Access control](https://cloud.google.com/pubsub/docs/access-control).

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

- JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "google-pubsub-source",
        "topicName": "test-google-pubsub-pulsar",
        "archive": "connectors/pulsar-io-google-pubsub-2.11.1.1.nar",
        "parallelism": 1,
        "configs":
        {
          "pubsubProjectId": "pulsar-io-google-pubsub",
          "pubsubTopicId": "test-pubsub-source"
        }
    }
    ```

- YAML

    ```yaml
    tenant: public
    namespace: default
    name: google-pubsub-source
    topicName: test-google-pubsub-pulsar
    archive: connectors/pulsar-io-google-pubsub-2.11.1.1.nar
    parallelism: 1
    configs:
      pubsubProjectId: pulsar-io-google-pubsub
      pubsubTopicId: test-pubsub-source
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create a Google Cloud Pub/Sub source connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar source CRD configurations, see [source CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/source-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Source
metadata:
  name: google-pubsub-source-sample
spec:
  image: streamnative/pulsar-io-google-pubsub:2.11.1.1
  className: org.apache.pulsar.ecosystem.io.pubsub.PubsubSource
  replicas: 1
  maxReplicas: 1
  output:
    topics:
      - persistent://public/default/test-google-pubsub-pulsar
  sourceConfig:
    pubsubCredential: 'SECRETS'
    pubsubProjectId: pulsar-io-google-pubsub
    pubsubTopicId: test-google-pubsub-source
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
    jar: connectors/pulsar-io-google-pubsub-2.11.1.1.nar
  clusterName: test-pulsar
```

# How to use

You can use the Google Cloud Pub/Sub source connector with Function Worker or Function Mesh.

## Work with Function Worker

You can use the Google Cloud Pub/Sub source connector as a non built-in connector or a built-in connector as below.

::: tabs

@@@ Use it as non built-in connector

If you already have a Pulsar cluster, you can use the Google Cloud Pub/Sub source connector as a non built-in connector directly.

This example shows how to create a Google Cloud Pub/Sub source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

```
PULSAR_HOME/bin/pulsar-admin sources create \
--source-config-file <google-pubsub-source-config.yaml >
```

@@@

@@@ Use it as built-in connector

You can make the Google Cloud Pub/Sub source connector as a built-in connector and use it on a standalone cluster or an on-premises cluster.

### Standalone cluster

This example describes how to use the Google Cloud Pub/Sub source connector to feed data from Google Cloud Pub/Sub and write data to Pulsar topics in the standalone mode.

#### Prerequisites

- Install the `gcloud` CLI tool. For details, see [installing Cloud SDK](https://cloud.google.com/sdk/docs/install).
- Install Pulsar locally. For details, see [set up a standalone Pulsar locally](https://pulsar.apache.org/docs/en/standalone/#install-pulsar-using-binary-release).

#### Steps

1. Prepare Google Cloud Pub/Sub service.

    For more information, see [Getting Started with Google Cloud Pub/Sub](https://console.cloud.google.com/cloudpubsub?tutorial=pubsub_quickstart).

2. Copy the NAR package to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-pubsub-2.11.1.1.nar PULSAR_HOME/connectors/pulsar-io-google-pubsub-2.11.1.1.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the Google Cloud Pub/Sub source connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sources localrun --source-config-file <google-pubsub-source-config.yaml>
    ```

5. Consume the message from the Pulsar topic.

    ```
    PULSAR_HOME/bin/pulsar-client consume -s "sub-products" public/default/test-google-pubsub-pulsar -n 0
    ```

6. Send a message to the Google Cloud PubSub using the [gcloud CLI tool](https://cloud.google.com/sdk/docs/install).

    This example creates a `test-pubsub-source` topic and sends a “Hello World” message to the topic.

    ```
    gcloud pubsub topics create test-pubsub-source
    gcloud pubsub topics publish test-pubsub-source --message="Hello World"
    ```

    Now you can see the message "Hello World" from the Pulsar consumer.

### On-premises cluster

This example explains how to create a Google Cloud Pub/Sub source connector in an on-premises cluster.

1. Copy the NAR package of the Google Cloud Pub/Sub connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-google-pubsub-2.11.1.1.nar $PULSAR_HOME/connectors/pulsar-io-google-pubsub-2.11.1.1.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sources reload
    ```

3. Check whether the Google Cloud Pub/Sub source connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sources available-sources
    ```

4. Create a Google Cloud Pub/Sub source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sources sources create \
    --source-config-file <google-pubsub-source-config.yaml>
    ```

## Work with Function Mesh

This example describes how to create a Google Cloud Pub/Sub source connector for a Kuberbetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare Google Cloud PubSub service. For details, see [Getting Started with Google Cloud Pub/Sub](https://console.cloud.google.com/cloudpubsub?tutorial=pubsub_quickstart).

### Step

1. Define the Google Cloud Pub/Sub source connector with a YAML file and save it as `source-sample.yaml`.

    This example shows how to publish the Google Cloud Pub/Sub source connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Source
    metadata:
      name: google-pubsub-source-sample
    spec:
      image: streamnative/pulsar-io-google-pubsub:2.11.1.1
      className: org.apache.pulsar.ecosystem.io.pubsub.PubsubSource
      replicas: 1
      maxReplicas: 1
      output:
        topics:
          - persistent://public/default/test-google-pubsub-pulsar
      sourceConfig:
        pubsubCredential: 'SECRETS'
        pubsubProjectId: pulsar-io-google-pubsub
        pubsubTopicId: test-google-pubsub-source
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
        jar: connectors/pulsar-io-google-pubsub-2.11.1.1.nar
      clusterName: test-pulsar
    ```

2. Apply the YAML file to create the Google Cloud Pub/Sub source connector.

    **Input**

    ```
    kubectl apply -f <path-to-source-sample.yaml>
    ```

    **Output**

    ```
    source.compute.functionmesh.io/google-pubsub-source-sample created
    ```

3. Check whether the Google Cloud Pub/Sub source connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/google-pubsub-source-sample-0               1/1    Running     0          77s
    ```

    After that, you can produce and consume messages using the Google Cloud Pub/Sub source connector between Pulsar and Google Cloud Pub/Sub.
