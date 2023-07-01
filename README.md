# projeto13-batepapo-uol-api

# Chat API

Esta é uma API para um aplicativo de chat básico, desenvolvida utilizando o framework Express e o banco de dados MongoDB. A API permite que os participantes se cadastrem, enviem mensagens e atualizem seus status.

Configuração
Antes de executar a API, é necessário configurar algumas variáveis de ambiente no arquivo .env. Certifique-se de ter o MongoDB instalado e disponível.

As seguintes variáveis devem ser definidas no arquivo .env:
{
DATABASE_URL=<URL_DO_BANCO_DE_DADOS>
PORT=<PORTA_DO_SERVIDOR>
}

# Endpoints

Cadastro de Participantes
URL: /participants

# Método: POST

Corpo da Requisição:
{
  "name": "Nome do Participante"
}

Resposta de Sucesso: Código de status HTTP 201 (Created)

Resposta de Erro: Código de status HTTP 422 (Unprocessable Entity) com uma mensagem de erro no corpo da resposta.

# Listar Participantes
URL: /participants

# Método: GET

Resposta de Sucesso: Código de status HTTP 200 (OK) com uma lista de participantes no corpo da resposta.

Resposta de Erro: Código de status HTTP 500 (Internal Server Error) em caso de erro no servidor.

# Envio de Mensagens
URL: /messages

# Método: POST

Cabeçalho da Requisição:
user: Nome do Participante

Corpo da Requisição:
{
  "to": "Destinatário",
  "text": "Texto da Mensagem",
  "type": "Tipo da Mensagem"
}

Resposta de Sucesso: Código de status HTTP 201 (Created)

Resposta de Erro: Código de status HTTP 422 (Unprocessable Entity) com uma mensagem de erro no corpo da resposta.

# Listar Mensagens
URL: /messages

# Método: GET

Cabeçalho da Requisição:
user: Nome do Participante

Parâmetros de Consulta:

limit (opcional): Limite de mensagens a serem retornadas (número inteiro)
Resposta de Sucesso: Código de status HTTP 200 (OK) com uma lista de mensagens no corpo da resposta.

Resposta de Erro: Código de status HTTP 500 (Internal Server Error) em caso de erro no servidor.

# Atualizar Status do Participante
URL: /status

# Método: POST

Cabeçalho da Requisição:
user: Nome do Participante

Resposta de Sucesso: Código de status HTTP 200 (OK)

Resposta de Erro: Código de status HTTP 404 (Not Found) se o participante não for encontrado ou código de status HTTP 500 (Internal Server Error) em caso de erro no servidor.

# Tarefa Programada

A API possui uma tarefa programada:

A cada 15 segundos, verifica os participantes que não atualizaram seu status nos últimos 10 segundos e os remove da lista de participantes. Além disso, envia uma mensagem informando que o participante saiu da sala.

# Executando o Servidor

Após configurar corretamente o arquivo .env, execute o seguinte comando para iniciar o servidor:
npm run dev

O servidor será iniciado e estará ouvindo na porta especificada no arquivo .env. Será exibida uma mensagem informando que o servidor está rodando e pronto para receber requisições.
