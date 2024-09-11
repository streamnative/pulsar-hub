import fs from 'fs-extra';
import path from "path";
import {globby} from "globby";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

const needSyncYamlPatterns = ["connectors/**/*.yaml"];
const allDocYamlPatterns = ["connectors/**/*.md"];
 // SYNC_EXTERNAL is a file that indicates the connector is maintained externally
 // we use this for Kafka Connect connectors, which are maintained in streamnative/kafka-connect-mesh
const syncExternalPatterns = ["connectors/**/SYNC_EXTERNAL"];
// Based on this, generate the version number of the manually maintained connectors
const specimenConnectorPath = "connectors/aws-eventbridge-sink";

function getConnectorVersions(connectorPath) {
    return fs.readdirSync(path.join(__dirname, connectorPath), {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name.startsWith('v'));
}

function compareVersions(v1, v2) {
    let v1Parts = v1.slice(1).split('.').map(Number);
    let v2Parts = v2.slice(1).split('.').map(Number);

    for (let i = 0; i < v1Parts.length; i++) {
        if (v1Parts[i] > v2Parts[i]) {
            return 1;
        } else if (v1Parts[i] < v2Parts[i]) {
            return -1;
        }
    }
    return 0;
}


/**
 * A samples:
 * specimenVersions: [ 'v2.10.5.8', 'v2.11.2.12', 'v3.0.1.6', 'v3.1.0.5' ]
 * connectorVersions: [ 'v2.10.5.5', 'v2.11.2.10' ]
 * return:
 * [
 *   { from: 'v2.10.5.5', to: 'v2.10.5.8' },
 *   { from: 'v2.11.2.10', to: 'v2.11.2.12' },
 *   { from: 'v2.11.2.10', to: 'v3.0.1.6' },
 *   { from: 'v2.11.2.10', to: 'v3.1.0.5' }
 * ]
 */
function findUpgradeVersions(specimenVersions, connectorVersions) {
    let upgrades = [];

    // Sort the versions
    const sortedSpecimenVersions = specimenVersions.sort(compareVersions);
    const sortedConnectorVersions = connectorVersions.sort(compareVersions);

    for (let specimenVersion of sortedSpecimenVersions) {
        // Find the connectorVersion that is closest (but still less) to the specimenVersion
        let upgradeFrom = null;
        for (let connectorVersion of sortedConnectorVersions) {
            if (compareVersions(connectorVersion, specimenVersion) <= 0) {
                upgradeFrom = connectorVersion;
            } else {
                break;
            }
        }

        // If we found a connectorVersion to upgrade from, add it to the upgrades array
        if (upgradeFrom) {
            upgrades.push({from: upgradeFrom, to: specimenVersion});
        }
    }

    return upgrades;
}

async function replaceVersionInFile(filePath, oldVersion, newVersion) {
    const data = await fs.readFile(filePath, 'utf8');

    // Remove the 'v' prefix from the versions
    const strippedOldVersion = oldVersion.substring(1);
    const strippedNewVersion = newVersion.substring(1);

    // Replace the old version with the new one
    const result = data.replace(new RegExp(strippedOldVersion, 'g'), strippedNewVersion);

    await fs.writeFile(filePath, result, 'utf8');
}

async function replaceVersionInAllFiles(dir, oldVersion, newVersion) {
    const files = await fs.readdir(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
            await replaceVersionInFile(filePath, oldVersion, newVersion);
        }
    }
}

async function removeOldVersions(dir) {
    const files = await fs.readdir(dir);
    const versions = files.map(file => file.slice(1)); // remove 'v' prefix

    // Group versions by first two digits
    let versionGroups = {};
    for (let version of versions) {
        const group = version.split('.').slice(0, 2).join('.');
        if (!versionGroups[group]) {
            versionGroups[group] = [];
        }
        versionGroups[group].push(version);
    }

    // For each group, find the latest version and remove the others
    for (let group in versionGroups) {
        versionGroups[group].sort(compareVersions);
        const latestVersion = versionGroups[group][versionGroups[group].length - 1];
        for (let version of versionGroups[group]) {
            if (version !== latestVersion) {
                await fs.remove(path.join(dir, 'v' + version));
            }
        }
    }
}

async function autoUpgradeDocs() {
    const needSyncYamlFiles = await globby(needSyncYamlPatterns);
    const allDocMdFiles = await globby(allDocYamlPatterns);
    const syncExternalFiles = await globby(syncExternalPatterns);
    const needSyncYamlDirs = new Set(needSyncYamlFiles.map(file => path.dirname(file).split(path.sep).slice(0, 2).join(path.sep)));
    const allDocMdDirs = new Set(allDocMdFiles.map(file => path.dirname(file).split(path.sep).slice(0, 2).join(path.sep)));
    const syncExternalDirs = new Set(syncExternalFiles.map(file => path.dirname(file).split(path.sep).slice(0, 2).join(path.sep)));
    const manuallyMaintainedConnectors = new Set([...allDocMdDirs].filter(dir => !needSyncYamlDirs.has(dir)).filter(dir => !syncExternalDirs.has(dir)));

    let specimenVersions = getConnectorVersions(specimenConnectorPath);
    // Cut the version to three digits
    specimenVersions = specimenVersions.map(version => version.slice(0, version.lastIndexOf('.')));  
    console.log("Manually maintained connectors: ",  manuallyMaintainedConnectors)
    console.log("Specimen versions: ",  specimenVersions)

    for (let dir of manuallyMaintainedConnectors) {
        const connectorVersions = getConnectorVersions(dir);
        if (!connectorVersions || connectorVersions.length === 0) {
            continue;
        }
        console.log(dir, "versions:", connectorVersions);
        const upgradeVersions = findUpgradeVersions(specimenVersions, connectorVersions);
        console.log(`Upgrade versions role:`);
        console.log(upgradeVersions);  // log the upgrades
        // copy and rename directories
        for (let upgrade of upgradeVersions) {
            if (upgrade.from === upgrade.to) {
                continue;
            }
            const sourceDir = path.join(dir, upgrade.from);
            const targetDir = path.join(dir, upgrade.to);
            await fs.copy(sourceDir, targetDir);
            // Replace the version in all files
            await replaceVersionInAllFiles(targetDir, upgrade.from, upgrade.to);
        }
        // remove old versions
        await removeOldVersions(dir)
    }
}

await autoUpgradeDocs();
