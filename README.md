# BIO-LINK.NODE

### > Upgrade your biology. Optimize your node.

---

## // Visão Geral

O **BIO-LINK.NODE** é um dashboard de bio-análise que atua como uma ponte direta entre seus dados metabólicos e uma inteligência artificial preditiva. Em vez de registrar dados manualmente em interfaces genéricas, o sistema utiliza o Google Gemini 1.5 Flash para interpretar texto e imagens, transformando o rastreamento de saúde em uma experiência imersiva e visualmente recompensadora, com uma estética cyberpunk que redefine o engajamento do usuário com seus próprios dados biológicos.

Este projeto foi construído com uma stack moderna (Next.js/React 19, Vite, Tailwind CSS) para garantir uma interface reativa e performática.

## // Key Features

| Feature               | Descrição                                                                                             | Emoji |
| --------------------- | ----------------------------------------------------------------------------------------------------- | :---: |
| **AI Logging**        | Descreva suas refeições ou treinos em linguagem natural. A IA estrutura os dados para você.            | `🤖`  |
| **Scanner Vision**    | Tire uma foto do seu prato. O Gemini analisa o conteúdo e estima as informações nutricionais.           | `👁️`  |
| **Bio-Insight Engine**| A IA analisa seus padrões de 7 dias para gerar "bio-hacks" e insights preditivos.                      | `🧠`  |
| **Dynamic Dashboard** | Monitore seu saldo calórico líquido, macros e micros em uma interface reativa e de alta fidelidade.    | `📊`  |
| **Cyberpunk UI/UX**   | Um ambiente dark-mode com fontes e efeitos visuais que motivam o engajamento contínuo.                 | ` cyberpunk ` |
| **Data Persistence**  | Seus dados são salvos localmente, garantindo privacidade e acesso offline. Exportação em JSON disponível.| `💾` |


## // Guia de Instalação

Para executar uma instância local (um "nó") do sistema, siga os passos abaixo.

**1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/bio-link-node.git
cd bio-link-node
```

**2. Instale as Dependências**
O projeto utiliza `npm` para gerenciamento de pacotes.
```bash
npm install
```

**3. Configure a Chave da API**
O motor de IA requer uma chave do Google Gemini.
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione sua chave da API da seguinte forma:
```
GEMINI_API_KEY="SUA_CHAVE_API_AQUI"
```

**4. Execute o Servidor de Desenvolvimento**
O sistema será inicializado em `http://localhost:3000`.
```bash
npm run dev
```

## // Arquitetura Simplificada

O núcleo da aplicação reside em três componentes principais:

- **Interface (React/Vite)**: Renderiza o dashboard e gerencia o estado da UI, proporcionando uma experiência de usuário fluida e reativa.
- **Serviços (`/services`)**:
    - `gemini.ts`: Orquestra a comunicação com a API do Google Gemini, enviando prompts de texto e imagem para análise.
    - `storage.ts`: Gerencia a persistência de dados no `localStorage`, tratando da carga, salvamento e migração de estado.
    - `calculator.ts`: Contém a lógica para cálculos metabólicos, como Taxa Metabólica Basal (TMB) e metas de macronutrientes.
- **Estado (Local)**: A aplicação opera em um modelo "local-first", garantindo que todos os dados do usuário permaneçam no dispositivo para máxima privacidade e performance.

---