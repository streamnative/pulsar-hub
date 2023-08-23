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

const LINK_PREFIX = "https://tuteng:" + process.env.ACCESS_TOKEN;
const GITHUB_HTTP_BASE = LINK_PREFIX + "@api.github.com";
const CONTENT_PREFIX = LINK_PREFIX + "@raw.githubusercontent.com";

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

async function getRepository(organization, repository) {
  const { data } = await axios.get(getLink(organization, repository));
  return data;
}

async function getContributors(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "contributors")
  );
  return data;
}

async function getLicenses(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "license")
  );
  return data;
}

async function getLanguages(organization, repository) {
  const { data } = await axios.get(
    getLink(organization, repository, "languages")
  );
  return data;
}

async function getTopics(organization, repository) {
  const { data } = await axios.get(getLink(organization, repository, "topics"));
  return data;
}

async function fetchDocs() {
  const yamlFiles = await globby(yamlPatterns);
  for (let yamlFile of yamlFiles) {
    if (!project.repository) { 
      continue
    }
    const filePath = yamlFile.split("/");
    const fileName = path.basename(yamlFile, ".yaml");
    const pathPrefix = filePath.slice(0, 2).join("/");
    const project = yaml.load(fs.readFileSync(yamlFile, "utf8"));
    const host = project.repository.split("://")[1];
    const orgRepository = host.split("/");
    const organization = orgRepository[1];
    const repository = orgRepository[2];
    const tags = await getTags(organization, repository);
    for (let tag of tags) {
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
          continue;
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
          source: project.source || source,
          license: project.license || license,
          licenseLink: project.license_link || licenseLink,
          tags: project.tags || topics["names"],
          alias: project.alias || alias,
          features: project.description || description,
          icon: project.icon || icon,
          download: project.download || download,
          support: project.support || support,
          supportLink: project.support_link || source,
          supportImg: project.support_img || ownerImg,
          ownerName: project.owner_name || ownerName,
          ownerImg: project.owner_img || ownerImg,
          dockerfile: project.dockerfile || dockerfile,
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
  }
}

fetchDocs();
