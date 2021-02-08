---
description: The AWS SQS sink connector pulls messages from Pulsar topics and persist messages to Amazon AWS SQS.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-sqs/tree/v2.7.0"
license: Apache License 2.0
tags: ["Pulsar IO", "AWS", "SQS", "Sink"]
alias: SQS Sink
features: ["Use SQS sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/aws_sqs.png"
download: "https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.0/pulsar-io-sqs-2.7.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile:
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
id: "sqs-sink"
---

The AWS SQS sink connector pulls messages from Pulsar topics and persist messages to AWS SQS.

# Installation

To install the SQS sink connector, follow these steps.

1. Download the NAR package of the SQS sink connector from [here](https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.0/pulsar-io-sqs-2.7.0.nar).

2. Put the NAR package `pulsar-io-sqs-2.7.0.nar` in the pulsar connectors catalog.

    ```
    cp pulsar-io-sqs-2.7.0.nar $PULSAR_HOME/connectors/pulsar-io-sqs-2.7.0.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the SQS sink connector locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin sink localrun --sink-config-file sqs-sink-config.yaml
    ```

# Configuration

The configuration of the SQS sink connector has the following properties.

## SQS sink connector configuration

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `awsEndpoint` |String| false | "tcp" | AWS SQS end-point url. It can be found at [here](https://docs.aws.amazon.com/general/latest/gr/rande.html) |
| `awsRegion` | String| true | " " (empty string) | Appropriate aws region. E.g. us-west-1, us-west-2 |
| `awsCredentialPluginName` | String|false | " " (empty string) | Fully-Qualified class name of implementation of AwsCredentialProviderPlugin. |
| `awsCredentialPluginParam` | String|true | " " (empty string) | json-parameters to initialize `AwsCredentialsProviderPlugin` |
| `queueName` | String|false | " " (empty string) | The SQS queue name that messages should be read from or written to. |

## Configure SQS sink connector

Before using the SQS sink connector, you need to create a configuration file through one of the following methods.

* JSON 

    ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "sqs-sink",
        "inputs": ["test-queue-pulsar"],
        "archive": "connectors/pulsar-io-sqs-2.7.0.nar",
        "parallelism": 1,
        "configs":
        {
            "awsEndpoint": "https://dynamodb.us-west-2.amazonaws.com",
            "awsRegion": "us-east-1",
            "queueName": "test-queue",
            "awsCredentialPluginName": "",
            "awsCredentialPluginParam": '{"accessKey":"myKey","secretKey":"my-Secret"}',
        }
    }
    ```

# Usage

This section describes how to use the SQS sink connector to pull messages from Pulsar topics to AWS SQS.

1. Prepare SQS service according to [amazon aws documents](https://aws.amazon.com/sqs/getting-started/).

2. Put the `pulsar-io-sqs-2.7.0.nar` in the pulsar connectors catalog.

    ```
    cp pulsar-io-sqs-2.7.0.nar $PULSAR_HOME/connectors/pulsar-io-sqs-2.7.0.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Run SQS sink locally.

    ```
    $PULSAR_HOME/bin/pulsar-admin sink localrun --sink-config-file sqs-sink-config.yaml
    ```

5. Send Pulsar messages.

    ```
    $PULSAR_HOME/bin/pulsar-client produce public/default/test-queue-pulsar --messages hello -n 10
    ```

6. Consume SQS messages.

    use aws sqs cli tool to consume messages. 

    ```
    aws sqs receive-message --queue-url ${QUEUE_URL} --max-number-of-messages 10
    ```