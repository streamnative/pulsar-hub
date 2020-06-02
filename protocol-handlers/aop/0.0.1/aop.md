---
description: AoP brings the native AMQP protocol support to Pulsar by introducing an AMQP protocol handler on Pulsar brokers.
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document: 
source: ""
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar", "AMQP", "Protocol handler"]
alias: AoP
features: ["AoP brings the native AMQP protocol support to Pulsar by introducing an AMQP protocol handler on Pulsar brokers"]
icon: "/images/protocol-handler/amqp-logo.png"
download: ""
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "aop"
---

# Overview

AoP (AMQP on Pulsar) supports AMQP0-9-1 protocol and is backed by Pulsar. AoP is implemented as a Pulsar [protocol handler](https://github.com/apache/pulsar/blob/master/pulsar-broker/src/main/java/org/apache/pulsar/broker/protocol/ProtocolHandler.java) with the protocol name of "amqp". The AoP protocol handler is built as a `nar` file, and is loaded when the Pulsar broker starts.

# Installation

To install the AoP protocol handler, follow these steps:

1. Download the NAR package of the AoP protocol handler from [here](TBD).

2. Install the AoP protocol handler.

   1. Set the configuration of the AoP protocol handler.
       
       Add the following properties and set their values in the Pulsar configuration file, such as `conf/broker.conf` or `conf/standalone.conf`.

       Property | Recommended value | Default value
       |---|---|---
       `messagingProtocols` | amqp | null
       `protocolHandlerDirectory`| Location of AoP NAR file | ./protocols
       
       **Example**

       ```
       messagingProtocols=amqp
       protocolHandlerDirectory=./protocols
       ```
       

   2. Set the AMQP server listeners.

       > #### Note
       >
       > The hostname in the AMQP server listeners should be the same one as the Pulsar broker's `advertisedAddress`.

       **Example**

       ```
       amqpListeners=amqp://127.0.0.1:5672
       advertisedAddress=127.0.0.1
       ```

3. Load the AoP protocol handler. After installing the AoP protocol handler on the Pulsar broker, you can restart the Pulsar broker to load the AoP protocol handler.

# Configuration 

The following table lists configurations available for the AoP protocol handler.

| Item | Description | Default value |
|---|---|---|
| amqpTenant | Set the AMQP on the Pulsar broker tenant. | public|
| amqpListeners | Set the AMQP service port. | amqp://127.0.0.1:5672 |
| maxNoOfChannels | Set the maximum number of channels available concurrently on a connection. | 64 |
| maxFrameSize | Set the maximum frame size on a connection. | 4 MB |
| heartBeat | Set the default heartbeat timeout on the Pulsar broker. | 60 s |
| amqpProxyPort | Set the AMQP proxy service port. | Port 5682 |
| useProxy | Enable/Disable the proxy service. | false |

# Usage

This example shows how to use the AoP protocol handler in standalone mode.

1. Download the NAR package of the AoP protocol handler from [here](TBD).

2. Install the AoP protocol handler.

   1. Set the configuration of the AoP protocol handler.
       
       Add the following properties and set their values in the Pulsar configuration file, such as `conf/broker.conf` or `conf/standalone.conf`.

       Property | Recommended value | Default value
       |---|---|---
       `messagingProtocols` | amqp | null
       `protocolHandlerDirectory`| Location of AoP NAR file | ./protocols
       
       **Example**

       ```
       messagingProtocols=amqp
       protocolHandlerDirectory=./protocols
       ```
       

   2. Set the AMQP server listeners.

       > #### Note
       >
       > The hostname in the AMQP server listeners should be the same one as the Pulsar broker's `advertisedAddress`.

       **Example**

       ```
       amqpListeners=amqp://127.0.0.1:5672
       advertisedAddress=127.0.0.1
       ```

3. Load the AoP protocol handler. After installing the AoP protocol handler on the Pulsar broker, you can restart the Pulsar broker to load the AoP protocol handler.

    ```
    $PULSAR_HOME/bin/pulsar standalone
    ```

4. Add the namespace for vhost.

    ```
    # for example, the vhost name is `vhost`
    bin/pulsar-admin namespaces create public/vhost1
    # set retention for the namespace
    bin/pulsar-admin namespaces set-retention -s 100M -t 2d public/vhost1
    ```

5. Use the RabbitMQ client to test the AoP protocol handler.

    ```
    # add RabbitMQ client dependency in your project
    <dependency>
      <groupId>com.rabbitmq</groupId>
      <artifactId>amqp-client</artifactId>
      <version>5.8.0</version>
    </dependency>
    ```

    ```
    // Java Code
    
    // create connection
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setVirtualHost("vhost1");
    connectionFactory.setHost("127.0.0.1");
    connectionFactory.setPort(5672);
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();
    
    String exchange = "ex";
    String queue = "qu";
    
    // exchange declare
    channel.exchangeDeclare(exchange, BuiltinExchangeType.FANOUT, true, false, false, null);
    
    // queue declare and bind
    channel.queueDeclare(queue, true, false, false, null);
    channel.queueBind(queue, exchange, "");
    
    // publish some messages
    for (int i = 0; i < 100; i++) {
        channel.basicPublish(exchange, "", null, ("hello - " + i).getBytes());
    }
    
    // consume messages
    CountDownLatch countDownLatch = new CountDownLatch(100);
    channel.basicConsume(queue, true, new DefaultConsumer(channel) {
        @Override
        public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
            System.out.println("receive msg: " + new String(body));
            countDownLatch.countDown();
        }
    });
    countDownLatch.await();
    
    // release resource
    channel.close();
    connection.close();
    ```
