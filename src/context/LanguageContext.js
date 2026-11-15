// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

const STORAGE_KEY_LANG = 'cc_icea_lang_v1';
const STORAGE_KEY_DEVICE = 'cc_icea_device_mode_v1';

export const TRANSLATIONS = {
  pt: {
    // Navigation Tabs
    tabRides: 'Caronas UFOP',
    tabCampusConnect: '3 Campi & Hub',
    tabMyRides: 'Minhas Caronas',
    tabWallet: 'Carteira Pix',
    tabProfile: 'Perfil',
    tabAdmin: 'Admin',

    // Stack Titles
    stackRideDetails: 'Detalhes da Carona',
    stackCreateRide: 'Oferecer Carona UFOP',
    stackWallet: 'Carteira & Finanças',
    stackEditProfile: 'Editar Perfil',
    stackRating: 'Avaliar Carona',

    // HomeScreen
    greeting: 'Olá',
    studentDefault: 'Estudante UFOP',
    appTitle: 'UFOP • Caronas & Campus Connect',
    appSubtitle: 'Ouro Preto • Mariana • João Monlevade (ICEA) — Mobile & Desktop (PT / EN)',
    segOffers: 'Ofertas',
    segMural: 'Mural',
    segEvents: 'Eventos & 3 Campi',
    searchRidesPlaceholder: 'Buscar caronas (ICEA, Ouro Preto, Mariana, Centro...)',
    searchMuralPlaceholder: 'Buscar pedidos no mural...',
    searchEventsPlaceholder: 'Buscar eventos nos 3 campi da UFOP...',
    chipAll: 'Todas',
    chipWomenOnly: 'Elas por Elas 🌸',
    chipAvailable: 'Com Vagas',
    chipToday: 'Hoje',
    chipMorning: 'Manhã (05h-12h)',
    chipAfternoon: 'Tarde (12h-18h)',
    chipNight: 'Noite (18h+)',
    chipMyRides: 'Minhas Caronas',
    emptyRidesTitle: 'Nenhuma carona encontrada',
    emptyRidesSearch: 'Não encontramos caronas para este filtro. Tente outro termo.',
    emptyWomenOnly: "Nenhuma carona 'Elas por Elas' no momento. Que tal postar no Mural?",
    emptyRidesDefault: 'Não há caronas disponíveis para este horário.',
    offerRideAction: 'Oferecer Carona',
    requestRideAction: 'Pedir Carona',
    newRequestAction: 'Novo Pedido',
    muralBanner:
      'Não encontrou carona no horário? Publique seu pedido no Mural e os motoristas da UFOP entram em contato pelo Chat ou WhatsApp!',
    eventsBanner:
      'Explore os mapas 3D/2D dos 3 Campi da UFOP (Ouro Preto, Mariana e João Monlevade) e ofereça ou peça carona com 1 clique.',
    helpUpTo: 'Ajuda até',
    originLabel: 'Origem: ',
    destLabel: 'Destino: ',
    timeLabel: 'Horário: ',
    venueLabel: 'Local: ',
    removeMyRequest: 'Remover Meu Pedido',
    offerRideWhatsApp: 'Oferecer Carona (WhatsApp)',
    offerRideForEvent: 'Oferecer Carona p/ Evento',
    askOnMural: 'Pedir no Mural',
    openInCampusHub: 'Ver no Hub Campus Connect',

    // CampusConnectScreen (Unified Super-App Tab)
    ccHeroBadge: 'UNIVERSIDADE FEDERAL DE OURO PRETO • 3 CAMPI OFICIAIS',
    ccHeroTitle: 'UFOP • Campus Connect & Caronas',
    ccHeroSub: 'Mapas 3D Sketchfab & 2D (Ouro Preto, Mariana e João Monlevade), Eventos, Grupos, Chats e Carteirinha UFOP',
    ccSubEvents: 'Mapas 3D/2D & Eventos',
    ccSubSocial: 'Comunidade & Grupos',
    ccSubChats: 'Chats & Disciplinas',
    ccSubIdCard: 'Carteirinha UFOP',
    mapToggleMap: 'Mapas 3D & 2D UFOP',
    mapToggleList: 'Lista de Eventos',
    createEventBtn: '+ Criar Evento',
    joinEventBtn: 'Participar',
    joinedEventBtn: 'Participando ✓',
    participantsLabel: 'vagas ocupadas',
    socialGroupsTab: 'Grupos Estudantis',
    socialPeopleTab: 'Estudantes',
    joinGroupBtn: 'Entrar no Grupo',
    joinedGroupBtn: 'Membro ✓',
    connectStudentBtn: 'Conectar +',
    connectedStudentBtn: 'Amigos ✓',
    openChatBtn: 'Abrir Chat',
    chatsPersons: 'Pessoas',
    chatsGroups: 'Grupos',
    chatsModules: 'Disciplinas',
    sendMsgPlaceholder: 'Escreva uma mensagem para o chat...',
    sendBtn: 'Enviar',
    idCardTitle: 'CARTEIRINHA ESTUDANTIL OFICIAL UFOP',
    idCardCode: 'MATRÍCULA UFOP',
    enrolledModulesTitle: 'Disciplinas Matriculadas (Clique para abrir o Chat)',
    interestsTitle: 'Interesses Acadêmicos & Esportivos',
  },
  en: {
    // Navigation Tabs
    tabRides: 'UFOP Rides',
    tabCampusConnect: '3 Campuses & Hub',
    tabMyRides: 'My Rides',
    tabWallet: 'Pix Wallet',
    tabProfile: 'Profile',
    tabAdmin: 'Admin',

    // Stack Titles
    stackRideDetails: 'Ride Details',
    stackCreateRide: 'Offer a UFOP Ride',
    stackWallet: 'Wallet & Payouts',
    stackEditProfile: 'Edit Profile',
    stackRating: 'Rate Ride',

    // HomeScreen
    greeting: 'Hello',
    studentDefault: 'UFOP Student',
    appTitle: 'UFOP • Rides & Campus Connect',
    appSubtitle: 'Ouro Preto • Mariana • João Monlevade (ICEA) — Mobile & Desktop (PT / EN)',
    segOffers: 'Ride Offers',
    segMural: 'Request Board',
    segEvents: 'Events & 3 Campuses',
    searchRidesPlaceholder: 'Search rides (ICEA, Ouro Preto, Mariana, Downtown...)',
    searchMuralPlaceholder: 'Search ride requests on board...',
    searchEventsPlaceholder: 'Search events across all 3 UFOP campuses...',
    chipAll: 'All Rides',
    chipWomenOnly: 'Women Only 🌸',
    chipAvailable: 'Available Seats',
    chipToday: 'Today',
    chipMorning: 'Morning (5am-12pm)',
    chipAfternoon: 'Afternoon (12pm-6pm)',
    chipNight: 'Night (6pm+)',
    chipMyRides: 'My Rides',
    emptyRidesTitle: 'No rides found',
    emptyRidesSearch: 'No rides matched your search. Try another keyword.',
    emptyWomenOnly: "No 'Women Only' rides right now. Post a request on the Board!",
    emptyRidesDefault: 'No rides available for this time slot.',
    offerRideAction: 'Offer a Ride',
    requestRideAction: 'Request Ride',
    newRequestAction: 'New Request',
    muralBanner:
      'Need a ride at a specific time? Post on the Request Board and UFOP drivers will reach out via Chat or WhatsApp!',
    eventsBanner:
      'Explore the 3D/2D maps for all 3 UFOP Campuses (Ouro Preto, Mariana & João Monlevade) and offer or request a ride with 1 click.',
    helpUpTo: 'Contribution up to',
    originLabel: 'From: ',
    destLabel: 'To: ',
    timeLabel: 'Time: ',
    venueLabel: 'Venue: ',
    removeMyRequest: 'Remove My Request',
    offerRideWhatsApp: 'Offer Ride (WhatsApp)',
    offerRideForEvent: 'Offer Ride to Event',
    askOnMural: 'Request on Board',
    openInCampusHub: 'Open in Campus Connect Hub',

    // CampusConnectScreen (Unified Super-App Tab)
    ccHeroBadge: 'FEDERAL UNIVERSITY OF OURO PRETO • 3 OFFICIAL CAMPUSES',
    ccHeroTitle: 'UFOP • Campus Connect & Rides',
    ccHeroSub: 'Sketchfab 3D & 2D Maps (Ouro Preto, Mariana & João Monlevade), Events, Groups, Module Chats & UFOP ID',
    ccSubEvents: '3D/2D Maps & Events',
    ccSubSocial: 'Social & Groups',
    ccSubChats: 'Chats & Modules',
    ccSubIdCard: 'UFOP Student ID',
    mapToggleMap: 'UFOP 3D & 2D Maps',
    mapToggleList: 'Events List',
    createEventBtn: '+ Create Event',
    joinEventBtn: 'Join Event',
    joinedEventBtn: 'Participating ✓',
    participantsLabel: 'places occupied',
    socialGroupsTab: 'Student Groups',
    socialPeopleTab: 'Students',
    joinGroupBtn: 'Join Group',
    joinedGroupBtn: 'Joined ✓',
    connectStudentBtn: 'Connect +',
    connectedStudentBtn: 'Friends ✓',
    openChatBtn: 'Open Chat',
    chatsPersons: 'Direct',
    chatsGroups: 'Groups',
    chatsModules: 'Modules',
    sendMsgPlaceholder: 'Type a message in this channel...',
    sendBtn: 'Send',
    idCardTitle: 'OFFICIAL UFOP DIGITAL STUDENT ID',
    idCardCode: 'UFOP STUDENT ID',
    enrolledModulesTitle: 'Enrolled Modules (Click to open Module Chat)',
    interestsTitle: 'Academic & Campus Interests',
  },
};

export const LanguageContext = createContext({
  lang: 'pt',
  setLang: () => {},
  toggleLang: () => {},
  deviceMode: 'desktop',
  setDeviceMode: () => {},
  toggleDeviceMode: () => {},
  t: (key) => TRANSLATIONS.pt[key] || key,
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY_LANG);
        if (saved === 'en' || saved === 'pt') return saved;
      }
    } catch {
      // ignore
    }
    return 'pt';
  });

  const [deviceMode, setDeviceModeState] = useState(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY_DEVICE);
        if (saved === 'desktop' || saved === 'mobile') return saved;
      }
    } catch {
      // ignore
    }
    const width = Dimensions.get('window').width || 1024;
    return width >= 768 ? 'desktop' : 'mobile';
  });

  const setLang = (nextLang) => {
    setLangState(nextLang);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_LANG, nextLang);
      }
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'pt' ? 'en' : 'pt');
  };

  const setDeviceMode = (nextMode) => {
    setDeviceModeState(nextMode);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_DEVICE, nextMode);
      }
    } catch {
      // ignore
    }
  };

  const toggleDeviceMode = () => {
    setDeviceMode(deviceMode === 'desktop' ? 'mobile' : 'desktop');
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onStorage = (e) => {
        if (e.key === STORAGE_KEY_LANG && (e.newValue === 'pt' || e.newValue === 'en')) {
          setLangState(e.newValue);
        }
        if (e.key === STORAGE_KEY_DEVICE && (e.newValue === 'desktop' || e.newValue === 'mobile')) {
          setDeviceModeState(e.newValue);
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }
  }, []);

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.pt[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        deviceMode,
        setDeviceMode,
        toggleDeviceMode,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
