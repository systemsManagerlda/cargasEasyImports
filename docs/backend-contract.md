# Contrato do backend — rastreio de cargas

Este documento registra os pontos do frontend que devem permanecer alinhados com o backend fornecido.

## Carga

Campos centrais: `cargaId`, `numeroOrdem`, `codigoRastreio`, `descricao`, `tipoMercadoria`, `peso`, `volume`, `valorDeclarado`, `contentor`, `viatura`, `reboque`, `origem`, `destino`, `rota`, `etapas`, `status`, `cliente`, `transportador`, `motorista`, `localizacaoAtual`, `historicoLocalizacoes`, `alertas`, `ocorrencias`, `reclamacoes`, `documentos`, `metricas`, `pagamentos`, `prioridade`, `tags`.

### Status da carga

`registada`, `em_preparacao`, `pronta_para_transporte`, `em_transito`, `em_posto_controlo`, `em_fronteira`, `em_porto`, `em_armazem`, `em_distribuicao`, `entregue`, `suspensa`, `cancelada`, `extraviada`, `danificada`.

### Rota

- `distanciaTotalKm`
- `tempoEstimadoHoras`
- `pontosPassagem[]` com ordem, nome, cidade, país, coordenadas e horários previstos/reais
- `coordenadasRota[]` com latitude, longitude, timestamp, velocidade e altitude
- `desvioPermitidoKm`
- `rotaOtimizada`
- `rotaAlternativa[]`

O mapa do frontend prioriza `coordenadasRota`; quando não existem pontos suficientes, usa `pontosPassagem` e os pontos de origem/localização atual/destino.

## Localização

`/atualizarLocalizacao` recebe `cargaId`, `latitude`, `longitude` e aceita altitude, velocidade, direção, precisão, endereço, cidade, país, fonte e observação.

## Etapas

`/adicionarEtapa` recebe `cargaId`, `nome`, descrição, localização e responsável. Os nomes definidos no schema incluem `carga_registada`, `em_preparacao`, `em_transito`, `posto_controlo`, `fronteira`, `porto`, `armazem`, `em_distribuicao` e `entregue`.

## Rastreamento público

`POST /getCargaByRastreio` recebe `{ codigoRastreio }` e retorna somente os campos públicos definidos pelo backend: código, descrição, status, origem/destino resumidos, localização atual, progresso, data de criação e atualização.

## Autenticação e acesso

Os perfis definidos pelo schema são `administrador_principal`, `administrador`, `cliente`, `transportador`, `motorista`, `analista` e `suporte`. O frontend mantém o controlo por sessão/permissões e usa as rotas de autenticação já existentes.
