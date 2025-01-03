---
description: "The official Snowflake Kafka Connect Sink connector."
author: ["Snowflake Computing"]
contributors: ["Snowflake Computing"]
language: Java
document: "https://docs.snowflake.com/en/user-guide/kafka-connector"
source: "https://github.com/snowflakedb/snowflake-kafka-connector/tree/v2.4.1"
license: Apache License 2.0
tags: ["Kafka Connect", "Sink"]
alias: Kafka Connect Snowflake Sink
features: ["Writes data from Kafka topics to Snowflake"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/snowflake-logo.png"
download: "https://github.com/snowflakedb/snowflake-kafka-connector/releases/tag/v2.4.1"
support: Community
support_link: "https://github.com/snowflakedb/snowflake-kafka-connector"
support_img: ""
owner_name: "Snowflake Computing"
owner_img: ""
sn_available: true
dockerfile:
id: "kafka-connect-snowflake-sink"
powered_by: "Kafka Connect"
---

### Prerequisites

- A running Snowflake instance in [Snowflake](https://www.snowflake.com/en/)

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Create a Snowflake instance
3. Setup the database, user in Snowflake, please refer to: [Snowflake Documentation](https://docs.snowflake.com/en/user-guide/kafka-connector-install#creating-a-role-to-use-the-kafka-connector)
4. Setup keypair: refer to: [Using key pair authentication & key rotation](https://docs.snowflake.com/en/user-guide/kafka-connector-install#using-key-pair-authentication-key-rotation)
5. Create a secret in StreamNative Console, and save the private key's content and passphrase to the secret, please refer to: [doc](https://docs.streamnative.io/docs/kafka-connect-create#create-kafka-connect-with-secret), let's say the secret name is `gcp`, and key is `auth`
6. Create a JSON file like the following:

    ```json
    {
        "name": "snowflake-demo",
        "config": {
            "connector.class": "com.snowflake.kafka.connector.SnowflakeSinkConnector",
            "key.converter": "org.apache.kafka.connect.storage.StringConverter",
            "key.converter.schemas.enable": "false",
            "value.converter": "org.apache.kafka.connect.json.JsonConverter",
            "value.converter.schemas.enable": "false",
            "snowflake.ingestion.method": "SNOWPIPE_STREAMING",
            "snowflake.role.name": "kafka_connector_role_1",
            "snowflake.user.name": "kafka_connector_user_1",
            "snowflake.url.name": "${SNOWFLAKE_URL}:443",
            "snowflake.private.key": "${snsecret:snowflake-demo:snowflake.private.key}",
            "snowflake.private.key.passphrase": "${snsecret:snowflake-demo:snowflake.private.key.passphrase}",
            "topics": "snowflake-input",
            "snowflake.database.name": "kafka_db",
            "snowflake.schema.name": "public",
            "tasks.max": "1"
        }
    }
    ```
   
7. Run the following command to create the connector:

    ```bash
    kcctl create -f <filename>.json
    ```

### Configuration

The Snowflake Kafka sink connector is configured using the following *Required* properties:

| Parameter                 | Description                                                                                                                                                           |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`                    | The name of the connector.                                                                                                                                            |
| `connector.class`         | `com.snowflake.kafka.connector.SnowflakeSinkConnector` .                                                                                                              |
| `topics`                  | A list of Kafka topics that the sink connector watches. (You can define either the `topics` or the `topics.regex` setting, but not both.)                             |
| `topics.regex`            | A regular expression that matches the Kafka topics that the sink connector watches. (You can define either the `topics` or the `topics.regex` setting, but not both.) |
| `snowflake.url.name`      | The URL for accessing your Snowflake account.                                                                                                                         |
| `snowflake.user.name`     | User login name for the Snowflake account.                                                                                                                            |
| `snowflake.private.key`   | The private key to authenticate the user. Include only the key, not the header or footer. If the key is split across multiple lines, remove the line breaks.          |
| `snowflake.database.name` | The name of the database that contains the table to insert rows into.                                                                                                 |
| `snowflake.schema.name`   | The name of the schema that contains the table to insert rows into.                                                                                                   |
| `header.converter`        | Required only if the records are formatted in Avro and include a header.                                                                                              |
| `key.converter`           | Kafka record's key converter.                                                                                                                                         |
| `value.converter`         | Kafka record's value converter.                                                                                                                                       |

For the full list of configs, see the [Official Snowflake Kafka Connect documentation](https://docs.snowflake.com/en/user-guide/kafka-connector-install#kafka-configuration-properties)
