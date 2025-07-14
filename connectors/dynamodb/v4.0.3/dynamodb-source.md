---
description: The Dynamodb source connector pulls messages from Dynamodb to Pulsar topics.
author: ["ASF"]
contributors: ["ASF"]
language: Java
document: 
source: "https://github.com/apache/pulsar/tree/v4.0.3/pulsar-io/dynamodb"
license: Apache License 2.0
tags: ["Pulsar IO", "Source", "DynamoDB"]
alias: DynamoDB Source
features: ["Use DynamoDB source connector to sync data to Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/aws-dynamodb.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-4.0.3/connectors/pulsar-io-dynamodb-4.0.3.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: ""
owner_img: ""
dockerfile: 
id: "dynamodb-source"
---

The DynamoDB source connector pulls data from DynamoDB table streams and persists data into Pulsar.

This connector uses the [DynamoDB Streams Kinesis Adapter](https://github.com/awslabs/dynamodb-streams-kinesis-adapter),
which uses the [Kinesis Consumer Library](https://github.com/awslabs/amazon-kinesis-client) (KCL) to do the actual
consuming of messages. The KCL uses DynamoDB to track the state of consumers and requires cloudwatch access to log metrics.


## Quick start

### Prerequisites

The prerequisites for connecting an AWS DynamoDB source connector to external systems include:

1. Enable stream to the DynamoDB in AWS, it will show a `Latest stream ARN` after the stream is turned on.
2. Create an [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and an `AccessKey`(Please record the value of `AccessKey` and its `SecretKey`).
3. Assign the following permissions to the AWS User:
- [AmazonDynamoDBFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonDynamoDBFullAccess.html)
- [CloudWatch:PutMetricData](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html): it is required because this connector will periodically [send metrics to CloudWatch](https://docs.aws.amazon.com/streams/latest/dev/monitoring-with-cloudwatch.html).

### 1. Create a connector
The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type dynamodb` with `--archive /path/to/pulsar-io-dynamodb.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type dynamodb \
  --name dynamodb-source \
  --tenant public \
  --namespace default \
  --destination-topic-name "Your topic name" \
  --parallelism 1 \
  --source-config \
  '{
    "awsRegion": "Your aws dynamodb region", 
    "awsDynamodbStreamArn": "the Latest stream ARN of the DynamoDB table",
    "awsCredentialPluginParam": "{\"accessKey\":\"Your AWS access key\",\"secretKey\":\"Your AWS secret access key\"}",
    "applicationName": "Your application name, which will be used as the table name for DynamoDB. E.g.: pulsar-io-dynamodb"
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

### 2. Insert row to DynamoDB table

``` java
    public static void main(String[] args) {
        // 1. Create a DynamoDB client
        DynamoDbClient ddb = DynamoDbClient.builder()
                .region(Region.EU_NORTH_1)  // change to your region
                .credentialsProvider(ProfileCredentialsProvider.create())
                .build();

        for (int i = 0; i < 10; ++i) {
            // 2. Define the item to insert
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("streamnative", AttributeValue.fromS("user" + i));   // partition key
            item.put("name", AttributeValue.fromS("Alice"));
            item.put("age", AttributeValue.fromN("30"));
            item.put("email", AttributeValue.fromS("Alive@test.com"));

            // 3. Create the PutItem request
            PutItemRequest request = PutItemRequest.builder()
                    .tableName("pulsar") // change to your table name
                    .item(item)
                    .build();

            // 4. Send the request
            try {
                ddb.putItem(request);
                System.out.println("Item inserted successfully.");
            } catch (DynamoDbException e) {
                System.err.println("Insert failed: " + e.getMessage());
            }
        }

        // 5. Close client
        ddb.close();
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
publishTime:[1752464541877], eventTime:[0], key:[390cc13abf07d7b9a233daa65231d6c8], properties:[SEQUENCE_NUMBER=18031900001003631107895421, EVENT_NAME=INSERT], content:{"eventID":"390cc13abf07d7b9a233daa65231d6c8","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464541000,"Keys":{"streamnative":{"S":"user2"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user2"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18031900001003631107895421","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464542809], eventTime:[0], key:[cf6f7706eb6e15f7ee7accdde36fd878], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18035200003649242324186849], content:{"eventID":"cf6f7706eb6e15f7ee7accdde36fd878","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464542000,"Keys":{"streamnative":{"S":"user4"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user4"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18035200003649242324186849","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464542809], eventTime:[0], key:[dd660a4071b9607681be4f56ed7b5b73], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18032900003894885254372246], content:{"eventID":"dd660a4071b9607681be4f56ed7b5b73","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464541000,"Keys":{"streamnative":{"S":"user1"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user1"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18032900003894885254372246","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464542809], eventTime:[0], key:[526bf489c407d0d7e65af22a9a3461a5], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18032100001449977882361981], content:{"eventID":"526bf489c407d0d7e65af22a9a3461a5","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464542000,"Keys":{"streamnative":{"S":"user5"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user5"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18032100001449977882361981","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464543205], eventTime:[0], key:[25a0239947e90a1aa7d1fae5cd70cd96], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18037000000661915555888784], content:{"eventID":"25a0239947e90a1aa7d1fae5cd70cd96","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464541000,"Keys":{"streamnative":{"S":"user0"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user0"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18037000000661915555888784","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464543205], eventTime:[0], key:[a7bf1cbf97f036c198e4f49f86749a3a], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18037300002951028206567171], content:{"eventID":"a7bf1cbf97f036c198e4f49f86749a3a","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464542000,"Keys":{"streamnative":{"S":"user3"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user3"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18037300002951028206567171","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464543205], eventTime:[0], key:[14e87c4eb4a5b352422ab5632f69d226], properties:[EVENT_NAME=INSERT, SEQUENCE_NUMBER=18037500000367820008016475], content:{"eventID":"14e87c4eb4a5b352422ab5632f69d226","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464543000,"Keys":{"streamnative":{"S":"user6"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user6"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18037500000367820008016475","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464543795], eventTime:[0], key:[6267f254261b4952b4ad6682f88dc821], properties:[SEQUENCE_NUMBER=18035500001731177388073396, EVENT_NAME=INSERT], content:{"eventID":"6267f254261b4952b4ad6682f88dc821","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464543000,"Keys":{"streamnative":{"S":"user7"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user7"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18035500001731177388073396","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464544799], eventTime:[0], key:[eea816f9d21323655124a59e0f1b2aab], properties:[SEQUENCE_NUMBER=18035600004198491318198578, EVENT_NAME=INSERT], content:{"eventID":"eea816f9d21323655124a59e0f1b2aab","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464544000,"Keys":{"streamnative":{"S":"user9"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user9"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18035600004198491318198578","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
----- got message -----
publishTime:[1752464545795], eventTime:[0], key:[bdc4688da075ed491848e21009ab2db1], properties:[SEQUENCE_NUMBER=18033200003338420245628766, EVENT_NAME=INSERT], content:{"eventID":"bdc4688da075ed491848e21009ab2db1","eventName":"INSERT","eventVersion":"1.1","eventSource":"aws:dynamodb","awsRegion":"eu-north-1","dynamodb":{"ApproximateCreationDateTime":1752464543000,"Keys":{"streamnative":{"S":"user8"}},"NewImage":{"name":{"S":"Alice"},"streamnative":{"S":"user8"},"age":{"N":"30"},"email":{"S":"Alive@test.com"}},"SequenceNumber":"18033200003338420245628766","SizeBytes":67,"StreamViewType":"NEW_AND_OLD_IMAGES"}}
```

## Configuration Properties

This table outlines the properties of an AWS DynamoDB source connector.

| Name                       | Required | Sensitive | Default           | Description                                                                                                                                                                                                                                                                                                                          |
|----------------------------|----------|-----------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awsEndpoint`              | false    | false     | None              | Dynamodb streams end-point url.                                                                                                                                                                                                                                                                                                      |
| `awsRegion`                | true     | false     | ''                | Appropriate aws region. E.g. us-west-1, us-west-2.                                                                                                                                                                                                                                                                                   |
| `awsDynamodbStreamArn`     | true     | false     | ''                | the Dynamodb stream arn.                                                                                                                                                                                                                                                                                                             |
| `awsCredentialPluginName`  | false    | false     | None              | Fully-Qualified class name of implementation of AwsCredentialProviderPlugin..                                                                                                                                                                                                                                                        |
| `awsCredentialPluginParam` | false    | true      | " "               | The JSON parameter to initialize `AwsCredentialsProviderPlugin`.                                                                                                                                                                                                                                                                     |
| `initialPositionInStream`  | false    | false     | LATEST            | Used to specify the position in the stream where the connector should start from, The available options are:<br/> - AT_TIMESTAMP: Start from the record at or after the specified timestamp<br/> - LATEST: Start after the most recent data record (fetch new data)<br/> - TRIM_HORIZON: Start from the oldest available data record |
| `startAtTime`              | false    | false     | None              | If the `initalPositionInStream` is set to 'AT_TIMESTAMP', then this property specifies the point in time to start consumption.                                                                                                                                                                                                       |
| `applicationName`          | false    | false     | "pulsar-dynamodb" | Name of the dynamodb consumer application.                                                                                                                                                                                                                                                                                           |
| `checkpointInterval`       | false    | false     | 60000             | The frequency of the stream checkpointing (in milliseconds).                                                                                                                                                                                                                                                                         |
| `backoffTime`              | false    | false     | 3000              | The amount of time to delay between requests when the connector encounters a Throttling exception from dynamodb (in milliseconds).                                                                                                                                                                                                   |
| `numRetries`               | false    | false     | 3                 | The number of re-attempts to make when the connector encounters an exception while trying to set a checkpoint.                                                                                                                                                                                                                       |
| `receiveQueueSize`         | false    | false     | 1000              | The maximum number of AWS Records that can be buffered inside the connector.                                                                                                                                                                                                                                                         |
| `dynamoEndpoint`           | false    | false     | None              | Dynamo end-point url.                                                                                                                                                                                                                                                                                                                |
| `cloudwatchEndpoint`       | false    | false     | None              | Cloudwatch end-point url.                                                                                                                                                                                                                                                                                                            |

### Configure AwsCredentialProviderPlugin

AWS DynamoDB source connector allows you to use three ways to connect to AWS DynamoDB by configuring `awsCredentialPluginName`.

- Leave `awsCredentialPluginName` empty to get the connector authenticated by passing `accessKey` and `secretKey` in `awsCredentialPluginParam`.

  ```json
  {"accessKey":"Your access key","secretKey":"Your secret key"}
  ```

- Set `awsCredentialPluginName` to `org.apache.pulsar.io.aws.AwsDefaultProviderChainPlugin` to use the default AWS provider chain. With this option, you don’t need to configure `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

- Set `awsCredentialPluginName`to `org.apache.pulsar.io.aws.STSAssumeRoleProviderPlugin` to use the [default AWS provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default), and you need to configure `roleArn` and `roleSessionNmae` in `awsCredentialPluginParam`. For more information, see [AWS documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

  ```json
  {"roleArn": "arn...", "roleSessionName": "name"}
  ```
