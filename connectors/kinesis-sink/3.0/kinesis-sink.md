---
description: The Kinesis sink connector pulls data from Pulsar and persists data into Amazon Kinesis.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
license: Apache License 2.0
tags: ["Pulsar IO", "Kinesis", "Sink"]
alias: Kinesis Sink
features: ["Use Kinesis sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/pulsar-hub.svg"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-kinesis
id: "kinesis-sink"
source: "https://github.com/streamnative/pulsar/tree/v3.0.0.1/pulsar-io/kinesis"
download: "https://github.com/streamnative/pulsar/releases/download/v3.0.0.1/pulsar-io-kinesis-3.0.0.1.nar"
---

The AWS Kinesis sink connector pulls data from Pulsar and persists data into Amazon Kinesis. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

![](/images/connectors/kinesis-sink.png)

This document introduces how to get started with creating an AWS Kinesis sink connector and get it up and running.
## Quick start

### Prerequisites

The prerequisites for connecting an AWS Kinesis sink connector to external systems include:

1. Create a Kinesis data stream in AWS.
2. Create an [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and an `AccessKey`(Please record the value of `AccessKey` and its `SecretKey`).
3. Assign the following permissions to the AWS User:
- [AmazonKinesisFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonKinesisFullAccess.html) 
- [CloudWatch:PutMetricData](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html): it is required because AWS Kinesis producer will periodically [send metrics to CloudWatch](https://docs.aws.amazon.com/streams/latest/dev/monitoring-with-cloudwatch.html).

### 1. Create a connector
Depending on the environment, there are several ways to create an AWS Kinesis sink connector:

- [Create a Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create a Connector with Function worker](https://pulsar.apache.org/docs/io-quickstart/).
Using this way requires you to download a **NAR** package to create a connector. You can download the version you need from the `download button` at the beginning of the article.
- [Create a Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-kinesis).

No matter how you create an AWS Kinesis sink connector, the minimum configuration contains the following parameters.
```yaml
configs:
awsRegion: "Your aws kinesis region"
awsKinesisStreamName: "Your kinesis stream name"
awsCredentialPluginParam: "{\"accessKey\":\"Your access key\",\"secretKey\":\"Your secret key\"}"
```
> * The configuration structure varies depending on how you create the AWS Kinesis sink connector.
>  For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.


### 2. Send messages to the topic
> **Note:** If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.

``` java
   PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

   Producer<String> producer = client.newProducer(Schema.STRING)
     .topic("{{Your topic name}}")
     .create();

   String message = "test-message";
   MessageId msgID = producer.send(message);
   System.out.println("Publish " + message + " and message ID " + msgID);

   producer.flush();
   producer.close();
   client.close();
```

  ### 3. Show data on AWS Kinesis console
  You can use the AWS Kinesis `Data Viewer` to view the data. ![](/images/connectors/kinesis-sink-show-data.png)

  ## Configuration Properties

  This table outlines the properties of an AWS Kinesis sink connector.

  | Name                        | Type          | Required | Default            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
  |-----------------------------|---------------|----------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | `awsKinesisStreamName`      | String        | true     | " " (empty string) | The Kinesis stream name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
  | `awsRegion`                 | String        | true     | " " (empty string) | The AWS Kinesis [region](https://www.aws-services.info/regions.html). <br/><br/>**Example:**<br/> us-west-1, us-west-2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `awsCredentialPluginName`   | String        | false    | " " (empty string) | The fully-qualified class name of implementation of [AwsCredentialProviderPlugin](https://github.com/apache/pulsar/blob/master/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java). Please refer to [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin)                                                                                                                                                                                                                                                                                                                                                      |
  | `awsCredentialPluginParam`  | String        | false    | " " (empty string) | The JSON parameter to initialize `awsCredentialsProviderPlugin`. Please refer to [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
  | `awsEndpoint`               | String        | false    | " " (empty string) | A custom Kinesis endpoint. For more information, see [AWS documentation](https://docs.aws.amazon.com/general/latest/gr/rande.html).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
  | `retainOrdering`            | Boolean       | false    | false              | Whether Pulsar connectors retain the ordering when moving messages from Pulsar to Kinesis.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
  | `messageFormat`             | MessageFormat | false    | ONLY_RAW_PAYLOAD   | Message format in which Kinesis sink converts Pulsar messages and publishes them to Kinesis streams.<br/><br/>Available options include:<br/><br/><li>`ONLY_RAW_PAYLOAD`: Kinesis sink directly publishes Pulsar message payload as a message into the configured Kinesis stream. <br/><br/><li>`FULL_MESSAGE_IN_JSON`: Kinesis sink creates a JSON payload with Pulsar message payload, properties, and encryptionCtx, and publishes JSON payload into the configured Kinesis stream.<br/><br/><li>`FULL_MESSAGE_IN_FB`: Kinesis sink creates a flatbuffers serialized payload with Pulsar message payload, properties, and encryptionCtx, and publishes flatbuffers payload into the configured Kinesis stream. <br/><br/><li>`FULL_MESSAGE_IN_JSON_EXPAND_VALUE`:  Kinesis sink sends a JSON structure containing the record topic name, key, payload, properties, and event time. The record schema is used to convert the value to JSON. |
  | `jsonIncludeNonNulls`       | Boolean       | false    | true               | Only the properties with non-null values are included when the message format is `FULL_MESSAGE_IN_JSON_EXPAND_VALUE`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `jsonFlatten`               | Boolean       | false    | false              | When it is set to `true` and the message format is `FULL_MESSAGE_IN_JSON_EXPAND_VALUE`, the output JSON is flattened.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `retryInitialDelayInMillis` | Long          | false    | 100                | The initial delay (in milliseconds) between retries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | `retryMaxDelayInMillis`     | Long          | false    | 60000              | The maximum delay(in milliseconds) between retries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Configure AwsCredentialProviderPlugin

AWS Kinesis sink connector allows you to use three ways to connect to AWS Kinesis by configuring `awsCredentialPluginName`.

-  Leave `awsCredentialPluginName` empty to get the connector authenticated by passing `accessKey` and `secretKey` in `awsCredentialPluginParam`.

  ```json
  {"accessKey":"Your access key","secretKey":"Your secret key"}
  ```

- Set `awsCredentialPluginName` to `org.apache.pulsar.io.kinesis.AwsDefaultProviderChainPlugin` to use the default AWS provider chain. With this option, you don’t need to configure `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

- Set `awsCredentialPluginName`to `org.apache.pulsar.io.kinesis.STSAssumeRoleProviderPlugin` to use the [default AWS provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default), and you need to configure `roleArn` and `roleSessionNmae` in `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```






