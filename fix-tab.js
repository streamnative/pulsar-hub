const fs = require("fs");
const path = require("path");

function travel(dir, callback) {
  if (dir.includes("node_modules")) {
    return;
  }
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
  let data = fs.readFileSync(mdpath, "utf8");
  data = data
    .replace(/::: tabs/g, "{% tabs %}")
    .replace(/:::/g, "{% /tabs %}")
    .replace(/@@@[ ]+(?<tab_name>.+)/g, '{% tab label="$<tab_name>" %}')
    .replace(/@@@\s*\n/g, "{% /tab %}\n");
  fs.writeFileSync(mdpath, data);
  console.log(mdpath + " fixed");
}

// Example: node fix-tab.js connectors/aws-lambda-sink/2.10.0/aws-lambda-sink.md
const [dir] = process.argv.slice(2);
travel(path.join(__dirname, dir), fix);

// Usage:
// Example 1: Update a specify md file:
// node fix-tab.js connectors/aws-lambda-sink/2.10.0/aws-lambda-sink.md

// Example 2: Update files in a specify directory:
// node fix-tab.js connectors/aws-lambda-sink

// Example 3: Update all connectors docs:
// node fix-tab.js connectors

// Example 4: Update all docs:
// node fix-tab.js .
