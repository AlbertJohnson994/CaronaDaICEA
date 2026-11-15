# 🏛️ UFOP • Caronas ICEA × Campus Connect (Super-App Mobile & Desktop)

**🇵🇹 Português:** Super-App institucional unificado de **Mobilidade Acadêmica (`Caronas ICEA`)** e **Vida Universitária (`Campus Connect`)** para os **3 Campi da Universidade Federal de Ouro Preto (UFOP)** — **Ouro Preto (Morro do Cruzeiro)**, **João Monlevade (Campus ICEA)** e **Mariana (Campus ICHS & ICSA)** — totalmente bilíngue (**Português 🇧🇷 ⇄ English 🇬🇧**) e com suporte nativo a **Mobile App** e **Desktop App**.

**🇬🇧 English:** Unified institutional **Academic Mobility (`Caronas ICEA`)** and **Campus Life (`Campus Connect`)** Super-App for all **3 Campuses of the Federal University of Ouro Preto (UFOP)** — **Ouro Preto (Morro do Cruzeiro)**, **João Monlevade (ICEA Campus)**, and **Mariana (ICHS & ICSA Campus)** — fully bilingual (**Português 🇧🇷 ⇄ English 🇬🇧**) with native **Mobile App** and **Desktop App** modes.

🔗 **Portal Oficial UFOP Conectado / Connected Official Portal:** [https://ufop.br/](https://ufop.br/)  
🧊 **Modelo 3D Oficial UFOP (Sketchfab):** [Universidade Federal de Ouro Preto - UFOP 3D](https://sketchfab.com/3d-models/universidade-federal-de-ouro-preto-ufop-cb546bc4ac754440bdd75e9ec39cae6f)

---

## ✨ Principais Funcionalidades / Key Features

### 🏛️ 1. Identidade Visual Oficial UFOP & Conexão Direta ao Portal (`https://ufop.br/`)
- **Cores Institucionais UFOP:** Paleta oficial em **Vinho / Grená UFOP (`#8C1D40` / `#590D22`)** e **Ouro / Dourado UFOP (`#C59B27` / `#D4AF37`)** ([src/constants/theme.js](src/constants/theme.js)).
- **Emblema e Logotipo UFOP ([src/components/UfopLogo.js](src/components/UfopLogo.js)):** Presente na Landing Page, barra superior institucional e hub dos campi.
- **Atalhos Diretos UFOP:** Acesso em 1 clique para [ufop.br](https://ufop.br/), [Minha UFOP](https://minha.ufop.br/), [Portal ICEA](https://icea.ufop.br/) e [Portal ICHS](https://ichs.ufop.br/).

### 🗺️ 2. Mapas 3D & 2D dos 3 Campi da UFOP ([src/components/UfopCampusMap3D2D.js](src/components/UfopCampusMap3D2D.js))
Três motores de visualização interativa para os **3 Campi da UFOP**:
1. **🏛️ Sketchfab 3D Oficial UFOP:** Incorporação direta do modelo 3D oficial da UFOP (`cb546bc4ac754440bdd75e9ec39cae6f`).
2. **🧊 Mapa 3D Interativo dos Blocos:** Blocos arquitetônicos extrudados em 3D com rotação (`⟲ / ⟳`), inclinação (`Tilt`) e botão **"Carona p/ cá / Ride Here"**:
   - **Ouro Preto — Campus Morro do Cruzeiro (Sede):** Reitoria, Escola de Minas (EM), ICEB, Farmácia/Medicina/Nutrição, RU Ouro Preto e Portaria Bauxita.
   - **João Monlevade — Campus ICEA:** Bloco A (Diretoria e Auditório), Bloco B (Salas, DECEA e Biblioteca), Bloco C (Laboratórios DECSI, DEENP e DEELT), RU ICEA, Ginásio e Portaria Principal.
   - **Mariana — Campus ICHS & ICSA:** Prédio Histórico ICHS, Campus ICSA, Anexo & Auditório, Biblioteca ICHS, RU Mariana e Ponto Intercampi.
3. **🗺️ Mapa 2D Internet (OpenStreetMap + Leaflet):** Mapa geográfico real com pinos institucionais, perímetro do campus e rotas de carona.

### 🚗 3. Caronas ICEA & Intercampi (Segurança & Pix 75% / 25%)
- **🔐 Autenticação `@ufop.edu.br`:** Hashing SHA-256 ([src/utils/security.js](src/utils/security.js)) e persistência de sessão.
- **🌸 Carona Elas por Elas:** Filtro e selo exclusivo para caronas entre mulheres.
- **📌 Mural de Pedidos:** Estudantes publicam solicitações de carona e motoristas oferecem viagem em 1 clique.
- **🛡️ PIN de Embarque de 4 Dígitos:** Validação obrigatória antes de iniciar a viagem.
- **💳 Carteira Digital & Pix Copia e Cola (EMV BR Code + CRC16):** Repasse líquido automático de **75% para o motorista** e **25% de taxa de manutenção da plataforma** ([src/utils/pixPayload.js](src/utils/pixPayload.js), [src/screens/WalletScreen.js](src/screens/WalletScreen.js)).

### 🌐 4. Campus Connect Hub Nativo & Bilíngue (`PT ⇄ EN`) ([src/screens/CampusConnectScreen.js](src/screens/CampusConnectScreen.js))
- **🗺️ Mapas 3D/2D & Eventos:** Eventos acadêmicos, esportivos e culturais sincronizados com botão **"Oferecer Carona p/ Evento"**.
- **👥 Comunidade & Grupos:** Descoberta de grupos estudantis (DECSI & IA, Atlética, Intercâmbio) e conexão entre estudantes.
- **💬 Chats & Disciplinas:** Canais em tempo real para mensagens diretas, grupos e disciplinas (`BCC202`, `BCC321`, `ENP104`, `11B0077`).
- **🪪 Carteirinha Estudantil Digital UFOP:** Identificação acadêmica digital nas cores da UFOP.

### 🖥️📱 5. Modo Desktop App & Mobile App ([src/navigation/AppNavigator.js](src/navigation/AppNavigator.js) & [desktop/main.js](desktop/main.js))
- Alternância instantânea na barra superior entre **`🖥️ Desktop App`** (layout widescreen completo) e **`📱 Mobile App`** (frame mobile responsivo), além de executável desktop via Electron (`npm run desktop`).

---

## 👥 Contas de Demonstração (1 Clique na Landing Page)

| Perfil / Role | E-mail | Senha | Detalhes |
| :--- | :--- | :--- | :--- |
| **Motorista / Driver** | `driver@ufop.edu.br` | `123456` | Veículo cadastrado, criação de caronas e Carteira Pix (75%) |
| **Passageiro / Passenger** | `passenger@ufop.edu.br` | `123456` | Reserva de vagas, PIN de 4 dígitos e Mural de Pedidos |
| **Administrador / Admin** | `admin@ufop.edu.br` | `123456` | Painel Admin, auditoria de comissões (25%) e denúncias |

---

## 🚀 Como Executar / How to Run

### Pré-requisitos / Prerequisites
- **Node.js 22 LTS** (v20.12+)
- `npm`

### 1. Instalar Dependências / Install Dependencies
```bash
npm ci
```

### 2. Executar como Web / Mobile Super-App
```bash
npm run web
# ou exportar e servir o bundle de produção:
npm run build:web
```

### 3. Executar como Desktop App (Electron)
```bash
npm run desktop
```
