---
description: 
author: shibd,sijie,Anonymitaet,yaalsn
contributors: shibd,sijie,Anonymitaet,yaalsn
language: Java,Shell,Dockerfile
document:
source: Private Source
license: Business License
license_link: "https://github.com/streamnative/pulsar-io-aws-eventbridge/blob/master/LICENSE"
tags: 
alias: AWS EventBridge Sink Connector
features: [""]
icon: "/images/connectors/aws-eventbridge.png"
download:
support: streamnative
support_link:
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile:
sn_available: "true"
id: "aws-eventbridge-sink"
---


The [Amazon EventBridge](https://aws.amazon.com/eventbridge/) sink connector pulls data from Pulsar topics and persists
data to Amazon EventBridge.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-aws-eventbridge/v3.0.1.3/docs/aws-eventbridge-sink.png)

## Quick start

### Prerequisites

The prerequisites for connecting an AWS EventBridge sink connector to external systems include:

1. Create EventBridge and EventBus in AWS.
2. Create the [AWS User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and create `AccessKey`(Please record `AccessKey` and `SecretAccessKey`).
3. Assign permissions to AWS User, and ensure they have the following permissions to the AWS EventBus. For details, see [permissions for event buses](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-bus-perms.html)
 
```json
  {
    "Version": "2012-10-17",
    "Statement": [

      ### To grant permissions for an account to use the PutEvents action, include the following, otherwise delete this section: ###

      {

        "Sid": "AllowAccountToPutEvents",
        "Effect": "Allow",
        "Principal": {
          "AWS": "<ACCOUNT_ID>"
        },
        "Action": "events:PutEvents",
        "Resource": "{EventBusArn}"
      },

      ### Include the following section to grant permissions to all members of your AWS Organizations to use the PutEvents action ###

      {
        "Sid": "AllowAllAccountsFromOrganizationToPutEvents",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "events:PutEvents",
        "Resource": "{EventBusArn}"
        "Condition": {
          "StringEquals": {
            "aws:PrincipalOrgID": "o-yourOrgID"
          }
        }
      }
    ]
}
```
- You can set permissions directly for this user. With this method, when you create a connector, you only need to configure `accessKey` and `secretAccessKey`.
- Or you can use [Security Token Service](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html), this [video](https://www.youtube.com/watch?v=dqF4VJCska4) explains how to use STS on AWS.
  With this method, when you create a connector, in addition to configuring `accessKey` and `secretAccessKey`, you also need to configure `role` and `roleSessionName`.

4. Create a [Rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule.html) in EventBridge.
- The data structure sent to Event Bridge is described [here](## Metadata mapping), and you can create **event pattern** based on this structure.
- Set the target according to your needs. If you're testing this connector, you can set the target to [Cloud Watch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html).

 
### 1. Create a connector

Depending on the environment, there are several ways to create an AWS EventBridge sink connector:

- [Create Connector on StreamNative Cloud](https://docs.streamnative.io/docs/connector-create).
- [Create Connector with Function worker](https://pulsar.apache.org/docs/3.0.x/io-quickstart/). 
  Using this way requires you to download a **NAR** package to create a built-in or non-built-in connector. You can download the version you need from [here](https://github.com/streamnative/pulsar-io-aws-eventbridge/releases).
- [Create Connector with Function mesh](https://functionmesh.io/docs/connectors/run-connector).
  Using this way requires you to set the docker image. You can choose the version you want to launch from [here](https://hub.docker.com/r/streamnative/pulsar-io-aws-eventbridge/tags)

No matter how you create an AWS EventBridge sink connector, the minimum configuration contains the following parameters.

```json
   "configs": {
      "accessKeyId": "{{Your access access key}}",
      "secretAccessKey": "{{Your secret access key}}",
      "region": "test-region",
      "eventBusName": "test-event-bus-name"
   }
```
> * The configuration structure varies depending on how you create the AWS EventBridge sink connector.
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

        String message = "{\"msg\": \"msg-data\"}";
        MessageId msgID = producer.send(message);
        System.out.println("Publish " + message + " and message ID " + msgID);
        
        producer.flush();
        producer.close();
        client.close();
```

### 3. Show data on AWS EventBridge
The connector will send the following format of JSON event to EventBridge.
```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "detail-type": "{{Your topic name}}",
  "source": "{{Your connector name}}",
  "account": "111122223333",
  "time": "2017-12-22T18:43:48Z",
  "region": "us-west-1",
  "resources": [
    "arn:aws:ec2:us-west-1:123456789012:instance/i-1234567890abcdef0"
  ],
  "detail": {
    "data": {
      "msg": "msg-data"
    },
    "message_id": "124:191:0"
  }
}
```

## Configuration Properties

Before using the AWS EventBridge sink connector, you need to configure it. This table outlines the properties and the
descriptions.

| Name                    | Type   | Required | Default           | Description                                                                                                                                                                                                                              |
|-------------------------|--------|----------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accessKeyId`           | String | yes      | "" (empty string) | The AWS EventBridge [access key ID.](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)                                                                                                              |
| `secretAccessKey`       | String | yes      | "" (empty string) | The AWS EventBridge [secret access key.](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)                                                                                                          |
| `region`                | String | yes      | "" (empty string) | The region where AWS EventBridge service is located. [All AWS region](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/regions/Region.html)                                                                              |
| `eventBusName`          | String | yes      | "" (empty string) | The Event Bus name.                                                                                                                                                                                                                      |
| `role`                  | String | false    | "" (empty string) | The AWS STS [roleArn](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html). Example: arn:aws:iam::598203581484:role/test-role                                                                                        |
| `roleSessionName`       | String | false    | "" (empty string) | The AWS role session name, Name it yourself.                                                                                                                                                                                             |
| `stsEndpoint`           | String | false    | "" (empty string) | The AWS STS endpoint. By default, the default STS endpoint: https://sts.amazonaws.com is used. See [Amazon documentation](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html) for more details.                            |
| `stsRegion`             | String | false    | "" (empty string) | The AWS STS region, By default, the 'region' config or env region is used.                                                                                                                                                               |
| `eventBusResourceName`  | String | no       | "" (empty string) | The Event Bus ARN (AWS Resource Name). Example: `arn:aws:events:ap-northeast-1:598263551484:event-bus/my_eventbus`                                                                                                                       |
| `metaDataField`         | String | no       | "" (empty string) | The metadata fields added to the event. Multiple fields are separated with commas. Optional values: `schema_version`, `partition`,  `event_time`, `publish_time`, `message_id`, `sequence_id`, `producer_name`, `key`, and `properties`. |
| `batchPendingQueueSize` | int    | no       | 1000              | Pending queue size. This value must be greater than `batchMaxSize`.                                                                                                                                                                      |
| `batchMaxSize`          | int    | no       | 10                | Maximum number of batch messages. The number must be less than or equal to 10 (AWS required).                                                                                                                                            |
| `batchMaxBytesSize`     | long   | no       | 640               | Maximum number of batch bytes payload size. This value cannot be greater than 512KB.                                                                                                                                                     |
| `batchMaxTimeMs`        | long   | no       | 5000              | Batch max wait time: milliseconds.                                                                                                                                                                                                       |
| `maxRetryCount`         | long   | no       | 100               | Maximum number of retries to send events, when put events failed.                                                                                                                                                                        |
| `intervalRetryTimeMs`   | long   | no       | 1000              | The interval time(milliseconds) for each retry, when the put events failed.                                                                                                                                                              |

> For details about this connector's advanced features and configurations, see [Advanced features](#advanced-features).

## Advanced features

### Delivery guarantees

The AWS EventBridge sink connector provides two delivery guarantees: **at-most-once** and **at-least-once**.

{% callout title="Note" type="note" %}
Currently, the **effectively-once** delivery guarantee is not supported, because Amazon EventBridge cannot offer the support of the Sink downstream system.
{% /callout %}

### Data convert

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

### Metadata mapping

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

### Parallelism

You can configure the parallelism of Sink execution by using the scheduling mechanism of the Function, and multiple
sink instances will be scheduled to run on different worker nodes. Multiple sinks will consume messages together
according to the configured subscription mode.

Since EventBus doesn't need to guarantee sequentiality, the connectors support the `shared` subscription model.

To increase the write throughput, you can configure the following:

```jsx
parallelism = 4
```

> When `retainOrdering` is set to `false`, the `Shared` subscription mode is used.

### Batch Put

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

### Retry Put

In AWS Event Bridge, about Handling failures with PutEvents, It suggests retrying each error
message [until it succeeds](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevents.html).

This connector will provide two flow configs for the controller's retry strategy:

```jsx
maxRetryCount: 100 // Maximum retry send event count, when event send failed.
intervalRetryTimeMs: 1000 //The interval time(milliseconds) for each retry, when event send failed.
```

## More Links
- [GitHub Repo](https://github.com/streamnative/pulsar-io-aws-eventbridge)
- [Announcing the Amazon EventBridge Sink Connector for Apache Pulsar](https://streamnative.io/blog/announcing-the-amazon-eventbridge-sink-connector-for-apache-pulsar)
- [Amazon EventBridge connector is now integrated with StreamNative Cloud](https://streamnative.io/blog/amazon-eventbridge-connector-is-now-integrated-with-streamnative-cloud)


