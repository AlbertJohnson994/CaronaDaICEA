// src/screens/RideScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { RideContext } from "../context/RideContext";
import {
  getRideByIdInDb,
  reserveSeatInDb,
  cancelReservationInDb,
  completeRideInDb,
  getUserProfileInDb,
} from "../services/sqliteService";
import { 
  formatTime, 
  formatDate, 
  openWhatsAppContact, 
  shareRideInfo, 
  openGoogleMapsRoute, 
  openWazeRoute,
  openDirectWhatsApp 
} from "../utils/formatters";
import { generatePixCopiaECola } from "../utils/pixPayload";
import CustomButton from "../components/CustomButton";
import PhotoDisplay from "../components/PhotoDisplay";
import RouteMap from "../components/RouteMap";
import ToastNotification from "../components/ToastNotification";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const RideScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { user } = useContext(AuthContext);
  const { startRideWithPin } = useContext(RideContext);

  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Payment Selection Modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("PIX");

  // PIN modal state for Driver
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [startingRide, setStartingRide] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const loadRide = React.useCallback(async () => {
    try {
      const rideData = await getRideByIdInDb(rideId);
      if (rideData) {
        setRide(rideData);
        if (rideData.driverId) {
          const driver = await getUserProfileInDb(rideData.driverId);
          setDriverInfo(driver);
        }
      } else {
        showToast("error", "Carona não encontrada");
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (error) {
      showToast("error", "Não foi possível carregar os dados da carona");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [rideId, navigation]);

  useEffect(() => {
    loadRide();
  }, [loadRide]);

  const isPassenger = ride && Array.isArray(ride.passengers) && ride.passengers.includes(user?.uid);
  const isDriver = ride && ride.driverId === user?.uid;
  const isFull = ride && ride.availableSeats <= 0;
  const departureDate = ride ? (ride.departureTime?.toDate ? ride.departureTime.toDate() : new Date(ride.departureTime)) : new Date();
  const isPast = ride && departureDate < new Date();

  // Financial calculations (25% Platform fee, 75% Driver Net)
  const grossPrice = Number(ride?.price || 0);
  const platformFee = Number((grossPrice * 0.25).toFixed(2));
  const driverNet = Number((grossPrice * 0.75).toFixed(2));

  // Generate Dynamic Pix Payload
  const dynamicPixPayload = generatePixCopiaECola({
    pixKey: driverInfo?.pixKey || "admin@ufop.edu.br",
    merchantName: (driverInfo?.name || "Motorista ICEA").substring(0, 25),
    merchantCity: "Joao Monlevade",
    amount: grossPrice,
    txid: (ride?.id || "CARONA").replace(/[^a-zA-Z0-9]/g, "").substring(0, 20),
  });

  const handleOpenPaymentModal = () => {
    if (!user) return;
    setPaymentModalVisible(true);
  };

  const handleConfirmReservationWithPayment = async () => {
    setPaymentModalVisible(false);
    setReserving(true);
    try {
      const result = await reserveSeatInDb(rideId, user.uid, selectedPaymentMethod);
      if (result.success) {
        showToast("success", `Reserva efetuada via ${selectedPaymentMethod}! Guarde seu PIN de embarque.`);
        loadRide();
      } else {
        showToast("error", result.error || "Não foi possível realizar a reserva");
      }
    } catch (error) {
      showToast("error", error.message || "Não foi possível realizar a reserva");
    } finally {
      setReserving(false);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const result = await cancelReservationInDb(rideId, user.uid);
      if (result.success) {
        showToast("success", "Reserva cancelada com sucesso!");
        loadRide();
      } else {
        showToast("error", result.error || "Não foi possível cancelar a reserva");
      }
    } catch (error) {
      showToast("error", "Não foi possível cancelar a reserva");
    } finally {
      setCanceling(false);
    }
  };

  const handleStartRide = async () => {
    if (inputPin.trim().length !== 4) {
      showToast("warning", "Por favor, digite o PIN de 4 dígitos informado pelo passageiro.");
      return;
    }
    setStartingRide(true);
    try {
      const result = await startRideWithPin(rideId, inputPin);
      if (result.success) {
        setPinModalVisible(false);
        setInputPin("");
        showToast("success", "Viagem iniciada com sucesso! Boa viagem.");
        loadRide();
      } else {
        showToast("error", result.error);
      }
    } catch (error) {
      showToast("error", "Erro ao verificar PIN de início de viagem.");
    } finally {
      setStartingRide(false);
    }
  };

  const handleCompleteRide = async () => {
    Alert.alert(
      "Finalizar Corrida",
      "Deseja finalizar esta corrida e avaliar os passageiros?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Avaliar Passageiros",
          onPress: () => navigation.navigate("Rating", { rideId }),
        },
        {
          text: "Apenas Finalizar",
          onPress: async () => {
            try {
              const result = await completeRideInDb(rideId);
              if (result.success) {
                showToast("success", "Corrida finalizada!");
                setTimeout(() => navigation.goBack(), 1000);
              } else {
                showToast("error", result.error || "Erro ao finalizar");
              }
            } catch (error) {
              showToast("error", "Erro de conexão ao finalizar corrida");
            }
          },
        },
      ]
    );
  };

  const handleCopyPixKey = () => {
    const key = driverInfo?.pixKey || "admin@ufop.edu.br";
    Clipboard.setString(key);
    showToast("success", `Chave Pix (${driverInfo?.pixType || "Chave"}) copiada!`);
  };

  const handleCopyPixCopiaECola = () => {
    Clipboard.setString(dynamicPixPayload);
    showToast("success", `Pix Copia e Cola (R$ ${grossPrice.toFixed(2)}) copiado! Cole no seu banco.`);
  };

  const handleWhatsApp = () => {
    if (isDriver) {
      const targetPhone = driverInfo?.phone || user.phone;
      openWhatsAppContact({ phone: targetPhone, name: user.name, ride, isDriver: true });
    } else {
      const targetPhone = driverInfo?.phone;
      openWhatsAppContact({ phone: targetPhone, name: user.name, ride, isDriver: false });
    }
  };

  const handleQuickMessage = (msgText) => {
    const targetPhone = isDriver ? (driverInfo?.phone || user?.phone) : driverInfo?.phone;
    if (!targetPhone) {
      showToast("warning", "Número de telefone indisponível.");
      return;
    }
    const message = `[Caronas ICEA - ${user?.name}]: ${msgText} (${ride.from} ➔ ${ride.to})`;
    openDirectWhatsApp({ phone: targetPhone, message });
  };

  const handleSOS = () => {
    const emergencyPhone = user?.emergencyContactPhone;
    const emergencyName = user?.emergencyContactName || "Contato de Emergência";

    if (emergencyPhone) {
      Alert.alert(
        "Segurança & Emergência SOS",
        `Deseja disparar alerta direto para seu contato (${emergencyName}) ou compartilhar com outro app?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: `WhatsApp SOS (${emergencyName})`,
            onPress: () => {
              const dateStr = formatDate(departureDate);
              const timeStr = formatTime(departureDate);
              const sosMsg = `🚨 *ALERTA DE EMERGÊNCIA - Caronas ICEA UFOP*\n` +
                `Estou em deslocamento universitário.\n` +
                `🚗 Motorista: ${ride.driverName || "N/I"}\n` +
                `🚙 Veículo: ${ride.vehicle || "N/I"} (Placa: ${ride.licensePlate || "N/I"})\n` +
                `📍 Trajeto: ${ride.from} ➔ ${ride.to}\n` +
                `⏰ Horário: ${dateStr} às ${timeStr}\n\n` +
                `Acompanhe minha rota e fique atento(a)!`;
              openDirectWhatsApp({ phone: emergencyPhone, message: sosMsg });
            }
          },
          {
            text: "Compartilhar Geral",
            onPress: () => shareRideInfo(ride)
          }
        ]
      );
    } else {
      shareRideInfo(ride);
    }
  };

  const handleGoogleMaps = () => {
    openGoogleMapsRoute({
      origin: ride.from,
      destination: ride.to,
      fromAddress: ride.fromAddress,
      toAddress: ride.toAddress,
      fromLat: ride.fromLat,
      fromLng: ride.fromLng,
      toLat: ride.toLat,
      toLng: ride.toLng,
    });
  };

  const handleWaze = () => {
    openWazeRoute({
      destination: ride.to,
      toAddress: ride.toAddress,
      toLat: ride.toLat,
      toLng: ride.toLng,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ride) return null;

  return (
    <View style={styles.flex1}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.routeHeaderRow}>
            <View style={styles.flex1}>
              <Text style={styles.fromTo}>
                {ride.from} ➔ {ride.to}
              </Text>
              <Text style={styles.headerSubtitle}>Carona Universitária ICEA UFOP</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>R$ {grossPrice.toFixed(2)}</Text>
              <Text style={styles.commissionCaption}>(R$ {driverNet.toFixed(2)} p/ motorista)</Text>
            </View>
          </View>

          {/* Badges Row: Elas por Elas & Recurring */}
          <View style={styles.badgesHeaderRow}>
            {ride.isWomenOnly ? (
              <View style={styles.womenOnlyBadge}>
                <Ionicons name="sparkles" size={13} color="#8E24AA" />
                <Text style={styles.womenOnlyBadgeText}>🌸 Elas por Elas (Exclusiva para Mulheres)</Text>
              </View>
            ) : null}

            {ride.isRecurring ? (
              <View style={styles.recurringBadge}>
                <Ionicons name="repeat" size={13} color={COLORS.primary} />
                <Text style={styles.recurringBadgeText}>
                  Recorrente: {Array.isArray(ride.recurringDays) ? ride.recurringDays.join(', ') : 'Semanal'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Route Map Visualizer */}
        <View style={styles.mapSection}>
          <RouteMap
            origin={ride.from}
            destination={ride.to}
            driverName={ride.driverName}
            fromLat={ride.fromLat}
            fromLng={ride.fromLng}
            toLat={ride.toLat}
            toLng={ride.toLng}
            fromAddress={ride.fromAddress}
            toAddress={ride.toAddress}
          />
        </View>

        {/* PASSENGER BOARDING PIN CARD */}
        {isPassenger && (
          <View style={styles.pinCard}>
            <View style={styles.pinCardHeader}>
              <Ionicons name="key-outline" size={24} color={COLORS.primary} />
              <Text style={styles.pinCardTitle}>Seu PIN de Embarque</Text>
            </View>
            <Text style={styles.pinNumber}>{ride.startPin || "1234"}</Text>
            <Text style={styles.pinDescription}>
              Informe este código de 4 dígitos ao motorista assim que entrar no veículo para confirmar seu embarque.
            </Text>
          </View>
        )}

        {/* DYNAMIC PIX COPIA E COLA CARD FOR PASSENGER */}
        {isPassenger && (
          <View style={styles.pixPaymentCard}>
            <View style={styles.pixCardHeader}>
              <Ionicons name="qr-code-outline" size={22} color={COLORS.success} style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.pixCardTitle}>Pix Copia e Cola Oficial</Text>
                <Text style={styles.pixCardSubtitle}>Padrão Banco Central c/ valor exato</Text>
              </View>
            </View>

            <Text style={styles.pixCardDesc}>
              Efetue o pagamento de <Text style={{ fontWeight: "700" }}>R$ {grossPrice.toFixed(2)}</Text> diretamente pelo seu aplicativo do banco:
            </Text>

            {/* Dynamic Copia e Cola Button */}
            <TouchableOpacity 
              style={styles.pixCopiaEColaBtn} 
              onPress={handleCopyPixCopiaECola}
              activeOpacity={0.85}
            >
              <Ionicons name="copy" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.pixCopiaEColaText}>
                Copiar Pix Copia e Cola (R$ {grossPrice.toFixed(2)})
              </Text>
            </TouchableOpacity>

            {/* Raw Pix Key Fallback */}
            <View style={styles.pixBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pixKeyLabel}>Chave Pix do Motorista ({driverInfo?.pixType || "Chave"}):</Text>
                <Text style={styles.pixKeyText} numberOfLines={1}>
                  {driverInfo?.pixKey || "admin@ufop.edu.br"}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyPixKeyBtn} onPress={handleCopyPixKey}>
                <Ionicons name="copy-outline" size={15} color={COLORS.primary} />
                <Text style={styles.copyPixKeyBtnText}>Chave</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DRIVER PIN NOTICE CARD */}
        {isDriver && ride.status === 'SCHEDULED' && (
          <View style={[styles.pinCard, { backgroundColor: COLORS.infoLight, borderColor: COLORS.info }]}>
            <View style={styles.pinCardHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.info} />
              <Text style={[styles.pinCardTitle, { color: COLORS.info }]}>PIN de Segurança do Motorista</Text>
            </View>
            <Text style={[styles.pinDescription, { color: COLORS.textPrimary, marginTop: 4 }]}>
              Peça o código PIN de 4 dígitos a um de seus passageiros antes de dar partida no veículo.
            </Text>
          </View>
        )}

        {/* TRIP DETAILS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Viagem</Text>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(departureDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatTime(departureDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {ride.availableSeats} de {ride.totalSeats} assento(s) disponível(is)
            </Text>
          </View>

          {ride.vehicle ? (
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {ride.vehicle} {ride.licensePlate ? `(Placa: ${ride.licensePlate})` : ""}
              </Text>
            </View>
          ) : null}

          {/* Preferences Badges */}
          {Array.isArray(ride.preferences) && ride.preferences.length > 0 && (
            <View style={styles.prefSection}>
              <Text style={styles.prefTitle}>Preferências da Carona:</Text>
              <View style={styles.prefChipsContainer}>
                {ride.preferences.includes('ac') && (
                  <View style={styles.prefChip}>
                    <Text style={styles.prefChipText}>❄️ Ar-condicionado</Text>
                  </View>
                )}
                {ride.preferences.includes('luggage') && (
                  <View style={styles.prefChip}>
                    <Text style={styles.prefChipText}>🧳 Bagagem grande</Text>
                  </View>
                )}
                {ride.preferences.includes('music') && (
                  <View style={styles.prefChip}>
                    <Text style={styles.prefChipText}>🎵 Com música</Text>
                  </View>
                )}
                {ride.preferences.includes('silent') && (
                  <View style={styles.prefChip}>
                    <Text style={styles.prefChipText}>🔇 Silêncio</Text>
                  </View>
                )}
                {ride.preferences.includes('nonsmoking') && (
                  <View style={styles.prefChip}>
                    <Text style={styles.prefChipText}>🚭 Não fumante</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* DRIVER PROFILE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motorista</Text>
          <View style={styles.userInfo}>
            {driverInfo?.driverPhotoUri ? (
              <Image
                source={{ uri: driverInfo.driverPhotoUri }}
                style={styles.driverAvatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={26} color={COLORS.primary} />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{ride.driverName}</Text>
              <Text style={styles.driverCourseText}>
                {driverInfo?.course ? `🎓 ${driverInfo.course}` : 'Aluno ICEA UFOP'}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={styles.userRating}>
                  {ride.driverRating ? Number(ride.driverRating).toFixed(1) : "5.0"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* QUICK WHATSAPP PRE-TRIP MESSAGES */}
        {(isPassenger || isDriver) && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleWithoutMargin}>Avisos Rápidos de Partida</Text>
            </View>
            <Text style={styles.quickMsgSubtitle}>
              Toque para avisar com 1 clique pelo WhatsApp:
            </Text>
            <View style={styles.quickChipsGrid}>
              <TouchableOpacity 
                style={styles.quickMsgChip} 
                onPress={() => handleQuickMessage("Cheguei no ponto de encontro! 📍")}
              >
                <Text style={styles.quickMsgText}>📍 Cheguei no ponto</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickMsgChip} 
                onPress={() => handleQuickMessage("Vou atrasar cerca de 3 minutinhos! ⏳")}
              >
                <Text style={styles.quickMsgText}>⏳ Atraso de 3 min</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickMsgChip} 
                onPress={() => handleQuickMessage("Estou saindo agora a caminho! 🚗")}
              >
                <Text style={styles.quickMsgText}>🚗 Saindo agora</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickMsgChip} 
                onPress={() => handleQuickMessage("Estou aguardando na portaria do ICEA! 🚪")}
              >
                <Text style={styles.quickMsgText}>🚪 Na portaria ICEA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* VEHICLE PHOTO */}
        {!isDriver && (ride.carPhotoUri || driverInfo?.carPhotoUri) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículo Identificado</Text>
            <PhotoDisplay
              photoUri={ride.carPhotoUri || driverInfo?.carPhotoUri}
              title="Foto do Veículo"
              licensePlate={ride.licensePlate || driverInfo?.licensePlate}
              showLicensePlate={true}
            />
          </View>
        )}

        {/* NOTES SECTION */}
        {ride.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações do Motorista</Text>
            <Text style={styles.notes}>{ride.notes}</Text>
          </View>
        ) : null}

        {/* ACTION BUTTONS & COMMUNICATION */}
        <View style={styles.actionsSection}>
          {/* GPS Navigation Row (Google Maps & Waze) */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.googleMapsBtn} onPress={handleGoogleMaps} activeOpacity={0.85}>
              <Ionicons name="map-outline" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
              <Text style={styles.navBtnText}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.wazeBtn} onPress={handleWaze} activeOpacity={0.85}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
              <Text style={styles.navBtnText}>Waze GPS</Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp & SOS Row */}
          <View style={styles.commRow}>
            <TouchableOpacity style={styles.whatsAppBtn} onPress={handleWhatsApp} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
              <Text style={styles.whatsAppBtnText}>Falar no WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sosBtn} onPress={handleSOS} activeOpacity={0.85}>
              <Ionicons name="shield-checkmark" size={19} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={styles.sosBtnText}>SOS Emergência</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Action Button */}
          {!isPast && (
            <View style={{ marginTop: SPACING.md }}>
              {isDriver ? (
                <>
                  {ride.status === 'SCHEDULED' ? (
                    <CustomButton
                      title="Iniciar Viagem (Digitar PIN)"
                      onPress={() => setPinModalVisible(true)}
                      icon="play-circle-outline"
                      color={COLORS.primary}
                    />
                  ) : (
                    <CustomButton
                      title="Finalizar Corrida"
                      onPress={handleCompleteRide}
                      icon="checkmark-circle-outline"
                      color={COLORS.success}
                    />
                  )}
                </>
              ) : isPassenger ? (
                <CustomButton
                  title="Cancelar Reserva"
                  onPress={handleCancel}
                  loading={canceling}
                  color={COLORS.danger}
                  icon="close-circle-outline"
                />
              ) : (
                <CustomButton
                  title={isFull ? "Carona Lotada" : "Reservar & Escolher Pagamento"}
                  onPress={handleOpenPaymentModal}
                  loading={reserving}
                  disabled={isFull}
                  icon="card-outline"
                  color={COLORS.primary}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* PAYMENT METHOD SELECTION MODAL */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="cash-outline" size={32} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Confirmar Pagamento</Text>
              <Text style={styles.modalSubtitle}>
                Escolha a forma de pagamento para concluir sua vaga:
              </Text>
            </View>

            {/* Financial Breakdown Box */}
            <View style={styles.breakdownBox}>
              <View style={styles.breakdownLine}>
                <Text style={styles.breakdownLabelText}>Valor da Passagem:</Text>
                <Text style={styles.breakdownValueText}>R$ {grossPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownLine}>
                <Text style={styles.breakdownLabelText}>Taxa da Plataforma (25%):</Text>
                <Text style={[styles.breakdownValueText, { color: COLORS.warning }]}>R$ {platformFee.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownLine}>
                <Text style={styles.breakdownLabelText}>Repasse ao Motorista (75%):</Text>
                <Text style={[styles.breakdownValueText, { color: COLORS.success }]}>R$ {driverNet.toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Method Chips */}
            <View style={styles.methodSelectorRow}>
              <TouchableOpacity
                style={[styles.methodOption, selectedPaymentMethod === "PIX" && styles.methodOptionActive]}
                onPress={() => setSelectedPaymentMethod("PIX")}
              >
                <Ionicons name="qr-code-outline" size={20} color={selectedPaymentMethod === "PIX" ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.methodOptionText, selectedPaymentMethod === "PIX" && styles.methodOptionTextActive]}>
                  Pix
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, selectedPaymentMethod === "DINHEIRO" && styles.methodOptionActive]}
                onPress={() => setSelectedPaymentMethod("DINHEIRO")}
              >
                <Ionicons name="cash-outline" size={20} color={selectedPaymentMethod === "DINHEIRO" ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.methodOptionText, selectedPaymentMethod === "DINHEIRO" && styles.methodOptionTextActive]}>
                  Dinheiro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, selectedPaymentMethod === "CARTEIRA" && styles.methodOptionActive]}
                onPress={() => setSelectedPaymentMethod("CARTEIRA")}
              >
                <Ionicons name="wallet-outline" size={20} color={selectedPaymentMethod === "CARTEIRA" ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.methodOptionText, selectedPaymentMethod === "CARTEIRA" && styles.methodOptionTextActive]}>
                  Saldo App
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmReservationWithPayment}
              >
                <Text style={styles.modalConfirmText}>Confirmar Vaga</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DRIVER PIN ENTER MODAL */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Confirmar Embarque</Text>
              <Text style={styles.modalSubtitle}>
                Digite o código PIN de 4 dígitos informado pelo seu passageiro ao entrar no veículo:
              </Text>
            </View>

            <TextInput
              style={styles.pinInput}
              placeholder="0 0 0 0"
              value={inputPin}
              onChangeText={(t) => setInputPin(t.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, startingRide && { opacity: 0.6 }]}
                onPress={handleStartRide}
                disabled={startingRide}
              >
                {startingRide ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar PIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  routeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fromTo: {
    ...TYPOGRAPHY.h2,
    fontSize: 21,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  price: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primary,
  },
  commissionCaption: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.success,
  },
  badgesHeaderRow: {
    marginTop: SPACING.sm,
    gap: 6,
  },
  womenOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "#E1BEE7",
    alignSelf: "flex-start",
  },
  womenOnlyBadgeText: {
    color: "#7B1FA2",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1F5FE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "#B3E5FC",
    alignSelf: "flex-start",
  },
  recurringBadgeText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  mapSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  pinCard: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: "center",
  },
  pinCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  pinCardTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  pinNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.accent,
    letterSpacing: 8,
    marginVertical: SPACING.xs,
  },
  pinDescription: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  pixPaymentCard: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  pixCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pixCardTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.success,
    fontSize: 15,
  },
  pixCardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pixCardDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  pixCopiaEColaBtn: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  pixCopiaEColaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13.5,
  },
  pixBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 6,
  },
  pixKeyLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pixKeyText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  copyPixKeyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
  },
  copyPixKeyBtnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: 3,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  sectionTitleWithoutMargin: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  prefSection: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  prefTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  prefChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  prefChip: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prefChipText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  detailText: {
    ...TYPOGRAPHY.body,
    marginLeft: SPACING.md,
    color: COLORS.textPrimary,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  driverCourseText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  userRating: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  quickMsgSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  quickChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickMsgChip: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  quickMsgText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  notes: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  actionsSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  commRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  whatsAppBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  whatsAppBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    fontSize: 14,
  },
  sosBtn: {
    flex: 0.8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  sosBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.error,
    fontSize: 13,
  },
  navRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  googleMapsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.xs,
    ...SHADOWS.small,
  },
  wazeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05C3DD",
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.lg,
    marginLeft: SPACING.xs,
    ...SHADOWS.small,
  },
  navBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.large,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  breakdownBox: {
    width: "100%",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  breakdownLabelText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
  },
  breakdownValueText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },
  methodSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SPACING.lg,
  },
  methodOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginHorizontal: 3,
  },
  methodOptionActive: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  methodOptionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    marginLeft: 4,
  },
  methodOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  pinInput: {
    width: "80%",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 12,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  modalBtnRow: {
    flexDirection: "row",
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  modalCancelText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  modalConfirmText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
});

export default RideScreen;
