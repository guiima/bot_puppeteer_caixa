// import puppeteer from 'puppeteer';
const puppeteer = require("puppeteer")

// const NOTA_CORTE_DESCONTO = 60;
let listImoveis = []

async function initialize() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultTimeout: 180000,
  })
  const page = await browser.newPage()

  await page.goto(
    "https://venda-imoveis.caixa.gov.br/sistema/busca-licitacoes.asp?sltTipoBusca=licitacoes"
  )

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })
  return { page, browser }
}

async function getDatesOfSale() {
  const { page } = await initialize()

  const selectElement = await page.waitForSelector("#cmb_estado")

  selectElement.select("PR")

  const btnSearch = await page.waitForSelector("#btn_next1")

  btnSearch.click()

  await page.waitForSelector("text/Até")

  const itemsOfPage = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll("span"),
      (element) => element.textContent
    )
  )

  console.log(itemsOfPage)

  const regex =
    /Recebimento de propostas:  Até \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\./

  let listDatas = []

  for (let i = 0; i < itemsOfPage.length; i++) {
    const string = itemsOfPage[i]
    if (regex.test(string)) {
      listDatas.push(string)
      console.log(string)
    }
  }

  const regexData = /(\d{2}\/\d{2}\/\d{4})/
  const arrayDatas = []

  for (let i = 0; i < listDatas.length; i++) {
    const string = listDatas[i]
    const match = string.match(regexData)
    if (match) {
      const data = match[1]
      arrayDatas.push(data)
    }
  }

  return arrayDatas
}

async function chooseDate() {
  const { page } = await initialize()

  const selectElement = await page.waitForSelector("#cmb_estado")

  selectElement.select("PR")

  const btnSearch = await page.waitForSelector("#btn_next1")

  btnSearch.click()

  await page.waitForSelector("text/Listar todos os imóveis desta venda online")

  // Obtém todas as tags <a> que contêm o texto "coisa"
  const tagsCoisa = await page.$(
    'a:has-text("Listar todos os imóveis desta venda online")'
  )

  // Clica na segunda tag <a> encontrada
  await tagsCoisa[1].click()
}

async function printImmobile(textItem, index, desconto) {
  // Extrair desconto
  const regexDesconto = /desconto de ([\d.,]+)/
  const discount = textItem.match(regexDesconto)[1]

  const descontoFloat = parseFloat(discount)

  if (descontoFloat >= desconto) {
    const nomeLocal = textItem.split("Valor de avaliação:")[0].trim()

    // Extrair valor de avaliação
    const regexValorAvaliacao = /Valor de avaliação: R\$\s([\d.,]+)/
    const valorAvaliacao = textItem.match(regexValorAvaliacao)[1]

    // Extrair valor mínimo de venda à vista
    let regexValorMinimo = /Valor mínimo de venda à vista: R\$\s([\d.,]+)/
    let valorMinimo = textItem.match(regexValorMinimo)
    if (!valorMinimo) {
      regexValorMinimo = /Valor mínimo de venda: R\$\s([\d.,]+)/
      valorMinimo = textItem.match(regexValorMinimo)
    }
    valorMinimo = valorMinimo[1]

    let lastItem = listImoveis[listImoveis.length - 1]

    let item = {
      number: index,
      name: nomeLocal,
      value: valorAvaliacao,
      minValue: valorMinimo,
      discount: discount,
    }

    lastItem.itens.push(item)

    // console.log(`ITEM Nº ${index}`);
    // console.log("Nome do local:", nomeLocal);
    // console.log("Valor de avaliação:", valorAvaliacao);
    // console.log("Valor mínimo de venda à vista:", valorMinimo);
    // console.log("Desconto:", desconto)
    // console.log("\n");
  }
}

async function getContentPage(page, desconto) {
  //espera o novo conteudo aparecer e a paginação tbm, sem isso ele reemprime o conteudo repetido
  await page.waitForSelector(".control-item.control-span-12_12")
  await page.waitForSelector("#paginacao > a")

  const itemsOfPage = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(".control-item.control-span-12_12"),
      (element) => element.textContent
    )
  )

  let index = 0
  for (let i = 0; i < itemsOfPage.length; i++) {
    if (i % 2 === 0) {
      index++
      await printImmobile(itemsOfPage[i], index, desconto)
    }
  }
}

async function navigateInPagination(page, desconto) {
  await page.waitForSelector(".control-item.control-span-12_12")
  const pages = await page.waitForSelector("#paginacao")

  const content = await pages?.evaluate((el) => el.textContent)

  const numberOfPage = content.split("-").length

  let indexPage = 0
  for (let i = 0; i < numberOfPage; i++) {
    indexPage++
    // console.log(`=== ITENS DA PAGINA ${indexPage} ===`);

    let uniquePage = {
      page: indexPage,
      itens: [],
    }

    listImoveis.push(uniquePage)

    await getContentPage(page, desconto)

    await page.waitForSelector("#paginacao > a")

    if (indexPage != numberOfPage) {
      const freeButton = await page.$(
        `[href="javascript:carregaListaImoveisLicitacoes(${indexPage + 1});"]`
      )

      await freeButton.click()
    }
  }
}

async function getImoveis(desconto) {
  listImoveis = []

  const { page, browser } = await initialize()

  const selectElement = await page.waitForSelector("#cmb_estado")

  selectElement.select("PR")

  const btnSearch = await page.waitForSelector("#btn_next1")

  btnSearch.click()

  const btnOnlineSale = await page.waitForSelector(
    "text/Listar todos os imóveis desta venda online"
  )

  btnOnlineSale.click()

  await navigateInPagination(page, desconto)

  await browser.close()

  return listImoveis
}

module.exports = { getImoveis, getDatesOfSale, chooseDate }
