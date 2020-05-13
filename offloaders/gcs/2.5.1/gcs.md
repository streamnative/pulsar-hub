---
description: Offload data from BookKeeper to GCS
author: ["StreamNative"]
contributors: ["StreamNative"]
language: Java
document:
source: "https://github.com/apache/pulsar/tree/master/tiered-storage/jcloud/src/main/java/org/apache/bookkeeper/mledger/offload/jcloud"
license: Apache License 2.0
license_link: "https://www.apache.org/licenses/LICENSE-2.0"
tags: ["GCS", "Offload", "Pulsar"]
alias: GCS
features: ["Offload data from BookKeeper to GCS"]
icon: "/images/offloaders/gcs-logo.png"
download: "https://www.apache.org/dyn/mirrors/mirrors.cgi?action=download&filename=pulsar/pulsar-2.5.1/apache-pulsar-offloaders-2.5.1-bin.tar.gz"
support: StreamNative
support_link: https://streamnative.io
support_img: "/images/connectors/streamnative.png"
dockerfile: 
id: "gcs"
---

# Overview

To deliver an event streaming service, StreamNative Platform must manage large numbers of messages and data in real-time, and this requires keeping large amounts of data on the platform, or readily accessible. As the data amount increases, it becomes significantly more expensive to store, manage, and retrieve, so administrators and developers look to external stores for long-term storage. 

StreamNative Platform leverages a unique **tiered storage** solution that addresses some of these key challenges faced by other distributed log systems. This tiered storage solution extends the storage capabilities of StreamNative Platform by offloading data from Apache BookKeeper to scalable cloud-native storage (such as [GCS (Google Cloud Storage)](https://cloud.google.com/storage)) without the need of adding storage. Older topic data can be offloaded to long-term storage that readily scales with the volume of data. In this way, on the one hand, tiered storage is much cheaper than the storage in Pulsar clusters; on the other hand, there is no perceivable difference in consuming a topic whether data is stored on tiered storage or on Pulsar clusters, they produce and consume messages in exactly the same way.

Besides, StreamNative Platform is able to retain both historic and real-time data and provides a unified view as infinite event streams, which can be easily reprocessed or backloaded into new systems. You can integrate StreamNative Platform with a unified data processing engine (such as Apache Flink or Apache Spark) to unlock many new use cases stemming from infinite data retention.

# Configuration

> #### Note
> 
> Before using GCS offload, you need to configure some properties of the GCS offload driver. 

Besides, you can also configure the GCS offload to run automatically or trigger it manually.

## Configure offload driver

You can configure GCS offload driver in the configuration file `broker.conf`.

- **Required** configurations are as below.

    **Required** configuration | Description | Example value
    |---|---|---
    `managedLedgerOffloadDriver`|Offload driver name, which is case-insensitive.|google-cloud-storage
    `offloadersDirectory`|Offload directory|offloaders
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

Bucket region is the region where a bucket located. If a bucket region is not specified, StreamNative Platform uses the default region, which is `us multi-regional location`.

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

## Configure offload to run automatically

Namespace policy can be configured to offload data automatically once a threshold is reached. The threshold is based on the size of data that a topic has stored on a Pulsar cluster. Once the topic reaches the threshold, an offload operation is triggered automatically. 

Threshold value|Action
|---|---
0|It causes a broker to offload data as soon as possible.
Negative value|It disables automatic offloading.

Automatic offload runs when a new segment is added to a topic log. If you set the threshold on a namespace, but few messages are being produced to the topic, offload does not work until the current segment is full.

You can configure the threshold size using CLI tools, such as [pulsarctl](https://streamnative.io/docs/v1.0.0/manage-and-monitor/pulsarctl/overview/) or puslar-admin.

### Example

This example sets the GCS offload threshold size to 10 MB using pulsarctl.

```bash
bin/pulsarctl namespaces set-offload-threshold --size 10M my-tenant/my-namespace
```

> #### Tip
>
> For more information about the `pulsarctl namespaces set-offload-threshold options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-offload-threshold-em-). 

## Configure offload to run manually

For individual topics, you can trigger GCS offload manually using the following methods:

- Use REST endpoint 

- Use CLI tools (such as pulsarctl or pulsar-admin). 

    To trigger via CLI tools, you need to specify the maximum amount of data (threshold) that should be retained on a Pulsar cluster for a topic. If the size of the topic data on the Pulsar cluster exceeds this threshold, segments from the topic are moved to GCS until the threshold is no longer exceeded. Older segments are moved first.

### Example

- This example triggers GCS offload to run manually using pulsarctl with the command `pulsarctl topic offload (topic-name) (threshold)`.

    ```bash
    bin/pulsarctl topic offload persistent://my-tenant/my-namespace/topic1 10M
    ``` 

    **Output**

    ```bash
    Offload triggered for persistent://my-tenant/my-namespace/topic1 for messages before 2:0:-1
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl topic offload options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-em-). 

- This example checks GCS offload status using pulsarctl with the command `pulsarctl topic offload-status options`.

    ```bash
    bin/pulsarctl topic offload-status persistent://my-tenant/my-namespace/topic1
    ```

    **Output**

    ```bash
    Offload is currently running
    ```

    To wait for GCS offload to complete the job, add the `-w` flag.

    ```bash
    bin/pulsarctl topic offload-status -w persistent://my-tenant/my-namespace/topic1
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
    > For more information about the `pulsarctl topic offload-status options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-offload-status-em-). 

# Usage

This tutorial provides step-by-step instructions on how to use GCS with Pulsar.

## Step 1: configure GCS offload driver

As indicated in the [configuration chapter](#configuration), before using GCS offload, you need to configure some properties for the GCS offload driver. This tutorial assumes that you have configured the GCS offload driver in `broker.conf` as below and run Pulsar in **standalone** mode.

```conf
managedLedgerOffloadDriver=google-cloud-storage

gcsManagedLedgerOffloadBucket=pulsar-topic-offload-1

gcsManagedLedgerOffloadRegion=europe-west3

gcsManagedLedgerOffloadServiceAccountKeyFile=/Users/user-name/Downloads/affable-ray-226821-6251d04987e9.json
# Configure this property after [Step 3: create GCS service account] as shown below

offloadersDirectory=offloaders

managedLedgerMinLedgerRolloverTimeMinutes=2 

managedLedgerMaxEntriesPerLedger=5000
```

## Step 2: create GCS bucket 

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/), select **Storage** at left navigation panel.

    ![](/images/offloaders/gcs/start.png)

2. To create a GCS bucket, click **Browser** > **CREATE BUCKET**.

    ![](/images/offloaders/gcs/create-bucket.png)

3. Name your bucket. 

    The bucket name should be the same as the value of `gcsManagedLedgerOffloadBucket` that you configured in [Step 1](#step-1).

![](/images/offloaders/gcs/bucket-name.png)

4. Set your bucket region. 

    The bucket region should be the same as the value of `gcsManagedLedgerOffloadRegion` that you configured in [Step 1](#step-1).

    ![](/images/offloaders/gcs/bucket-range.png)

5. Click **Create**. 

    Now you have successfully created a GCS bucket.

    ![](/images/offloaders/gcs/complete.png)

## Step 3: create GCS service account

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/), select **IAM & Admin** at left navigation panel.

    ![](/images/offloaders/gcs/start-2.png)


2. To create a new service account, click **Service Accounts** > **CREATE SERVICE ACCOUNT**.

	![](/images/offloaders/gcs/create-service-account.png)

3. Name your service account.
   
   The service account ID is automatically generated.

    ![](/images/offloaders/gcs/create-1.png)

4. Click **Create**.

5. Grant privilege to your service account.

	This tutorial skips this task here and completes it in [Step 4](#step-4). 
    
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

3. Assign **Owner** and **Storage Admin** roles to your service account.

    ![](/images/offloaders/gcs/select-1.png)

    ![](/images/offloaders/gcs/select-2.png)

4. Click **Save**.

## Step 5: offload data from BookKeeper to GCS

1. Start Pulsar standalone.

    ```
    ./bin/pulsar standalone -a 127.0.0.1
    ```

2. To make sure the data generated is not deleted immediately, it is recommended to set the [retention policy](https://pulsar.apache.org/docs/en/next/cookbooks-retention-expiry/#retention-policies), which can be either a **size** limit or a **time** limit. The larger value you set for the retention policy, the longer the data can be retained.

    ```
    ./bin/pulsarctl namespaces set-retention public/default --size -10G --time 3d
    ```

    > #### Tip
    >
    > For more information about the `pulsarctl namespaces set-retention options` command, including flags, descriptions, default values, and shorthands, see [here](https://streamnative.io/docs/pulsarctl/v0.4.0/#-em-set-retention-em-). 

3. Produce data using pulsar-perf. 

    ```
    ./bin/pulsar-perf produce -r 1000 -s 2048 test-topic
    ```

4. The offloading operation starts after a ledge rollover is trigged. To ensure offload data successfully, it is recommended that you wait until several ledge rollovers are triggered. In this case, you might need to wait for a second. You can check the ledge status using pulsar-admin.
 
    ```
    ./bin/pulsar-admin topics stats-internal test-topic
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

5. After ledger rollover, trigger the offloading operation manually.

    ```
    bin/pulsarctl topic offload --size-threshold 10M public/default/test-topic
    ```

    **Output**

    ```
    Offload triggered for persistent://public/default/test-topic for messages before 12:0:-1
    ```

6. Check the offloading status.

	```
    bin/pulsarctl topic offload-status -w public/default/test-topic
    ```
	
	You might need to wait for a while until the offloading operation finishes.

    **Output**

    ```
    Offload was a success
    ```

	At last, you can see the data is offloaded to GCS successfully.

    ![](/images/offloaders/gcs/storage.png)

# How it works

Pulsar's **segment oriented architecture** allows for topic backlogs to effectively grow very large without limit. However, this can become expensive over time. One way to alleviate this cost is to use **tiered storage**. With tiered storage, older messages in the backlog can be moved from BookKeeper to a cheaper storage mechanism, such as GCS, while still allowing clients to access the backlog as if nothing had changed.

Currently, StreamNative Platform supports **AWS S3**, **GCS**, and **filesystem** for long term storage. Offloading to long term storage can be triggered via REST API or CLI tools. You can pass as many as topics you want to retain on BookKeeper and brokers copy the backlog data to long term storage. The original data is deleted from BookKeeper after a configured delay.

A topic in StreamNative Platform is backed by a log, known as a managed **ledger**. This log is composed of an ordered list of segments. StreamNative Platform **only** writes to the final segment of the log. All previous segments are sealed. The data within the segment is immutable. This is known as a segment oriented architecture.

The tiered storage offloading mechanism takes advantage of this segment oriented architecture. When offloading is requested, the segments of the log are copied, one-by-one, to tiered storage. All segments of the log, apart from the segment currently being written to, can be offloaded.

![](/images/offloaders/gcs/pulsar-tiered-storage.png)

On the broker, you need to configure the bucket and credentials for the cloud storage service. The configured bucket must exist before attempting to offload. If it does not exist, the offload operation fails.
StreamNative Platform uses multi-part objects to upload the segment data. It is possible that a broker could crash while uploading the data. It is recommended that you add a life cycle rule your bucket to expire incomplete multi-part upload after a day or two to avoid getting charged for incomplete uploads.

# Reference

For more information about tiered storage for Pulsar topics, see [here](https://github.com/apache/pulsar/wiki/PIP-17:-Tiered-storage-for-Pulsar-topics).

