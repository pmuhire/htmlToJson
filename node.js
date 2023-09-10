const fs = require("fs");
const htmlparser = require("htmlparser2");

function htmlToObject(html) {
  let result = {};
  let currentNode = result;
  let stack = [];

  const parser = new htmlparser.Parser(
    {
      onopentag(tag, attributes) {
        const newNode = {
          tag,
          style: {},
          ...attributes,
        };

        if (!currentNode.children) {
          currentNode.children = [];
        }
        currentNode.children.push(newNode);
        stack.push(currentNode);
        currentNode = newNode;
      },
      ontext(text) {
        if (text.trim() !== "") {
          currentNode.text = text.trim();
        }
      },
      onclosetag() {
        currentNode = stack.pop();
      },
      onattribute(name, value) {
        if (name === "style") {
          currentNode.style = parseStyles(value);
        }
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return result;
}

function parseStyles(styleString) {
  const styles = {};
  styleString.split(";").forEach((style) => {
    const [key, value] = style.split(":").map((s) => s.trim());
    if (key && value) {
      styles[key] = value;
    }
  });
  return styles;
}

if (process.argv.length >= 3) {
  const filePath = process.argv[2];
  const html = fs.readFileSync(filePath, "utf8");
  const result = htmlToObject(html);
  console.log(JSON.stringify(result, null, 2));
} else {
  console.error("Usage: node server.js <html_file_path>");
}
