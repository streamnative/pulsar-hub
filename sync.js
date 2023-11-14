import fs from "fs";
import path from "path";
import { globby } from "globby";
import yaml from "js-yaml";
import axios from "axios";
import matter from "gray-matter";
import ejs from "ejs";

const yamlPatterns = ["**/*.yaml"];
const reThreeNumber = new RegExp("^v\\d+\\.\\d+.\\d+$");
const reFourNumber = new RegExp("^v\\d+.\\d+.\\d+.\\d+$");

const GITHUB_HTTP_BASE = "https://api.github.com";
const CONTENT_PREFIX = "https://raw.githubusercontent.com";

function getLink(organization, repository, rest) {
  return (
    GITHUB_HTTP_BASE +
    "/repos/" +
    organization +
    "/" +
    repository +
    (rest ? "/" + rest : "")
  );
}

function getDocLink(organization, repository, version, fileName) {
  return (
    CONTENT_PREFIX +
    "/" +
    organization +
    "/" +
    repository +
    "/" +
    version +
    "/" +
    fileName
  );
}

async function getTagsToSync(organization, repository, maxVersions) {
  const tagsLink = getLink(organization, repository, "git/refs/tags");
  try {
    const { data } = await axios.get(tagsLink, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });
    const tags = data.map((tag) => {
      const name = tag.ref.split("/")[2];
      return {
        name,
        tarball_url: tag.url.replace("/git/", "/tarball/"),
      };
    });

    // 1. we need to create an object to store the maximum version for each group
    let maxTagInGroup = {};
    tags.forEach(tag => {
      // Check if the version format is valid
      const isValidFormat = reThreeNumber.test(tag.name) || reFourNumber.test(tag.name);
      if (!isValidFormat) {
        return;
      }
      // Extract the first two digits of the version number as the group name
      const group = tag.name.split('.').slice(0, 2).join('.');
      // If this group in maxTagInGroup does not have a version yet, or if this version is greater than the version in maxTagInGroup, then update maxTagInGroup
      if (!maxTagInGroup[group] || compareVersions(tag.name, maxTagInGroup[group].name) > 0) {
        maxTagInGroup[group] = tag;
      }
    });
    // 2. we convert maxTagInGroup to an array and filter out the versions that need to be synchronized
    return Object.values(maxTagInGroup).filter(tag => {
      // Extract the first two digits of the version number as the group name
      const group = tag.name.split('.').slice(0, 2).join('.');

      // If there is no local version for this group, or if this version is greater than the maximum local version, then synchronize this version
      return !maxVersions[group] || compareVersions(tag.name, maxVersions[group]) > 0;
    });
  } catch(error) {
    console.log(
        "no tag list for repo",
        repository,
        `maybe it's archived, so skip this repo`,
        'Error:', error
    );
    return [];
  }
}

async function getDoc(organization, repository, version, name) {
  try {
    const docLink = getDocLink(
      organization,
      repository,
      version,
      "/docs/" + name
    );
    let res = await axios.get(docLink, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });
    if (!res || !res.data) {
      const readmeLink = getDocLink(
        organization,
        repository,
        version,
        "README.md"
      );
      res = await axios.get(readmeLink, {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      });
    }
    return res.data;
  } catch (error) {
    return null;
  }
}

async function getRepository(organization, repository) {
  const { data } = await axios.get(
      getLink(organization, repository), {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
  );
  return data;
}

async function getContributors(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "contributors"), {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
  );
  return data;
}

async function getLicenses(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "license"), {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
  );
  return data;
}

async function getLanguages(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "languages"), {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
  );
  return data;
}

async function getTopics(organization, repository) {
  const { data } = await axios.get(
      getLink(organization, repository, "topics"), {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
  );
  return data;
}

function compareVersions(v1, v2) {
  const parts1 = v1.slice(1).split('.').map(Number);
  const parts2 = v2.slice(1).split('.').map(Number);

  for (let i = 0; i < parts1.length; i++) {
    if (parts1[i] > parts2[i]) {
      return 1;
    } else if (parts1[i] < parts2[i]) {
      return -1;
    }
  }
  return 0;
}

function getLocalMaxVersion(dir) {
  const versions = fs.readdirSync(dir).filter(file => file.startsWith('v'));
  const maxVersions = {};

  versions.forEach(version => {
    const group = version.split('.').slice(0, 2).join('.');
    if (!maxVersions[group] || compareVersions(version, maxVersions[group]) > 0) {
      maxVersions[group] = version;
    }
  });
  return maxVersions;
}

async function syncDoc(tag, pathPrefix, fileName, organization, repository, project) {
  const version = tag.name;
  const download = tag.tarball_url;
  const _dir = pathPrefix + "/" + version;
  const _file_path = _dir + "/" + fileName + ".md";
  if (!fs.existsSync(_dir)) {
    fs.mkdirSync(_dir);
  }
  if (!fs.existsSync(_file_path)) {
    const repo = await getRepository(organization, repository);
    const description = repo["description"];
    const ownerName = repo["owner"]["login"];
    const support = repo["owner"]["login"];
    const ownerImg = repo["owner"]["avatar_url"];
    const icon = project.icon || ownerImg
    const name = repo["name"];
    const source = repo["html_url"];
    const licenses = await getLicenses(organization, repository);
    const license = licenses["license"]["name"];
    const licenseLink = licenses["html_url"];
    const languages = await getLanguages(organization, repository);
    const languageKeys = Object.keys(languages);
    const language = languageKeys.slice(0, 4);
    const topics = await getTopics(organization, repository);
    const contributors = await getContributors(organization, repository);
    const contributorList = [];
    for (let m = 0; m < contributors.length; m++) {
      contributorList.push(contributors[m]["login"]);
    }

    const doc = await getDoc(
        organization,
        repository,
        version,
        fileName + ".md"
    );
    if (!doc) {
      console.log(`not found doc ${fileName} version: ${version}`);
      return;
    }
    const md = matter(doc);
    const dockerfile = md.data.dockerfile;
    const alias = md.data.alias || name;
    let content = "";
    md.content.split("\n").forEach(function (line) {
      if (line.indexOf("![](/docs") >= 0) {
        line = line.replace(
            "/docs",
            "https://raw.githubusercontent.com/" +
            organization +
            "/" +
            name +
            "/" +
            tag.name +
            "/docs"
        );
      }
      if (line.indexOf("![](docs") >= 0) {
        line = line.replace(
            "docs",
            "https://raw.githubusercontent.com/" +
            organization +
            "/" +
            name +
            "/" +
            tag.name +
            "/docs"
        );
      }
      content += line + "\n";
    });

    const result = {
      description: project.description || description,
      authors: project.authors || contributorList.slice(0, 4),
      contributors: project.contributors || contributorList.slice(0, 4),
      languages: project.language || language,
      document: "",
      source: project.private_source ? "Private source" : (project.source || source),
      license: project.private_source ? "Business License" : (project.license || license),
      licenseLink: project.license_link || licenseLink,
      tags: project.tags || topics["names"],
      alias: project.alias || alias,
      features: project.description || description,
      icon: project.icon || icon,
      download: project.private_source ? "Business License" : (project.download || download),
      support: project.support || support,
      supportLink: project.private_source ? "" : (project.support_link || source),
      supportImg: project.support_img || ownerImg,
      ownerName: project.owner_name || ownerName,
      ownerImg: project.owner_img || ownerImg,
      dockerfile: project.private_source ? "" : (project.dockerfile || dockerfile),
      snAvailable: project.sn_available || md.data.sn_available,
      id: fileName,
      content: content,
    };

    ejs.renderFile("hub.template", result, (err, str) => {
      if (err) {
        return console.error(err);
      }
      fs.writeFileSync(_file_path, str);
      console.log("successed sync doc:", _file_path);
    });
  }
}

function cleanupDirectories(baseDir) {
  // Get all directories within the base directory
  const dirents = fs.readdirSync(baseDir, { withFileTypes: true });
  const directories = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  // Group the directories based on the first two digits of the version
  let groups = {};
  directories.forEach(dir => {
    const group = dir.split('.').slice(0, 2).join('.');
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(dir);
  });

  // For each group, delete all directories except for the maximum version
  for (let group in groups) {
    let versions = groups[group];
    versions.sort(compareVersions);
    let maxVersion = versions.pop(); // Keep the maximum version
    // Delete the other versions
    for (let version of versions) {
      let directoryPath = path.join(baseDir, version);
      fs.rmSync(directoryPath, { recursive: true, force: true });
    }
  }
}

async function fetchDocs() {
  const yamlFiles = await globby(yamlPatterns);
  for (let yamlFile of yamlFiles) {
    const filePath = yamlFile.split("/");
    const fileName = path.basename(yamlFile, ".yaml");
    const pathPrefix = filePath.slice(0, 2).join("/");
    const project = yaml.load(fs.readFileSync(yamlFile, "utf8"));
    if (!project.repository) {
      return;
    }
    const host = project.repository.split("://")[1];
    const orgRepository = host.split("/");
    const organization = orgRepository[1];
    const repository = orgRepository[2];

    console.log(`Initiating synchronization for ${repository} documents...`);
    // 1. Get the maximum versions locally.
    const maxVersions = getLocalMaxVersion(path.dirname(yamlFile));
    // 2. Get the tags (versions) that need to be synchronized.
    const tags = await getTagsToSync(organization, repository, maxVersions);
    // 3. Synchronize the documentation.
    for (let tag of tags) {
      await syncDoc(tag, pathPrefix, fileName, organization, repository, project);
    }
    // 4. Clean up the directories right after the synchronization.
    cleanupDirectories(path.dirname(yamlFile));
    console.log(`Synchronization completed for ${repository} documents.`);
  }
}

fetchDocs();
