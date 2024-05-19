---
description: 
author: nodece,shibd,Huanli-Meng,nicoloboschi
contributors: nodece,shibd,Huanli-Meng,nicoloboschi
language: Java,Shell,Dockerfile
document:
source: Private source
license: StreamNative, Inc.. All Rights Reserved
license_link: 
tags: 
alias: Google Cloud Pub/Sub Source Connector
features: [""]
icon: "/images/connectors/google-pubsub.svg"
download: 
support: streamnative
support_link: https://streamnative.io
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: 
sn_available: ""
id: "google-pubsub-source"
---


The [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) source connector feeds data from Google Cloud Pub/Sub topics and writes data to Pulsar topics.

![](https://raw.githubusercontent.com/streamnative/pulsar-io-google-pubsub/v3.0.4.6/docs/google-pubsub-source.png)

## Quick start

### Prerequisites

The prerequisites for connecting an Google PubSub source connector to external systems include:

1. Create Google PubSub Topic in Google Cloud.
2. Create the [Gcloud ServiceAccount](https://cloud.google.com/iam/docs/service-accounts-create) and create a public key certificate.
3. Create the [Gcloud Role](https://cloud.google.com/iam/docs/creating-custom-roles), ensure the Google Cloud role have the following permissions:
```text
- pubsub.subscriptions.consume
- pubsub.subscriptions.create
- pubsub.subscriptions.get
- pubsub.subscriptions.update
- pubsub.topics.attachSubscription
```
4. Grant the service account the above role permissions.

### 1. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--source-type google-pubsub` with `--archive /path/to/pulsar-io-google-pubsub.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sources create \
  --source-type google-pubsub \
  --name pubsub-source \
  --tenant public \
  --namespace default \
  --destination-topic-name "Your topic name" \
  --parallelism 1 \
  --source-config \
  '{
    "pubsubProjectId": "Your google pubsub project Id", 
    "pubsubTopicId": "Your google pubsub Topic name",
    "pubsubCredential": "The escaped and compressed public key certificate you created above"
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
 
### 2. Write data to Google PubSub topic

Send some messages to the Google Cloud PubSub using the [gcloud CLI tool](https://cloud.google.com/sdk/docs/install)

```shell
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-0"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-1"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-2"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-3"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-4"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-5"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-6"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-7"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-8"
gcloud pubsub topics publish {{Your PubSub Topic Name}} --message="my-message-9"
```

### 3. Show data by Pulsar Consumer

{% callout title="Note" type="note" %}
If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
{% /callout %}

```java
    public static void main(String[] args) {
        PulsarClient client = PulsarClient.builder()
            .serviceUrl("{{Your Pulsar URL}}")
            .build();

        Consumer<GenericRecord> consumer = client.newConsumer(Schema.AUTO_CONSUME())
                                                 .topic("{{The topic name that you specified when you created the connector}}")
                                                 .subscriptionName(subscription)
                                                 .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
                                                 .subscribe();
        Consumer<byte[]> consumer = client.newConsumer()
                .topic("{{The topic name that you specified when you created the connector}}")
                .subscriptionName("test-sub")
                .subscriptionInitialPosition(SubscriptionInitialPosition.Earliest)
                .subscribe();

        for (int i = 0; i < 10; i++) {
          Message<byte[]> msg = consumer.receive();
          consumer.acknowledge(msg);
          System.out.println("Receive message " + new String(msg.getData()));
        }
        client.close();  
    }
    // output
    // Receive message my-message-0
    // Receive message my-message-1
    // Receive message my-message-2
    // Receive message my-message-3
    // Receive message my-message-4
    // Receive message my-message-5
    // Receive message my-message-6
    // Receive message my-message-7
    // Receive message my-message-8
    // Receive message my-message-9
```


## Configuration Properties

Before using the Google PubSub source connector, you need to configure it. This table outlines the properties and the descriptions.

| Name                     | Type   | Required | Sensitive | Default            | Description                                                                                                                                                        |
|--------------------------|--------|----------|-----------|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pubsubCredential`       | String | true     | true      | "" (empty string)  | The credential (JSON string) for accessing the Google Cloud. It needs to be compressed and escaping before use.                                                    |
| `pubsubProjectId`        | String | true     | false     | "" (empty string)  | The Google Cloud project ID.                                                                                                                                       |
| `pubsubTopicId`          | String | true     | false     | " " (empty string) | The topic ID. It is used to read messages from or write messages to Google Cloud Pub/Sub topics.                                                                   |


