---
description: support sink/source for AMQP version 1.0.0
author: gaoran10,Anonymitaet,dependabot[bot],freeznet
contributors: gaoran10,Anonymitaet,dependabot[bot],freeznet
language: Java,Shell,Dockerfile,Python
document:
source: https://github.com/streamnative/pulsar-io-amqp-1-0
license: Apache License 2.0
license_link: https://github.com/streamnative/pulsar-io-amqp-1-0/blob/master/LICENSE
tags: 
alias: AMQP 1.0 Sink Connector
features: ["support sink/source for AMQP version 1.0.0"]
icon: "/images/connectors/amqp-logo.png"
download: https://api.github.com/repos/streamnative/pulsar-io-amqp-1-0/tarball/refs/tags/v3.0.2.1
support: streamnative
support_link: https://github.com/streamnative/pulsar-io-amqp-1-0
support_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
owner_name: "streamnative"
owner_img: "https://avatars.githubusercontent.com/u/44651383?v=4"
dockerfile: https://hub.docker.com/r/streamnative/pulsar-io-amqp-1-0
sn_available: "true"
id: "amqp-1-0-sink"
---


# AMQP 1.0 sink connector

The AMQP 1.0 sink connector pulls messages from Pulsar topics and persists messages to [AMQP 1.0](https://www.amqp.org/).

![](https://raw.githubusercontent.com/streamnative/pulsar-io-amqp-1-0/v3.0.2.1/docs/amqp-1-0-sink.png)

## Quick start

### 1. Start AMQP 1.0 service

Start a service that supports the AMQP 1.0 protocol, such as [Solace](https://docs.solace.com/index.html).
```bash
docker run -d -p 8080:8080 -p:8008:8008 -p:1883:1883 -p:8000:8000 -p:5672:5672 -p:9000:9000 -p:2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
```

### 2. Create a connector

The following command shows how to use [pulsarctl](https://github.com/streamnative/pulsarctl) to create a `builtin` connector. If you want to create a `non-builtin` connector,
you need to replace `--sink-type amqp1_0` with `--archive /path/to/pulsar-io-amqp1_0.nar`. You can find the button to download the `nar` package at the beginning of the document.

{% callout title="For StreamNative Cloud User" type="note" %}
If you are a StreamNative Cloud user, you need [set up your environment](https://docs.streamnative.io/docs/connector-setup) first.
{% /callout %}

```bash
pulsarctl sinks create \
  --sink-type amqp1_0 \
  --name amqp1_0-sink \
  --tenant public \
  --namespace default \
  --inputs "Your topic name" \
  --parallelism 1 \
  --sink-config \
  '{
    "connection": {
      "failover": {
        "useFailover": true
      },
      "uris": [
        {
          "protocol": "amqp",
          "host": "localhost",
          "port": 5672,
          "urlOptions": [
            "transport.tcpKeepAlive=true"
          ]
        }
      ]
    },
    "username": "guest",
    "password": "guest",
    "queue": "user-op-queue-pulsar"
  }'
```

The `--sink-config` is the minimum necessary configuration for starting this connector, and it is a JSON string. You need to substitute the relevant parameters with your own.
If you want to configure more parameters, see [Configuration Properties](#configuration-properties) for reference.

{% callout title="Note" type="note" %}
You can also choose to use a variety of other tools to create a connector:
- [pulsar-admin](https://pulsar.apache.org/docs/3.1.x/io-use/): The command arguments for `pulsar-admin` are similar to those of `pulsarctl`. You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector ).
- [RestAPI](https://pulsar.apache.org/sink-rest-api/?version=3.1.1): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Terraform](https://github.com/hashicorp/terraform): You can find an example for [StreamNative Cloud Doc](https://docs.streamnative.io/docs/connector-create#create-a-built-in-connector).
- [Function Mesh](https://functionmesh.io/docs/connectors/run-connector): The docker image can be found at the beginning of the document.
{% /callout %}

### 2. Send messages to the topic

{% callout title="Note" type="note" %}
- If your connector is created on StreamNative Cloud, you need to authenticate your clients. See [Build applications using Pulsar clients](https://docs.streamnative.io/docs/qs-connect#jumpstart-for-beginners) for more information.
- The following sample code uses the **Apache qpid** library.
{% /callout %}

``` java
    public static void main(String[] args) {
        PulsarClient pulsarClient = PulsarClient.builder().serviceUrl("{{Your Pulsar URL}}").build();
        Producer<ByteBuffer> producer = pulsarClient.newProducer(Schema.BYTEBUFFER)
                .topic("{{The topic name that you specified when you created the connector}}")
                .create();

        JmsConnectionFactory jmsConnectionFactory = new JmsConnectionFactory();
        JMSContext jmsContext = jmsConnectionFactory.createContext();

        for (int i = 0; i < 10; i++) {
            JmsTextMessage textMessage = (JmsTextMessage) jmsContext.createTextMessage("text message - " + i);
            ByteBuf byteBuf = (ByteBuf) textMessage.getFacade().encodeMessage();
            producer.send(byteBuf.nioBuffer());
        }
        System.out.println("finish send messages.");
        jmsContext.close();
        pulsarClient.close();
    }
```

### 3. Consume data from AMQP 1.0 service

``` java
    public static void main(String[] args) {
        ConnectionFactory connectionFactory = new JmsConnectionFactory("guest", "guest", "amqp://localhost:5672");
        Connection connection = connectionFactory.createConnection();
        connection.start();
        Session session = connection.createSession();
        MessageConsumer consumer = session.createConsumer(new JmsQueue("user-op-queue-pulsar"));
        for (int i = 0; i < 10; i++) {
            JmsTextMessage textMessage = (JmsTextMessage) consumer.receive();
            System.out.println("receive msg content: " + textMessage.getText());
            textMessage.acknowledge();
        }
        consumer.close();
        session.close();
        connection.close();
    }
```

## Configuration Properties

Before using the AMQP 1.0 sink connector, you need to configure it.

You can create a configuration file (JSON or YAML) to set the following properties.

| Name                | Type       | Required                                     | Default             | Description                                                                                                                                   |
|---------------------|------------|----------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `protocol`          | String     | required if connection is not used           | "amqp"              | [deprecated: use connection instead] The AMQP protocol.                                                                                       |
| `host`              | String     | required if connection is not used           | " " (empty string)  | [deprecated: use connection instead] The AMQP service host.                                                                                   |
| `port`              | int        | required if connection is not used           | 5672                | [deprecated: use connection instead] The AMQP service port.                                                                                   |
| `connection`        | Connection | required if protocol, host, port is not used | " "  (empty string) | The connection details.                                                                                                                       |
| `username`          | String     | false                                        | " " (empty string)  | The username used to authenticate to ActiveMQ.                                                                                                |
| `password`          | String     | false                                        | " " (empty string)  | The password used to authenticate to ActiveMQ.                                                                                                |
| `queue`             | String     | false                                        | " " (empty string)  | The queue name that messages should be read from or written to.                                                                               |
| `topic`             | String     | false                                        | " " (empty string)  | The topic name that messages should be read from or written to.                                                                               |
| `activeMessageType` | String     | false                                        | 0                   | The ActiveMQ message simple class name.                                                                                                       |
| `onlyTextMessage`   | boolean    | false                                        | false               | If it is set to `true`, the AMQP message type must be set to `TextMessage`. Pulsar consumers can consume the messages with schema ByteBuffer. |

A `Connection` object can be specified as follows:

| Name       | Type                  | Required | Default            | Description                                                                                                                                                       |
|------------|-----------------------|----------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `failover` | Failover              | false    | " " (empty string) | The configuration for a failover connection.                                                                                                                      |
| `uris`     | list of ConnectionUri | true     | " " (empty string) | A list of ConnectionUri objects. When useFailover is set to true 1 or more should be provided. Currently only 1 uri is supported when useFailover is set to false |

A `Failover` object can be specified as follows:

| Name                           | Type           | Required                                         | Default            | Description                                                                                                                                                                                                                                                     |
|--------------------------------|----------------|--------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `useFailover`                  | boolean        | true                                             | false              | If it is set to true, the connection will be created from the uris provided under uris, using qpid's failover connection factory.                                                                                                                               |
| `jmsClientId`                  | String         | required if failoverConfigurationOptions is used | " " (empty string) | Identifying name for the jms Client                                                                                                                                                                                                                             |
| `failoverConfigurationOptions` | List of String | required if jmsClientId is used                  | " " (empty string) | A list of options (e.g. <key=value>). The options wil be joined using an '&', prefixed with a the jmsClientId and added to the end of the failoverUri. see also: https://qpid.apache.org/releases/qpid-jms-2.2.0/docs/index.html#failover-configuration-options |

A `ConnectionUri` object can be specified as follows:

| Name         | Type           | Required | Default            | Description                                                                                                                               |
|--------------|----------------|----------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `protocol`   | String         | true     | " " (empty string) | The AMQP protocol.                                                                                                                        |
| `host`       | String         | true     | " " (empty string) | The AMQP service host.                                                                                                                    |
| `port`       | int            | true     | 0                  | The AMQP service port.                                                                                                                    |
| `urlOptions` | List of String | false    | " " (empty string) | A list of url-options (e.g. <key=value>). The url options wil be joined using an '&', prefixed with a '?' and added to the end of the uri |



