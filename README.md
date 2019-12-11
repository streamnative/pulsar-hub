# pulsar-registry-metadata
The canonical source of pulsar-registry.org


### Workflow of adding a module to the repository

The following takes adding a module to the connector component as an example.

1. Add a folder under the connector component, such as debezium-mysql.

2. Add a folder named by version number, such as 2.2.1, 2.3.0 etc.

3. Add a yaml file, the sample content is as follows:

```yaml
name: debezium-mysql
description: The Debezium source connector pulls messages from MySQL to Pulsar topics.
author: ["jiazhai"]
contributors: ["jiazhai", "sijie"]
language: Java
document: "http://pulsar.apache.org/docs/en/2.3.0/io-cdc-debezium/"
source: "https://github.com/apache/pulsar/tree/branch-2.3/pulsar-io/debezium/src/main/java/org/apache/pulsar/io/debezium"
license: Apache 2.0
tags: ["Pulsar IO", "Debezium", "MySQL", "Source"]
alias: Debezium MySQL Source
features:
  feature1: "Use debezium to sync MySQL data to pulsar"
icon: https://debezium.io/images/color_white_debezium_type_600px.svg
download: "https://archive.apache.org/dist/pulsar/pulsar-2.3.0/connectors/pulsar-io-kafka-connect-adaptor-2.3.0.nar"
support: Apache community
dockerfile: ""
```

Field introduction:

* name: the module name.
* description: the module description.
* author: the module author, this is a list in yaml format, for example ['tuteng', 'jia'].
* contributors: the module contributors, this is a list in yaml format, for example ['tuteng', 'jia'].
* language: the module language.
* document: the document of the module, support HTTP link or markdown file.
* source: Source of module, support HTTP link, link to code repository.
* license: License of module, support HTTP link or markdown file.
* tags: keywords for the module, this is a list in yaml format.
* alias: alias of module, fields for display, such as the alias of debezium-mysql is `Debezium MySQL Source`.
* features: features of modules in each version.
* icon: the icon of the module.
* download: download link of the module.
* support: community of the module.
* dockerfile: the dockerfile of current version, to test in the future
