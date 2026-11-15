// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY_LANG = 'cc_icea_lang_v1';

export const TRANSLATIONS = {
  pt: {
    // Navigation Tabs
    tabRides: 'Caronas',
    tabCampusConnect: 'Campus Connect',
    tabMyRides: 'Minhas Caronas',
    tabWallet: 'Carteira Pix',
    tabProfile: 'Perfil',
    tabAdmin: 'Admin',

    // Stack Titles
    stackRideDetails: 'Detalhes da Carona',
    stackCreateRide: 'Oferecer Carona',
    stackWallet: 'Carteira & Finanças',
    stackEditProfile: 'Editar Perfil',
    stackRating: 'Avaliar Carona',

    // HomeScreen
    greeting: 'Olá',
    studentDefault: 'Estudante',
    appTitle: 'Caronas ICEA × Campus Connect',
    appSubtitle: 'Plataforma Unificada de Mobilidade & Vida Universitária (PT / EN)',
    segOffers: 'Ofertas',
    segMural: 'Mural',
    segEvents: 'Eventos CC',
    searchRidesPlaceholder: 'Buscar caronas (ICEA, Centro, Westerberg...)',
    searchMuralPlaceholder: 'Buscar pedidos no mural...',
    searchEventsPlaceholder: 'Buscar eventos acadêmicos, festas, esportes...',
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
      'Não encontrou carona no horário? Publique seu pedido no Mural e os motoristas entram em contato pelo Chat ou WhatsApp!',
    eventsBanner:
      'Eventos oficiais sincronizados entre UFOP ICEA e Osnabrück! Ofereça ou peça carona com 1 clique.',
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
    ccHeroBadge: 'SUPER-APP UNIFICADO · UFOP ICEA & OSNABRÜCK',
    ccHeroTitle: 'Campus Connect & Caronas ICEA',
    ccHeroSub: 'Eventos, Mapa Interativo, Grupos, Chats de Disciplinas e Caronas em um só lugar',
    ccSubEvents: 'Eventos & Mapa',
    ccSubSocial: 'Comunidade & Grupos',
    ccSubChats: 'Chats & Disciplinas',
    ccSubIdCard: 'Carteirinha & Módulos',
    mapToggleMap: 'Mapa do Campus',
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
    idCardTitle: 'CARTEIRINHA ESTUDANTIL DIGITAL',
    idCardCode: 'MATRÍCULA / ID',
    enrolledModulesTitle: 'Disciplinas Matriculadas (Clique para abrir o Chat)',
    interestsTitle: 'Interesses Acadêmicos & Esportivos',
  },
  en: {
    // Navigation Tabs
    tabRides: 'Rides',
    tabCampusConnect: 'Campus Connect',
    tabMyRides: 'My Rides',
    tabWallet: 'Pix Wallet',
    tabProfile: 'Profile',
    tabAdmin: 'Admin',

    // Stack Titles
    stackRideDetails: 'Ride Details',
    stackCreateRide: 'Offer a Ride',
    stackWallet: 'Wallet & Payouts',
    stackEditProfile: 'Edit Profile',
    stackRating: 'Rate Ride',

    // HomeScreen
    greeting: 'Hello',
    studentDefault: 'Student',
    appTitle: 'Caronas ICEA × Campus Connect',
    appSubtitle: 'Unified University Mobility & Campus Life Super-App (PT / EN)',
    segOffers: 'Ride Offers',
    segMural: 'Request Board',
    segEvents: 'Campus Events',
    searchRidesPlaceholder: 'Search rides (ICEA, Downtown, Westerberg...)',
    searchMuralPlaceholder: 'Search ride requests on board...',
    searchEventsPlaceholder: 'Search campus events, parties, sports...',
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
      'Need a ride at a specific time? Post on the Request Board and campus drivers will reach out via Chat or WhatsApp!',
    eventsBanner:
      'Live campus events synced across UFOP ICEA & Osnabrück! Offer or request a ride to any event with 1 click.',
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
    ccHeroBadge: 'UNIFIED SUPER-APP · UFOP ICEA & OSNABRÜCK',
    ccHeroTitle: 'Campus Connect & Caronas ICEA',
    ccHeroSub: 'Events, Interactive Campus Map, Student Groups, Module Chats & Carpooling in one app',
    ccSubEvents: 'Events & Map',
    ccSubSocial: 'Social & Groups',
    ccSubChats: 'Chats & Modules',
    ccSubIdCard: 'Student ID & Modules',
    mapToggleMap: 'Campus Map',
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
    idCardTitle: 'DIGITAL STUDENT ID CARD',
    idCardCode: 'STUDENT ID',
    enrolledModulesTitle: 'Enrolled Modules (Click to open Module Chat)',
    interestsTitle: 'Academic & Campus Interests',
  },
};

export const LanguageContext = createContext({
  lang: 'pt',
  setLang: () => {},
  toggleLang: () => {},
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

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onStorage = (e) => {
        if (e.key === STORAGE_KEY_LANG && (e.newValue === 'pt' || e.newValue === 'en')) {
          setLangState(e.newValue);
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
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
