---
description: Trace Pulsar messages using OpenTracing Pulsar Client
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document:
source: 
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["OpenTracing", "Pulsar"]
alias: OpenTracing Pulsar Client
features: ["Trace Pulsar messages using OpenTracing Pulsar Client"]
icon: "/images/monitoring/opentracing-logo.png"
download: "https://bintray.com/streamnative/maven/io.streamnative.pulsar-tracing/0.1.0"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "opentracing-pulsar-client"
---

OpenTracing Pulsar Client integrates Pulsar client with [OpenTracing](https://opentracing.io/) [APIs](https://javadoc.io/doc/io.opentracing/opentracing-api/latest/index.html) to trace Pulsar messages. 
  
# Installation

Before install OpenTracing Pulsar Client, make sure you meet the following requirements.

## Prerequisite

- Java 8
  
- Pulsar client 2.5.1

## Step

You can install OpenTracing Pulsar Client by adding the following dependencies.


```xml
<dependency>
    <groupId>org.apache.pulsar</groupId>
    <artifactId>pulsar-client</artifactId>
    <version>VERSION</version>
</dependency>
```

```xml
<dependency>
    <groupId>io.streamnative</groupId>
    <artifactId>opentracing-pulsar-client</artifactId>
    <version>VERSION</version>
</dependency>
```

# Usage

Before integrating OpenTracing with Pulsar client, you need to create a tracer as below.

```java
// Instantiate tracer
Tracer tracer = ...

// Optionally register tracer with GlobalTracer
GlobalTracer.register(tracer);
```

## Publish message

This example creates an interceptor for a producer and publishes messages using OpenTracing Pulsar Client.

```java
// Instantiate Producer with tracing interceptor.
Producer<String> producer = client
    .newProducer(Schema.STRING)
    .intercept(new TracingProducerInterceptor())
    .topic("your-topic")
    .create();

// Send messages.
producer.send("Hello OpenTracing!");
```

## Receive message

This example creates an interceptor for a consumer and then receives messages using OpenTracing Pulsar Client.

```java
// Instantiate Consumer with tracing interceptor.
Consumer<String> consumer = client.newConsumer(Schema.STRING)
    .topic("your-topic")
    .intercept(new TracingConsumerInterceptor<>())
    .subscriptionName("your-sub")
    .subscribe();

// Receive messages.
Message<String> message = consumer.receive();
```

## Extract span context from messages

This example extracts span context from messages using OpenTracing Pulsar Client.

```java
// To retrieve SpanContext from the message(Consumer side).
SpanContext spanContext = TracingPulsarUtils.extractSpanContext(message, tracer);
```

## Inject parent span for messages

This example injects parent span for messages using OpenTracing Pulsar Client.

```java
TypedMessageBuilder<String> messageBuilder = producer.newMessage();
// Inject parent span context
tracer.inject(context, Format.Builtin.TEXT_MAP, new TypeMessageBuilderInjectAdapter(messageBuilder));
```

# Reference

This chapter provides Pulsar-related explanations.

## Span name

Span is the primary building block of a distributed trace, representing an individual unit of work done in a distributed system. 

The patterns of span names in the OpenTracing Pulsar Client are as below.

Type|Pattern|Example
|---|---|---
Publish|To__{topic_name}|To__my-topic
Consume|From__{topic_name}__{subscription_name}|From__my-topic__my-sub

## Tag

Tag is a key:value pair that enables user-defined annotation of span to query, filter, and comprehend trace data.

### Producer

The Pulsar-related tags for a producer are as below.

Name|Description|Default value
|---|---|---
message_bus.destination|Topic name to which a producer sends.|N/A
partition|Partition index to which a producer sends.<br><br>-1 represents a non-partitioned topic.|N/A
sequenceId|Sequence ID of a message that a producer sends.|N/A

### Consumer

The Pulsar-related tags for a consumer are as below.

Name|Description|Default value
|---|---|---
message_bus.destination|Topic name from which a consumer receives.|N/A
partition|Partition index from which a consumer receives.<br><br>-1 represents a non-partitioned topic.|N/A
messageId|Message ID of a message that a consumer receives.|N/A
sequenceId|Sequence ID of a message that a consumer receives.|N/A
subscription|Subscription name of a consumer.|N/A

# How it works 

OpenTracing Pulsar Client leverages [Pulsar client interceptors](https://github.com/apache/pulsar/wiki/PIP-23%3A-Message-Tracing-By-Interceptors). 

As shown in the image below:

- When sending a message to a topic, the tracing interceptor injects a span context to the message, and the message with the span context is written to a broker. 

- When receiving a message from a topic, the tracing interceptor extracts a span context from the message. The message properties are used as the carriers of the span context.

![](/images/monitoring/opentracing-pulsar-client.png)

