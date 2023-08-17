---
description: 
author: shibd,sijie,Anonymitaet,yaalsn
contributors: shibd,sijie,Anonymitaet,yaalsn
language: Java,Shell,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-aws-eventbridge"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-aws-eventbridge/blob/master/LICENSE"
tags: 
alias: AWS EventBridge Sink Connector
features: [""]
icon: /images/connectors/aws-eventbridge.png
download: "https://api.github.com/repos/streamnative/pulsar-io-aws-eventbridge/tarball/refs/tags/v3.0.0.2"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-aws-eventbridge
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-aws-eventbridge"
id: "aws-eventbridge-sink"
sn_available: true
---


The [Amazon EventBridge](https://aws.amazon.com/eventbridge/) sink connector pulls data from Pulsar topics and persists
data to Amazon EventBridge.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-aws-eventbridge/v3.0.0.2/docs/aws-eventbridge-sink.png)

# Features

This section describes the features of the AWS EventBridge sink connector. For details about how to configure these
features, see [how to configure](#how-to-configure).

## Delivery guarantees

The AWS EventBridge sink connector provides two delivery guarantees: **at-most-once** and **at-least-once**.

{% callout title="Note" type="note" %}
Currently, the **effectively-once** delivery guarantee is not supported, because Amazon EventBridge cannot offer the
support of the Sink downstream system.
{% /callout %}

## Data convert

In AWS EventBridge, all events
is [JSON format](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html).

Pulsar supports multiple schema types. When receiving the data from Pulsar, the AWS EventBridge sink connectors
recognize it and convert it to a JSON string according to the following table:

| Pulsar Schema  | Convert to JSON | Note                                                                                                                                       |
|----------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Primitive      | ✔*              | Just support primitive type is string and data is JSON format.                                                                             |
| Avro           | ✔               | Take advantage of toolkit conversions                                                                                                      |
| Json           | ✔               | Just send it directly                                                                                                                      |
| Protobuf       | X               | The Protobuf schema is based on the Avro schema. It uses Avro as an intermediate format, so it may not provide the best effort conversion. |
| ProtobufNative | ✔               | Take advantage of toolkit conversions                                                                                                      |

In EventBridge, the user data is in the `detail$data` field.

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "detail": {
    "data": {
      "instance-id": " i-1234567890abcdef0",
      "state": "terminated"
    }
  }
}
```

## Metadata mapping

In EventBridge, a complete event contains
many [system fields](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html#eb-custom-event). These
system fields can help you to configure the rule.

An **Event** containing event data:

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "source-type": "test-aws-event-bridge-sink-connector",
  "detail-type": "topic_name_test_1",
  "source": "aws.ec2",
  "account": "111122223333",
  "time": "2017-12-22T18:43:48Z",
  "region": "us-west-1",
  "resources": [
    "arn:aws:ec2:us-west-1:123456789012:instance/i-1234567890abcdef0"
  ],
  "detail": {
    "data": {
      "instance-id": " i-1234567890abcdef0",
      "state": "terminated"
    }
  }
}
```

This connector maps the following fields:

- sourceType: The default value is `${{Connector Name}}`.
- detailType: The default value is `${{Topic Name}}`.

And, this connector supports setting the metadata of Pulsar to every **Event** (set in the **detail** field).

You can select the desired metadata through the following configuration:

```jsx
#
optional: schema_version | partition | event_time | publish_time
#
message_id | sequence_id | producer_name | key | properties
metaDataField = event_time, message_id
```

An **Event** containing metadata :

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "source-type": "test-aws-event-bridge-sink-connector",
  "detail-type": "topic_name_test_1",
  "source": "aws.ec2",
  "account": "111122223333",
  "time": "2017-12-22T18:43:48Z",
  "region": "us-west-1",
  "resources": [
    "arn:aws:ec2:us-west-1:123456789012:instance/i-1234567890abcdef0"
  ],
  "detail": {
    "data": {
      "instance-id": " i-1234567890abcdef0",
      "state": "terminated"
    },
    "event_time": 789894645625,
    "message_id": "1,1,1"
  }
}
```

## Parallelism

You can configure the parallelism of Sink execution by using the scheduling mechanism of the Function, and multiple
sink instances will be scheduled to run on different worker nodes. Multiple sinks will consume messages together
according to the configured subscription mode.

Since EventBus doesn't need to guarantee sequentiality, the connectors support the `shared` subscription model.

To increase the write throughput, you can configure the following:

```jsx
parallelism = 4
```

> When `retainOrdering` is set to `false`, the `Shared` subscription mode is used.
>

## Batch Put

AWS EventBridge connectors support batch put events, which are mainly controlled by the following three parameters:

- **batchSize**: When the buffered message is larger than batchSize, it will trigger flush (put) events. `0` means no
  trigger.
- **maxBatchBytes**: When the buffered message data size is larger than maxBatchBytes, it will trigger flush pending events.
  This value should be less than 256000 and greater than 0, The default value is 640.
- **batchTimeMs**: When the interval from the last flush exceeds `batchTimeMs`, it will trigger flush pending 
  events.  `0` means no trigger.

In addition to these three parameters that control flush
behavior, [in AWS EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevent-size.html), batches
larger than 256KB per write are not allowed. So, when the buffered message is larger than 256KB, it will trigger a
flush.

## Retry Put

In AWS Event Bridge, about Handling failures with PutEvents, It suggests retrying each error
message [until it succeeds](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevents.html).

This connector will provide two flow configs for the controller's retry strategy:

```jsx
maxRetryCount: 100 // Maximum retry send event count, when event send failed.
intervalRetryTimeMs: 1000 //The interval time(milliseconds) for each retry, when event send failed.
```

# How to get

This section describes how to get the AWS EventBridge sink connector.

## Work with Function Worker

You can get the AWS EventBridge sink connector using one of the following methods if you
use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run the connector in a cluster.

- Download the NAR package
  from [the download page](https://github.com/streamnative/pulsar-io-aws-eventbridge/releases/).

- Build it from the source code.

To build the AWS EventBridge sink connector from the source code, follow these steps.

1. Clone the source code to your machine.

   ```bash
   git clone https://github.com/streamnative/pulsar-io-aws-eventbridge
   ```

2. Build the connector in the `pulsar-io-aws-eventbridge` directory.

   ```bash
   mvn clean install -DskipTests
   ```

   After the connector is successfully built, a `NAR` package is generated under the target directory.

   ```bash
   ls target
   pulsar-io-aws-eventbridge-3.0.0.2.nar
   ```

## Work with Function Mesh

You can pull the AWS EventBridge sink connector Docker image from
the [Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-aws-eventbridge) if you
use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the AWS EventBridge sink connector, you need to configure it. This table outlines the properties and the
descriptions.

| Name                    | Type   | Required | Default           | Description                                                                                                                                                                                                                              |
|-------------------------|--------|----------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accessKeyId`           | String | No       | "" (empty string) | The EventBridge access key ID.                                                                                                                                                                                                           |
| `secretAccessKey`       | String | no       | "" (empty string) | The EventBridge secret access key.                                                                                                                                                                                                       |
| `role`                  | String | no       | "" (empty string) | The AWS role to use.                                                                                                                                                                                                                     |
| `roleSessionName`       | String | no       | "" (empty string) | The AWS role session name to use.                                                                                                                                                                                                        |
| `stsEndpoint`           | String | no       | "" (empty string) | The STS endpoint to use. By default, the [default STS endpoint](https://sts.amazonaws.com) is used. See [Amazon documentation](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html) for more details.                       |
| `stsRegion`             | String | no       | "" (empty string) | The STS region to use, By default, the 'region' config or env region is used.                                                                                                                                                            |
| `region`                | String | yes      | "" (empty string) | The EventBridge region.                                                                                                                                                                                                                  |
| `eventBusName`          | String | yes      | "" (empty string) | The Event Bus name.                                                                                                                                                                                                                      |
| `eventBusResourceName`  | String | no       | "" (empty string) | The Event Bus ARN (AWS Resource Name).                                                                                                                                                                                                   |
| `metaDataField`         | String | no       | "" (empty string) | The metadata fields added to the event. Multiple fields are separated with commas. Optional values: `schema_version`, `partition`,  `event_time`, `publish_time`, `message_id`, `sequence_id`, `producer_name`, `key`, and `properties`. |
| `batchPendingQueueSize` | int    | no       | 1000              | Pending queue size. This value must be greater than `batchMaxSize`.                                                                                                                                                                      |
| `batchMaxSize`          | int    | no       | 10                | Maximum number of batch messages. The number must be less than or equal to 10 (AWS required).                                                                                                                                            |
| `batchMaxBytesSize`     | long   | no       | 640               | Maximum number of batch bytes payload size. This value cannot be greater than 512KB.                                                                                                                                                     |
| `batchMaxTimeMs`        | long   | no       | 5000              | Batch max wait time: milliseconds.                                                                                                                                                                                                       |
| `maxRetryCount`         | long   | no       | 100               | Maximum number of retries to send events, when put events failed.                                                                                                                                                                        |
| `intervalRetryTimeMs`   | long   | no       | 1000              | The interval time(milliseconds) for each retry, when the put events failed.                                                                                                                                                              |

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you
use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

* JSON

   ```json
    {
        "name": "eventbridge-sink",
        "archive": "connectors/pulsar-io-aws-eventbridge-3.0.0.2.nar",
        "tenant": "public",
        "namespace": "default",
        "inputs": [
          "test-aws-eventbridge-pulsar"
        ],
        "parallelism": 1,
        "configs": {
          "accessKeyId": "{{Your access access key}}",
          "secretAccessKey": "{{Your secret access key}}",
          "region": "test-region",
          "eventBusName": "test-event-bus-name"
      }
    }
    ```

* YAML

    ```yaml
     name: eventbridge-sink
     archive: 'connectors/pulsar-io-aws-eventbridge-3.0.0.2.nar'
     tenant: public
     namespace: default
     inputs:
     - test-aws-eventbridge-pulsar
     parallelism: 1
     configs:
       accessKeyId: '{{Your access access key}}'
       secretAccessKey: '{{Your secret access key}}'
       region: test-region
       eventBusName: test-event-bus-name
    ```

## Work with Function Mesh

You can create
a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
to create an AWS EventBridge sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes
ecosystem. For more information about Pulsar sink CRD configurations,
see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: aws-eventbridge-sink-sample
spec:
  image: streamnative/pulsar-io-aws-eventbridge:3.0.0.2
  replicas: 1
  maxReplicas: 1
  input:
    topics:
      - persistent://public/default/test-aws-eventbridge-pulsar
  sinkConfig:
    accessKeyId: '{{Your access access key}}'
    secretAccessKey: '{{Your secret access key}}'
    region: test-region
    eventBusName: test-event-bus-name
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
    jar: connectors/pulsar-io-aws-eventbridge-3.0.0.2.jar
  clusterName: test-pulsar
  autoAck: false
```

# How to use

You can use the AWS EventBridge sink connector with Function Worker or Function Mesh.

## Work with Function Worker

{% callout title="Note" type="note" %}
Currently, the AWS EventBridge sink connector cannot run as a built-in connector as it uses the JAR package.
{% /callout %}

1. Start a Pulsar cluster in standalone mode.
    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

2. Run the AWS EventBridge sink connector.
    ```
    PULSAR_HOME/bin/pulsar-admin sinks localrun \
    --sink-config-file <aws-eventbridge-sink-config.yaml>
    --archive <pulsar-io-aws-eventbridge-3.0.0.2.nar>
    ```

   Or, you can create a connector for the Pulsar cluster.
    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-config-file <aws-eventbridge-sink-config.yaml>
    --archive <pulsar-io-aws-eventbridge-3.0.0.2.nar>
    ```

3. Send messages to a Pulsar topic.

   This example sends ten “hello” messages to the `test-aws-eventbridge-pulsar` topic in the `default` namespace of
   the `public` tenant.

     ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-aws-eventbridge-pulsar --messages hello -n 10
     ```

4. Show data on AWS EventBridge.

The connector will send the following format of JSON event to EventBridge.

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "source-type": "test-aws-event-bridge-sink-connector",
  "detail-type": "topic_name_test_1",
  "source": "aws.ec2",
  "account": "111122223333",
  "time": "2017-12-22T18:43:48Z",
  "region": "us-west-1",
  "resources": [
    "arn:aws:ec2:us-west-1:123456789012:instance/i-1234567890abcdef0"
  ],
  "detail": {
    "data": "hello"
  }
}
```

You can configure the [rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) to match events on
Amazon EventBridge, and set the target
to [Amazon CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) to track
data.

## Work with Function Mesh

This example describes how to create an AWS EventBridge sink connector for a Kubernetes cluster using Function
Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/getting-started-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes
  cluster.

- Prepare Amazon EventBridge service. For more details,
  see [Getting Started with Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-setup.html).

### Steps

1. Define the AWS EventBridge sink connector with a YAML file and save it as `sink-sample.yaml`.

   This example shows how to publish the AWS EventBridge sink connector to Function Mesh with a Docker image.
   ```yaml
   apiVersion: compute.functionmesh.io/v1alpha1
   kind: Sink
   metadata:
      name: aws-eventbridge-sink-sample
   spec:
      image: streamnative/pulsar-io-aws-eventbridge:3.0.0.2
      replicas: 1
      maxReplicas: 1
      input:
         topics:
            - persistent://public/default/test-aws-eventbridge-pulsar
      sinkConfig:
         accessKeyId: '{{Your access access key}}'
         secretAccessKey: '{{Your secret access key}}'
         region: test-region
         eventBusName: test-event-bus-name
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
         jar: connectors/pulsar-io-aws-eventbridge-3.0.0.2.jar
      clusterName: test-pulsar
      autoAck: false
   ```

2. Apply the YAML file to create the AWS EventBridge sink connector.

   **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

   **Output**

    ```
    sink.compute.functionmesh.io/aws-eventbridge-sink-sample created
    ```

3. Check whether the AWS EventBridge sink connector is created successfully.

   **Input**

    ```
    kubectl get all
    ```

   **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/aws-eventbridge-sink-sample-0               1/1    Running     0          77s
    ```

   After that, you can produce and consume messages using the AWS EventBridge sink connector between Pulsar and
   EventBridge.



