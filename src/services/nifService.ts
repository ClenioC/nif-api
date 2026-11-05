import puppeteer from "puppeteer-core";
import { NifData } from "../types";

interface LinhaResultado {
  rotulo: string;
  valor: string;
}

function normalizarRotulo(rotulo: string): string {
  return rotulo
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/:\s*$/, "")
    .trim()
    .toLowerCase();
}

/**
 * Identifica os campos pelo rótulo: o portal pode acrescentar linhas
 * (ex.: "Inadimplente"), por isso a posição de cada linha não é fiável.
 */
function mapearLinhas(linhas: LinhaResultado[]): NifData {
  const porRotulo = new Map(
    linhas.map((linha): [string, string] => [normalizarRotulo(linha.rotulo), linha.valor])
  );

  return {
    nif: porRotulo.get("nif") ?? "",
    name: porRotulo.get("nome") ?? "",
    type: porRotulo.get("tipo") ?? "",
    status: porRotulo.get("estado") ?? "",
    vatRegime: porRotulo.get("regime de iva") ?? "",
    // No portal, esta linha não tem rótulo visível: está comentado no HTML
    // (<!--Indicador de Não Residente:-->)
    taxResidence: porRotulo.get("") ?? porRotulo.get("indicador de nao residente") ?? "",
  };
}

/**
 * Consulta NIF/BI no Portal do Contribuinte
 */
export async function consultarNif(nif: string): Promise<NifData> {
  const isProduction = process.env.NODE_ENV === "production";
  
  let browser;
  
  if (isProduction) {
    // No Render/cloud, usa @sparticuz/chromium
    // O pacote é ESM-only: via require() os métodos ficam em .default
    const chromium = require("@sparticuz/chromium").default;
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  } else {
    // Localmente, usa o Chrome do Puppeteer (via node_modules)
    const { executablePath } = require("puppeteer");
    browser = await puppeteer.launch({
      executablePath: await executablePath(),
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }

  try {
    const page = await browser.newPage();

    // Bloquear imagens, CSS e fontes para ser mais rápido
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const tipo = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(tipo)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(
      "https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      }
    );

    // Aguarda o campo do NIF aparecer
    await page.waitForSelector("#j_id_2x\\:txtNIFNumber", { timeout: 20000 });

    // Limpa e digita o NIF
    await page.click("#j_id_2x\\:txtNIFNumber");
    await page.type("#j_id_2x\\:txtNIFNumber", nif, { delay: 30 });

    // Clica em Pesquisar
    await page.click("#j_id_2x\\:j_id_34");

    // Espera o resultado aparecer
    await page.waitForSelector("div.panel-default-header", {
      timeout: 15000,
    });

    // Extrai os dados
    const linhas = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.form-group"))
        // O grupo do formulário de pesquisa não tem <label> como filho direto
        .filter((grupo) => grupo.querySelector(":scope > label"))
        .map((grupo) => ({
          rotulo: grupo.querySelector(":scope > label")?.textContent?.trim() ?? "",
          valor: grupo.querySelector(":scope > div label")?.textContent?.trim() ?? "",
        }))
    );

    const dados = mapearLinhas(linhas);

    // Validação básica
    if (!dados.name || !dados.nif) {
      throw new Error("NIF not found or incomplete data");
    }

    return dados;
  } finally {
    await browser.close();
  }
}
