// src/components/UfopCampusMap3D2D.js
// Unified 3D (Sketchfab + Custom Extruded 3D) & 2D (OpenStreetMap Leaflet + Vector 2D) Map for all 3 UFOP Campuses
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, UFOP_LINKS } from '../constants/theme';
import { openUfopUrl } from './UfopLogo';

let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    WebView = null;
  }
}

export const UFOP_CAMPUSES = [
  {
    id: 'joao-monlevade',
    shortPt: 'Campus ICEA (João Monlevade)',
    shortEn: 'ICEA Campus (João Monlevade)',
    titlePt: 'UFOP — Campus ICEA (João Monlevade)',
    titleEn: 'UFOP — ICEA Campus (João Monlevade)',
    subtitlePt: 'Instituto de Ciências Exatas e Aplicadas • Rua Trinta e Seis, 115 — Loanda',
    subtitleEn: 'Institute of Exact and Applied Sciences • Rua Trinta e Seis, 115 — Loanda',
    city: 'João Monlevade - MG',
    lat: -19.8336,
    lng: -43.1669,
    zoom: 17,
    portalUrl: 'https://icea.ufop.br/',
    coursesPt: 'Eng. de Computação, Sistemas de Informação, Eng. de Produção, Eng. Elétrica',
    coursesEn: 'Computer Eng., Information Systems, Industrial Eng., Electrical Eng.',
    buildings: [
      {
        id: 'icea-bloco-a',
        code: 'BLOCO A',
        namePt: 'Bloco A — Diretoria, Auditório & Secretarias',
        nameEn: 'Block A — Dean Office, Auditorium & Admin',
        dept: 'Diretoria ICEA / Auditório',
        lat: -19.8333,
        lng: -43.1666,
        x: 24,
        y: 28,
        w: 22,
        d: 14,
        h: 48,
        color: '#8C1D40',
        roofColor: '#A6264C',
        carpoolStop: 'Portaria Principal / Auditório ICEA',
      },
      {
        id: 'icea-bloco-b',
        code: 'BLOCO B',
        namePt: 'Bloco B — Salas de Aula, DECEA & Biblioteca',
        nameEn: 'Block B — Lecture Halls, DECEA & Library',
        dept: 'DECEA / Biblioteca ICEA',
        lat: -19.8337,
        lng: -43.1671,
        x: 52,
        y: 24,
        w: 24,
        d: 15,
        h: 56,
        color: '#7A1530',
        roofColor: '#9E1F42',
        carpoolStop: 'Estacionamento Central Bloco B',
      },
      {
        id: 'icea-bloco-c',
        code: 'BLOCO C',
        namePt: 'Bloco C — Laboratórios DECSI, DEENP & DEELT',
        nameEn: 'Block C — DECSI, DEENP & DEELT Labs',
        dept: 'Computação, Produção & Elétrica',
        lat: -19.8341,
        lng: -43.1665,
        x: 56,
        y: 52,
        w: 25,
        d: 16,
        h: 62,
        color: '#8C1D40',
        roofColor: '#B32B54',
        carpoolStop: 'Acesso Laboratórios Bloco C',
      },
      {
        id: 'icea-ru',
        code: 'RU ICEA',
        namePt: 'Restaurante Universitário (RU ICEA)',
        nameEn: 'University Restaurant (RU ICEA)',
        dept: 'PRAE / Alimentação Estudantil',
        lat: -19.8331,
        lng: -43.1675,
        x: 20,
        y: 56,
        w: 18,
        d: 14,
        h: 34,
        color: '#C59B27',
        roofColor: '#D4AF37',
        carpoolStop: 'Parada RU ICEA',
      },
      {
        id: 'icea-quadra',
        code: 'GINÁSIO',
        namePt: 'Quadra Poliesportiva & Atlética ICEA',
        nameEn: 'Sports Court & ICEA Athletics Arena',
        dept: 'Esportes & Integração',
        lat: -19.8344,
        lng: -43.1672,
        x: 36,
        y: 74,
        w: 20,
        d: 13,
        h: 30,
        color: '#1E5F8A',
        roofColor: '#2980B9',
        carpoolStop: 'Acesso Quadra / Eventos',
      },
      {
        id: 'icea-portaria',
        code: 'CARONAS',
        namePt: 'Portaria Principal — Ponto Oficial Caronas ICEA',
        nameEn: 'Main Gate — Official Caronas ICEA Pickup Point',
        dept: 'Embarque & Desembarque Seguro (PIN 4 Dígitos)',
        lat: -19.8329,
        lng: -43.1662,
        x: 10,
        y: 38,
        w: 12,
        d: 10,
        h: 26,
        color: '#10B981',
        roofColor: '#34D399',
        carpoolStop: 'Campus ICEA (Portaria Principal)',
      },
    ],
  },
  {
    id: 'ouro-preto',
    shortPt: 'Morro do Cruzeiro (Ouro Preto)',
    shortEn: 'Morro do Cruzeiro (Ouro Preto)',
    titlePt: 'UFOP — Campus Morro do Cruzeiro (Ouro Preto · Sede)',
    titleEn: 'UFOP — Morro do Cruzeiro Campus (Ouro Preto · HQ)',
    subtitlePt: 'Sede Reitoria, Escola de Minas, ICEB, Farmácia, Nutrição, IFAC, EDTM • Bauxita',
    subtitleEn: 'Rectory HQ, School of Mines, ICEB, Pharmacy, Nutrition, IFAC, EDTM • Bauxita',
    city: 'Ouro Preto - MG',
    lat: -20.3983,
    lng: -43.5136,
    zoom: 16,
    portalUrl: 'https://ufop.br/',
    coursesPt: 'Engenharias (Civil, Minas, Metalúrgica, Controle, Produção), Computação, Direito, Medicina, Farmácia',
    coursesEn: 'Engineering (Mining, Civil, Control, Metallurgy), CS, Law, Medicine, Pharmacy',
    buildings: [
      {
        id: 'op-reitoria',
        code: 'REITORIA',
        namePt: 'Reitoria UFOP & Centro de Artes e Convenções',
        nameEn: 'UFOP Rectory & Convention Center',
        dept: 'Administração Central UFOP',
        lat: -20.3965,
        lng: -43.5122,
        x: 20,
        y: 24,
        w: 22,
        d: 14,
        h: 54,
        color: '#8C1D40',
        roofColor: '#A6264C',
        carpoolStop: 'Praça da Reitoria — Morro do Cruzeiro',
      },
      {
        id: 'op-em',
        code: 'ESC. MINAS',
        namePt: 'Escola de Minas (EM) — Complexo Morro do Cruzeiro',
        nameEn: 'School of Mines (EM) — Main Complex',
        dept: 'Engenharias UFOP (Fundada em 1876)',
        lat: -20.3985,
        lng: -43.5138,
        x: 48,
        y: 26,
        w: 26,
        d: 16,
        h: 64,
        color: '#7A1530',
        roofColor: '#9E1F42',
        carpoolStop: 'Estacionamento Escola de Minas',
      },
      {
        id: 'op-iceb',
        code: 'ICEB',
        namePt: 'ICEB — Instituto de Ciências Exatas e Biológicas',
        nameEn: 'ICEB — Institute of Exact and Biological Sciences',
        dept: 'DECOM / Matemática / Física / Biologia / Química',
        lat: -20.3992,
        lng: -43.5149,
        x: 54,
        y: 54,
        w: 24,
        d: 16,
        h: 58,
        color: '#8C1D40',
        roofColor: '#B32B54',
        carpoolStop: 'Ponto ICEB / Pavilhão de Aulas',
      },
      {
        id: 'op-ef-enut',
        code: 'FARM / MED',
        namePt: 'Escola de Farmácia (EF), Medicina (EMED) & Nutrição (ENUT)',
        nameEn: 'School of Pharmacy, Medicine & Nutrition',
        dept: 'Ciências da Saúde UFOP',
        lat: -20.3976,
        lng: -43.5155,
        x: 22,
        y: 54,
        w: 22,
        d: 15,
        h: 46,
        color: '#6B1129',
        roofColor: '#8C1D40',
        carpoolStop: 'Acesso Saúde / EF & EMED',
      },
      {
        id: 'op-ru',
        code: 'RU OP',
        namePt: 'Restaurante Universitário (RU Morro do Cruzeiro)',
        nameEn: 'University Restaurant (Morro do Cruzeiro RU)',
        dept: 'PRAE / Alimentação Estudantil',
        lat: -20.3989,
        lng: -43.5125,
        x: 38,
        y: 74,
        w: 20,
        d: 13,
        h: 34,
        color: '#C59B27',
        roofColor: '#D4AF37',
        carpoolStop: 'Parada RU Ouro Preto',
      },
      {
        id: 'op-bauxita',
        code: 'BAUXITA',
        namePt: 'Portaria Bauxita — Hub Central de Caronas UFOP',
        nameEn: 'Bauxita Gate — Central UFOP Carpool Hub',
        dept: 'Integração Ouro Preto ⇄ Mariana ⇄ João Monlevade',
        lat: -20.3958,
        lng: -43.5112,
        x: 10,
        y: 40,
        w: 13,
        d: 11,
        h: 28,
        color: '#10B981',
        roofColor: '#34D399',
        carpoolStop: 'Portaria Bauxita (Ouro Preto)',
      },
    ],
  },
  {
    id: 'mariana',
    shortPt: 'ICHS & ICSA (Mariana)',
    shortEn: 'ICHS & ICSA (Mariana)',
    titlePt: 'UFOP — Campus ICHS & ICSA (Mariana)',
    titleEn: 'UFOP — ICHS & ICSA Campus (Mariana)',
    subtitlePt: 'Instituto de Ciências Humanas e Sociais (ICHS) & Ciências Sociais Aplicadas (ICSA)',
    subtitleEn: 'Institute of Humanities & Social Sciences (ICHS) & Applied Social Sciences (ICSA)',
    city: 'Mariana - MG',
    lat: -20.3778,
    lng: -43.4164,
    zoom: 16,
    portalUrl: 'https://ichs.ufop.br/',
    coursesPt: 'História, Letras, Pedagogia, Administração, Economia, Jornalismo, Serviço Social',
    coursesEn: 'History, Literature, Pedagogy, Business, Economics, Journalism, Social Work',
    buildings: [
      {
        id: 'mar-ichs-hist',
        code: 'ICHS SEDE',
        namePt: 'Prédio Histórico ICHS — História, Letras & Pedagogia',
        nameEn: 'ICHS Historic Building — History, Literature & Pedagogy',
        dept: 'DEHIS / DELET / DEEDU',
        lat: -20.3775,
        lng: -43.4162,
        x: 24,
        y: 26,
        w: 24,
        d: 15,
        h: 50,
        color: '#8C1D40',
        roofColor: '#A6264C',
        carpoolStop: 'Portaria ICHS Mariana',
      },
      {
        id: 'mar-icsa',
        code: 'ICSA',
        namePt: 'Campus ICSA — Administração, Economia, Jornalismo & Serv. Social',
        nameEn: 'ICSA Campus — Business, Economics, Journalism & Social Work',
        dept: 'DECAD / DEECO / DEJOR / DESSO',
        lat: -20.3792,
        lng: -43.4178,
        x: 54,
        y: 30,
        w: 25,
        d: 16,
        h: 56,
        color: '#7A1530',
        roofColor: '#9E1F42',
        carpoolStop: 'Portaria ICSA Mariana',
      },
      {
        id: 'mar-auditorio',
        code: 'AUDITÓRIO',
        namePt: 'Anexo ICHS, Auditório & Pós-Graduação',
        nameEn: 'ICHS Annex, Main Auditorium & Graduate Studies',
        dept: 'Eventos Acadêmicos & Pesquisa',
        lat: -20.3781,
        lng: -43.4168,
        x: 52,
        y: 56,
        w: 22,
        d: 15,
        h: 44,
        color: '#8C1D40',
        roofColor: '#B32B54',
        carpoolStop: 'Pátio Anexo ICHS',
      },
      {
        id: 'mar-ru',
        code: 'RU MARIANA',
        namePt: 'Restaurante Universitário (RU Mariana)',
        nameEn: 'University Restaurant (Mariana RU)',
        dept: 'PRAE / Alimentação Estudantil',
        lat: -20.3784,
        lng: -43.4160,
        x: 22,
        y: 56,
        w: 19,
        d: 14,
        h: 34,
        color: '#C59B27',
        roofColor: '#D4AF37',
        carpoolStop: 'Parada RU Mariana',
      },
      {
        id: 'mar-caronas',
        code: 'CARONAS',
        namePt: 'Ponto Intercampi Mariana ⇄ Ouro Preto ⇄ ICEA',
        nameEn: 'Inter-Campus Carpool Stop Mariana ⇄ Ouro Preto ⇄ ICEA',
        dept: 'Conexão Direta entre os 3 Campi UFOP',
        lat: -20.3770,
        lng: -43.4165,
        x: 36,
        y: 74,
        w: 18,
        d: 12,
        h: 28,
        color: '#10B981',
        roofColor: '#34D399',
        carpoolStop: 'Campus ICHS/ICSA Mariana',
      },
    ],
  },
];

// Build interactive HTML for 3D Extruded Map or 2D OpenStreetMap Leaflet Map
const buildInteractiveCampusMapHtml = (campus, mode, lang) => {
  const buildingsJson = JSON.stringify(campus.buildings);
  const isPt = lang !== 'en';

  if (mode === '2d') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: system-ui, -apple-system, sans-serif; background: #FAF8F6; }
    .ufop-pin {
      display: flex; align-items: center; justify-content: center;
      padding: 4px 8px; border-radius: 999px; font-weight: 800; font-size: 10px;
      color: #FFF; border: 2px solid #D4AF37; box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    .ufop-banner {
      position: absolute; top: 10px; left: 10px; z-index: 999;
      background: rgba(89, 13, 34, 0.92); color: #FFF; padding: 8px 14px;
      border-radius: 10px; border: 1.5px solid #C59B27;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      max-width: 72%;
    }
    .ufop-banner h4 { margin: 0 0 2px 0; font-size: 13px; color: #F3E5AB; }
    .ufop-banner p { margin: 0; font-size: 11px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="ufop-banner">
    <h4>🗺️ ${isPt ? campus.titlePt : campus.titleEn} (2D OpenStreetMap)</h4>
    <p>${isPt ? campus.subtitlePt : campus.subtitleEn}</p>
  </div>
  <div id="map"></div>
  <script>
    const buildings = ${buildingsJson};
    const map = L.map('map', { zoomControl: true }).setView([${campus.lat}, ${campus.lng}], ${campus.zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap • UFOP (${campus.city})'
    }).addTo(map);

    // Draw campus perimeter circle
    L.circle([${campus.lat}, ${campus.lng}], {
      color: '#8C1D40',
      fillColor: '#C59B27',
      fillOpacity: 0.14,
      weight: 2,
      radius: 230
    }).addTo(map);

    const coords = [];
    buildings.forEach((b) => {
      coords.push([b.lat, b.lng]);
      const icon = L.divIcon({
        className: '',
        html: '<div class="ufop-pin" style="background:' + b.color + '">' + b.code + '</div>',
        iconSize: [74, 24],
        iconAnchor: [37, 12]
      });
      const title = ${isPt ? 'b.namePt' : 'b.nameEn'};
      L.marker([b.lat, b.lng], { icon }).addTo(map)
        .bindPopup('<b>' + title + '</b><br/><span style="color:#8C1D40;font-weight:700;">' + b.dept + '</span><br/>🚗 ' + b.carpoolStop);
    });

    if (coords.length > 1) {
      L.polyline(coords, { color: '#8C1D40', weight: 3, dashArray: '6, 6' }).addTo(map);
    }
  </script>
</body>
</html>`;
  }

  // Redesigned Interactive 3D Isometric / WebGL-style Extruded Campus Map
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; user-select: none; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 50% 35%, #2D121B 0%, #14080C 100%);
      color: #FFF;
    }
    .hud-top {
      position: absolute; top: 10px; left: 12px; right: 12px; z-index: 20;
      display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
      pointer-events: none;
    }
    .hud-card {
      pointer-events: auto;
      background: rgba(89, 13, 34, 0.88);
      border: 1.5px solid #C59B27;
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    }
    .hud-card h4 { margin: 0 0 2px 0; font-size: 13px; color: #F3E5AB; }
    .hud-card p { margin: 0; font-size: 11px; color: rgba(255,255,255,0.85); }
    .controls {
      pointer-events: auto;
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .ctrl-btn {
      background: rgba(30, 27, 24, 0.9);
      color: #F3E5AB;
      border: 1px solid #C59B27;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .ctrl-btn:hover { background: #8C1D40; color: #FFF; }
    .viewport {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      perspective: 1100px;
      cursor: grab;
    }
    .viewport:active { cursor: grabbing; }
    .ground {
      position: relative;
      width: 520px; height: 370px;
      background:
        linear-gradient(rgba(197,155,39,0.14) 1px, transparent 1px),
        linear-gradient(90deg, rgba(197,155,39,0.14) 1px, transparent 1px),
        linear-gradient(135deg, #253328 0%, #1B2820 55%, #2A1D21 100%);
      background-size: 26px 26px, 26px 26px, 100% 100%;
      border: 3px solid #C59B27;
      border-radius: 22px;
      transform-style: preserve-3d;
      transition: transform 0.25s ease-out;
      box-shadow: 0 30px 60px rgba(0,0,0,0.65), inset 0 0 40px rgba(140,29,64,0.35);
    }
    .road-main {
      position: absolute;
      left: 8%; right: 8%; top: 45%; height: 22px;
      background: #2D3138;
      border-top: 2px solid #C59B27;
      border-bottom: 2px solid #C59B27;
      transform: translateZ(2px);
    }
    .road-dash {
      position: absolute;
      left: 4%; right: 4%; top: 9px; height: 2px;
      background: repeating-linear-gradient(90deg, #F3E5AB 0 14px, transparent 14px 26px);
    }
    .road-cross {
      position: absolute;
      top: 12%; bottom: 12%; left: 45%; width: 20px;
      background: #2D3138;
      border-left: 1.5px solid rgba(197,155,39,0.7);
      border-right: 1.5px solid rgba(197,155,39,0.7);
      transform: translateZ(2px);
    }
    .bldg-wrap {
      position: absolute;
      transform-style: preserve-3d;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .bldg-wrap:hover {
      transform: translateZ(6px);
    }
    .bldg-roof {
      position: absolute; inset: 0;
      border: 1.5px solid #F3E5AB;
      border-radius: 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-weight: 900; font-size: 10px; color: #FFF;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      box-shadow: inset 0 0 12px rgba(255,255,255,0.2);
    }
    .bldg-wall-front {
      position: absolute; left: 0; right: 0; bottom: 0;
      transform-origin: bottom;
      transform: rotateX(-90deg);
      border: 1px solid rgba(243,229,171,0.5);
      background-image: repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.18) 0px 4px,
        transparent 4px 10px
      );
    }
    .bldg-wall-side {
      position: absolute; top: 0; bottom: 0; right: 0;
      transform-origin: right;
      transform: rotateY(90deg);
      border: 1px solid rgba(243,229,171,0.4);
      filter: brightness(0.8);
    }
    .bldg-label {
      position: absolute;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%) translateZ(24px) rotateX(-45deg);
      background: rgba(15, 12, 10, 0.9);
      color: #F3E5AB;
      border: 1px solid #C59B27;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      white-space: nowrap;
      pointer-events: none;
    }
    .info-bar {
      position: absolute; bottom: 10px; left: 12px; right: 12px; z-index: 20;
      background: rgba(24, 18, 20, 0.94);
      border: 1.5px solid #C59B27;
      border-radius: 12px;
      padding: 8px 14px;
      display: flex; justify-content: space-between; align-items: center; gap: 10px;
    }
    .info-bar strong { color: #F3E5AB; font-size: 12px; }
    .info-bar span { color: #E2E8F0; font-size: 11px; }
  </style>
</head>
<body>
  <div class="hud-top">
    <div class="hud-card">
      <h4>🧊 ${isPt ? campus.titlePt : campus.titleEn} (3D)</h4>
      <p>${isPt ? 'Arraste ou use os botões para girar o modelo 3D dos blocos' : 'Drag or use buttons to rotate the 3D campus blocks'}</p>
    </div>
    <div class="controls">
      <button class="ctrl-btn" onclick="rotate(-18)">⟲ 3D</button>
      <button class="ctrl-btn" onclick="rotate(18)">⟳ 3D</button>
      <button class="ctrl-btn" onclick="tilt()">📐 Tilt</button>
      <button class="ctrl-btn" onclick="resetCam()">🎯 Reset</button>
    </div>
  </div>

  <div class="viewport" id="vp">
    <div class="ground" id="ground">
      <div class="road-main"><div class="road-dash"></div></div>
      <div class="road-cross"></div>
    </div>
  </div>

  <div class="info-bar" id="infoBar">
    <div>
      <strong id="selTitle">${isPt ? 'Selecione um bloco 3D no mapa' : 'Click any 3D building block on the map'}</strong><br/>
      <span id="selSub">${isPt ? campus.coursesPt : campus.coursesEn}</span>
    </div>
    <div style="text-align:right;font-size:11px;color:#34D399;font-weight:700;" id="selStop">
      🚗 ${campus.city}
    </div>
  </div>

  <script>
    const buildings = ${buildingsJson};
    const ground = document.getElementById('ground');
    let rotZ = -28;
    let rotX = 56;
    let scale = 1;

    function applyTransform() {
      ground.style.transform = 'rotateX(' + rotX + 'deg) rotateZ(' + rotZ + 'deg) scale(' + scale + ')';
    }
    applyTransform();

    function rotate(delta) { rotZ += delta; applyTransform(); }
    function tilt() { rotX = rotX === 56 ? 38 : (rotX === 38 ? 66 : 56); applyTransform(); }
    function resetCam() { rotZ = -28; rotX = 56; scale = 1; applyTransform(); }

    buildings.forEach((b) => {
      const wrap = document.createElement('div');
      wrap.className = 'bldg-wrap';
      wrap.style.left = b.x + '%';
      wrap.style.top = b.y + '%';
      wrap.style.width = b.w + '%';
      wrap.style.height = b.d + '%';

      const roof = document.createElement('div');
      roof.className = 'bldg-roof';
      roof.style.background = b.roofColor;
      roof.style.transform = 'translateZ(' + b.h + 'px)';
      roof.innerHTML = '<span>' + b.code + '</span>';

      const front = document.createElement('div');
      front.className = 'bldg-wall-front';
      front.style.height = b.h + 'px';
      front.style.backgroundColor = b.color;

      const side = document.createElement('div');
      side.className = 'bldg-wall-side';
      side.style.width = b.h + 'px';
      side.style.backgroundColor = b.color;

      const label = document.createElement('div');
      label.className = 'bldg-label';
      label.style.transform = 'translate(-50%, -50%) translateZ(' + (b.h + 14) + 'px)';
      label.textContent = b.code;

      wrap.appendChild(front);
      wrap.appendChild(side);
      wrap.appendChild(roof);
      wrap.appendChild(label);

      wrap.onclick = function(e) {
        e.stopPropagation();
        document.getElementById('selTitle').textContent = ${isPt ? 'b.namePt' : 'b.nameEn'};
        document.getElementById('selSub').textContent = b.dept + ' • GPS: ' + b.lat.toFixed(4) + ', ' + b.lng.toFixed(4);
        document.getElementById('selStop').textContent = '🚗 ' + b.carpoolStop;
      };

      ground.appendChild(wrap);
    });

    // Mouse / Touch drag rotation
    let dragging = false, startX = 0;
    const vp = document.getElementById('vp');
    vp.addEventListener('pointerdown', (e) => { dragging = true; startX = e.clientX; });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      startX = e.clientX;
      rotZ += dx * 0.45;
      applyTransform();
    });
  </script>
</body>
</html>`;
};

export default function UfopCampusMap3D2D({
  lang = 'pt',
  initialCampusId = 'joao-monlevade',
  initialMode = 'sketchfab3d', // 'sketchfab3d' | '3d' | '2d'
  height = 360,
  onSelectBuildingRide,
}) {
  const isPt = lang !== 'en';
  const [selectedCampusId, setSelectedCampusId] = useState(initialCampusId);
  const [mapMode, setMapMode] = useState(initialMode);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const activeCampus =
    UFOP_CAMPUSES.find((c) => c.id === selectedCampusId) || UFOP_CAMPUSES[0];

  const handleCampusChange = (campusId) => {
    setSelectedCampusId(campusId);
    setSelectedBuilding(null);
  };

  const renderMapViewport = () => {
    if (mapMode === 'sketchfab3d') {
      if (Platform.OS === 'web') {
        return (
          <View style={[styles.viewportContainer, { height }]}>
            {React.createElement('iframe', {
              title: 'Universidade Federal de Ouro Preto - UFOP 3D Model (Sketchfab)',
              src: UFOP_LINKS.sketchfab3dEmbed,
              style: { width: '100%', height: '100%', border: 'none' },
              allow: 'autoplay; fullscreen; xr-spatial-tracking',
              allowFullScreen: true,
            })}
            <View style={styles.sketchfabBadgeRow}>
              <Text style={styles.sketchfabBadgeText}>
                🏛️ {isPt ? 'Modelo 3D Oficial UFOP (Sketchfab)' : 'Official UFOP 3D Model (Sketchfab)'}
              </Text>
              <TouchableOpacity
                style={styles.sketchfabExternalBtn}
                onPress={() => openUfopUrl(UFOP_LINKS.sketchfab3dPage)}
              >
                <Text style={styles.sketchfabExternalBtnText}>
                  {isPt ? 'Abrir no Sketchfab ↗' : 'Open on Sketchfab ↗'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      if (WebView) {
        return (
          <View style={[styles.viewportContainer, { height }]}>
            <WebView
              originWhitelist={['*']}
              source={{ uri: UFOP_LINKS.sketchfab3dEmbed }}
              style={{ flex: 1 }}
            />
          </View>
        );
      }
    }

    const htmlContent = buildInteractiveCampusMapHtml(activeCampus, mapMode, lang);

    if (Platform.OS === 'web') {
      return (
        <View style={[styles.viewportContainer, { height }]}>
          {React.createElement('iframe', {
            key: `${activeCampus.id}-${mapMode}-${lang}`,
            srcDoc: htmlContent,
            style: { width: '100%', height: '100%', border: 'none' },
            title: `UFOP ${activeCampus.id} ${mapMode}`,
          })}
        </View>
      );
    }

    if (WebView) {
      return (
        <View style={[styles.viewportContainer, { height }]}>
          <WebView
            key={`${activeCampus.id}-${mapMode}-${lang}`}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
          />
        </View>
      );
    }

    return (
      <View style={[styles.viewportContainer, { height, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>{activeCampus.titlePt}</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Compact Single-Row Campus & 3D/2D Mode Selector (No redundant maroon banner) */}
      <View style={styles.headerBlock}>
        {/* 3 UFOP Campuses Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.campusTabsRow}
        >
          {UFOP_CAMPUSES.map((c) => {
            const active = c.id === activeCampus.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.campusPill, active && styles.campusPillActive]}
                onPress={() => handleCampusChange(c.id)}
              >
                <Ionicons
                  name="business"
                  size={13}
                  color={active ? '#FFFFFF' : COLORS.primary}
                />
                <Text style={[styles.campusPillText, active && styles.campusPillTextActive]}>
                  {isPt ? c.shortPt : c.shortEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Map Engine Switcher: Sketchfab 3D | Redesigned 3D | 2D Internet OpenStreetMap */}
        <View style={styles.modeSwitchRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mapMode === 'sketchfab3d' && styles.modeBtnActive]}
            onPress={() => setMapMode('sketchfab3d')}
          >
            <Ionicons
              name="cube"
              size={13}
              color={mapMode === 'sketchfab3d' ? '#FFFFFF' : COLORS.primary}
            />
            <Text style={[styles.modeBtnText, mapMode === 'sketchfab3d' && styles.modeBtnTextActive]}>
              {isPt ? 'Sketchfab 3D UFOP' : 'Sketchfab 3D UFOP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mapMode === '3d' && styles.modeBtnActive]}
            onPress={() => setMapMode('3d')}
          >
            <Ionicons
              name="layers"
              size={13}
              color={mapMode === '3d' ? '#FFFFFF' : COLORS.primary}
            />
            <Text style={[styles.modeBtnText, mapMode === '3d' && styles.modeBtnTextActive]}>
              {isPt ? '3D Blocos' : '3D Blocks'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mapMode === '2d' && styles.modeBtnActive]}
            onPress={() => setMapMode('2d')}
          >
            <Ionicons
              name="map"
              size={13}
              color={mapMode === '2d' ? '#FFFFFF' : COLORS.primary}
            />
            <Text style={[styles.modeBtnText, mapMode === '2d' && styles.modeBtnTextActive]}>
              {isPt ? '2D OpenStreetMap' : '2D OpenStreetMap'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main 3D / 2D Viewport */}
      {renderMapViewport()}

      {/* Interactive Buildings & Carpool Pickup Points Bar */}
      <View style={styles.buildingsFooter}>
        <Text style={styles.buildingsFooterLabel}>
          📍 {isPt
            ? `Blocos e Pontos de Carona — ${activeCampus.shortPt}:`
            : `Buildings & Carpool Stops — ${activeCampus.shortEn}:`}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buildingsChipRow}
        >
          {activeCampus.buildings.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.bldgChip, isSelected && styles.bldgChipSelected]}
                onPress={() => setSelectedBuilding(b)}
              >
                <View style={[styles.bldgDot, { backgroundColor: b.color }]} />
                <Text style={[styles.bldgChipText, isSelected && styles.bldgChipTextSelected]}>
                  {b.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedBuilding && (
          <View style={styles.selectedBuildingCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedBuildingTitle}>
                {isPt ? selectedBuilding.namePt : selectedBuilding.nameEn}
              </Text>
              <Text style={styles.selectedBuildingMeta}>
                {selectedBuilding.dept} • 🚗 {selectedBuilding.carpoolStop}
              </Text>
            </View>
            {onSelectBuildingRide && (
              <TouchableOpacity
                style={styles.rideToBuildingBtn}
                onPress={() => onSelectBuildingRide(selectedBuilding, activeCampus)}
              >
                <Ionicons name="car-sport" size={14} color="#FFFFFF" />
                <Text style={styles.rideToBuildingBtnText}>
                  {isPt ? 'Carona p/ cá' : 'Ride Here'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  headerBlock: {
    backgroundColor: '#FAF8F6',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  campusTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  campusPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  campusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 5,
  },
  campusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    gap: 4,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 5,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  viewportContainer: {
    width: '100%',
    backgroundColor: '#14080C',
    position: 'relative',
  },
  sketchfabBadgeRow: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(89, 13, 34, 0.92)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sketchfabBadgeText: {
    color: '#F3E5AB',
    fontSize: 11,
    fontWeight: '700',
  },
  sketchfabExternalBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  sketchfabExternalBtnText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: '900',
  },
  buildingsFooter: {
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  buildingsFooterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  buildingsChipRow: {
    gap: 6,
  },
  bldgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  bldgChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
  bldgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  bldgChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bldgChipTextSelected: {
    color: '#FFFFFF',
  },
  selectedBuildingCard: {
    marginTop: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBuildingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  selectedBuildingMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rideToBuildingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginLeft: 10,
  },
  rideToBuildingBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
  },
});
