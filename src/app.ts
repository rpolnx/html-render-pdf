import handlebars from "handlebars";
import { join } from "path";
import puppeteer from "puppeteer";
import { TemplateData } from "./template";

const readFile = require("util").promisify(require("fs").readFile);
const writeFile = require("util").promisify(require("fs").writeFile);
const unlink = require("util").promisify(require("fs").unlink);

const data: TemplateData = {
  id: "pdf-template",
  title: "A new Brazilian School",
  date: "05/12/2018",
  name: "Rodolfo Luis Marcos",
  age: 28,
  birthdate: "12/07/1990",
  course: "Computer Science",
  obs: "Graduated in 2014 by Federal University of Lavras, work with Full-Stack development and E-commerce.",
};

async function createPDF(data: TemplateData) {
  const templateHtml = await readFile(
    join(process.cwd(), "resources/template.html"),
    "utf8"
  );
  const template = handlebars.compile(templateHtml);
  const html = template(data);

  const compiled = join(process.cwd(), "resources/compiled.html")

  await writeFile(compiled, html);

  const milis = new Date().getTime();

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(`file://${compiled}`, {
  // await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    waitUntil: ["domcontentloaded", "networkidle0"],
  });

  const pdfPath = join("resources", `${data.id}-${milis}.pdf`);

  const options: any = {
    format: 'a4',
    width: "1230px",
    margin: {
      top: "30px",
      bottom: "30px",
      left: "10px",
      right: "10px"
    },
    printBackground: true,
    path: pdfPath,
  };

  await unlink(compiled)

  await page.pdf(options);
  await browser.close();
}

createPDF(data);
