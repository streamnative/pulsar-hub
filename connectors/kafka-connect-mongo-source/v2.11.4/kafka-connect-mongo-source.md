---
description: "The official MongoDB Kafka Connect Source connector." 
author: ["MongoDB"]
contributors: ["MongoDB"]
language: Java
document: "https://www.mongodb.com/docs/kafka-connector/v1.13/"
source: "https://github.com/mongodb/mongo-kafka/tree/r2.11.4"
license: Apache License 2.0
tags: ["Kafka Connect", "Source"]
alias: Kafka Connect MongoDB Source
features: ["Reads data from MongoDB as a source into Apache Kafka topics"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/mongodb.png"
download: "https://github.com/mongodb/mongo-kafka/releases/tag/r2.11.4"
support: Community
support_link: "https://github.com/mongodb/mongo-kafka"
support_img: ""
owner_name: "MongoDB"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-mongodb-source"
powered_by: "Kafka Connect"
---

The MongoDB Kafka source connector is a Kafka Connect connector that reads data from MongoDB and writes data to Kafka topics.

### Prerequisites

- The `connection.uri` is in form of `mongodb+srv://username:password@cluster0.xxx.mongodb.net`
- Valid credentials with the `read` role on the database. For more granular access control, you can specify a custom role that allows `find`, and `changeStream` actions on the databases or collections.

### Configuration

The MongoDB Kafka source connector is configured using the following *Required* properties:

Parameter | Description 
-|-
`connection.uri` | The connection URI for the MongoDB server. 
`database` | The MongoDb database from which the connector imports data into Redpanda topics. The connector monitors changes in this database. Leave the field empty to watch all databases.
`collection` | The collection in the MongoDB database to watch. If not set, then all collections are watched.
`topic.prefix` | The prefix for the Kafka topics that the connector creates. The connector appends a database name and collection name to this prefix to create the topic name.

The full properties are also available from the [offical MongoDB Kafka Source Connector documentation](https://www.mongodb.com/docs/kafka-connector/v1.13/source-connector/configuration-properties/).
