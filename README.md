# 🚗 Caronas ICEA (UFOP)

Aplicativo oficial de caronas universitárias para a comunidade acadêmica do **ICEA - Universidade Federal de Ouro Preto (UFOP)** em João Monlevade - MG.

Construído com **React Native**, **Expo SDK 57**, e persistência local através de **SQLite** (dispositivos móveis) e **LocalStorage Engine** (Web), eliminando dependências externas de nuvem e garantindo funcionamento 100% autônomo e de alta velocidade.

---

## 🌟 Principais Funcionalidades

- **🔐 Autenticação Institucional:** Validação estrita de contas `@ufop.edu.br` com hashing de senha em SHA-256 e persistência de sessão.
- **🗺️ Rotas e Mapas Interativos:** Visualização geográfica com Leaflet & OpenStreetMap, rotas diretas entre o Campus ICEA e bairros de João Monlevade, além de integração com Google Maps e Waze.
- **🛡️ PIN de Embarque de 4 Dígitos:** Cada carona gera um código único que o motorista deve inserir para iniciar a viagem, garantindo segurança total.
- **💰 Sistema Financeiro e Comissão de 25%:** Motoristas recebem 75% líquido creditado em carteira digital integrada com suporte a Chave Pix (CPF, Email, Telefone, Aleatória); a plataforma retém 25% auditável no painel administrativo.
- **📱 Integração Direta:** Botão de WhatsApp direto com mensagem pré-formatada e botão SOS com compartilhamento nativo dos dados do veículo e rota.
- **📷 Upload de Fotos:** Suporte para foto de perfil do motorista/passageiro e foto do veículo cadastrado.

---

## 👥 Contas de Demonstração Pré-Cadastradas

O banco de dados é automaticamente inicializado e semeado na primeira execução:

| Tipo | E-mail | Senha | Detalhes |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@ufop.edu.br` | `123456` | Acesso à aba Admin, métricas financeiras de 25%, auditoria e gestão |
| **Motorista** | `driver@ufop.edu.br` | `123456` | Fiat Uno Vermelho (Placa `ABC1D23`), carteira digital com saldo |
| **Passageiro** | `passenger@ufop.edu.br` | `123456` | Mariana Passageira, saldo para reservas |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- npm ou yarn

### 1. Iniciar no Navegador (Web)
```bash
npm run web
# ou
npx expo start --web
```

### 2. Iniciar no Android ou iOS
```bash
# Android
npm run android

# iOS
npm run ios

# Expo Go com QR Code
npm start
```

### 3. Gerar e Servir o Bundle Web de Produção
```bash
npx expo export --platform web --output-dir dist
npx serve dist -l 8081
```

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** React 19 / React Native 0.86 / Expo SDK 57
- **Navegação:** React Navigation v6 (Native Stack + Bottom Tabs)
- **Persistência:** `expo-sqlite` (Mobile) / Web LocalStorage SQL Simulator (Web) / `AsyncStorage`
- **Mapas:** Leaflet / OpenStreetMap / Geodetic SIRGAS2000 & Haversine
- **Ícones & Estilos:** `@expo/vector-icons`, Tokens de Tema UFOP Navy