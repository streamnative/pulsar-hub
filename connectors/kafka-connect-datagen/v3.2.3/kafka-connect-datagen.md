---
description: kafka-connect-datagen is a Kafka Connect connector for generating mock data for testing and is not suitable for production scenarios. 
author: ["Confluent"]
contributors: ["Confluent"]
language: Java
document: "https://github.com/confluentinc/kafka-connect-datagen/blob/v3.2.3/README.md"
source: "https://github.com/confluentinc/kafka-connect-datagen/tree/v3.2.3"
license: Apache License 2.0
tags: ["Kafka Connect", "Source"]
alias: Kafka Connect Datagen Source
features: ["Generating mock data for testing on Kafka protocol"]
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
icon: "/images/connectors/kafka-connect.png"
download: "https://github.com/confluentinc/kafka-connect-datagen/releases/tag/v3.2.3"
support: Community
support_link: "https://github.com/confluentinc/kafka-connect-datagen"
support_img: ""
owner_name: "Confluent"
owner_img: ""
sn_available: true
dockerfile: 
id: "kafka-connect-datagen-source"
powered_by: "Kafka Connect"
---

`kafka-connect-datagen` is a Kafka Connect connector for generating mock data for testing and is not suitable for production scenarios. It is available in the StreamNative Cloud.

### Configuration

The `kafka-connect-datagen` connector is configured using the following properties:

Parameter | Description | Default
-|-|-
`kafka.topic` | Topic to write to | 
`max.interval` | Max interval between messages (ms) | 500
`iterations` | Number of messages to send from each task, or less than 1 for unlimited | -1
`schema.string` | The literal JSON-encoded Avro schema to use. Cannot be set with `schema.filename` or `quickstart`.
`schema.filename` | Filename of schema to use. Cannot be set with `schema.string` or `quickstart`. This config is not enabled on StreamNative Cloud.
`schema.keyfield` | Name of field to use as the message key
`quickstart` | Name of [quickstart](https://github.com/confluentinc/kafka-connect-datagen/tree/v3.2.3/src/main/resources) to use. Cannot be set with `schema.string` or `schema.filename`

For full details, see the [offical kafka-connect-datagen documentation](https://github.com/confluentinc/kafka-connect-datagen/blob/v3.2.3/README.md).

### Using the bundled schema

The `quickstart` property can be set to one of the following values:

Value | Description
-|-
`clickstream_codes` | Generates clickstream codes data
`clickstream` | Generates clickstream data
`clickstream_users` | Generates clickstream users data
`orders` | Generates order data
`ratings` | Generates ratings data
`users` | Generates user data
`users_` | Generates alternative user data
`pageviews` | Generates pageview data
`stock_trades` | Generates stock trade data
`inventory` | Generates inventory data
`product` | Generates product data
`purchases` | Generates purchase data
`transactions` | Generates transaction data
`stores` | Generates store data
`creadit_cards` | Generates credit card data
`campaign_finance` | Generates campaign finance data
`fleet_mgmt_description` | Generates fleet management description data
`fleet_mgmt_location` | Generates fleet management location data
`fleet_mgmt_sensors` | Generates fleet management sensor data
`pizza_orders` | Generates pizza order data
`pizza_orders_completed` | Generates completed pizza order data
`pizza_orders_cancelled` | Generates cancelled pizza order data
`insurance_offers` | Generates insurance offer data
`insurance_customers` | Generates insurance customer data
`insurance_customer_activity` | Generates insurance customer activity data
`gaming_games` | Generates gaming game data
`gaming_players` | Generates gaming player data
`gaming_player_activity` | Generates gaming player activity data
`payroll_employee` | Generates payroll employee data
`payroll_empolyee_location` | Generates payroll employee location data
`payroll_bonus` | Generates payroll bonus data
`syslog_logs` | Generates syslog log data
`device_information` | Generates device information data
`siem_logs` | Generates SIEM log data
`shoes` | Generates shoe data
`shoe_customers` | Generates shoe customer data
`shoe_orders` | Generates shoe order data
`shoe_clickstream` | Generates shoe clickstream data

