---
description: 
author: freeznet,Anonymitaet,nlu90,shibd
contributors: freeznet,Anonymitaet,nlu90,shibd
language: Java,Shell,Python,Dockerfile
document:
source: "https://github.com/streamnative/pulsar-io-sqs"
license: Apache License 2.0
license_link: "https://github.com/streamnative/pulsar-io-sqs/blob/master/LICENSE"
tags: 
alias: AWS SQS Sink Connector
features: [""]
icon: "/images/connectors/sqs-logo.png"
download: "https://api.github.com/repos/streamnative/pulsar-io-sqs/tarball/refs/tags/v2.11.2.11"
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-sqs
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: "https://hub.docker.com/r/streamnative/pulsar-io-sqs"
sn_available: "true"
id: "sqs-sink"
---


The [AWS Simple Queue Service (SQS)](https://aws.amazon.com/sqs/?nc1=h_ls) sink connector pulls data from Pulsar topics and persists data to AWS SQS.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-sqs/v2.11.2.11/docs/sqs-sink.png)

## Quick start

### Prerequisites

The prerequisites for connecting an AWS SQS sink connector to external systems include:

1. Create SQS in AWS.
2. Create the [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and create `AccessKey`(Please record `AccessKey` and `SecretAccessKey`).
3. Assign the following permissions to the AWS User:
- sqs:CreateQueue
- sqs:SendMessage


### 1. Create a connector

Depending on the environment, there are several ways to create an AWS SQS sink connector:

- [Create Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create Connector with Function worker](https://pulsar.apache.org/docs/3.0.x/io-quickstart/).
  Using this way requires you to download a **NAR** package to create a built-in or non-built-in connector. You can download the version you need by clicking the **Download** icon on the upper-right corner of this page.
- [Create Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
  Using this way requires you to set the docker image. You can choose the version you want to launch from [Docker Hub](https://hub.docker.com/r/streamnative/pulsar-io-sqs/tags).

No matter how you create an AWS SQS sink connector, the minimum configuration contains the following parameters.

```yaml
configs:
  awsRegion: "Your AWS SQS region"
  queueName: "Your AWS SQS name"
  awsCredentialPluginParam: "{\"accessKey\":\"Your access key\",\"secretKey\":\"Your secret key\"}"
```
> * The configuration structure varies depending on how you create the AWS SQS sink connector.
    >  For example, some are **JSON**, some are **YAML**, and some are **Kubernetes YAML**. You need to adapt the configs to the corresponding format.
>
> * If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

### 2. Send messages to the topic

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

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

### 3. Show data on AWS SQS
You can use the following simple code to receive messages from AWS SQS.

``` java
    public static void main(String[] args) {

        AmazonSQS client = AmazonSQSClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(
                        new BasicAWSCredentials("Your access key", "Your secret key")))
                .withRegion("Your AWS SQS region").build();

        String queueUrl = client.getQueueUrl(new GetQueueUrlRequest("Your SQS name")).getQueueUrl();
        ReceiveMessageResult receiveMessageResult = client.receiveMessage(queueUrl);
        for (Message message : receiveMessageResult.getMessages()) {
            System.out.println("Receive msg: " + message.getBody());
        }
        client.shutdown();
    }
    
    // Output
    // Receive msg: test-message
```

## Configuration Properties

Before using the AWS SQS sink connector, you need to configure it. This table outlines the properties and the
Descriptions of an AWS SQS sink connector.

| Name                       | Type   | Required | Default            | Description                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------|--------|----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awsRegion`                | String | true     | " " (empty string) | Supported AWS region. For example, us-west-1, us-west-2.                                                                                                                                                                                                                                                                                                     |
| `queueName`                | String | true     | " " (empty string) | The name of the SQS queue that messages should be read from or written to.                                                                                                                                                                                                                                                                                       |
| `awsCredentialPluginName`  | String | false    | " " (empty string) | The fully-qualified class name of implementation of [AwsCredentialProviderPlugin](https://github.com/apache/pulsar/blob/master/pulsar-io/aws/src/main/java/org/apache/pulsar/io/aws/AwsCredentialProviderPlugin.java). For more information, see [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin). |
| `awsCredentialPluginParam` | String | false     | " " (empty string) | The JSON parameter to initialize `awsCredentialsProviderPlugin`. For more information, see [Configure AwsCredentialProviderPlugin](###Configure AwsCredentialProviderPlugin). |
| `awsEndpoint`              | String | false    | " " (empty string) | AWS SQS end-point URL. You can find it at [AWS SQS Service endpoints](https://docs.aws.amazon.com/general/latest/gr/sqs-service.html#sqs_region).                                                                                                                                                                                                                                 |


### Configure AwsCredentialProviderPlugin

AWS SQS sink connector allows you to use three ways to connect to AWS SQS by configuring `awsCredentialPluginName`.

- Leave `awsCredentialPluginName` empty to get the connector authenticated by passing `accessKey` and `secretKey` in `awsCredentialPluginParam`.

  ```json
  {"accessKey":"Your access key","secretKey":"Your secret key"}
  ```

- Set `awsCredentialPluginName` to `org.apache.pulsar.io.aws.AwsDefaultProviderChainPlugin` to use the default AWS provider chain. With this option, you don't need to configure `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

- Set `awsCredentialPluginName` to `org.apache.pulsar.io.aws.STSAssumeRoleProviderPlugin` to use the [default AWS provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default), and you need to configure `roleArn` and `roleSessionNmae` in `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html).

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```

