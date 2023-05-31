import puppeteer from 'puppeteer';

const NOTA_CORTE_DESCONTO = 60;

async function printImmobile(textItem, index) {
    // Extrair desconto
    const regexDesconto = /desconto de ([\d.,]+)/;
    const desconto = textItem.match(regexDesconto)[1];

    const descontoFloat = parseFloat(desconto);

    if (descontoFloat >= NOTA_CORTE_DESCONTO) {
        const nomeLocal = textItem.split("Valor de avaliação:")[0].trim();

        // Extrair valor de avaliação
        const regexValorAvaliacao = /Valor de avaliação: R\$\s([\d.,]+)/;
        const valorAvaliacao = textItem.match(regexValorAvaliacao)[1];

        // Extrair valor mínimo de venda à vista
        let regexValorMinimo = /Valor mínimo de venda à vista: R\$\s([\d.,]+)/;
        let valorMinimo = textItem.match(regexValorMinimo);
        if (!valorMinimo) {
            regexValorMinimo = /Valor mínimo de venda: R\$\s([\d.,]+)/;
            valorMinimo = textItem.match(regexValorMinimo);
        }
        valorMinimo = valorMinimo[1];

        console.log(`ITEM Nº ${index}`);
        console.log("Nome do local:", nomeLocal);
        console.log("Valor de avaliação:", valorAvaliacao);
        console.log("Valor mínimo de venda à vista:", valorMinimo);
        console.log("Desconto:", desconto)
        console.log("\n");
    }
}

async function getContentPage(page) {
    //espera o novo conteudo aparecer e a paginação tbm, sem isso ele reemprime o conteudo repetido
    await page.waitForSelector('.control-item.control-span-12_12');
    await page.waitForSelector('#paginacao > a');

    const itemsOfPage = await page.evaluate(() => Array.from(document.querySelectorAll('.control-item.control-span-12_12'), element => element.textContent));

    let index = 0;
    for (let i = 0; i < itemsOfPage.length; i++) {
        if (i % 2 === 0) {
            index++;
            await printImmobile(itemsOfPage[i], index);
        }
    }
}

async function navigateInPagination(page) {
    await page.waitForSelector('.control-item.control-span-12_12');
    const pages = await page.waitForSelector('#paginacao');

    const content = await pages?.evaluate(el => el.textContent);

    const numberOfPage = content.split('-').length;

    let indexPage = 0;
    for (let i = 0; i < numberOfPage; i++) {
        indexPage++;
        console.log(`=== ITENS DA PAGINA ${indexPage} ===`);

        await getContentPage(page);

        await page.waitForSelector('#paginacao > a');

        if (indexPage != numberOfPage) {
            const freeButton = await page.$(`[href="javascript:carregaListaImoveisLicitacoes(${indexPage + 1});"]`);

            await freeButton.click();
        }
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultTimeout: 60000, });
    const page = await browser.newPage();

    await page.goto('https://venda-imoveis.caixa.gov.br/sistema/busca-licitacoes.asp?sltTipoBusca=licitacoes');

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    const selectElement = await page.waitForSelector('#cmb_estado');

    selectElement.select('PR');

    const btnSearch = await page.waitForSelector('#btn_next1');

    btnSearch.click();

    const btnOnlineSale = await page.waitForSelector(
        'text/Listar todos os imóveis desta venda online'
    );

    btnOnlineSale.click();

    // await getContentPage(page);

    await navigateInPagination(page);

    // const freeButton = await page.$('[href="javascript:carregaListaImoveisLicitacoes(2);"]');
    // await freeButton.click();
    // console.log(freeButton);
})();

