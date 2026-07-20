// src/screens/CreateRideScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { RideContext } from "../context/RideContext";
import { AuthContext } from "../context/AuthContext";
import { formatLicensePlate } from "../utils/formatters";
import CustomButton from "../components/CustomButton";
import PhotoUploadModal from "../components/PhotoUploadModal";
import PhotoDisplay from "../components/PhotoDisplay";
import ToastNotification from "../components/ToastNotification";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";
import { LOCATION_PRESETS } from "../constants/locations";

const CreateRideScreen = ({ navigation }) => {
  const { createRide } = useContext(RideContext);
  const { user } = useContext(AuthContext);

  const [from, setFrom] = useState("Campus ICEA");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("5.00");
  const [seats, setSeats] = useState("3");
  const [notes, setNotes] = useState("");
  const [vehicle, setVehicle] = useState(user?.vehicle || "");
  const [licensePlate, setLicensePlate] = useState(user?.licensePlate || "");
  const [carPhotoUri, setCarPhotoUri] = useState(user?.carPhotoUri || null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const handleCreateRide = async () => {
    if (!from.trim() || !to.trim() || !price || !seats) {
      showToast("warning", "Por favor, preencha todos os campos obrigatórios (*)");
      return;
    }

    if (!vehicle.trim() || !licensePlate.trim()) {
      showToast("warning", "Informe o modelo e a placa do veículo para segurança dos passageiros.");
      return;
    }

    if (parseInt(seats) < 1) {
      showToast("warning", "O número de assentos disponíveis deve ser pelo menos 1.");
      return;
    }

    if (parseFloat(price) <= 0) {
      showToast("warning", "O preço deve ser um valor maior que zero.");
      return;
    }

    // Combine date and time
    const departureTime = new Date(date);
    departureTime.setHours(time.getHours());
    departureTime.setMinutes(time.getMinutes());

    if (departureTime <= new Date()) {
      showToast("error", "A data e hora da saída devem ser futuras.");
      return;
    }

    setLoading(true);

    const rideData = {
      from: from.trim(),
      to: to.trim(),
      price: parseFloat(price),
      totalSeats: parseInt(seats),
      availableSeats: parseInt(seats),
      departureTime,
      notes: notes.trim(),
      vehicle: vehicle.trim(),
      licensePlate: formatLicensePlate(licensePlate),
      carPhotoUri,
    };

    const result = await createRide(rideData);
    setLoading(false);

    if (result.success) {
      showToast("success", "Carona publicada com sucesso! Código PIN gerado.");
      setTimeout(() => navigation.goBack(), 1200);
    } else {
      showToast("error", "Não foi possível criar a carona: " + result.error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.flex1}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Oferecer Carona</Text>
        <Text style={styles.subtitle}>Ajude colegas a chegarem ao campus com segurança</Text>

        {/* ORIGIN FIELD & PRESETS */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ponto de Saída (Origem) *</Text>
          <TextInput
            style={styles.input}
            value={from}
            onChangeText={setFrom}
            placeholder="Ex: Campus ICEA"
            placeholderTextColor={COLORS.textMuted}
          />
          <View style={styles.presetRow}>
            {LOCATION_PRESETS.slice(0, 3).map((loc) => (
              <TouchableOpacity
                key={`from_${loc.id}`}
                style={[styles.presetChip, from === loc.title && styles.presetChipActive]}
                onPress={() => setFrom(loc.title)}
              >
                <Text style={[styles.presetText, from === loc.title && styles.presetTextActive]}>{loc.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DESTINATION FIELD & PRESETS */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ponto de Chegada (Destino) *</Text>
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder="Ex: Centro João Monlevade"
            placeholderTextColor={COLORS.textMuted}
          />
          <View style={styles.presetRow}>
            {LOCATION_PRESETS.map((loc) => (
              <TouchableOpacity
                key={`to_${loc.id}`}
                style={[styles.presetChip, to === loc.title && styles.presetChipActive]}
                onPress={() => setTo(loc.title)}
              >
                <Text style={[styles.presetText, to === loc.title && styles.presetTextActive]}>{loc.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRICE & SEATS ROW */}
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
            <Text style={styles.label}>Preço (R$) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="5.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Vagas *</Text>
            <TextInput
              style={styles.input}
              value={seats}
              onChangeText={setSeats}
              placeholder="3"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* DATE & TIME ROW */}
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
            <Text style={styles.label}>Data de Partida *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerText}>{date.toLocaleDateString("pt-BR")}</Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Hora de Partida *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerText}>
                {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* VEHICLE & LICENSE PLATE */}
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1.2, marginRight: SPACING.sm }]}>
            <Text style={styles.label}>Modelo / Cor do Veículo *</Text>
            <TextInput
              style={styles.input}
              value={vehicle}
              onChangeText={setVehicle}
              placeholder="Fiat Uno Vermelho"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={[styles.formGroup, { flex: 0.8 }]}>
            <Text style={styles.label}>Placa *</Text>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={(t) => setLicensePlate(formatLicensePlate(t))}
              placeholder="ABC1D23"
              autoCapitalize="characters"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* NOTES */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ponto exato de encontro, tolerância de atraso, bagagens, etc."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        {/* CAR PHOTO SECTION */}
        <View style={styles.photoSection}>
          <Text style={styles.label}>Foto do Veículo (Segurança Adicional)</Text>
          {carPhotoUri ? (
            <PhotoDisplay
              photoUri={carPhotoUri}
              title="Foto do Carro"
              licensePlate={licensePlate}
              showLicensePlate={true}
            />
          ) : (
            <Text style={styles.photoPlaceholder}>
              Nenhuma foto cadastrada. Fotos ajudam o passageiro a reconhecer o veículo na saída.
            </Text>
          )}
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => setPhotoModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={18} color={COLORS.surface} />
            <Text style={styles.photoButtonText}>Selecionar Foto do Carro</Text>
          </TouchableOpacity>
        </View>

        {/* SUBMIT BUTTON */}
        <CustomButton
          title="Publicar Carona no Feed"
          onPress={handleCreateRide}
          loading={loading}
          icon="car-sport-outline"
          color={COLORS.primary}
        />
      </ScrollView>

      {/* DATE & TIME PICKERS */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* PHOTO UPLOAD MODAL */}
      <PhotoUploadModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onPhotoSelected={async (uri) => {
          setPhotoLoading(true);
          setCarPhotoUri(uri);
          setPhotoLoading(false);
          setPhotoModalVisible(false);
        }}
        title="Foto do Veículo"
        loading={photoLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primary,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.textPrimary,
    ...SHADOWS.small,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  presetChip: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  presetChipActive: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  presetText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  pickerText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  photoSection: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  photoPlaceholder: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginVertical: SPACING.xs,
    lineHeight: 18,
  },
  photoButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  photoButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    fontSize: 14,
    marginLeft: 6,
  },
});

export default CreateRideScreen;
