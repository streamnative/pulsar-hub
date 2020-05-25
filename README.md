# StreamNative Hub

StreamNative Hub is an online service for finding, reviewing, and downloading extensions for the Apache Pulsar ecosystem.
It highlights features, richer component descriptions, links to external resources for the components, and installation
and support information.

The StreamNative Hub currently hosts the following extensions for Pulsar ecosystem.

- Connectors (source & sink)
- Offloaders
- Protocol handlers
- Authentication plugins
- Integrations with data processing engines
- Interceptors
- ... and more


## How to add your plugins

If a new plugin is introduced, you should upload the plugin to the target category. Currently, the StreamNative supports the following categories for the plugin.

- Authentication
- Connector
- Data processing
- Deployment
- Handler
- Logging
- Monitoring
- Offloader

If a new category is required, you can create it. For details about how to create a new category, see [create new category](#create-new-category).

### Prepare for uploading plugin

This section describes operations to be performed before creating a PR (Pull Request) for a plugin.

- Clone the [pulsar-hub](https://github.com/streamnative/pulsar-hub) repository to the local.
- Create a sub-folder under the cloned [pulsar-hub](https://github.com/streamnative/pulsar-hub) repository and put the document in this sub-folder. The sub-folder name is set to the version of the plugin to be submitted, such as `2.5.1`.
- Put the plugin image in the `image` folder under the cloned [pulsar-hub](https://github.com/streamnative/pulsar-hub) repository.

### Create new category

To create a new category, follow these steps:

1. Create a branch based on the latest [pulsar-hub](https://github.com/streamnative/pulsar-hub) master repository.
2. Create a sub-folder under the `pulsar-hub` folder in the local. Set the name of the sub-folder to the category name with lower cases. If the category name consists of multiple words, use the hyphen (-) between these words, such as `data-processing`.

### Create plugin document

To create a document for a new plugin, follow these steps:

1. Create a branch based on the latest [pulsar-hub](https://github.com/streamnative/pulsar-hub) master repository.
2. Create a document in the target folder for the plugin. For the document template about the plugin, see [plugin document template](#plugin-document-template).
3. Commit your updates, create a PR, and then publish the PR to the [pulsar-hub](https://github.com/streamnative/pulsar-hub) master repository.
4. Update comments, if any.
5. If no more comment, ask reviewers to approve the PR and merge the PR to the master.

## Plugin document template

This section describes a plugin document structure, including the following two parts:
- Metadata
- Body text

### Metadata

The metadata of a plugin consists of the following fields:

```yaml
description:
author: 
contributors: 
language: 
document:
source: 
license: 
tags: 
alias: 
features:
license_link: 
icon: 
download: 
support:
support_link:
support_image:
dockerfile:
owner_name:
owner_img:
id: 
```

The following table describes tags covered in the metadata of a plugin.

| Item | Description |
|----|----|
| description | It is a short description about the plugin.|
| author | Set the name of the author for the plugin. <li> Use square brackets ([]) and double quotation marks ("") to wrap the author name, such as ["ASF"]. <li> If there are multiple authors, use a comma to separate them, such as ["StreamNative", "Huanli Meng"].
| contributors | Set the name of the contributor for the plugin. <li> Use square brackets ([]) and double quotation marks ("") to wrap the contributor name, such as ["ASF"]. <li> If there are multiple contributors, use a comma to separate them, such as ["StreamNative", "Huanli Meng"]. |
| language | Set the language used by the plugin.|
| document | At present, leave this blank.|
| source | Set the source link address for the plugin. It is the root directory of the source code of the plugin. Use double quotation marks ("") to wrap the link address of the source, such as "https://github.com/apache/pulsar/tree/v2.3.2/pulsar-io/hdfs3". |
| license | By default, it is set to Apache License 2.0.
| tags | Set keywords for this document. <li> Use square brackets ([]) and double quotation marks ("") to wrap the keywords. <li> If there are multiple keywords, use a comma to separate them, such as  ["OpenTracing", "Jaeger", "Monitoring"]. |
| alias | It is the name displayed on the StreamNative website. The alias is case sensitive. |
| features | Describe what the plugin is used to do. Use double quotation marks ("") to wrap the download link of the NAR package of the plugin.|
| license_link | Set the license link of the plugin. Use double quotation marks ("") to wrap the license link of the plugin. |
| icon | Set the image link for the plugin. If there is no image available, leave this blank. |
| download | Set the download link for a NAR package of the plugin. Use double quotation marks ("") to wrap the download link of the NAR package of the plugin. |
| support | Set the support organization of the plugin. |
| support_link | Set the link of the support organization. |
| support_image | Set the image logo of support organization. |
| dockerfile | At present, leave this blank. |
| owner_name | Set the owner of the component. This is optional. By default, it is set to `Apache Software Foundation`. |
| owner_img | Set the picture of the component owner, this is optional, default `/images/apache-powered-by.svg` |
| id | By default, it is set to the file name of the plugin (without extension). <li> Use lower cases. Use double quotation marks ("") to wrap the ID. <li> Use hyphens (-) between words if the ID consists of multiple words, such as "open-tracing-client". |

### Body text

In general, the body text of a plugin document includes the following sections:

- Overview
- Installation
  - Prerequisites
  - Procedures
- Configuration
  - XXX configuration (XXX refers to the plugin name.)
  - Configure XXX (XXX refers to the plugin name.)
- Usage
- Monitoring (Optional)
- Security (Optional)
- Metrics (Optional)
- How it works (Optional)
- Reference (Optional)
- Troubleshooting (Optional)
- Tutorial (Optional)

```markdown
### Overview

> Describe what the plugin is used for.

### Installation

> Describe how to install or load the plugin.

#### Prerequisites

> List prerequisite used for installing the plugin, if any.

#### Procedures

> Lists how to instal the plugin.

### Configuration

> List some configuration examples to describe what the plugin can be used to do.

#### XXX configuration

> List configuration items available for the plugin. XXX refers to the plugin name.

#### Configure XXX

> How to configure the plugin through Json or Yaml file. XXX refers to the plugin name.

### Usage

> Provide an example to describe what the connector can be used to do.

### Monitoring (Optional)

> Describe how to monitor the plugin.

### Security (Optional)

> List security configurations required to be configured and how to configure it.

### Metrics (Optional)

> List metrics available for the plugin.

### How it works (Optional)

> List basic principles for the plugin to work.

### Reference (Optional)

> List additional external references, if any.

### Troubleshooting (Optional)

> List FAQs and how to troubleshoot the bugs, if any.

### Tutorial (Optional)

> List a step-by-step for the whole process.
```
