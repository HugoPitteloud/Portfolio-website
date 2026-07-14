const fs = require("fs");
const path = require("path");

const projectsFolder = "./projects";
const dataFile = "./data.js";

const projectFolders = fs.readdirSync(projectsFolder)
  .filter(file =>
    fs.statSync(path.join(projectsFolder, file)).isDirectory()
  );

const projects = projectFolders.map(folder => {
  const folderPath = path.join(projectsFolder, folder);
  const files = fs.readdirSync(folderPath);

  const images = files.filter(file =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
  );

  const videos = files.filter(file =>
    /\.(mp4|webm|mov)$/i.test(file)
  );

  const infoPath = path.join(folderPath, "info.json");

  let info = {
    title: folder,
    text: "",
    mediaTexts: {}
  };

  if (fs.existsSync(infoPath)) {
    info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
  }

  [...images, ...videos].forEach(file => {
    if (!info.mediaTexts[file]) {
      info.mediaTexts[file] = "";
    }
  });

  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));

  return {
    title: info.title || folder,
    text: info.text || "",

    cover: images.length > 0
      ? `${projectsFolder}/${folder}/${images[0]}`
      : "",

    media: [
      ...images.map(file => ({
        type: "image",
        src: `${projectsFolder}/${folder}/${file}`,
        text: info.mediaTexts[file] || ""
      })),

      ...videos.map(file => ({
        type: "video",
        src: `${projectsFolder}/${folder}/${file}`,
        text: info.mediaTexts[file] || ""
      }))
    ]
  };
});

const content =
`const projects = ${JSON.stringify(projects, null, 2)};`;

fs.writeFileSync(dataFile, content);

console.log("data.js generated!");
console.log("info.json files created/updated!");