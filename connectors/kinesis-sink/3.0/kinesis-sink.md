---
source: "https://github.com/streamnative/pulsar/tree/v3.0.0.1/pulsar-io/kinesis"
download: "https://github.com/streamnative/pulsar/releases/download/v3.0.0.1/pulsar-io-kinesis-3.0.0.1.nar"
---

The Kinesis sink connector pulls data from Pulsar and persists data into Amazon Kinesis.

![](/images/connectors/kinesis-sink.png)

## Quick start

### Prerequisites

The prerequisites for connecting an AWS Kinesis sink connector to external systems include:

1. Create a kinesis data stream in AWS.
2. Create the [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and create `AccessKey`(Please record `AccessKey` and `AecretAccessKey`).
3. Assign permissions to AWS User:
- [AmazonKinesisFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonKinesisFullAccess.html) 
- [CloudWatch:PutMetricData](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html): Because AWS Kinesis producer will periodically [send metrics to CloudWatch](https://docs.aws.amazon.com/streams/latest/dev/monitoring-with-cloudwatch.html). 

### 1. Create a connector
Depending on the environment, there are several ways to create an AWS Kinesis sink connector:

- [Create Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create Connector with Function worker](https://pulsar.apache.org/docs/3.0.x/io-quickstart/).
  Using this way requires you to download a **NAR** package to create a built-in or non-built-in connector. You can download the version you need from [here](https://github.com/streamnative/pulsar/releases/download/v3.0.0.1/pulsar-io-kinesis-3.0.0.1.nar).
- [Create Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
  Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-kinesis)

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

### 3. Show data by AWS Kinesis console
You can use the AWS Kinesis `Data viewer` to view the data.
![](/images/connectors/kinesis-sink-show-data.png)

## Configuration Properties

This table outlines the properties and the descriptions.

| Name                        | Type          | Required | Default            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------|---------------|----------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awsKinesisStreamName`      | String        | true     | " " (empty string) | The Kinesis stream name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `awsRegion`                 | String        | true     | " " (empty string) | The AWS Kinesis [region](https://www.aws-services.info/regions.html). <br/><br/>**Example**<br/> us-west-1, us-west-2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `awsCredentialPluginName`   | String        | false    | " " (empty string) | The fully-qualified class name of implementation of {@inject: github:`AwsCredentialProviderPlugin`:/pulsar-io/kinesis/src/main/java/org/apache/pulsar/io/kinesis/AwsCredentialProviderPlugin.java}. <br/><br/>It is a factory class which creates an AWSCredentialsProvider that is used by Kinesis sink. <br/><br/>If it is empty, the Kinesis sink creates a default AWSCredentialsProvider which accepts json-map of credentials in `awsCredentialPluginParam`. For examples: awsCredentialPluginParam: "{\"accessKey\":\"Your accessKey\",\"secretKey\":\"Your secretKey\"}".                                                                                                                                                                                                                                                                                                                                                         |
| `awsCredentialPluginParam`  | String        | false    | " " (empty string) | The JSON parameter to initialize `awsCredentialsProviderPlugin`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `awsEndpoint`               | String        | false    | " " (empty string) | To set a custom Kinesis endpoint, which can be found at [here](https://docs.aws.amazon.com/general/latest/gr/rande.html).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `retainOrdering`            | boolean       | false    | false              | Whether Pulsar connectors to retain ordering when moving messages from Pulsar to Kinesis or not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `messageFormat`             | MessageFormat | false    | ONLY_RAW_PAYLOAD   | Message format in which Kinesis sink converts Pulsar messages and publishes to Kinesis streams.<br/><br/>Below are the available options:<br/><br/><li>`ONLY_RAW_PAYLOAD`: Kinesis sink directly publishes Pulsar message payload as a message into the configured Kinesis stream. <br/><br/><li>`FULL_MESSAGE_IN_JSON`: Kinesis sink creates a JSON payload with Pulsar message payload, properties and encryptionCtx, and publishes JSON payload into the configured Kinesis stream.<br/><br/><li>`FULL_MESSAGE_IN_FB`: Kinesis sink creates a flatbuffer serialized payload with Pulsar message payload, properties and encryptionCtx, and publishes flatbuffer payload into the configured Kinesis stream. <br/><br/><li>`FULL_MESSAGE_IN_JSON_EXPAND_VALUE`:  Kinesis sink sends a JSON structure containing the record topic name, key, payload, properties and event time. The record schema is used to convert the value to JSON. |
| `jsonIncludeNonNulls`       | boolean       | false    | true               | Only the properties with non-null values are included when the message format is `FULL_MESSAGE_IN_JSON_EXPAND_VALUE`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `jsonFlatten`               | boolean       | false    | false              | When it is set to `true` and the message format is `FULL_MESSAGE_IN_JSON_EXPAND_VALUE`, the output JSON is flattened.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `retryInitialDelayInMillis` | long          | false    | 100                | The initial delay(in milliseconds) between retries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `retryMaxDelayInMillis`     | long          | false    | 60000              | The maximum delay(in milliseconds) between retries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |


The following are built-in `AwsCredentialProviderPlugin` plugins:

- When `awsCredentialPluginName` is empty:

  This will be authenticated by passing `accessKey` and `secretKey` in `awsCredentialPluginParam`.
  
  ```json
  {"accessKey":"Your access key","secretKey":"Your secret key"}
  ```
- When `awsCredentialPluginName` is `org.apache.pulsar.io.kinesis.AwsDefaultProviderChainPlugin`:

   This plugin takes no configuration, it uses the default AWS provider chain.

   For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

- When `awsCredentialPluginName` is `org.apache.pulsar.io.kinesis.STSAssumeRoleProviderPlugin`:

  This plugin will use [default AWS provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default)
  and takes a configuration (via the `awsCredentialPluginParam`) that describes a [role](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) to assume when running the KCL.

  This configuration takes the form of a small json document like:

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```


   
    

