# pulsar-registry-metadata
The canonical source of pulsar-registry.org


### Workflow of adding a module to the repository

The following takes adding a module to the connector component as an example.

1. Add a folder under the connector component, such as debezium-mysql.

2. Add a folder named by version number, such as 2.2.1, 2.3.0 etc.

3. Add a yaml file, the sample content is as follows:

```yaml
description: The Debezium source connector pulls messages from MySQL to Pulsar topics.
author: ["jiazhai"]
contributors: ["jiazhai", "sijie"]
language: Java
document: "http://pulsar.apache.org/docs/en/2.3.0/io-cdc-debezium/"
source: "https://github.com/apache/pulsar/tree/branch-2.3/pulsar-io/debezium/src/main/java/org/apache/pulsar/io/debezium"
license: Apache 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["Pulsar IO", "Debezium", "MySQL", "Source"]
alias: Debezium MySQL Source
features:
  feature1: "Use debezium to sync MySQL data to pulsar"
icon: /images/connectors/debezium.png
download: "https://archive.apache.org/dist/pulsar/pulsar-2.3.0/connectors/pulsar-io-kafka-connect-adaptor-2.3.0.nar"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: ""
id: "debezium-mysql"
```

Field introduction:

* id: the module name.
* description: the module description.
* author: the module author, this is a list in yaml format, for example ['tuteng', 'jia'].
* contributors: the module contributors, this is a list in yaml format, for example ['tuteng', 'jia'].
* language: the module language.
* document: the document of the module, support HTTP link or markdown file.
* source: source of module, support HTTP link, link to code repository.
* license: license of module, support HTTP link or markdown file.
* license_link: link of license.
* tags: keywords for the module, this is a list in yaml format.
* alias: alias of module, fields for display, such as the alias of debezium-mysql is `Debezium MySQL Source`.
* features: features of modules in each version.
* icon: the icon of the module.
* download: download link of the module.
* support: community of the module.
* support_link: link of support organization.
* support_img: image logo of support organization.
* dockerfile: the dockerfile of current version, to test in the future
