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
import { formatTime, formatDate, openWhatsAppContact, shareRideInfo, openGoogleMapsRoute, openWazeRoute } from "../utils/formatters";
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
    showToast("success", `Chave Pix (${driverInfo?.pixType || "CPF"}) copiada com sucesso!`);
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

  const handleGoogleMaps = () => {
    openGoogleMapsRoute({ origin: ride.from, destination: ride.to });
  };

  const handleWaze = () => {
    openWazeRoute({ destination: ride.to });
  };

  const handleShare = () => {
    if (ride) {
      shareRideInfo(ride);
    }
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
        {/* Header Header */}
        <View style={styles.header}>
          <View style={styles.routeHeaderRow}>
            <View style={styles.flex1}>
              <Text style={styles.fromTo}>
                {ride.from} ➔ {ride.to}
              </Text>
              <Text style={styles.headerSubtitle}>Carona Universitária UFOP</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>R$ {grossPrice.toFixed(2)}</Text>
              <Text style={styles.commissionCaption}>(R$ {driverNet.toFixed(2)} p/ motorista)</Text>
            </View>
          </View>
        </View>

        {/* Route Map Visualizer */}
        <View style={styles.mapSection}>
          <RouteMap
            origin={ride.from}
            destination={ride.to}
            driverName={ride.driverName}
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

        {/* PIX KEY PAYMENT CARD FOR RESERVED PASSENGER */}
        {isPassenger && (
          <View style={styles.pixPaymentCard}>
            <View style={styles.pixCardHeader}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.success} style={{ marginRight: 6 }} />
              <Text style={styles.pixCardTitle}>Pagamento via Pix</Text>
            </View>
            <Text style={styles.pixCardDesc}>
              Faça a transferência Pix no valor de <Text style={{ fontWeight: "700" }}>R$ {grossPrice.toFixed(2)}</Text> para a chave do motorista:
            </Text>
            <View style={styles.pixBox}>
              <Text style={styles.pixKeyText}>
                {driverInfo?.pixKey ? `${driverInfo.pixType || "CPF"}: ${driverInfo.pixKey}` : "Chave Pix indisponível"}
              </Text>
              {driverInfo?.pixKey ? (
                <TouchableOpacity style={styles.copyPixBtn} onPress={handleCopyPixKey}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.surface} />
                  <Text style={styles.copyPixBtnText}>Copiar</Text>
                </TouchableOpacity>
              ) : null}
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
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={styles.userRating}>
                  {ride.driverRating ? Number(ride.driverRating).toFixed(1) : "5.0"}
                </Text>
              </View>
            </View>
          </View>
        </View>

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

            <TouchableOpacity style={styles.sosBtn} onPress={handleShare} activeOpacity={0.85}>
              <Ionicons name="share-social-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.sosBtnText}>SOS / Enviar</Text>
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
  },
  pixCardDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
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
  },
  pixKeyText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  copyPixBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  copyPixBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: "700",
    marginLeft: 4,
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
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  sosBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
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
