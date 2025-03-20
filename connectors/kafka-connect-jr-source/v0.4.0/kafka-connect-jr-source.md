---
description: JR Source Connector for Apache Kafka Connect. JR (jrnd.io) is a CLI program that helps you to stream quality random data for your applications.
author: ["jrnd.io"]
contributors: ["jrnd.io"]
language: Java
document: "https://github.com/jrnd-io/jr-kafka-connect-source/blob/0.4.0/README.md"
source: "https://github.com/jrnd-io/jr-kafka-connect-source/tree/0.4.0"
license: The MIT License
tags: ["Kafka Connect", "Source"]
alias: Kafka Connect JR Source
features: ["JR Source Connector for Apache Kafka Connect"]
license_link: "https://github.com/jrnd-io/jr-kafka-connect-source/blob/0.4.0/LICENSE"
icon: "/images/connectors/kafka-connect.png"
download: "https://github.com/jrnd-io/jr-kafka-connect-source/releases/tag/0.4.0"
support: Community
support_link: "https://github.com/jrnd-io/jr-kafka-connect-source"
support_img: ""
owner_name: "The JR Project"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-jr-source"
powered_by: "Kafka Connect"
---

`kafka-connect-jr-source` is a Kafka Connect connector for generating mock data for testing and is not suitable for production scenarios. It is available in the StreamNative Cloud.

### Quick Start

1. Setup the kcctl client: [doc](https://docs.streamnative.io/docs/kafka-connect-setup)
2. Create a json file like below:
    ```json
    {
        "name": "jr-quickstart",
        "config": {
            "connector.class": "io.jrnd.kafka.connect.connector.JRSourceConnector",
            "template": "net_device",
            "topic": "net_device",
            "frequency": 5000,
            "objects": 5,
            "tasks.max": 1
        }
    }
    ```
3. Run the following command to create the connector:
    ```
    kcctl create -f <filename>.json
    ```

### Configuration

The JR Source Connector can be configured using the following properties:

| Parameter | Description | Default |
| --- | --- | --- |
| `template` | A valid JR existing template name. Skipped when `embedded_template` is set. | net_device |
| `topic` | Destination topic on Kafka | |
| `frequency` | Repeat the creation of a random object every 'frequency' milliseconds. | 5000 |
| `duration` | Set a time bound to the entire object creation. The duration is calculated starting from the first run and is expressed in milliseconds. At least one run will always been scheduled, regardless of the value for 'duration'. If not set creation will run forever. | -1 |
| `objects` | Number of objects to create at every run. | 1 |
| `key_field_name` | Name for key field, for example 'ID'. This is an _OPTIONAL_ config, if not set, objects will be created without a key. Skipped when `key_embedded_template` is set. Value for key will be calculated using JR function `key`. | |
| `key_value_interval_max` | Maximum interval value for key value, for example 150 (0 to key_value_interval_max). Skipped when `key_embedded_template` is set. | 100 |
| `value.converter` | One between `org.apache.kafka.connect.storage.StringConverter`, `io.confluent.connect.avro.AvroConverter`, `io.confluent.connect.json.JsonSchemaConverter` or `io.confluent.connect.protobuf.ProtobufConverter` | org.apache.kafka.connect.storage.StringConverter |
| `value.converter.schema.registry.url` | Only if `value.converter` is set to `io.confluent.connect.avro.AvroConverter`, `io.confluent.connect.json.JsonSchemaConverter` or `io.confluent.connect.protobuf.ProtobufConverter`. URL for Schema Registry. | |
| `key.converter` | One between `org.apache.kafka.connect.storage.StringConverter`, `io.confluent.connect.avro.AvroConverter`, `io.confluent.connect.json.JsonSchemaConverter` or `io.confluent.connect.protobuf.ProtobufConverter` | org.apache.kafka.connect.storage.StringConverter |
| `key.converter.schema.registry.url` | Only if `key.converter` is set to `io.confluent.connect.avro.AvroConverter`, `io.confluent.connect.json.JsonSchemaConverter` or `io.confluent.connect.protobuf.ProtobufConverter`. URL for Schema Registry. | |

### Available templates on StreamNative Cloud

- csv_product
- csv_user
- finance_stock_trade
- fleet_mgmt_sensors
- fleetmgmt_description
- fleetmgmt_location
- fleetmgmt_sensor
- gaming_game
- gaming_player
- gaming_player_activity
- insurance_customer
- insurance_customer_activity
- insurance_offer
- inventorymgmt_inventory
- inventorymgmt_product
- iot_device_information
- marketing_campaign_finance
- net_device
- payment_credit_card
- payment_transaction
- payroll_bonus
- payroll_employee
- payroll_employee_location
- pizzastore_order
- pizzastore_order_cancelled
- pizzastore_order_completed
- pizzastore_util
- shoestore_clickstream
- shoestore_customer
- shoestore_order
- shoestore_shoe
- shopping_order
- shopping_purchase
- shopping_rating
- siem_log
- store
- syslog_log
- user
- user_with_key
- users
- users_array_map
- util_ip
- util_userid
- webanalytics_clickstream
- webanalytics_code
- webanalytics_page_view
- webanalytics_user