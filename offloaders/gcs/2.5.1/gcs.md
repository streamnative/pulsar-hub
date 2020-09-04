---
description: Use GCS offloader with Pulsar
author: ["ASF"]
contributors: ["ASF"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/master/tiered-storage/jcloud"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["GCS", "Offloader", "Pulsar"]
alias: GCS offloader
features: ["Offload data from BookKeeper to GCS"]
icon: "/images/offloaders/gcs/gcs-logo.png"
download: "https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/streamnative.png"
owner_name: "StreamNative"
owner_img: "/images/streamnative.png"
dockerfile: 
id: "gcs"
---

# Overview

To deliver an event streaming service, Pulsar needs to manage large numbers of messages and data in real-time, and this requires keeping large amounts of data on the platform, or readily accessible. As the data amount increases, it becomes significantly more expensive to store, manage, and retrieve data, so administrators and developers look to external stores for long-term storage. 

Pulsar leverages a unique **tiered storage** solution that addresses some of these key challenges faced by other distributed log systems. This tiered storage solution extends the storage capabilities of Pulsar by offloading data from Apache BookKeeper to scalable cloud-native storage or filesystems without adding storage. Older topic data can be offloaded to long-term storage that readily scales with the volume of data. 

* Tiered storage uses [Apache jclouds](https://jclouds.apache.org) to support
[Amazon S3](https://aws.amazon.com/s3/) and [GCS (Google Cloud Storage)](https://cloud.google.com/storage/) for long term storage. 


    With jclouds, it is easy to add support for more
[cloud storage providers](https://jclouds.apache.org/reference/providers/#blobstore-providers) in the future.

* Tiered storage uses [Apache Hadoop](http://hadoop.apache.org/) to support file systems for long term storage. 

    With Hadoop, it is easy to add support for more file systems in the future.

In this way, on the one hand, tiered storage is much cheaper than the storage in Pulsar clusters; on the other hand, there is no perceivable difference in consuming a topic no matter whether data is stored on tiered storage or on Pulsar clusters. They produce and consume messages in exactly the same way.

Additionally, Pulsar is able to retain both historic and real-time data and provides a unified view as infinite event streams, which can be easily reprocessed or backloaded into new systems. You can integrate Pulsar with a unified data processing engine (such as Apache Flink or Apache Spark) to unlock many new use cases stemming from infinite data retention.

# Installation

Follow the steps below to install the GCS offloader.

## Prerequisite
  
- Apache jclouds: 2.2.0 or later versions

## Step

1. Download Pulsar tarball using one of the following ways:

   * download the Pulsar tarball from the [Apache mirror](https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz)

   * download from the Pulsar [download page](https://pulsar.apache.org/download)

   * use [wget](https://www.gnu.org/software/wget)

     ```shell
     wget https://archive.apache.org/dist/pulsar/pulsar-2.5.1/apache-pulsar-2.5.1-bin.tar.gz
     ```

2. Download and untar the Pulsar offloaders package. 

    ```bash
    wget https://downloads.apache.org/pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz

    tar xvfz apache-pulsar-offloaders-2.5.1-bin.tar.gz
    ```

    > #### Note
    >
    > * If you are running Pulsar in a bare metal cluster, make sure that `offloaders` tarball is unzipped in every broker's Pulsar directory.
    > 
    > * If you are running Pulsar in Docker or deploying Pulsar using a Docker image (such as K8S and DCOS), you can use the `apachepulsar/pulsar-all` image instead of the `apachepulsar/pulsar` image. `apachepulsar/pulsar-all` image has already bundled tiered storage offloaders.

3. Copy the Pulsar offloaders as `offloaders` in the Pulsar directory.

    ```
    mv apache-pulsar-offloaders-2.5.1/offloaders apache-pulsar-2.5.1/offloaders

    ls offloaders
    ```

    **Output**

    As shown in the output, Pulsar uses [Apache jclouds](https://jclouds.apache.org) to support GCS and AWS S3 for long term storage. 


    ```
    tiered-storage-file-system-2.5.1.nar
    tiered-storage-jcloud-2.5.1.nar
    ```

# Configuration

> #### Note
> 
> Before offloading data from BookKeeper to GCS, you need to configure some properties of the GCS offloader driver. 

Besides, you can also configure the GCS offloader to run it automatically or trigger it manually.

## Configure GCS offloader driver

You can configure GCS offloader driver in the configuration file `broker.conf` or `standalone.conf`.

- **Required** configurations are as below.

    **Required** configuration | Description | Example value
    |---|---|---
    `managedLedgerOffloadDriver`|Offloader driver name, which is case-insensitive.|google-cloud-storage
    `offloadersDirectory`|Offloader directory|offloaders
    `gcsManagedLedgerOffloadBucket`|Bucket|pulsar-topic-offload
    `gcsManagedLedgerOffloadRegion`|Bucket region|europe-west3
    `gcsManagedLedgerOffloadServiceAccountKeyFile`|Authentication |/Users/user-name/Downloads/project-804d5e6a6f33.json

- **Optional** configurations are as below.

    Optional configuration|Description|Example value
    |---|---|---
    `gcsManagedLedgerOffloadReadBufferSizeInBytes`|Size of block read|1 MB
    `gcsManagedLedgerOffloadMaxBlockSizeInBytes`|Size of block write|64 MB
    `managedLedgerMinLedgerRolloverTimeMinutes`|Minimum time between ledger rollover for a topic.|2
    `managedLedgerMaxEntriesPerLedger`|Max number of entries to append to a ledger before triggering a rollover.|5000

### Bucket (required)

A bucket is a basic container that holds your data. Everything you store in GCS **must** be contained in a bucket. You can use a bucket to organize your data and control access to your data, but unlike directory and folder, you can not nest a bucket.

#### Example

This example names the bucket as _pulsar-topic-offload_.

```conf
gcsManagedLedgerOffloadBucket=pulsar-topic-offload
```

### Bucket region (required)

Bucket region is the region where a bucket is located. If a bucket region is not specified, the **default** region (`us multi-regional location`) is used.

> #### Tip
>
> For more information about bucket location, see [here](https://cloud.google.com/storage/docs/bucket-locations).

#### Example

This example sets the bucket region as _europe-west3_.

```
gcsManagedLedgerOffloadRegion=europe-west3
```

### Authentication (required)

To enable a broker access GCS, you need to configure `gcsManagedLedgerOffloadServiceAccountKeyFile` in the configuration file `broker.conf`. 

`gcsManagedLedgerOffloadServiceAccountKeyFile` is
a JSON file, containing GCS credentials of a service account.

#### Example

To generate service account credentials or view the public credentials that you've already generated, follow the following steps.

1. Navigate to the [Service accounts page](https://console.developers.google.com/iam-admin/serviceaccounts).

2. Select a project or create a new one.

3. Click **Create service account**.

4. In the **Create service account** window, type a name for the service account and select **Furnish a new private key**. 

    If you want to [grant G Suite domain-wide authority](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority) to the service account, select **Enable G Suite Domain-wide Delegation**.

5. Click **Create**.

    > #### Note
    >
    > Make sure the service account you create has permission to operate GCS, you need to assign **Storage Admin** permission to your service account [here](https://cloud.google.com/storage/docs/access-control/iam).

6. You can get the following information and set this in `broker.conf`.
   
    ```conf
    gcsManagedLedgerOffloadServiceAccountKeyFile="/Users/user-name/Downloads/project-804d5e6a6f33.json"
    ```

    > #### Tip
    >
    > - For more information about how to create `gcsManagedLedgerOffloadServiceAccountKeyFile`, see [here](https://support.google.com/googleapi/answer/6158849).
    >
    > - For more information about Google Cloud IAM, see [here](https://cloud.google.com/storage/docs/access-control/iam).

### Size of block read/write

You can configure the size of a request sent to or read from GCS in the configuration file `broker.conf`. 

Configuration|Description
|---|---
`gcsManagedLedgerOffloadReadBufferSizeInBytes`|Block size for each individual read when reading back data from GCS.<br><br>The **default** value is 1 MB.
`gcsManagedLedgerOffloadMaxBlockSizeInBytes`|Maximum size of a "part" sent during a multipart upload to GCS. <br><br>It **can not** be smaller than 5 MB. <br><br>The **default** value is 64 MB.

## Configure GCS offloader to run automatically

Namespace policy can be configured to offload data automatically once a threshold is reached. The threshold is based on the size of data that a topic has stored on a Pulsar cluster. Once the topic reaches the threshold, an offload operation is triggered automatically. 

Threshold value|Action
|---|---
> 0 | It triggers the offloading operation if the topic storage reaches its threshold.
= 0|It causes a broker to offload data as soon as possible.
< 0 |It disables automatic offloading operation.

Automatic offloading runs when a new segment is added to a topic log. If you set the threshold on a namespace, but few messages are being produced to the topic, offload does not work until the current segment is full.

You can configure the threshold size using CLI tools, such as [pulsarctl](https://streamnative.io/docs/v1.0.0/manage-and-monitor/pulsarctl/overview/) or pulsar-admin.

The offload configurations in `broker.conf` and `standalone.conf` are used for the namespaces that do not have namespace level offload policies. Each namespace can have its own offload policy. If you want to set offload policy for each namespace, use the command [`pulsar-admin namespaces set-offload-policies options`](http://pulsar.apache.org/tools/pulsar-admin/2.6.0-SNAPSHOT/#-em-set-offload-policies-em-) command.

### Example

This example sets the GCS offloader threshold size to 10 MB using pulsarctl.

```bash
bin/pulsarctl namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

> #### Tip
>
> For more information about the `pulsarctl namespaces set-offload-threshold options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-offload-threshold-em-). 

## Configure GCS offloader to run manually

For individual topics, you can trigger GCS offloader manually using the following methods:

- Use REST endpoint 

- Use CLI tools (such as pulsarctl or pulsar-admin). 

    To trigger the GCS via CLI tools, you need to specify the maximum amount of data (threshold) that should be retained on a Pulsar cluster for a topic. If the size of the topic data on the Pulsar cluster exceeds this threshold, segments from the topic are moved to GCS until the threshold is no longer exceeded. Older segments are moved first.

### Example

- This example triggers GCS offloader to run manually using pulsarctl with the command `pulsarctl topic offload (topic-name) (threshold)`.

    ```bash
    bin/pulsarctl topics offload persistent://my-tenant/my-namespace/topic1 10M
    ``` 

    **Output**

    ```bash
    Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl topics offload options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-em-). 

- This example checks GCS offloader status using pulsarctl with the command `pulsarctl topic offload-status options`.

    ```bash
    bin/pulsarctl topics offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```bash
    Offload is currently running
    ```

    To wait for GCS to complete the job, add the `-w` flag.

    ```bash
    bin/pulsarctl topics offload-status -w persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```
    Offload was a success
    ```

    If there is an error in offloading, the error is propagated to the `pulsarctl topic offload-status` command.

    ```bash
    bin/pulsarctl topic offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```
    Error in offload
    null

    Reason: Error offloading: org.apache.bookkeeper.mledger.ManagedLedgerException: java.util.concurrent.CompletionException: com.amazonaws.services.s3.model.AmazonS3Exception: Anonymous users cannot initiate multipart uploads.  Please authenticate. (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied; Request ID: 798758DE3F1776DF; S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=), S3 Extended Request ID: dhBFz/lZm1oiG/oBEepeNlhrtsDlzoOhocuYMpKihQGXe6EG8puRGOkK6UwqzVrMXTWBxxHcS+g=
    ````

    > #### Tip
    >
    > For more information about the `pulsarctl topics offload-status options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-status-em-). 

# Usage

This tutorial provides step-by-step instructions on how to use GCS with Pulsar.

## Step 1: configure GCS offloader driver

As indicated in the [configuration chapter](#configuration) before using the GCS offloader, you need to configure some properties for the GCS offloader driver. This tutorial assumes that you have configured the GCS offloader driver in `standalone.conf` as below and run Pulsar in **standalone** mode.

```conf
managedLedgerOffloadDriver=google-cloud-storage

gcsManagedLedgerOffloadBucket=pulsar-topic-offload-1

gcsManagedLedgerOffloadRegion=europe-west3

gcsManagedLedgerOffloadServiceAccountKeyFile=/Users/user-name/Downloads/affable-ray-226821-6251d04987e9.json

offloadersDirectory=offloaders

managedLedgerMinLedgerRolloverTimeMinutes=2 

managedLedgerMaxEntriesPerLedger=5000
```

## Step 2: create GCS bucket 

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/), and select **Storage** at the left navigation panel.

    ![](/images/offloaders/gcs/start.png)

2. To create a GCS bucket, click **Browser** > **CREATE BUCKET**.

    > #### Note
    > 
    > To ensure broker can access the bucket, you need to assign **Storage Object Creator** and **Storage Object Viewer** roles to your service account. For how to assign roles to your service account, see [Step 4: grant access to GCS service account](#step-4-grant-access-to-gcs-service-account).

    ![](/images/offloaders/gcs/create-bucket.png)

3. Name your bucket. 

    The bucket name should be the same as the value of `gcsManagedLedgerOffloadBucket` that you configured in [Step 1: configure GCS offloader driver](#step-1-configure-gcs-offloader-driver).

    ![](/images/offloaders/gcs/bucket-name.png)

4. Set your bucket region. 

    The bucket region should be the same as the value of `gcsManagedLedgerOffloadRegion` that you configured in [Step 1: configure GCS offloader driver](#step-1-configure-gcs-offloader-driver).

    ![](/images/offloaders/gcs/bucket-range.png)

5. Click **Create**. 

    Now you have successfully created a GCS bucket.

    ![](/images/offloaders/gcs/complete.png)

## Step 3: create GCS service account

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/), and select **IAM & Admin** at the left navigation panel.

    ![](/images/offloaders/gcs/start-2.png)


2. To create a new service account, click **Service Accounts** > **CREATE SERVICE ACCOUNT**.

	![](/images/offloaders/gcs/create-service-account.png)

3. Name your service account.
   
   The service account ID is automatically generated.

    ![](/images/offloaders/gcs/create-1.png)

4. Click **Create**.

5. Grant privilege to your service account.

	This tutorial skips this task here and completes it in [Step 4: grant access to GCS service account](#step-4-grant-access-to-gcs-service-account). 
    
    Click **Continue**.

6. Click **CREATE KEY**.

    ![](/images/offloaders/gcs/create-key.png)

7. Click **JSON** > **Create**, and **save this JSON file to your local machine**.

	The JSON file is the value you need to set for `gcsManagedLedgerOffloadServiceAccountKeyFile` in `broker.conf`.

    ![](/images/offloaders/gcs/create-key-2.png)

8. Copy the key ID in the JSON file to the **key ID** field and click **Done**.

    ![](/images/offloaders/gcs/key-id.png)

## Step 4: grant access to GCS service account

1. On **IAM and Admin** homepage, click **IAM** > **Add**.

    ![](/images/offloaders/gcs/add.png)

2. Fill in your GCS service account name that you created in [Step 3](#step-3).

    ![](/images/offloaders/gcs/add-1.png)

3. Assign **Storage Object Creator** and **Storage Object Viewer** roles to your service account.

    ![](/images/offloaders/gcs/select-2.png)

4. Click **Save**.

## Step 5: offload data from BookKeeper to GCS

Execute the following commands in the repository where you download Pulsar tarball. For example, `~/path/to/apache-pulsar-2.5.1`.

1. Start Pulsar standalone.

    ```
    ./bin/pulsar standalone -a 127.0.0.1
    ```

2. To ensure the data generated is not deleted immediately, it is recommended to set the [retention policy](https://pulsar.apache.org/docs/en/next/cookbooks-retention-expiry/#retention-policies), which can be either a **size** limit or a **time** limit. The larger value you set for the retention policy, the longer the data can be retained.

    ```
    ./bin/pulsarctl namespaces set-retention public/default --size 10G --time 3d
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl namespaces set-retention options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-retention-em-). 

3. Produce data using pulsar-perf. 

    ```
    ./bin/pulsar-perf produce -r 1000 -s 2048 test-topic
    ```

4. The offloading operation starts after a ledger rollover is trigged. To ensure offload data successfully, it is recommended that you wait until several ledger rollovers are triggered. In this case, you might need to wait for a second. You can check the ledger status using pulsarctl.
 
    ```
    ./bin/pulsarctl topics internal-stats test-topic
    ```

	**Output**

	As shown below, there are ledger 10, ledger 11, and ledger 12 in the output.

	```bash
	"entriesAddedCounter" : 107982,
    "numberOfEntries" : 107982,
    "totalSize" : 508276193,
    "currentLedgerEntries" : 1953,
    "currentLedgerSize" : 9167863,
    "lastLedgerCreatedTimestamp" : "2020-05-12T00:07:27.273+08:00",
    "waitingCursorsCount" : 0,
    "pendingAddEntriesCount" : 1,
    "lastConfirmedEntry" : "12:1951",
    "state" : "LedgerOpened",
    "ledgers" : [ {
        "ledgerld" : 10,
        "entries" : 52985,
        "size" : 249500259,
        "offloaded" : false
    }, {
        "ledgerld" : 11,
        "entries" : 53045,
        "size" : 249614295,
        "offloaded" : false
    }, {
        "ledgerId" : 12,
        "entries" : 0,
        "size" : 0,
        "offloaded" : false
    }, ]
    "cursors" : {  }
    ```
    
    > #### Tip
    >
    > For more information about the `pulsarctl topics internal-stats options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-internal-stats-em-). 

5. After ledger rollover, trigger the offloading operation manually. 

	You can also trigger the offloading operation automatically. For more information, see [Configure GCS offloader to run automatically](#configure-gcs-offloader-to-run-automatically).

    ```
    ./bin/pulsarctl topics offload --size-threshold 10M public/default/test-topic
    ```

    **Output**

    ```
    Offload triggered for persistent://public/default/test-topic for messages before 12:0:-1
    ```
    
    > #### Tip
    >
    > For more information about the `pulsarctl topics offload options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-em-). 

6. Check the offloading operation status.

	```
    ./bin/pulsarctl topics offload-status -w public/default/test-topic
    ```
	
	You might need to wait for a while until the offloading operation finishes.

    **Output**

    ```
    Offload was a success
    ```
    
    > #### Tip
    >
    > For more information about the `pulsarctl topics offload-status options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-status-em-). 

	At last, you can see the data is offloaded to GCS successfully.

    ![](/images/offloaders/gcs/storage.png)

# How it works

Pulsar's **segment oriented architecture** allows for topic backlogs to effectively grow very large without limit. However, this can become expensive over time. One way to alleviate this cost is to use **tiered storage**. With tiered storage, older messages in the backlog can be moved from BookKeeper to a cheaper storage mechanism, while still allowing clients to access the backlog as if nothing had changed.

Currently, Pulsar supports **AWS S3**, **GCS**, and **filesystem** for long term storage. Offloading to long term storage can be triggered via REST API or CLI tools. You can pass as many as topics you want to retain on BookKeeper and brokers copy the backlog data to long term storage. The original data is deleted from BookKeeper after a configured delay.

A topic in Pulsar is backed by a log, known as a managed **ledger**. This log is composed of an ordered list of segments. Pulsar **only** writes to the final segment of the log. All previous segments are sealed. The data within the segment is immutable. This is known as a segment oriented architecture.

The tiered storage offloading mechanism takes advantage of this segment oriented architecture. When offloading is requested, the segments of the log are copied, one-by-one, to tiered storage. All segments of the log, apart from the segment currently being written to, can be offloaded.

![](/images/offloaders/gcs/pulsar-tiered-storage.png)

On the broker, you need to configure the bucket and credentials for the cloud storage service. The configured bucket must exist before attempting to offload. If it does not exist, the offload operation fails.
Pulsar uses multi-part objects to upload the segment data. It is possible that a broker could crash while uploading the data. It is recommended that you add a life cycle rule your bucket to expire incomplete multi-part upload after a day or two to avoid getting charged for incomplete uploads.

# Reference

For more information about tiered storage for Pulsar topics, see [here](https://github.com/apache/pulsar/wiki/PIP-17:-Tiered-storage-for-Pulsar-topics).
