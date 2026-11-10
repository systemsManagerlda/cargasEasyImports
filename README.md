This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## CargoTrack — versão modernizada

A interface foi modernizada mantendo as rotas da API e os campos do schema existentes. O projeto usa os componentes HeroUI que já estavam integrados na camada `components/ui`, com Tailwind CSS para o layout responsivo.

### Rastreamento público

- `/rastrear` — consulta pública por `codigoRastreio`, usando a rota `/getCargaByRastreio`.
- O detalhe de carga agora usa `rota.coordenadasRota` e `rota.pontosPassagem` do schema para desenhar a rota e os pontos de passagem no mapa.
- A página pública não expõe dados privados de cliente, transportador ou documentos; ela consome a resposta pública definida pela API.

### Rotas principais consumidas

`/auth/loginCarga`, `/auth/logoutCarga`, `/getCargaList`, `/getCargaDetailA`, `/createCargaA`, `/updateCargaA`, `/atualizarLocalizacao`, `/adicionarEtapa`, `/registrarOcorrencia`, `/gerarAlerta`, `/confirmarEntrega`, `/getHistoricoLocalizacoes`, `/getCargaByRastreio`, `/atualizarStatusCarga` e as restantes rotas já presentes em `lib/api/endpoints.ts`.

### Configuração

Copie `.env.example` para `.env.local` e defina uma `NEXTAUTH_SECRET` própria.

```bash
npm install
npm run dev
```

Para produção:

```bash
npm run build
npm start
```
