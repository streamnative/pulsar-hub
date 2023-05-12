---
description: 
author: freeznet,Anonymitaet,nlu90,danpi
contributors: freeznet,Anonymitaet,nlu90,danpi
language: Java,Shell,Python,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-sqs"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-sqs/blob/master/LICENSE"
tags: 
alias: AWS SQS Sink Connector
features: [""]
icon: "https://avatars.githubusercontent.com/u/44651383?v=4"
download: "https://api.github.com/repos/streamnative/pulsar-io-sqs/tarball/refs/tags/v2.9.2.22"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-sqs
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-sqs"
id: "sqs-sink"
---


The [AWS Simple Queue Service (SQS)](https://aws.amazon.com/sqs/?nc1=h_ls) sink connector pulls data from Pulsar topics and persists data to AWS SQS.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-sqs/v2.9.2.22/docs/sqs-sink.png)

# How to get 

You can get the SQS sink connector using one of the following methods.

## Use it with Function Worker

- Download the NAR package from [here](https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.9.2.22/pulsar-io-sqs-2.9.2.22.nar).

- Build it from the source code.

  1. Clone the source code to your machine.

     ```bash
     git clone https://github.com/streamnative/pulsar-io-sqs.git
     ```

  2. Assume that `PULSAR_IO_SQS_HOME` is the home directory for the `pulsar-io-sqs` repo. Build the connector in the `${PULSAR_IO_SQS_HOME}` directory.

     ```bash
     mvn clean install -DskipTests
     ```

     After the connector is successfully built, a `NAR` package is generated under the `target` directory. 

     ```bash
     ls target
     pulsar-io-sqs-2.9.2.22.nar
     ```

## Use it with Function Mesh

Pull the SQS connector Docker image from [here](https://hub.docker.com/r/streamnative/pulsar-io-sqs).

# How to configure 

Before using the SQS sink connector, you need to configure it. Below are the properties and their descriptions.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name                       | Type   | Required | Default            | Description                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------|--------|----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awsEndpoint`              | String | false    | " " (empty string) | AWS SQS end-point URL. You can find it at [AWS SQS Service endpoints](https://docs.aws.amazon.com/general/latest/gr/sqs-service.html#sqs_region).                                                                                                                                                                                                                                 |
| `awsRegion`                | String | true     | " " (empty string) | Supported AWS region. For example, us-west-1, us-west-2.                                                                                                                                                                                                                                                                                                     |
| `awsCredentialPluginName`  | String | false    | " " (empty string) | Fully-qualified class name of implementation of `AwsCredentialProviderPlugin`. Built-in options are listed below. It is a factory class that creates an AWSCredentialsProvider that is used by the SQS connector. If it is empty, the SQS connector creates a default AWSCredentialsProvider which accepts a JSON-format map of credentials in `awsCredentialPluginParam`. |
| `awsCredentialPluginParam` | String | true     | " " (empty string) | The JSON parameter to initialize `AwsCredentialsProviderPlugin`.                                                                                                                                                                                                                                                                                                 |
| `queueName`                | String | true     | " " (empty string) | The name of the SQS queue that messages should be read from or written to.                                                                                                                                                                                                                                                                                       |

### AWS Credential permissions

The provided AWS credentials must have permissions to access AWS resources. To
use the SQS sink connector, make sure the AWS credentials have the
following permissions to Amazon SQS API:

- sqs:CreateQueue
- sqs:SendMessage

### Built-in AWS Credential plugins

The following are built-in `AwsCredentialProviderPlugin` plugins:

* ` ` (empty)

  If the plugin is empty, the SQS connector creates a default AWSCredentialsProvider which accepts a JSON-format map of credentials in `awsCredentialPluginParam`.

  The configuration of the default AWSCredentialsProvider is as follows:

  ```json
  {
    "accessKey": "myKey",
    "secretKey": "mySecretKey",
  }
  ```

* `org.apache.pulsar.io.aws.AwsDefaultProviderChainPlugin`

  This plugin takes no configuration, it uses the default AWS provider chain.

  For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

* `org.apache.pulsar.io.aws.STSAssumeRoleProviderPlugin`

  This plugin takes a configuration (via the `awsCredentialPluginParam`) that describes a role to assume when running the SQS Client.

  This configuration takes the form of a small JSON-format document like below:

    ```json
    {"roleArn": "arn...", "roleSessionName": "name"}
    ```

For more information about Amazon SQS API permissions, see [Amazon SQS API permissions: Actions and resource reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-api-permissions-reference.html).

## Configure it with Function Worker

You can create a configuration file (JSON or YAML) to set the properties as below.

**Example**

* JSON 

   ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "sqs-sink",
        "inputs": [
          "test-queue-pulsar"
        ],
        "archive": "connectors/pulsar-io-sqs-2.9.2.22.nar",
        "parallelism": 1,
        "configs":
        {
            "awsEndpoint": "https://sqs.us-west-2.amazonaws.com",
            "awsRegion": "us-west-2",
            "queueName": "test-queue",
            "awsCredentialPluginName": "",
            "awsCredentialPluginParam": '{"accessKey":"myKey","secretKey":"my-Secret"}'
        }
    }
    ```

* YAML

   ```yaml
   tenant: "public"
   namespace: "default"
   name: "sqs-sink"
   inputs: 
      - "test-queue-pulsar"
   archive: "connectors/pulsar-io-sqs-2.9.2.22.nar"
   parallelism: 1

   configs:
      awsEndpoint: "https://sqs.us-west-2.amazonaws.com"
      awsRegion: "us-west-2"
      queueName: "test-queue"
      awsCredentialPluginName: ""
      awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
    ```

## Configure it with Function Mesh

You can submit a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create an SQS sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [here](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: sqs-sink-sample
spec:
  image: streamnative/pulsar-io-sqs:2.9.2.22
  className: org.apache.pulsar.ecosystem.io.sqs.SQSSource
  replicas: 1
  maxReplicas: 1
  input:
    topics: 
    - persistent://public/default/destination
    typeClassName: “[B”
  sinkConfig:
    awsEndpoint: "https://sqs.us-west-2.amazonaws.com"
    awsRegion: "us-west-2"
    queueName: "test-queue"
    awsCredentialPluginName: ""
    awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
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
    jar: connectors/pulsar-io-sqs-2.9.2.22.nar
  clusterName: test-pulsar
  autoAck: true
```

# How to use

You can use the SQS sink connector with Function Worker or Function Mesh.

## Use it with Function Worker

You can use the SQS sink connector as a non built-in connector or a built-in connector.

### Use it as non built-in connector

If you already have a Pulsar cluster, you can use the SQS sink connector as a non built-in connector directly.

This example shows how to create an SQS sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

```
PULSAR_HOME/bin/pulsar-admin sinks create \
--archive pulsar-io-sqs-2.9.2.22.nar \
--sink-config-file sqs-sink-config.yaml \
--classname org.apache.pulsar.ecosystem.io.sqs.SQSSink \
--name sqs-sink
```

### Use it as built-in connector

You can make the SQS sink connector as a built-in connector and use it on a standalone cluster or on-premises cluster.

### Standalone cluster

This example describes how to use the SQS sink connector to pull data from Pulsar topics and persist data to SQS in standalone mode.

1. Prepare SQS service. 
 
    For more information, see [Getting Started with Amazon SQS](https://aws.amazon.com/sqs/getting-started/).

2. Copy the NAR package of the SQS connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-sqs-2.9.2.22.nar PULSAR_HOME/connectors/pulsar-io-sqs-2.9.2.22.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the SQS sink connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sink localrun \
    --sink-type sqs \
    --sink-config-file sqs-sink-config.yaml
    ```

5. Send messages to Pulsar topics.

    ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-queue-pulsar --messages hello -n 10
    ```

6. Consume messages from the SQS queue using the [AWS SQS CLI tool](https://aws.amazon.com/cli/). 

    ```
    aws sqs receive-message --queue-url ${QUEUE_URL} --max-number-of-messages 10
    ```

    Now you can see the messages containing "Hello From Pulsar" from AWS SQS CLI.

#### On-premises cluster

This example explains how to create an SQS sink connector in an on-premises cluster.

1. Copy the NAR package of the SQS connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-sqs-2.9.2.22.nar $PULSAR_HOME/connectors/pulsar-io-sqs-2.9.2.22.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the SQS sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create an SQS sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type sqs \
    --sink-config-file sqs-sink-config.yaml \
    --name sqs-sink
    ```

## Use it with Function Mesh

This example demonstrates how to create an SQS sink connector through Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

- Prepare SQS service. 

  For more information, see [Getting Started with Amazon SQS](https://aws.amazon.com/sqs/getting-started/).

### Step

1. Define the SQS sink connector with a YAML file and save it as `sink-sample.yaml`.

    This example shows how to publish the SQS sink connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Sink
    metadata:
    name: sqs-sink-sample
    spec:
    image: streamnative/pulsar-io-sqs:2.9.2.22
    className: org.apache.pulsar.ecosystem.io.sqs.SQSSource
    replicas: 1
    maxReplicas: 1
    input:
        topics: 
        - persistent://public/default/destination
        typeClassName: “[B”
    sinkConfig:
        awsEndpoint: "https://sqs.us-west-2.amazonaws.com"
        awsRegion: "us-west-2"
        queueName: "test-queue"
        awsCredentialPluginName: ""
        awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
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
        jar: connectors/pulsar-io-sqs-2.9.2.22.nar
    clusterName: test-pulsar
    autoAck: true
    ```


1. Apply the YAML file to create the SQS sink connector.

    **Input**

    ```
    kubectl apply -f  <path-to-sink-sample.yaml>
    ```

    **Output**

    ```
    sink.compute.functionmesh.io/sqs-sink-sample created
    ```

2. Check whether the SQS sink connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                READY   STATUS      RESTARTS   AGE
    pod/sqs-sink-sample-0               1/1     Running     0          77s
    ```

    After that, you can produce and consume messages using the SQS sink connector between Pulsar and SQS.


