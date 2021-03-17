---
description: The SQS sink connector pulls data from Pulsar topics and persists data to AWS SQS..
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/pulsar-io-sqs/tree/branch-2.7.0/src/main/java/org/apache/pulsar/ecosystem/io/sqs"
license: Apache License 2.0
tags: ["Pulsar IO", "SQS", "Sink"]
alias: SQS Sink
features: ["Use SQS sink connector to sync data from Pulsar"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/sqs-logo.png"
download: "https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.0/pulsar-io-sqs-2.7.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
owner_name: "StreamNative"
owner_img: "/images/streamnative.png" 
id: "sqs-sink"
---

The [AWS Simple Queue Service (SQS)](https://aws.amazon.com/sqs/?nc1=h_ls) sink connector pulls data from Pulsar topics and persists data to AWS SQS.

![](/images/connectors/sqs-sink.png)

# How to get 

You can get the SQS sink connector using one of the following methods:

- Download the NAR package from [here](https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.0/pulsar-io-sqs-2.7.0.nar).

- Build it from the source code.

  1. Clone the source code to your machine.

     ```bash
     git clone https://github.com/streamnative/pulsar-io-sqs
     ```

  2. Assume that `PULSAR_IO_SQS_HOME` is the home directory for the `pulsar-io-sqs` repo. Build the connector in the `${PULSAR_IO_SQS_HOME}` directory.

     ```bash
     mvn clean install -DskipTests
     ```

     After the connector is successfully built, a `NAR` package is generated under the `target` directory. 

     ```bash
     ls target
     pulsar-io-sqs-2.7.0.nar
     ```

# How to configure 

Before using the SQS sink connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `awsEndpoint` |String| false | " " (empty string) | AWS SQS end-point URL. It can be found at [here](https://docs.aws.amazon.com/general/latest/gr/sqs-service.html#sqs_region). |
| `awsRegion` | String| true | " " (empty string) | Supported AWS region. For example, us-west-1, us-west-2. |
| `awsCredentialPluginName` | String|false | " " (empty string) | Fully-qualified class name of implementation of `AwsCredentialProviderPlugin`. |
| `awsCredentialPluginParam` | String|true | " " (empty string) | JSON parameter to initialize `AwsCredentialsProviderPlugin`. |
| `queueName` | String|true | " " (empty string) | Name of the SQS queue that messages should be read from or written to. |

**Example**

* JSON 

   ```json
    {
        "tenant": "public",
        "namespace": "default",
        "name": "sqs-sink",
        "inputs": [
          "test-queue-pulsar"
        ],
        "archive": "connectors/pulsar-io-sqs-2.7.0.nar",
        "parallelism": 1,
        "configs":
        {
            "awsEndpoint": "https://sqs.us-west-2.amazonaws.com",
            "awsRegion": "us-west-2",
            "queueName": "test-queue",
            "awsCredentialPluginName": "",
            "awsCredentialPluginParam": '{"accessKey":"myKey","secretKey":"my-Secret"}'
        }
    }
    ```

* YAML

   ```yaml
   tenant: "public"
   namespace: "default"
   name: "sqs-sink"
   inputs: 
      - "test-queue-pulsar"
   archive: "connectors/pulsar-io-sqs-2.7.0.nar"
   parallelism: 1

   configs:
      awsEndpoint: "https://sqs.us-west-2.amazonaws.com"
      awsRegion: "us-west-2"
      queueName: "test-queue"
      awsCredentialPluginName: ""
      awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
    ```

# How to use

You can use the SQS sink connector as a non built-in connector or a built-in connector as below. 

## Use as non built-in connector 

If you already have a Pulsar cluster, you can use the SQS sink connector as a non built-in connector directly.

This example shows how to create an SQS sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

```
PULSAR_HOME/bin/pulsar-admin sinks create \
--archive pulsar-io-sqs-2.7.0.nar \
--sink-config-file sqs-sink-config.yaml \
--classname org.apache.pulsar.ecosystem.io.sqs.SQSSink \
--name sqs-sink
```

## Use as built-in connector

You can make the SQS sink connector as a built-in connector and use it on a standalone cluster, on-premises cluster, or K8S cluster.

### Standalone cluster

This example describes how to use the SQS sink connector to pull data from Pulsar topics and persist data to SQS in standalone mode.


1. Prepare SQS service. 
 
    For more information, see [Getting Started with Amazon SQS](https://aws.amazon.com/sqs/getting-started/).

2. Copy the NAR package of the SQS connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-sqs-2.7.0.nar PULSAR_HOME/connectors/pulsar-io-sqs-2.7.0.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the SQS sink connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sink localrun \
    --sink-type sqs \
    --sink-config-file sqs-sink-config.yaml
    ```

5. Send messages to Pulsar topics.

    ```
    PULSAR_HOME/bin/pulsar-client produce public/default/test-queue-pulsar --messages hello -n 10
    ```

6. Consume messages from the SQS queue using the [AWS SQS CLI tool](https://aws.amazon.com/cli/). 

    ```
    aws sqs receive-message --queue-url ${QUEUE_URL} --max-number-of-messages 10
    ```

    Now you can see the messages containing "Hello From Pulsar" from AWS SQS CLI.

### On-premises cluster

This example explains how to create an SQS sink connector in an on-premises cluster.

1. Copy the NAR package of the SQS connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-sqs-2.7.0.nar $PULSAR_HOME/connectors/pulsar-io-sqs-2.7.0.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sinks reload
    ```

3. Check whether the SQS sink connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks available-sinks
    ```

4. Create an SQS sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type sqs \
    --sink-config-file sqs-sink-config.yaml \
    --name sqs-sink
    ```

### K8S cluster

1. Build a new image based on the Pulsar image with the SQS sink connector and push the new image to your image registry. This example tags the new image as `streamnative/pulsar-sqs:2.7.0`.

    ```Dockerfile
    FROM apachepulsar/pulsar-all:2.7.0
    RUN curl https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.0/pulsar-io-sqs-2.7.0.nar -o /pulsar/connectors/pulsar-io-sqs-2.7.0.nar
    ```

2. Extract the previous `--set` arguments from K8S to the file `pulsar.yaml`.

    ```
    helm get values <release-name> > pulsar.yaml
    ```

3. Replace the `images` section in the `pulsar.yaml` file with the `images` section of `streamnative/pulsar-sqs:2.7.0`.

4. Upgrade the K8S cluster with the `pulsar.yaml`  file.

    ```
    helm upgrade <release-name> streamnative/pulsar \
        --version <new version> \
        -f pulsar.yaml
    ```

    > **Tip**
    >
    > For more information about how to upgrade a Pulsar cluster with Helm, see [Upgrade Guide](https://docs.streamnative.io/platform/latest/install-and-upgrade/helm/install/upgrade).


5. Create an SQS sink connector on a Pulsar cluster using the [`pulsar-admin sinks create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--24) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sinks create \
    --sink-type sqs \
    --sink-config-file sqs-sink-config.yaml \
    --name sqs-sink
    ```
