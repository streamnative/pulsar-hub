---
description: The SQS source connector is used to consume messages from Amazon SQS and publish them to Pulsar.
author: StreamNative
contributors: freeznet,shibd,Anonymitaet,nlu90
language: Java,Shell,Python,Dockerfile
document:
source: Private source
license: StreamNative, Inc.. All Rights Reserved
license_link: 
tags: 
alias: pulsar-io-sqs
features: ["The SQS source connector is used to consume messages from Amazon SQS and publish them to Pulsar."]
icon: "/images/connectors/sqs-logo.png"
download: 
support: streamnative
support_link: https://streamnative.io
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: 
sn_available: "true"
id: "sqs-source"
---

The [AWS Simple Queue Service (SQS)](https://aws.amazon.com/sqs/?nc1=h_ls) source connector feeds data from Amazon AWS SQS and writes data to Pulsar topics.

![](https://raw.githubusercontent.com/streamnative/pulsar-hub/refs/heads/master/images/connectors/sync/sqs-sqs-source.png)

# How to get 

You can get the SQS source connector using one of the following methods:

- Download the NAR package from [here](https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.3.8-rc-3/pulsar-io-sqs-2.7.3.8-rc-3.nar).

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
     pulsar-io-sqs-2.7.3.8-rc-3.nar
     ```

# How to configure 

Before using the SQS source connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name | Type|Required | Default | Description
|------|----------|----------|---------|-------------|
| `awsEndpoint` |String| false | "" (empty string) | AWS SQS end-point URL. It can be found at [here](https://docs.aws.amazon.com/general/latest/gr/sqs-service.html#sqs_region). |
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
        "name": "sqs-source",
        "topicName": "test-queue-pulsar",
        "archive": "connectors/pulsar-io-sqs-2.7.3.8-rc-3.nar",
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
   name: "sqs-source"
   topicName: "test-queue-pulsar"
   archive: "connectors/pulsar-io-sqs-2.7.3.8-rc-3.nar"
   parallelism: 1

   configs:
      awsEndpoint: "https://sqs.us-west-2.amazonaws.com"
      awsRegion: "us-west-2"
      queueName: "test-queue"
      awsCredentialPluginName: ""
      awsCredentialPluginParam: '{"accessKey":"myKey","secretKey":"my-Secret"}'
    ```

# How to use

You can use the SQS source connector as a non built-in connector or a built-in connector as below. 

## Use as non built-in connector 

If you already have a Pulsar cluster, you can use the SQS source connector as a non built-in connector directly.

This example shows how to create an SQS source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

```
PULSAR_HOME/bin/pulsar-admin sources create \
--archive pulsar-io-sqs-2.7.3.8-rc-3.nar \
--source-config-file sqs-source-config.yaml \
--classname org.apache.pulsar.ecosystem.io.sqs.SQSSource \
--name sqs-source
```

## Use as built-in connector

You can make the SQS source connector as a built-in connector and use it on a standalone cluster, on-premises cluster, or K8S cluster.

### Standalone cluster

This example describes how to use the SQS source connector to feed data from SQS and write data to Pulsar topics in the standalone mode.

1. Prepare SQS service. 
 
    For more information, see [Getting Started with Amazon SQS](https://aws.amazon.com/sqs/getting-started/).
 
2. Copy the NAR package to the Pulsar connectors directory.
 
    ```
    cp pulsar-io-sqs-2.7.3.8-rc-3.nar PULSAR_HOME/connectors/pulsar-io-sqs-2.7.3.8-rc-3.nar
    ```

3. Start Pulsar in standalone mode.

    ```
    PULSAR_HOME/bin/pulsar standalone
    ```

4. Run the SQS source connector locally.

    ```
    PULSAR_HOME/bin/pulsar-admin sources localrun --source-type sqs  --source-config-file sqs-source-config.yaml
    ```

5. Consume the message from the Pulsar topic.
    
    ```
    PULSAR_HOME/bin/pulsar-client consume -s "sub-products" public/default/test-queue-pulsar -n 0
    ```
6. Send a message to the SQS queue using the [AWS SQS CLI tool](https://aws.amazon.com/cli/).

    ```
    aws sqs send-message --queue-url ${QUEUE_URL} --message-body "Hello From SQS"
    ```

    Now you can see the message "Hello From SQS" from the Pulsar consumer.

### On-premises cluster

This example explains how to create an SQS source connector in an on-premises cluster.

1. Copy the NAR package of the SQS connector to the Pulsar connectors directory.

    ```
    cp pulsar-io-sqs-2.7.3.8-rc-3.nar $PULSAR_HOME/connectors/pulsar-io-sqs-2.7.3.8-rc-3.nar
    ```

2. Reload all [built-in connectors](https://pulsar.apache.org/docs/en/next/io-connectors/).

    ```
    PULSAR_HOME/bin/pulsar-admin sources reload
    ```

3. Check whether the SQS source connector is available on the list or not.

    ```
    PULSAR_HOME/bin/pulsar-admin sources available-sources
    ```

4. Create an SQS source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    $PULSAR_HOME/bin/pulsar-admin sources create \
    --source-type sqs \
    --source-config-file sqs-source-config.yaml \
    --name sqs-source
    ```

### K8S cluster

This example demonstrates how to create an SQS source connector on a K8S cluster.

1. Build a new image based on the Pulsar image with the SQS source connector and push the new image to your image registry. This example tags the new image as `streamnative/pulsar-sqs:2.7.3.8-rc-3`.

    ```Dockerfile
    FROM apachepulsar/pulsar-all:2.7.3.8-rc-3
    RUN curl https://github.com/streamnative/pulsar-io-sqs/releases/download/v2.7.3.8-rc-3/pulsar-io-sqs-2.7.3.8-rc-3.nar -o /pulsar/connectors/pulsar-io-sqs-2.7.3.8-rc-3.nar
    ```

2. Extract the previous `--set` arguments from K8S to the `pulsar.yaml` file.

    ```
    helm get values <release-name> > pulsar.yaml
    ```

3. Replace the `images` section in the `pulsar.yaml` file with the `images` section of `streamnative/pulsar-sqs:2.7.3.8-rc-3`.

4. Upgrade the K8S cluster with the `pulsar.yaml` file.

    ```
    helm upgrade <release-name> streamnative/pulsar \
        --version <new version> \
        -f pulsar.yaml
    ```

    > **Tip**
    >
    > For more information about how to upgrade a Pulsar cluster with Helm, see [Upgrade Guide](https://docs.streamnative.io/platform/latest/install-and-upgrade/helm/install/upgrade).

5. Create an SQS source connector on a Pulsar cluster using the [`pulsar-admin sources create`](http://pulsar.apache.org/tools/pulsar-admin/2.8.0-SNAPSHOT/#-em-create-em--14) command.

    ```
    PULSAR_HOME/bin/pulsar-admin sources create \
    --source-type sqs 
    --source-config-file sqs-source-config.yaml 
    --name sqs-source
    ```


