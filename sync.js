import fs from "fs";
import path from "path";
import { globby } from "globby";
import request from "sync-request";
import yaml from "js-yaml";

const yamlPatterns = ["**/*.yaml"];
const GITHUB_HTTP_BASE =
  "https://tuteng:" + process.env.ACCESS_TOKEN + "@api.github.com";
const CONTENT_PREFIX =
  "https://tuteng:" + process.env.ACCESS_TOKEN + "@raw.githubusercontent.com";

const reThreeNumber = new RegExp("^v\\d+\\.\\d+.\\d+$");
const reFourNumber = new RegExp("^v\\d+.\\d+.\\d+.\\d+$");

function getGitHubLink(organization, repository, type) {
  return (
    GITHUB_HTTP_BASE + "/repos/" + organization + "/" + repository + "/" + type
  );
}

function getGitHubContentLink(organization, repository, version, fileName) {
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

function getGitHubDocsContentLink(organization, repository, version, fileName) {
  return (
    CONTENT_PREFIX +
    "/" +
    organization +
    "/" +
    repository +
    "/" +
    version +
    "/docs/" +
    fileName
  );
}

function getTags(organization, repository) {
  const tagsLink = getGitHubLink(organization, repository, "git/refs/tags");
  try {
    const res = request("GET", tagsLink, {
      headers: {
        "user-agent": "nodejs-client",
      },
    });
    let tags = JSON.parse(res.getBody("utf8"));
    tags = tags.map((tag) => {
      const name = tag.ref.split("/")[2];
      return {
        name,
        tarball_url: tag.url.replace("/git/", "/tarball/"),
      };
    });
    return tags.filter((tag) => {
      return reThreeNumber.test(tag.name) || reFourNumber.test(tag.name);
    });
  } catch {
    console.log(
      "no tag list for reop",
      repository,
      `maybe it's archived, so skip this repo`
    );
    return [];
  }
}

function getReadme(organization, repository, version) {
  const readmeLink = getGitHubContentLink(
    organization,
    repository,
    version,
    "README.md"
  );
  const res = request("GET", readmeLink, {
    headers: {
      "user-agent": "nodejs-client",
    },
  });
  return res.getBody("utf8");
}

function getReadmeByName(organization, repository, version, name) {
  const readmeLink = getGitHubDocsContentLink(
    organization,
    repository,
    version,
    name
  );
  try {
    const res = request("GET", readmeLink, {
      headers: {
        "user-agent": "nodejs-client",
      },
    });
    return res.getBody("utf8");
  } catch (error) {
    return null;
  }
}

async function fetchDocs() {
  const yamlFiles = await globby(yamlPatterns);
  for (let yamlFile of yamlFiles) {
    const filePath = yamlFile.split("/");
    const fileName = path.basename(yamlFile, ".yaml");
    const pathPrefix = filePath.slice(0, 2).join("/");
    const project = yaml.load(fs.readFileSync(yamlFile, "utf8"));
    const host = project.repository.split("://")[1];
    const orgRepository = host.split("/");
    const organization = orgRepository[1];
    const repository = orgRepository[2];
    const tags = getTags(organization, repository);
    for (let tag of tags) {
      const version = tag.name;
      const _dir = pathPrefix + "/" + version;
      const _file_path = _dir + "/" + fileName + ".md";
      if (!fs.existsSync(_dir)) {
        fs.mkdirSync(_dir);
      }
      if (!fs.existsSync(_file_path)) {
        let readme = getReadmeByName(
          organization,
          repository,
          version,
          fileName + ".md"
        );
        if (!readme) {
          readme = getReadme(organization, repository, version);
        }
        fs.writeFileSync(_file_path, readme, function (err) {
          if (err) {
            return console.error(err);
          }
        });
        console.log("successed cached doc:", _file_path);
      }
    }
  }
}

fetchDocs();
