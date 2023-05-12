import fs from "fs";
import path from "path";
import { globby } from "globby";
import yaml from "js-yaml";
import axios from "axios";

const yamlPatterns = ["**/*.yaml"];
const reThreeNumber = new RegExp("^v\\d+\\.\\d+.\\d+$");
const reFourNumber = new RegExp("^v\\d+.\\d+.\\d+.\\d+$");

const LINK_PREFIX = "https://tuteng:" + process.env.ACCESS_TOKEN;
const GITHUB_HTTP_BASE = LINK_PREFIX + "@api.github.com";
const CONTENT_PREFIX = LINK_PREFIX + "@raw.githubusercontent.com";

function getLink(organization, repository, rest) {
  return (
    GITHUB_HTTP_BASE + "/repos/" + organization + "/" + repository + "/" + rest
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

async function getTags(organization, repository) {
  const tagsLink = getLink(organization, repository, "git/refs/tags");
  try {
    const { data } = await axios.get(tagsLink);
    const tags = data.map((tag) => {
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

async function getDoc(organization, repository, version, name) {
  try {
    const docLink = getDocLink(
      organization,
      repository,
      version,
      "/docs/" + name
    );
    let res = await axios.get(docLink);
    if (!res || !res.data) {
      const readmeLink = getDocLink(
        organization,
        repository,
        version,
        "README.md"
      );
      res = await axios.get(readmeLink);
    }
    return res.data;
  } catch (error) {
    return null;
  }
}

async function fetchDocs() {
  const yamlFiles = await globby(yamlPatterns);
  for (let yamlFile of yamlFiles.slice(0, 1)) {
    // temporary slice a short sub items for a quickly action test, will remove the slice call next PR
    const filePath = yamlFile.split("/");
    const fileName = path.basename(yamlFile, ".yaml");
    const pathPrefix = filePath.slice(0, 2).join("/");
    const project = yaml.load(fs.readFileSync(yamlFile, "utf8"));
    const host = project.repository.split("://")[1];
    const orgRepository = host.split("/");
    const organization = orgRepository[1];
    const repository = orgRepository[2];
    const tags = await getTags(organization, repository);
    for (let tag of tags.slice(0, 2)) {
      // temporary slice a short sub items for a quickly action test, will remove the slice call next PR
      const version = tag.name;
      const _dir = pathPrefix + "/" + version;
      const _file_path = _dir + "/" + fileName + ".md";
      if (!fs.existsSync(_dir)) {
        fs.mkdirSync(_dir);
      }
      if (!fs.existsSync(_file_path)) {
        const doc = await getDoc(
          organization,
          repository,
          version,
          fileName + ".md"
        );
        if (!doc) {
          console.log(`not found doc ${fileName} version: ${version}`);
          continue;
        }
        fs.writeFileSync(_file_path, doc, function (err) {
          if (err) {
            return console.error(err);
          }
        });
        console.log("successed sync doc:", _file_path);
      }
    }
  }
}

fetchDocs();
