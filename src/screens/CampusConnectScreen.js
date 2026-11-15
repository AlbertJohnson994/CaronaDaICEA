// src/screens/CampusConnectScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UfopLogo, { openUfopUrl } from '../components/UfopLogo';
import UfopCampusMap3D2D from '../components/UfopCampusMap3D2D';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, UFOP_LINKS } from '../constants/theme';
import {
  DEFAULT_CAMPUS_CONNECT_EVENTS,
  getCampusConnectEvents,
  openCampusConnectHub,
} from '../services/campusConnectService';

const INITIAL_CC_GROUPS = [
  {
    id: 'grp-icea-decsi',
    namePt: 'Comunidade DECSI & IA — UFOP ICEA',
    nameEn: 'DECSI & AI Community — UFOP ICEA',
    uni: 'UFOP — Campus ICEA',
    categoryPt: 'Tecnologia & Pesquisa',
    categoryEn: 'Tech & Research',
    members: 48,
    schedulePt: 'Quartas · 18:30 · Lab 104 ICEA',
    scheduleEn: 'Wednesdays · 6:30 PM · Lab 104 ICEA',
    descPt: 'Grupo de projetos em IA, Mobile, Hackathons e caronas colaborativas do ICEA.',
    descEn: 'Student group for AI, Mobile dev, Hackathons, and collaborative campus rides at ICEA.',
    joined: true,
  },
  {
    id: 'grp-icea-atletica',
    namePt: 'Atlética Engenharias UFOP ICEA',
    nameEn: 'UFOP ICEA Engineering Athletics',
    uni: 'UFOP — Campus ICEA',
    categoryPt: 'Esporte & Integração',
    categoryEn: 'Sports & Social',
    members: 85,
    schedulePt: 'Terças & Quintas · 19:00 · Quadra ICEA',
    scheduleEn: 'Tue & Thu · 7:00 PM · ICEA Sports Court',
    descPt: 'Treinos de futsal, vôlei, handebol e caronas para os jogos universitários.',
    descEn: 'Futsal, volleyball, handball practices and shared rides to university tournaments.',
    joined: false,
  },
  {
    id: 'grp-uos-boulder',
    namePt: 'Boulder Crew Westerberg (Osnabrück)',
    nameEn: 'Boulder Crew Westerberg (Osnabrück)',
    uni: 'Osnabrück University',
    categoryPt: 'Esporte & Escalada',
    categoryEn: 'Climbing & Sport',
    members: 24,
    schedulePt: 'Terças & Quintas · 18:30',
    scheduleEn: 'Tuesdays & Thursdays · 6:30 PM',
    descPt: 'Sessões semanais de escalada e intercâmbio estudantil Brasil-Alemanha.',
    descEn: 'Weekly bouldering sessions and Brazil-Germany student exchange meetups.',
    joined: false,
  },
];

const INITIAL_CC_STUDENTS = [
  {
    id: 'stu-mariana',
    name: 'Mariana Costa',
    coursePt: 'Engenharia de Computação · 6º período',
    courseEn: 'Computer Engineering · 6th semester',
    uni: 'UFOP — Campus ICEA',
    bioPt: 'Motorista Elas por Elas 🌸 e monitora de Estruturas de Dados I (BCC202).',
    bioEn: 'Women-Only Carpool driver 🌸 and TA for Data Structures I (BCC202).',
    modules: ['BCC202', 'BCC321'],
    connected: true,
  },
  {
    id: 'stu-noah',
    name: 'Noah Schuster',
    coursePt: 'Ciência da Computação (B.Sc.) · 5º semestre',
    courseEn: 'Computer Science (B.Sc.) · 5th semester',
    uni: 'Osnabrück University',
    bioPt: 'Tutor de Banco de Dados (11B0077) e motorista de carona elétrica em Westerberg.',
    bioEn: 'Tutor for Databases (11B0077) and electric campus carpool driver at Westerberg.',
    modules: ['11B0077', 'BCC321'],
    connected: true,
  },
  {
    id: 'stu-amira',
    name: 'Amira Yilmaz',
    coursePt: 'Sistemas de Informação · 4º semestre',
    courseEn: 'Information Systems · 4th semester',
    uni: 'Osnabrück University / UFOP Exchange',
    bioPt: 'Intercambista pesquisando mobilidade urbana inteligente e sistemas distribuídos.',
    bioEn: 'Exchange student researching smart urban mobility and distributed systems.',
    modules: ['11B0077', 'ENP104'],
    connected: false,
  },
];

const INITIAL_CC_CHATS = [
  {
    id: 'chat-bcc202',
    type: 'Modules',
    name: 'BCC202 · Estruturas de Dados I / Data Structures',
    subtitlePt: 'Canal Oficial da Disciplina · 64 estudantes',
    subtitleEn: 'Official Module Channel · 64 students',
    messages: [
      {
        id: 'm1',
        sender: 'Mariana Costa',
        textPt: 'Pessoal, subi o material de Árvores Balanceadas e saio do Centro às 18h10 com 2 vagas!',
        textEn: 'Hey everyone! Uploaded the Balanced Trees notes — leaving Downtown at 6:10 PM with 2 seats!',
        time: '17:45',
        mine: false,
      },
    ],
  },
  {
    id: 'chat-bcc321',
    type: 'Modules',
    name: 'BCC321 · Engenharia de Software & Mobile',
    subtitlePt: 'Canal Oficial da Disciplina · 52 estudantes',
    subtitleEn: 'Official Module Channel · 52 students',
    messages: [
      {
        id: 'm2',
        sender: 'Prof. & Monitoria DECSI',
        textPt: 'A apresentação do projeto integrado Caronas ICEA × Campus Connect será no Auditório!',
        textEn: 'The integrated Caronas ICEA × Campus Connect project demo will take place in the Auditorium!',
        time: '16:20',
        mine: false,
      },
    ],
  },
  {
    id: 'chat-mariana',
    type: 'Persons',
    name: 'Mariana Costa (UFOP ICEA)',
    subtitlePt: 'Engenharia de Computação · Carona Elas por Elas 🌸',
    subtitleEn: 'Computer Engineering · Women-Only Carpool 🌸',
    messages: [
      {
        id: 'm3',
        sender: 'Mariana Costa',
        textPt: 'Combinado! Passo em frente à Rodoviária às 18:10 para o Hackathon no ICEA.',
        textEn: 'Sounds great! Picking up in front of the Bus Station at 6:10 PM for the ICEA Hackathon.',
        time: '18:02',
        mine: false,
      },
    ],
  },
  {
    id: 'chat-grp-decsi',
    type: 'Groups',
    name: 'Comunidade DECSI & IA — UFOP ICEA',
    subtitlePt: 'Grupo Acadêmico · 48 membros',
    subtitleEn: 'Academic Group · 48 members',
    messages: [
      {
        id: 'm4',
        sender: 'Lucas Oliveira',
        textPt: 'Quem vai precisar de carona saindo de Carneirinhos hoje para o Hackathon?',
        textEn: 'Who needs a ride leaving from Carneirinhos today for the Hackathon?',
        time: '17:15',
        mine: false,
      },
    ],
  },
];

const CampusConnectScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { lang, toggleLang, t } = useLanguage();

  const [subTab, setSubTab] = useState('events'); // 'events' | 'social' | 'chats' | 'idcard'
  const [eventsViewMode, setEventsViewMode] = useState('map'); // 'map' | 'list'
  const [events, setEvents] = useState(DEFAULT_CAMPUS_CONNECT_EVENTS);
  const [joinedEvents, setJoinedEvents] = useState(['ev-ufop-hackathon']);
  const [selectedMapPin, setSelectedMapPin] = useState(DEFAULT_CAMPUS_CONNECT_EVENTS[0]);

  const [socialMode, setSocialMode] = useState('groups'); // 'groups' | 'people'
  const [groups, setGroups] = useState(INITIAL_CC_GROUPS);
  const [students, setStudents] = useState(INITIAL_CC_STUDENTS);

  const [chats, setChats] = useState(INITIAL_CC_CHATS);
  const [activeChatId, setActiveChatId] = useState('chat-bcc202');
  const [chatInput, setChatInput] = useState('');

  // Create Event Modal
  const [createEventModal, setCreateEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVenue, setNewVenue] = useState('Campus ICEA UFOP');
  const [newTime, setNewTime] = useState('Amanhã às 18:00');
  const [newCategory, setNewCategory] = useState('Learn');

  useEffect(() => {
    getCampusConnectEvents()
      .then((list) => {
        setEvents(list);
        if (list.length > 0) setSelectedMapPin(list[0]);
      })
      .catch(() => {});
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleToggleEventJoin = (eventId) => {
    setJoinedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleCreateEvent = () => {
    if (!newTitle.trim()) return;
    const created = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      organizer: user?.name || 'Estudante UFOP ICEA',
      university: 'UFOP — Campus ICEA (João Monlevade)',
      category: newCategory,
      dateTimeLabel: newTime.trim() || 'Amanhã às 18:00',
      venue: newVenue.trim() || 'Campus ICEA UFOP',
      venueDetail: newVenue.trim() || 'Campus ICEA UFOP',
      occupied: 1,
      capacity: 30,
      description:
        lang === 'pt'
          ? 'Evento criado pelo Super-App Caronas ICEA × Campus Connect.'
          : 'Event created via the unified Caronas ICEA × Campus Connect Super-App.',
    };
    setEvents((prev) => [created, ...prev]);
    setJoinedEvents((prev) => [...prev, created.id]);
    setSelectedMapPin(created);
    setNewTitle('');
    setCreateEventModal(false);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = {
      id: `m-${Date.now()}`,
      sender: user?.name || 'Você / You',
      textPt: chatInput.trim(),
      textEn: chatInput.trim(),
      time: now,
      mine: true,
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id ? { ...c, messages: [...c.messages, msg] } : c
      )
    );
    setChatInput('');
  };

  return (
    <View style={styles.container}>
      {/* Single Compact Sub-Navigation & Action Bar (No stacked maroon banners) */}
      <View style={styles.heroHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsRow}
        >
          {[
            { id: 'events', icon: 'map', label: t('ccSubEvents') },
            { id: 'social', icon: 'people', label: t('ccSubSocial') },
            { id: 'chats', icon: 'chatbubbles', label: t('ccSubChats') },
            { id: 'idcard', icon: 'card', label: t('ccSubIdCard') },
          ].map((tab) => {
            const active = subTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTabPill, active && styles.subTabPillActive]}
                onPress={() => setSubTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={active ? '#FFFFFF' : COLORS.textSecondary}
                />
                <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.heroRightActions}>
          {subTab === 'events' && (
            <>
              <View style={styles.viewModeSwitch}>
                <TouchableOpacity
                  style={[
                    styles.viewModeBtn,
                    eventsViewMode === 'map' && styles.viewModeBtnActive,
                  ]}
                  onPress={() => setEventsViewMode('map')}
                >
                  <Ionicons
                    name="map-outline"
                    size={13}
                    color={eventsViewMode === 'map' ? '#FFFFFF' : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.viewModeText,
                      eventsViewMode === 'map' && styles.viewModeTextActive,
                    ]}
                  >
                    {t('mapToggleMap')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewModeBtn,
                    eventsViewMode === 'list' && styles.viewModeBtnActive,
                  ]}
                  onPress={() => setEventsViewMode('list')}
                >
                  <Ionicons
                    name="list-outline"
                    size={13}
                    color={eventsViewMode === 'list' ? '#FFFFFF' : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.viewModeText,
                      eventsViewMode === 'list' && styles.viewModeTextActive,
                    ]}
                  >
                    {t('mapToggleList')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setCreateEventModal(true)}
              >
                <Text style={styles.createBtnText}>{t('createEventBtn')}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.externalWebBtn}
            onPress={() => openCampusConnectHub('#events')}
          >
            <Ionicons name="open-outline" size={13} color={COLORS.primaryDark} />
            <Text style={styles.externalWebBtnText}>
              {lang === 'pt' ? 'Hub Web ↗' : 'Web Hub ↗'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ====================================================================
          SUB-TAB 1: EVENTS & INTERACTIVE CAMPUS MAP (PT / EN)
         ==================================================================== */}
      {subTab === 'events' && (
        <ScrollView contentContainerStyle={styles.contentPad}>
          {/* Interactive 3D Sketchfab + 3D Campus Blocks + 2D OpenStreetMap for All 3 UFOP Campuses */}
          {eventsViewMode === 'map' && (
            <>
              <UfopCampusMap3D2D
                lang={lang}
                initialCampusId="joao-monlevade"
                initialMode="sketchfab3d"
                height={450}
                onSelectBuildingRide={(bldg, campus) =>
                  navigation.navigate('CreateRide', {
                    prefillTo: `${bldg.code} — ${campus.shortPt}`,
                    prefillNotes: `Carona para ${bldg.namePt} (${campus.titlePt})`,
                  })
                }
              />

              <View style={styles.campusMapCanvas}>
                <View style={styles.mapGridOverlay}>
                  <Text style={styles.mapCampusZoneLabel}>
                    📍 {lang === 'pt'
                      ? 'EVENTOS ATIVOS NOS 3 CAMPI UFOP (OURO PRETO · MARIANA · JOÃO MONLEVADE)'
                      : 'ACTIVE EVENTS ACROSS ALL 3 UFOP CAMPUSES (OURO PRETO · MARIANA · JOÃO MONLEVADE)'}
                  </Text>
                  <View style={styles.mapPinsContainer}>
                    {events.map((ev, idx) => {
                      const isSelected = selectedMapPin?.id === ev.id;
                      return (
                        <TouchableOpacity
                          key={ev.id}
                          style={[
                            styles.mapPinBubble,
                            isSelected && styles.mapPinBubbleSelected,
                            {
                              top: 16 + (idx % 3) * 44,
                              left: 12 + ((idx * 21) % 70) + '%',
                            },
                          ]}
                          onPress={() => setSelectedMapPin(ev)}
                        >
                          <Ionicons
                            name={
                              ev.category === 'Sport'
                                ? 'football'
                                : ev.category === 'Eat'
                                ? 'restaurant'
                                : 'school'
                            }
                            size={13}
                            color="#FFFFFF"
                          />
                          <Text style={styles.mapPinText} numberOfLines={1}>
                            {ev.title.split(' ')[0]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedMapPin && (
                    <View style={styles.mapSelectedCard}>
                      <View style={styles.eventCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventTitle}>{selectedMapPin.title}</Text>
                          <Text style={styles.eventSub}>
                            {selectedMapPin.organizer} · {selectedMapPin.dateTimeLabel}
                          </Text>
                        </View>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {selectedMapPin.category}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.eventDesc}>{selectedMapPin.description}</Text>
                      <View style={styles.eventActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.primaryActionBtn,
                            joinedEvents.includes(selectedMapPin.id) &&
                              styles.joinedActionBtn,
                          ]}
                          onPress={() => handleToggleEventJoin(selectedMapPin.id)}
                        >
                          <Text style={styles.primaryActionText}>
                            {joinedEvents.includes(selectedMapPin.id)
                              ? t('joinedEventBtn')
                              : t('joinEventBtn')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.caronaActionBtn}
                          onPress={() =>
                            navigation.navigate('CreateRide', {
                              prefillTo: selectedMapPin.venue,
                              prefillEventTitle: selectedMapPin.title,
                              prefillNotes: `Carona para o evento: ${selectedMapPin.title}`,
                            })
                          }
                        >
                          <Ionicons name="car-sport" size={14} color="#FFFFFF" />
                          <Text style={styles.caronaActionText}>
                            {t('offerRideForEvent')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Events Cards List */}
          {events.map((ev) => {
            const isJoined = joinedEvents.includes(ev.id);
            return (
              <View key={ev.id} style={styles.eventCard}>
                <View style={styles.eventCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.eventSub}>
                      {ev.organizer} · {ev.university}
                    </Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{ev.category}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>{ev.dateTimeLabel}</Text>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={COLORS.accent}
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.metaText}>{ev.venueDetail || ev.venue}</Text>
                </View>

                <Text style={styles.eventDesc}>{ev.description}</Text>

                <View style={styles.capacityBarWrap}>
                  <View style={styles.capacityTrack}>
                    <View
                      style={[
                        styles.capacityFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round((ev.occupied / (ev.capacity || 40)) * 100)
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.capacityLabel}>
                    {ev.occupied}/{ev.capacity || 40} {t('participantsLabel')}
                  </Text>
                </View>

                <View style={styles.eventActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryActionBtn,
                      isJoined && styles.joinedActionBtn,
                    ]}
                    onPress={() => handleToggleEventJoin(ev.id)}
                  >
                    <Text style={styles.primaryActionText}>
                      {isJoined ? t('joinedEventBtn') : t('joinEventBtn')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.caronaActionBtn}
                    onPress={() =>
                      navigation.navigate('CreateRide', {
                        prefillTo: ev.venue,
                        prefillEventTitle: ev.title,
                        prefillNotes: `Carona para o evento: ${ev.title}`,
                      })
                    }
                  >
                    <Ionicons name="car-sport" size={14} color="#FFFFFF" />
                    <Text style={styles.caronaActionText}>
                      {t('offerRideForEvent')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ====================================================================
          SUB-TAB 2: SOCIAL & STUDENT GROUPS (PT / EN)
         ==================================================================== */}
      {subTab === 'social' && (
        <ScrollView contentContainerStyle={styles.contentPad}>
          <View style={styles.toolbarRow}>
            <View style={styles.viewModeSwitch}>
              <TouchableOpacity
                style={[
                  styles.viewModeBtn,
                  socialMode === 'groups' && styles.viewModeBtnActive,
                ]}
                onPress={() => setSocialMode('groups')}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    socialMode === 'groups' && styles.viewModeTextActive,
                  ]}
                >
                  {t('socialGroupsTab')} ({groups.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewModeBtn,
                  socialMode === 'people' && styles.viewModeBtnActive,
                ]}
                onPress={() => setSocialMode('people')}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    socialMode === 'people' && styles.viewModeTextActive,
                  ]}
                >
                  {t('socialPeopleTab')} ({students.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {socialMode === 'groups'
            ? groups.map((grp) => (
                <View key={grp.id} style={styles.eventCard}>
                  <View style={styles.eventCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>
                        {lang === 'pt' ? grp.namePt : grp.nameEn}
                      </Text>
                      <Text style={styles.eventSub}>
                        {grp.uni} · {grp.members}{' '}
                        {lang === 'pt' ? 'membros' : 'members'}
                      </Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {lang === 'pt' ? grp.categoryPt : grp.categoryEn}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    🕒 {lang === 'pt' ? grp.schedulePt : grp.scheduleEn}
                  </Text>
                  <Text style={[styles.eventDesc, { marginTop: 6 }]}>
                    {lang === 'pt' ? grp.descPt : grp.descEn}
                  </Text>

                  <View style={styles.eventActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.primaryActionBtn,
                        grp.joined && styles.joinedActionBtn,
                      ]}
                      onPress={() =>
                        setGroups((prev) =>
                          prev.map((g) =>
                            g.id === grp.id ? { ...g, joined: !g.joined } : g
                          )
                        )
                      }
                    >
                      <Text style={styles.primaryActionText}>
                        {grp.joined ? t('joinedGroupBtn') : t('joinGroupBtn')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.caronaActionBtn}
                      onPress={() => {
                        setActiveChatId('chat-grp-decsi');
                        setSubTab('chats');
                      }}
                    >
                      <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
                      <Text style={styles.caronaActionText}>{t('openChatBtn')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            : students.map((stu) => (
                <View key={stu.id} style={styles.eventCard}>
                  <View style={styles.eventCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{stu.name}</Text>
                      <Text style={styles.eventSub}>
                        {lang === 'pt' ? stu.coursePt : stu.courseEn} · {stu.uni}
                      </Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {stu.modules.join(' · ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventDesc}>
                    {lang === 'pt' ? stu.bioPt : stu.bioEn}
                  </Text>

                  <View style={styles.eventActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.primaryActionBtn,
                        stu.connected && styles.joinedActionBtn,
                      ]}
                      onPress={() =>
                        setStudents((prev) =>
                          prev.map((s) =>
                            s.id === stu.id ? { ...s, connected: !s.connected } : s
                          )
                        )
                      }
                    >
                      <Text style={styles.primaryActionText}>
                        {stu.connected
                          ? t('connectedStudentBtn')
                          : t('connectStudentBtn')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.caronaActionBtn}
                      onPress={() => {
                        setActiveChatId('chat-mariana');
                        setSubTab('chats');
                      }}
                    >
                      <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
                      <Text style={styles.caronaActionText}>{t('openChatBtn')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
        </ScrollView>
      )}

      {/* ====================================================================
          SUB-TAB 3: CHATS & UNIVERSITY MODULE CHANNELS (PT / EN)
         ==================================================================== */}
      {subTab === 'chats' && (
        <View style={styles.chatsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chatSelectorBar}
          >
            {chats.map((c) => {
              const selected = c.id === activeChat.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chatRoomPill, selected && styles.chatRoomPillActive]}
                  onPress={() => setActiveChatId(c.id)}
                >
                  <Text
                    style={[
                      styles.chatRoomPillText,
                      selected && styles.chatRoomPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.chatPaneCard}>
            <View style={styles.chatPaneHeader}>
              <Text style={styles.chatPaneTitle}>{activeChat.name}</Text>
              <Text style={styles.chatPaneSub}>
                {lang === 'pt' ? activeChat.subtitlePt : activeChat.subtitleEn}
              </Text>
            </View>

            <ScrollView style={styles.chatMessagesArea}>
              {activeChat.messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.chatBubble,
                    m.mine ? styles.chatBubbleMine : styles.chatBubbleOther,
                  ]}
                >
                  <Text style={styles.chatSenderName}>{m.sender}</Text>
                  <Text
                    style={[
                      styles.chatMsgText,
                      m.mine && { color: '#FFFFFF' },
                    ]}
                  >
                    {lang === 'pt' ? m.textPt : m.textEn}
                  </Text>
                  <Text
                    style={[
                      styles.chatMsgTime,
                      m.mine && { color: '#E2E8F0' },
                    ]}
                  >
                    {m.time}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatComposerRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder={t('sendMsgPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                style={styles.chatSendBtn}
                onPress={handleSendChatMessage}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.chatSendText}>{t('sendBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ====================================================================
          SUB-TAB 4: DIGITAL STUDENT ID CARD & MODULES (PT / EN)
         ==================================================================== */}
      {subTab === 'idcard' && (
        <ScrollView contentContainerStyle={styles.contentPad}>
          <View style={styles.studentIdCard}>
            <View style={styles.idCardTopRow}>
              <Text style={styles.idCardBrand}>{t('idCardTitle')}</Text>
              <Text style={styles.idCardBadge}>UFOP ICEA × UOS</Text>
            </View>

            <Text style={styles.idCardName}>
              {user?.name || 'Albert Johnson'}
            </Text>
            <Text style={styles.idCardCourse}>
              {user?.course || 'Engenharia de Computação / Automotive Engineering'}
            </Text>

            <View style={styles.idCardCodeBox}>
              <Text style={styles.idCardCodeLabel}>{t('idCardCode')}:</Text>
              <Text style={styles.idCardCodeValue}>
                {user?.registration || '22.1.8050 · 80A50'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t('enrolledModulesTitle')}</Text>
          <View style={styles.modulesGrid}>
            {[
              { code: 'BCC202', title: 'Estruturas de Dados I / Data Structures', chatId: 'chat-bcc202' },
              { code: 'BCC321', title: 'Engenharia de Software & Mobile', chatId: 'chat-bcc321' },
              { code: '11B0077', title: 'Databases / Banco de Dados (UOS)', chatId: 'chat-bcc202' },
              { code: 'ENP104', title: 'Logística & Mobilidade Urbana (ICEA)', chatId: 'chat-bcc321' },
            ].map((mod) => (
              <TouchableOpacity
                key={mod.code}
                style={styles.moduleCard}
                onPress={() => {
                  setActiveChatId(mod.chatId);
                  setSubTab('chats');
                }}
              >
                <View style={styles.moduleCodeBadge}>
                  <Text style={styles.moduleCodeText}>{mod.code}</Text>
                </View>
                <Text style={styles.moduleTitleText}>{mod.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Create Event Modal */}
      <Modal
        visible={createEventModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateEventModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{t('createEventBtn')}</Text>
              <TouchableOpacity onPress={() => setCreateEventModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder={
                lang === 'pt'
                  ? 'Título do Evento (ex: Grupo de Estudos IA)'
                  : 'Event Title (e.g. AI Study Meetup)'
              }
            />
            <TextInput
              style={styles.modalInput}
              value={newVenue}
              onChangeText={setNewVenue}
              placeholder={lang === 'pt' ? 'Local / Campus' : 'Venue / Campus'}
            />
            <TextInput
              style={styles.modalInput}
              value={newTime}
              onChangeText={setNewTime}
              placeholder={lang === 'pt' ? 'Data e Horário' : 'Date & Time'}
            />

            <TouchableOpacity style={styles.modalSubmit} onPress={handleCreateEvent}>
              <Text style={styles.modalSubmitText}>{t('createEventBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroHeader: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  externalWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  externalWebBtnText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  subTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  subTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subTabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  contentPad: {
    padding: SPACING.sm,
    paddingBottom: 32,
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewModeSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  viewModeBtnActive: {
    backgroundColor: '#6849FF',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  viewModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  campusMapCanvas: {
    backgroundColor: '#131A29',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#2E3A52',
  },
  mapGridOverlay: {
    minHeight: 230,
    justifyContent: 'space-between',
  },
  mapCampusZoneLabel: {
    color: '#93C5FD',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mapPinsContainer: {
    height: 120,
    position: 'relative',
    marginVertical: 8,
  },
  mapPinBubble: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6849FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
    maxWidth: 150,
  },
  mapPinBubbleSelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  mapPinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapSelectedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  eventSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  categoryBadgeText: {
    color: '#5B21B6',
    fontSize: 10.5,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  capacityBarWrap: {
    marginBottom: 10,
  },
  capacityTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#6849FF',
  },
  capacityLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  eventActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#6849FF',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedActionBtn: {
    backgroundColor: '#059669',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  caronaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  caronaActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatsContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  chatSelectorBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    maxHeight: 40,
  },
  chatRoomPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatRoomPillActive: {
    backgroundColor: '#6849FF',
    borderColor: '#6849FF',
  },
  chatRoomPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chatRoomPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chatPaneCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chatPaneHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  chatPaneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chatPaneSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  chatMessagesArea: {
    flex: 1,
    padding: SPACING.md,
  },
  chatBubble: {
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    maxWidth: '85%',
  },
  chatBubbleOther: {
    backgroundColor: COLORS.surfaceAlt,
    alignSelf: 'flex-start',
  },
  chatBubbleMine: {
    backgroundColor: '#6849FF',
    alignSelf: 'flex-end',
  },
  chatSenderName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  chatMsgText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  chatMsgTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
    textAlign: 'right',
  },
  chatComposerRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  chatSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    gap: 5,
  },
  chatSendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  studentIdCard: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  idCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  idCardBrand: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  idCardBadge: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '800',
  },
  idCardName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  idCardCourse: {
    color: '#E0E7FF',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  idCardCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    gap: 6,
  },
  idCardCodeLabel: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  idCardCodeValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  modulesGrid: {
    gap: 10,
  },
  moduleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moduleCodeBadge: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  moduleCodeText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '800',
  },
  moduleTitleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalDialog: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSubmit: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default CampusConnectScreen;
