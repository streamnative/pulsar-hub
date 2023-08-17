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

The Kinesis source connector pulls data from Amazon Kinesis and persists data into Pulsar. For more information about connectors, see [Connector Overview](https://docs.streamnative.io/docs/connector-overview).

![](/images/connectors/kinesis-source.png)

This connector uses the [Kinesis Consumer Library](https://github.com/awslabs/amazon-kinesis-client) (KCL) to do the actual consuming of messages. The KCL uses DynamoDB to track checkpoint for consumers,
uses CloudWatch to track metrics for consumers.

This document introduces how to get started with creating an AWS Kinesis sink connector and get it up and running.

## Limites
Currently, the Kinesis source connector only supports raw messages. If you use KMS encrypted messages, the encrypted messages are sent to downstream. This connector will support decrypting messages in the future release.


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
Depending on the environment, there are several ways to create an AWS Kinesis source connector:

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
applicationName: "You application name, will be used as the table name for DynamoDB. E.g.: pulsar-io-kinesis"

```
> * The configuration structure varies depending on how you create the AWS Kinesis sink connector.
>  For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

### 2. Send messages to the Kinesis
> **Note:** The following example uses KPL to send data to kinesis, See [Writing to your Kinesis Data Stream Using the KPL](https://docs.aws.amazon.com/streams/latest/dev/kinesis-kpl-writing.html)

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

### 3. Show data by Pulsar client

> **Note:** If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.

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






