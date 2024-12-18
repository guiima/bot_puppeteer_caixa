# Bot Puppeteer Caixa

Este projeto utiliza Puppeteer para automatizar tarefas relacionadas à consulta de imóveis com desconto na Caixa Econômica Federal.

## Como executar o projeto

### Pré-requisitos

- **Node.js** instalado.
- Gerenciador de pacotes **yarn**.

### Passos para iniciar

1. Instale as dependências do projeto:

   ```bash
   yarn install

   ```

1. Inicie o servidor com o comando:

   ```bash
   yarn dev

   ```

1. Utilize uma ferramenta como Insomnia ou Postman para fazer requisições ao endpoint:

POST http://localhost:3000/imoveis

1. Envie um JSON com o valor de desconto mínimo que você deseja filtrar. Exemplo:

   ```bash
   {
    "desconto": 50
   }
   ```

Nota: O valor de desconto é uma porcentagem que será utilizada como critério para filtrar os imóveis retornados.
