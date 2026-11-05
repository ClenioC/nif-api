# Frontend de testes da Angola NIF API

Interface web para testar a API: consulta um NIF, mostra o resultado ou o erro e guarda o histórico da sessão. Todas as consultas são reais. Feito com React, Vite e TypeScript, e independente do backend, com o seu próprio `package.json`.

## Como executar

São precisos dois terminais, com Node.js 22.17 ou superior.

**1. API**, na raiz do projecto. No Windows (PowerShell):

```powershell
$env:CORS_ORIGINS="http://localhost:5173"; npm run dev
```

Em Linux ou macOS:

```bash
CORS_ORIGINS=http://localhost:5173 npm run dev
```

A API só aceita pedidos de browsers vindos das origens autorizadas, e a porta 5173 não faz parte da lista predefinida. `CORS_ORIGINS` substitui essa lista, por isso inclua todas as origens de que precisar, separadas por vírgulas.

**2. Frontend**, na pasta `frontend/`:

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

Para validar a compilação e o build de produção, use `npm run build` e `npm run preview`. A porta é sempre a 5173; se estiver ocupada, o servidor não arranca, para a origem autorizada na API não mudar sem aviso.

## Como configurar o endereço da API

Copie `.env.example` para `.env` e altere o valor:

```
VITE_API_BASE_URL=https://a-sua-api.onrender.com
```

Sem esta variável, é usado `http://localhost:3000`. O valor é lido só em `src/config/api.ts`. O Vite aplica-o ao arrancar e ao compilar, por isso reinicie o servidor ou volte a compilar depois de o alterar.

Ao usar uma API remota, acrescente a origem do frontend a `CORS_ORIGINS` no ambiente dessa API.

## Como interpretar o estado da API

O indicador consulta `GET /` a cada 30 segundos, e também depois de cada consulta. Este pedido não conta para o limite de pedidos.

| Indicador | Significado |
|---|---|
| Online | A API responde e aceita esta origem. Não diz nada sobre o Portal da AGT. |
| Online · CORS bloqueado | A API responde, mas recusa esta origem. Corrija `CORS_ORIGINS`. |
| Offline | Não foi possível contactar a API. |

## Como interpretar os erros

| Mensagem | Quando aparece |
|---|---|
| NIF inválido ou não encontrado | `404` em que o portal não mostrou resultado |
| Falha na consulta ao Portal da AGT | `404` por qualquer outra causa, como o portal inacessível ou o Chromium não arrancar |
| Limite de pedidos excedido | `429`: mais de 30 pedidos por IP em 15 minutos, incluindo pedidos inválidos e respostas da cache |
| Pedido bloqueado por CORS | A API é alcançável, mas não aceita esta origem |
| API indisponível | A API não é alcançável |
| A consulta demorou demasiado | Sem resposta em 5 minutos |
| Erro de comunicação | Ligação interrompida, erro `5xx` ou resposta num formato inesperado |
| Pedido inválido | `400` devolvido pela API |

A API usa `404` tanto para um NIF sem resultado como para falhas do portal. O frontend distingue-os pelo campo `error` da resposta, em `classifyPortalError` (`src/services/nifApi.ts`). Um portal muito lento pode, por isso, aparecer como NIF não encontrado. Se o texto desse erro mudar na API, esta função tem de acompanhar a alteração.

Uma consulta sem resultado demora cerca de 1 minuto, porque a API faz 3 tentativas.

## Estrutura

```
src/
├── config/api.ts              # URL base da API, tempos limite e tamanho do histórico
├── models/nif.ts              # Tipos do contrato da API, dos erros e do histórico
├── services/
│   ├── nifApi.ts              # checkHealth, queryNif e classificação de erros
│   └── historyStorage.ts      # Leitura e escrita do histórico em sessionStorage
├── hooks/
│   ├── useApiStatus.ts        # Estado da API
│   └── useNifQuery.ts         # Estado da consulta e histórico
├── utils/nif.ts               # Normalização e validação do NIF
├── components/                # Header, QueryForm, LoadingCard, ResultCard, ErrorAlert, HistoryList
├── styles/global.css
├── App.tsx
└── main.tsx
```

O histórico guarda as últimas 20 consultas e desaparece ao fechar o separador.
