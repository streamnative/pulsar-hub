---
description: "The official MongoDB Kafka Connect Sink connector." 
author: ["MongoDB"]
contributors: ["MongoDB"]
language: Java
document: "https://www.mongodb.com/docs/kafka-connector/v1.13/"
source: "https://github.com/mongodb/mongo-kafka/tree/r3.3.1"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect MongoDB Sink
features: ["Persists data from Apache Kafka topics as a data sink into MongoDB"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/mongodb.png"
download: "https://github.com/mongodb/mongo-kafka/releases/tag/r3.3.1"
support: Community
support_link: "https://github.com/mongodb/mongo-kafka"
support_img: ""
owner_name: "MongoDB"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-mongodb-sink"
powered_by: "Kafka Connect"
---

The MongoDB Kafka sink connector is a Kafka Connect connector that reads data from Kafka topics and writes data to MongoDB.

### Prerequisites

- Valid credentials with the `readWrite` role on the database. For more granular access control, you can specify a custom role that allows `insert`, `remove`, and `update` actions on the databases or collections.
- The `connection.uri` is in form of `mongodb+srv://username:password@cluster0.xxx.mongodb.net`

### Limitations

If you want to use the MongoDB CDC handler for data sourced from MongoDB instances by MongoDB source connector, you will need to select `STRING` or `BYTES` as the value converter for both MongoDB source and MongoDB sink connectors. Details can be found [here](https://www.mongodb.com/docs/kafka-connector/v1.13/sink-connector/fundamentals/change-data-capture/).

### Configuration

The MongoDB Kafka sink connector is configured using the following *Required* properties:

Parameter | Description 
-|-
`connection.uri` | The connection URI for the MongoDB server. 
`database` | The MongoDB database name. 
`topics` | A list of Kafka topics that the sink connector watches. (You can define either the `topics` or the `topics.regex` setting, but not both.) 
`topics.regex` | A regular expression that matches the Kafka topics that the sink connector watches. (You can define either the `topics` or the `topics.regex` setting, but not both.) 

The full properties are also available from the [offical MongoDB Kafka Sink Connector documentation](https://www.mongodb.com/docs/kafka-connector/v1.13/sink-connector/configuration-properties/).

