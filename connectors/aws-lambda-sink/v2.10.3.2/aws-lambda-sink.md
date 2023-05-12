---
description: 
author: freeznet,timmyyuan,Anonymitaet,Technoboy-
contributors: freeznet,timmyyuan,Anonymitaet,Technoboy-
language: Java,Shell,Python,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-aws-lambda"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-aws-lambda/blob/master/LICENSE"
tags: 
alias: AWS Lambda Sink
features: [""]
icon: "https://avatars.githubusercontent.com/u/44651383?v=4"
download: "https://api.github.com/repos/streamnative/pulsar-io-aws-lambda/tarball/refs/tags/v2.10.3.2"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-aws-lambda
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: ""
id: "aws-lambda-sink"
---


The [AWS Lambda](https://aws.amazon.com/lambda/) sink connector is a [Pulsar IO connector](http://pulsar.apache.org/docs/en/next/io-overview/) for pulling messages from Pulsar topics to AWS Lambda to invoke Lambda functions. 

![](https://raw.githubusercontent.com/streamnative/pulsar-io-aws-lambda/v2.10.3.2/docs/lambda-sink.png)

# How to get

This section describes how to build the AWS Lambda sink connector.

## Work with Function Worker

You can get the AWS Lambda sink connector using one of the following methods if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

- Download the NAR package from [the download page](https://github.com/streamnative/pulsar-io-aws-lambda/releases/download/v2.10.3.2/pulsar-io-google-pubsub-2.10.3.2.nar).

- Build it from the source code.

To build the AWS Lambda sink connector from the source code, follow these steps.

1. Clone the source code to your machine.

     ```bash
     git clone https://github.com/streamnative/pulsar-io-aws-lambda
     ```

2. Build the connector in the `pulsar-io-aws-lambda` directory.

     ```bash
     mvn clean install -DskipTests
     ```

     After the connector is successfully built, a `NAR` package is generated under the `target` directory. 

     ```bash
     ls target
     pulsar-io-aws-lambda-2.10.3.2.nar
     ```

## Work with Function Mesh

You can pull the AWS Lambda sink connector Docker image from [the Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-aws-lambda) if you use [Function Mesh](https://functionmesh.io/docs/connectors/run-connector) to run the connector.

# How to configure

Before using the AWS Lambda sink, you need to configure it. This table lists the properties and the descriptions.

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `awsEndpoint` |String| false | " " (empty string) | The AWS Lambda endpoint URL. It can be found at [AWS Lambda endpoints and quotas](https://docs.aws.amazon.com/general/latest/gr/lambda-service.html). |
| `awsRegion` | String| true | " " (empty string) | The supported AWS region. For example, `us-west-1`, `us-west-2`. |
| `awsCredentialPluginName` | String|false | " " (empty string) | The fully-qualified class name of the `AwsCredentialProviderPlugin` implementation. |
| `awsCredentialPluginParam` | String|true | " " (empty string) | The JSON parameter to initialize `AwsCredentialsProviderPlugin`. |
| `lambdaFunctionName` | String|true | " " (empty string) | The Lambda function that should be invoked by the messages. |
| `synchronousInvocation` | Boolean|true | true | <br />- `true`: invoke a Lambda function synchronously. <br />- `false`: invoke a Lambda function asynchronously. |

## Work with Function Worker

You can create a configuration file (JSON or YAML) to set the properties if you use [Pulsar Function Worker](https://pulsar.apache.org/docs/en/functions-worker/) to run connectors in a cluster.

**Example**

- JSON 

  ```json
    {
      "tenant": "public",
      "namespace": "default",
      "name": "aws-lambda-sink",
      "inputs": [
        "test-aws-lambda-topic"
      ],
      "archive": "connectors/pulsar-io-aws-lambda-2.10.3.2.nar",
      "parallelism": 1,
      "configs":
      {
          "awsEndpoint": "https://lambda.us-west-2.amazonaws.com",
          "awsRegion": "us-west-2",
          "lambdaFunctionName": "test-function",
          "awsCredentialPluginName": "",
          "awsCredentialPluginParam": '{"accessKey":"myKey","secretKey":"my-Secret"}',
          "synchronousInvocation": true
      }
    }
    ```

- YAML

   ```yaml
   tenant: "public"
   namespace: "default"
   name: "aws-lambda-sink"
   inputs: 
    - "test-aws-lambda-topic"
   archive: "connectors/pulsar-io-aws-lambda-2.10.3.2.nar"
   parallelism: 1

   configs:
    awsEndpoint: "https://lambda.us-west-2.amazonaws.com"
    awsRegion: "us-west-2"
    lambdaFunctionName: "test-function"
    awsCredentialPluginName: ""
    awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
    synchronousInvocation: true
    ```

## Work with Function Mesh

You can create a [CustomResourceDefinitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to create an AWS Lambda sink connector. Using CRD makes Function Mesh naturally integrate with the Kubernetes ecosystem. For more information about Pulsar sink CRD configurations, see [sink CRD configurations](https://functionmesh.io/docs/connectors/io-crd-config/sink-crd-config).

You can define a CRD file (YAML) to set the properties as below.

```yaml
apiVersion: compute.functionmesh.io/v1alpha1
kind: Sink
metadata:
  name: aws-lambda-sink-sample
spec:
  image: streamnative/pulsar-io-aws-lambda:2.10.3.2
  className: org.apache.pulsar.ecosystem.io.aws.lambda.AWSLambdaBytesSink
  replicas: 1
  input:
    topics: 
    - persistent://public/default/destination
    typeClassName: “[B”
  sinkConfig:
    awsEndpoint: "https://lambda.us.us-west-2.amazonaws.com"
    awsRegion: "us-west-2"
    lambdaFunctionName: "test-function"
    awsCredentialPluginName: ""
    awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
    synchronousInvocation: true
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
    jar: connectors/pulsar-io-aws-lambda-2.10.3.2.nar
  clusterName: test-pulsar
  autoAck: true
```

# How to use

You can use the AWS Lambda sink connector with Function Worker or Function Mesh.

## Work with Function Worker

You can use the AWS Lambda sink connector as a non built-in connector or a built-in connector.

::: tabs

@@@ Use it as non built-in connector

If you already have a Pulsar cluster, you can use the AWS Lambda sink connector as a non built-in connector directly.

This example shows how to create an AWS Lambda sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.10.0-SNAPSHOT/#-em-create-em--24) command.

```bash
PULSAR_HOME/bin/pulsar-admin sinks create \
--archive pulsar-io-aws-lambda-2.10.3.2.nar \
--sink-config-file aws-lambda-sink-config.yaml \
--classname org.apache.pulsar.ecosystem.io.aws.lambda.AWSLambdaBytesSink \
--name aws-lambda-sink
```

@@@

@@@ Use it as built-in connector

You can make the AWS Lambda sink connector as a built-in connector and use it on a standalone cluster or an on-premises cluster.

### Standalone cluster

This example describes how to use the AWS Lambda sink connector to pull messages from Pulsar topics and persist the messages to AWS Lambda to invoke Lambda functions.

1. Prepare AWS Lambda service. Make sure the Lambda function is ready to use.
 
    For more information, see [Getting Started with Amazon AWS Lambda](https://aws.amazon.com/lambda/getting-started/).

2. Copy the NAR package of the AWS Lambda connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-aws-lambda-2.10.3.2.nar 
    PULSAR_HOME/connectors/pulsar-io-aws-lambda-2.10.3.2.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the AWS Lambda sink connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sink localrun \
    --sink-type aws-lambda \
    --sink-config-file aws-lambda-sink-config.yaml
    ```

5. Send messages to Pulsar topics.

    ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-queue-pulsar --messages hello -n 10
    ```

6. Monitor the Lambda function status through the [AWS Lambda console](https://console.aws.amazon.com/lambda/home#/functions).

    For more information, see [monitoring and troubleshooting Lambda applications](https://docs.aws.amazon.com/lambda/latest/dg/lambda-monitoring.html).

### On-premises cluster

This example explains how to create an AWS Lambda sink connector in an on-premises cluster.

1. Copy the NAR package of the AWS Lambda connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-aws-lambda-2.10.3.2.nar     
    PULSAR_HOME/connectors/pulsar-io-aws-lambda-2.10.3.2.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the AWS Lambda sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create an AWS Lambda sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.10.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type aws-lambda \
    --sink-config-file aws-lambda-sink-config.yaml \
    --name aws-lambda-sink
    ```

@@@

:::

## Work with Function Mesh

This example describes how to create an AWS Lambda sink connector for a Kuberbetes cluster using Function Mesh.

### Prerequisites

- Create and connect to a [Kubernetes cluster](https://kubernetes.io/).

- Create a [Pulsar cluster](https://pulsar.apache.org/docs/en/kubernetes-helm/) in the Kubernetes cluster.

- [Install the Function Mesh Operator and CRD](https://functionmesh.io/docs/install-function-mesh/) into the Kubernetes cluster.

### Step

1. Define the AWS Lambda sink connector with a YAML file and save it as `sink-sample.yaml`.

    This example shows how to publish the AWS Lambda sink connector to Function Mesh with a Docker image.

    ```yaml
    apiVersion: compute.functionmesh.io/v1alpha1
    kind: Sink
    metadata:
      name: aws-lambda-sink-sample
    spec:
      image: streamnative/pulsar-io-aws-lambda:2.10.3.2
      className: org.apache.pulsar.ecosystem.io.aws.lambda.AWSLambdaBytesSink
      replicas: 1
      input:
        topics: 
        - persistent://public/default/destination
        typeClassName: “[B”
      sinkConfig:
        awsEndpoint: "https://lambda.us.us-west-2.amazonaws.com"
        awsRegion: "us-west-2"
        lambdaFunctionName: "test-function"
        awsCredentialPluginName: ""
        awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
        synchronousInvocation: true
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
        jar: connectors/pulsar-io-aws-lambda-2.10.3.2.nar
      clusterName: test-pulsar
      autoAck: true
    ```

2. Apply the YAML file to create the AWS Lambda sink connector.

    **Input**

    ```
    kubectl apply -f <path-to-sink-sample.yaml>
    ```

    **Output**

    ```
    sink.compute.functionmesh.io/aws-lambda-sink-sample created
    ```

3. Check whether the AWS Lambda sink connector is created successfully.

    **Input**

    ```
    kubectl get all
    ```

    **Output**

    ```
    NAME                                         READY   STATUS      RESTARTS   AGE
    pod/aws-lambda-sink-sample-0               1/1    Running     0          77s
    ```

    After that, you can use the AWS Lambda sink connector to export Pulsar messages to AWS Lambda to invoke Lambda functions.

