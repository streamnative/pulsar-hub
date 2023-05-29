const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function travel(dir, callback) {
  if (fs.statSync(dir).isFile()) {
    if (dir.endsWith(".md")) {
      callback(dir);
    }
  } else {
    fs.readdirSync(dir).forEach((file) => {
      var pathname = path.join(dir, file);
      if (fs.statSync(pathname).isDirectory()) {
        travel(pathname, callback);
      } else if (pathname.endsWith(".md")) {
        callback(pathname);
      }
    });
  }
}

function fix(mdpath) {
  let yamlFile = path.join(
    path.dirname(mdpath),
    "..",
    path.basename(mdpath, ".md") + ".yaml"
  );
  let ymlData = null;
  if (fs.existsSync(yamlFile)) {
    ymlData = yaml.load(fs.readFileSync(yamlFile, "utf8"));
  }
  if (!ymlData || !ymlData.icon) {
    return;
  }
  let data = fs.readFileSync(mdpath, "utf8");
  data = data.replace(/icon: .*/, 'icon: ' + ymlData.icon);
  fs.writeFileSync(mdpath, data);
  console.log(mdpath + " fixed");
}

module.exports = (dir) => {
  travel(dir, fix);
};

if (typeof require !== "undefined" && require.main === module) {
  const [dir] = process.argv.slice(2);
  travel(path.join(__dirname, dir), fix);
}
