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
icon: /images/connectors/lambda-logo.png
download: "https://api.github.com/repos/streamnative/pulsar-io-aws-lambda/tarball/refs/tags/v2.8.3.2"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-aws-lambda
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: ""
id: "aws-lambda-sink"
---


The [AWS Lambda](https://aws.amazon.com/lambda/) sink connector is a [Pulsar IO connector](http://pulsar.apache.org/docs/en/next/io-overview/) for pulling messages from Pulsar topics to AWS Lambda to invoke Lambda functions. 

![](https://raw.githubusercontent.com/streamnative/pulsar-io-aws-lambda/v2.8.3.2/docs/lambda-sink.png)

# How to get 

You can get the AWS Lambda sink connector using one of the following methods:

- Download the NAR package from [here](https://github.com/streamnative/pulsar-io-aws-lambda/releases/download/v2.7.0/pulsar-io-aws-lambda-2.7.0.nar).

- Build it from the source code.

  1. Clone the source code to your machine.

     ```bash
     git clone https://github.com/streamnative/pulsar-io-aws-lambda
     ```

  2. Assume that `PULSAR_IO_AWS_LAMBDA_HOME` is the home directory for the `pulsar-io-aws-lambda` repo. Build the connector in the `${PULSAR_IO_AWS_LAMBDA_HOME}` directory.

     ```bash
     mvn clean install -DskipTests
     ```

     After the connector is successfully built, a `NAR` package is generated under the `target` directory. 

     ```bash
     ls target
     pulsar-io-aws-lambda-2.7.0.nar
     ```

# How to configure 

Before using the AWS Lambda sink connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `awsEndpoint` |String| false | " " (empty string) | AWS Lambda end-point URL. It can be found at [here](https://docs.aws.amazon.com/general/latest/gr/lambda-service.html). |
| `awsRegion` | String| true | " " (empty string) | Supported AWS region. For example, us-west-1, us-west-2. |
| `awsCredentialPluginName` | String|false | " " (empty string) | Fully-qualified class name of implementation of `AwsCredentialProviderPlugin`. |
| `awsCredentialPluginParam` | String|true | " " (empty string) | JSON parameter to initialize `AwsCredentialsProviderPlugin`. |
| `lambdaFunctionName` | String|true | " " (empty string) | The Lambda function that should be invoked by the messages. |
| `synchronousInvocation` | Boolean|true | true | `true` means invoking a Lambda function synchronously. <br>`false` means invoking a Lambda function asynchronously. |

**Example**

* JSON 

   ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "aws-lambda-sink",
        "inputs": [
          "test-aws-lambda-topic"
        ],
        "archive": "connectors/pulsar-io-aws-lambda-2.7.0.nar",
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

* YAML

   ```yaml
   tenant: "public"
   namespace: "default"
   name: "aws-lambda-sink"
   inputs: 
      - "test-aws-lambda-topic"
   archive: "connectors/pulsar-io-aws-lambda-2.7.0.nar"
   parallelism: 1

   configs:
      awsEndpoint: "https://lambda.us-west-2.amazonaws.com"
      awsRegion: "us-west-2"
      lambdaFunctionName: "test-function"
      awsCredentialPluginName: ""
      awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
      synchronousInvocation: true
    ```

# How to use

You can use the AWS Lambda sink connector as a non built-in connector or a built-in connector as below. 

## Use as non built-in connector 

If you already have a Pulsar cluster, you can use the AWS Lambda sink connector as a non built-in connector directly.

This example shows how to create an AWS Lambda sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

```
PULSAR_HOME/bin/pulsar-admin sinks create \
--archive pulsar-io-aws-lambda-2.7.0.nar \
--sink-config-file aws-lambda-sink-config.yaml \
--classname org.apache.pulsar.ecosystem.io.aws.lambda.AWSLambdaBytesSink \
--name aws-lambda-sink
```

## Use as built-in connector

You can make the AWS Lambda sink connector as a built-in connector and use it on a standalone cluster, on-premises cluster, or K8S cluster.

### Standalone cluster

This example describes how to use the AWS Lambda sink connector to pull data from Pulsar topics and persist data to AWS Lambda in standalone mode.


1. Prepare AWS Lambda service. Make sure the Lambda function is ready to use. 
 
    For more information, see [Getting Started with Amazon AWS Lambda](https://aws.amazon.com/lambda/getting-started/).

2. Copy the NAR package of the AWS Lambda connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-aws-lambda-2.7.0.nar PULSAR_HOME/connectors/pulsar-io-aws-lambda-2.7.0.nar
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
    cp pulsar-io-aws-lambda-2.7.0.nar $PULSAR_HOME/connectors/pulsar-io-aws-lambda-2.7.0.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the AWS Lambda sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create an AWS Lambda sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type aws-lambda \
    --sink-config-file aws-lambda-sink-config.yaml \
    --name aws-lambda-sink
    ```

### K8S cluster

1. Build a new image based on the Pulsar image with the AWS Lambda sink connector and push the new image to your image registry. This example tags the new image as `streamnative/pulsar-aws-lambda:2.7.0`.

    ```Dockerfile
    FROM apachepulsar/pulsar-all:2.7.0
    RUN curl https://github.com/streamnative/pulsar-io-aws-lambda/releases/download/v2.7.0/pulsar-io-aws-lambda-2.7.0.nar -o /pulsar/connectors/pulsar-io-aws-lambda-2.7.0.nar
    ```

2. Extract the previous `--set` arguments from K8S to the `pulsar.yaml` file.

    ```
    helm get values <release-name> > pulsar.yaml
    ```

3. Replace the `images` section in the `pulsar.yaml` file with the `images` section of `streamnative/pulsar-aws-lambda:2.7.0`.

4. Upgrade the K8S cluster with the `pulsar.yaml`  file.

    ```
    helm upgrade <release-name> streamnative/pulsar \
        --version <new version> \
        -f pulsar.yaml
    ```

    > **Tip**
    >
    > For more information about how to upgrade a Pulsar cluster with Helm, see [Upgrade Guide](https://docs.streamnative.io/platform/latest/install-and-upgrade/helm/install/upgrade).


5. Create a AWS Lambda sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type aws-lambda \
    --sink-config-file aws-lambda-sink-config.yaml \
    --name aws-lambda-sink
    ```


