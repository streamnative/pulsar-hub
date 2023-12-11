---
description: The Kinesis source connector pulls data from Amazon Kinesis and persists data into Pulsar
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
license: Apache License 2.0
tags: ["Pulsar IO", "Kinesis", "Source"]
alias: Kinesis Source
features: ["Use Kinesis source connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/kinesis.svg"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-kinesis
source: "https://github.com/streamnative/pulsar/tree/v2.10.5.9/pulsar-io/kinesis"
download: "https://github.com/streamnative/pulsar/releases/download/v2.10.5.9/pulsar-io-kinesis-2.10.5.9.nar"
sn_available: true
id: "kinesis-source"
---

The Kinesis source connector pulls data from Amazon Kinesis and persists data into Pulsar. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

![](/images/connectors/kinesis-source.png)

This connector uses the [Kinesis Consumer Library](https://github.com/awslabs/amazon-kinesis-client) (KCL) to consume messages. The KCL uses [DynamoDB](https://docs.aws.amazon.com/streams/latest/dev/shared-throughput-kcl-consumers.html) to track checkpoints for consumers,
and uses [CloudWatch](https://docs.aws.amazon.com/streams/latest/dev/monitoring-with-cloudwatch.html) to track metrics for consumers.

This document introduces how to get started with creating an AWS Kinesis source connector and get it up and running.

{% callout title="Note" type="note" %}
Currently, the Kinesis source connector only supports raw messages. If you use [AWS Key Management Service (KMS)](https://docs.aws.amazon.com/streams/latest/dev/server-side-encryption.html) encrypted messages, the encrypted messages are sent to Pulsar directly. You need to [manually decrypt](https://aws.amazon.com/blogs/big-data/encrypt-and-decrypt-amazon-kinesis-records-using-aws-kms/) the data on the consumer side of Pulsar.
{% /callout %}

## Quick start

### Prerequisites

The prerequisites for connecting an AWS Kinesis source connector to external systems include:

1. Create a Kinesis data stream in AWS.
2. Create an [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and an `AccessKey`(Please record the value of `AccessKey` and its `SecretKey`).
3. Assign the following permissions to the AWS User:
- [AmazonKinesisFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonKinesisFullAccess.html) 
- [CloudWatch:PutMetricData](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html): it is required because AWS Kinesis client will periodically [send metrics to CloudWatch](https://docs.aws.amazon.com/streams/latest/dev/monitoring-with-cloudwatch.html).
- [AmazonDynamoDBFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonDynamoDBFullAccess.html): it is required because AWS Kinesis client will use [DynamoDB store checkpoint status](https://docs.aws.amazon.com/streams/latest/dev/shared-throughput-kcl-consumers.html#shared-throughput-kcl-consumers-what-is-leasetable).

### 1. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type kinesis` with `--archive /path/to/pulsar-io-kinesis.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type kinesis \
  --name kinesis-source \
  --tenant public \
  --namespace default \
  --destination-topic-name "Your topic name" \
  --parallelism 1 \
  --source-config \
  '{
    "awsRegion": "Your aws kinesis region", 
    "awsKinesisStreamName": "Your kinesis stream name",
    "awsCredentialPluginParam": "{\"accessKey\":\"Your AWS access key\",\"secretKey\":\"Your AWS secret access key\"}",
    "applicationName": "Your application name, which will be used as the table name for DynamoDB. E.g.: pulsar-io-kinesis"
  }'
```

The `--source-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.
If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/source-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 2. Send messages to Kinesis

{% callout title="Note" type="note" %}
The following example uses KPL to send data to Kinesis. For more details, see [Writing to your Kinesis Data Stream Using the KPL](https://docs.aws.amazon.com/streams/latest/dev/kinesis-kpl-writing.html)
{% /callout %}

``` java
public static void main(String[] args) throws Exception {

  AWSCredentialsProvider credentialsProvider =
  new AWSStaticCredentialsProvider(new BasicAWSCredentials("Your access key", "Your secret key"));

  KinesisProducerConfiguration kinesisConfig = new KinesisProducerConfiguration();
  kinesisConfig.setRegion("Your aws kinesis region");
  kinesisConfig.setCredentialsProvider(credentialsProvider);
  KinesisProducer kinesis = new KinesisProducer(kinesisConfig);
  // Put some records 
  for (int i = 0; i < 10; ++i) {
    ByteBuffer data = ByteBuffer.wrap("test-kinesis-data".getBytes("UTF-8"));
    // doesn't block       
    kinesis.addUserRecord("Your kinesis stream name", "myPartitionKey", data);
  }
  kinesis.flush();
  Thread.sleep(60000);
}
```

### 3. Show data using Pulsar client

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

```
bin/pulsar-client \
--url "Your Pulsar serviceUrl" \
consume "The topic that you specified when you created the connector" -s "test-sub" -n 10 -p Earliest

----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450427674751028642409795813410], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450430092602667871668145225762], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450431301528487486297319931938], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450432510454307100926494638114], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450433719380126715555669344290], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450434928305946330184844050466], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450436137231765944814018756642], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450437346157585559443193462818], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450438555083405174072368168994], content:test-kinesis-data
----- got message -----
key:[myPartitionKey], properties:[=49643665543143983613442895450439764009224788701542875170], content:test-kinesis-data

```
  
## Configuration Properties

This table outlines the properties of an AWS Kinesis source connector.

| Name                       | Type                    | Required | Default             | Description                                                                                                                                                                                                                                                                                                               |
|----------------------------|-------------------------|----------|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awsKinesisStreamName`     | String                  | true     | " " (empty string)  | The Kinesis stream name.                                                                                                                                                                                                                                                                                                  |
| `awsRegion`                | String                  | false    | " " (empty string)  | The AWS region. <br/><br/>**Example**<br/> us-west-1, us-west-2.                                                                                                                                                                                                                                                           |
| `awsCredentialPluginName`  | String                  | false    | " " (empty string)  | The fully-qualified class name of implementation of [AwsCredentialProviderPlugin](https://github.com/apache/pulsar/blob/master/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java). For more information, see [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin).  |
| `awsCredentialPluginParam` | String                  | false    | " " (empty string)  | The JSON parameter to initialize `awsCredentialsProviderPlugin`. For more information, see [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin).                                                                                                                                                        |
| `awsEndpoint`              | String                  | false    | " " (empty string)  | The Kinesis end-point URL, which can be found at [here](https://docs.aws.amazon.com/general/latest/gr/rande.html).                                                                                                                                                                                                        |
| `dynamoEndpoint`           | String                  | false    | " " (empty string)  | The Dynamo end-point URL, which can be found at [here](https://docs.aws.amazon.com/general/latest/gr/rande.html).                                                                                                                                                                                                         |
| `cloudwatchEndpoint`       | String                  | false    | " " (empty string)  | The Cloudwatch end-point URL. For more information, see[Amazon documentation](https://docs.aws.amazon.com/general/latest/gr/rande.html).                                                                                                                                                                                                     |
| `applicationName`          | String                  | false    | Pulsar IO connector | The name of the Amazon Kinesis application, which will be used as the table name for DynamoDB.                                                       |
| `initialPositionInStream`  | InitialPositionInStream | false    | LATEST              | The position where the connector starts from.<br/><br/>Below are the available options:<br/><br/><li>`AT_TIMESTAMP`: start from the record at or after the specified timestamp.<br/><br/><li>`LATEST`: start after the most recent data record.<br/><br/><li>`TRIM_HORIZON`: start from the oldest available data record. |
| `startAtTime`              | Date                    | false    | " " (empty string)  | If set to `AT_TIMESTAMP`, it specifies the time point to start consumption.                                                                                                                                                                                                                                            |
| `checkpointInterval`       | Long                    | false    | 60000               | The frequency of the Kinesis stream checkpoint in milliseconds.                                                                                                                                                                                                                                                           |
| `backoffTime`              | Long                    | false    | 3000                | The amount of time to delay between requests when the connector encounters a throttling exception from AWS Kinesis in milliseconds.                                                                                                                                                                                       |
| `numRetries`               | int                     | false    | 3                   | The number of re-attempts when the connector encounters an exception while trying to set a checkpoint.                                                                                                                                                                                                                    |
| `receiveQueueSize`         | int                     | false    | 1000                | The maximum number of AWS records that can be buffered inside the connector. <br/><br/>Once the `receiveQueueSize` is reached, the connector does not consume any messages from Kinesis until some messages in the queue are successfully consumed.                                                                       |
| `useEnhancedFanOut`        | boolean                 | false    | true                | If set to true, it uses Kinesis enhanced fan-out.<br><br>If set to false, it uses polling.                                                                                                                                                                                                                                |

### Configure AwsCredentialProviderPlugin

AWS Kinesis source connector allows you to use three ways to connect to AWS Kinesis by configuring `awsCredentialPluginName`.

- Leave `awsCredentialPluginName` empty to get the connector authenticated by passing `accessKey` and `secretKey` in `awsCredentialPluginParam`.

  ```json
  {"accessKey":"Your access key","secretKey":"Your secret key"}
  ```

- Set `awsCredentialPluginName` to `org.apache.pulsar.io.aws.AwsDefaultProviderChainPlugin` to use the default AWS provider chain. With this option, you don’t need to configure `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

- Set `awsCredentialPluginName`to `org.apache.pulsar.io.aws.STSAssumeRoleProviderPlugin` to use the [default AWS provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default), and you need to configure `roleArn` and `roleSessionNmae` in `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```







  