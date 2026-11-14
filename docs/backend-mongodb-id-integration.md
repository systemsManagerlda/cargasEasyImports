# Ajustes obrigatórios no backend para a integração MongoDB _id

O frontend deste projecto passa a seleccionar motoristas pelo `_id` do documento da colecção `Utilizador`. Para a integração funcionar de ponta a ponta, aplicar também os ajustes abaixo no backend.

## 1. `respostaGestao`

A função actual já preserva `_id` porque converte o documento com `toObject()` e não o elimina. Não é necessário alterar esta função para expor o `_id`.

## 2. Login

A resposta actual `utilizador.toObject()` já inclui `_id`. O frontend NextAuth usa esse `_id` para normalizar `motoristaId` quando `perfil === "motorista"`.

Se também quiseres que qualquer outro consumidor da API receba `motoristaId` normalizado no login, antes de montar a resposta:
```js
const userData = respostaGestao(utilizador);

if (userData.perfil === "motorista") {
  userData.motoristaId = String(userData._id);
}
```
Evita devolver `sessaoAtiva` ou outros segredos no objecto de utilizador. Preferencialmente, usa `respostaGestao(utilizador)` em vez de `utilizador.toObject()`.

## 3. Middleware `verificarAutenticacao`

Depois de procurar o utilizador e antes de chamar `next()`, disponibiliza o identificador canónico na sessão do pedido:
```js
const userData = utilizador.toObject();

if (userData.perfil === "motorista") {
  userData.motoristaId = String(userData._id);
}

req.user = userData;
req.sessao = sessao;
return next();
```
Isto é importante porque `/getCargaListA` filtra por `req.user.motoristaId`. Não é necessário alterar o `utilizadorId` guardado na colecção `Sessao`.

## 4. Detalhe do motorista por `_id`

Em `/getMotoristaDetailA`, quando o body contém `motoristaId`, o filtro deve procurar `_id`, não o campo personalizado `motoristaId`:
```js
const filtro = { perfil: "motorista", arquivado: false };

if (utilizadorId) {
  filtro.utilizadorId = utilizadorId;
} else {
  filtro._id = motoristaId;
}
```
Ajusta a declaração do filtro ao tipo/schema usado no teu projecto. O endpoint continua a aceitar `utilizadorId` para compatibilidade com clientes antigos.

## 5. Actualização do motorista por `_id`

Em `/updateMotoristaA`, aplica a mesma regra:
```js
const filtro = { perfil: "motorista", arquivado: false };

if (utilizadorId) {
  filtro.utilizadorId = utilizadorId;
} else {
  filtro._id = motoristaId;
}
```
Mantém a lista de campos permitidos que já existe no backend. O frontend envia apenas esses campos.

## 6. Listagem de cargas e controlo de acesso

No `/getCargaListA`, mantém o filtro de perfil:
```js
if (req.user.perfil === "motorista") {
  filter["motorista.motoristaId"] = req.user.motoristaId;
}
```
Mas impede que o body substitua o filtro do motorista autenticado. Altera o filtro adicional para:
```js
if (motoristaId && req.user.perfil !== "motorista") {
  filter["motorista.motoristaId"] = motoristaId;
}
```

## 7. Atribuição de motorista na carga

O frontend envia `motorista.motoristaId` com o `_id` string do utilizador seleccionado. Recomenda-se que a rota de criação/actualização da carga valide esse identificador na colecção `Utilizador`, confirme `perfil: "motorista"` e `arquivado: false`, e construa os campos de nome/contacto a partir do registo encontrado. Não confies no nome/telefone recebidos do browser como fonte de verdade.

## Limites do contrato actualmente fornecido

- Não foi fornecida uma rota `deleteMotoristaA`; o frontend não chama essa rota e o método `delete()` devolve uma mensagem explícita de indisponibilidade.
- A rota de registo não foi fornecida integralmente. O frontend usa `utilizadorId` devolvido pelo registo e consulta `/getMotoristaDetailA` para obter o `_id` real. Confirma que o endpoint de registo devolve `data.utilizadorId`.
- As rotas `/getMotoristaDetailA` e `/updateMotoristaA` têm de receber o `_id` em `motoristaId` e procurar por `_id`, conforme os ajustes acima.
