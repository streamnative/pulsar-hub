---
description: KoP brings the native Kafka protocol support to Pulsar by introducing a Kafka protocol handler on Pulsar brokers
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: "https://github.com/streamnative/kop/tree/v0.2.0/kafka-impl"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "Kafka"]
alias: KoP
features: ["KoP brings the native Kafka protocol support to Pulsar by introducing a Kafka protocol handler on Pulsar brokers"]
icon: "/images/protocol-handler/kafka-logo.png"
download: "https://github.com/streamnative/kop/releases/download/v0.2.0/pulsar-protocol-handler-kafka-0.2.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "kop"
---


KoP (Kafka on Pulsar) is a protocol handler bringing the native Apache Kafka protocol support to Apache Pulsar. By adding the KoP to your existing Pulsar cluster, you can migrate your existing Kafka applications and services to Pulsar without modifying the code. This enables Kafka applications to leverage Pulsar’s powerful features, such as:

- Streamlined operations with enterprise-grade multi-tenancy.

- Simplified operations with a rebalance-free architecture.

- Infinite event stream retention with Apache BookKeeper and tiered storage.

- Serverless event processing with Pulsar Functions.

![](/images/protocol-handler/kop-architecture.png)

For more information about how to use KoP, see [here](https://streamnative.io/docs/v1.0.0/connect/kop/overview/).
