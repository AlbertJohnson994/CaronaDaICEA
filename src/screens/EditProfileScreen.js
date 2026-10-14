// src/screens/EditProfileScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import CustomButton from "../components/CustomButton";
import PhotoUploadModal from "../components/PhotoUploadModal";
import PhotoDisplay from "../components/PhotoDisplay";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const COURSES_LIST = [
  "Engenharia de Produção",
  "Engenharia de Computação",
  "Sistemas de Informação",
  "Engenharia Elétrica",
  "Outro Curso UFOP",
];

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [course, setCourse] = useState(user?.course || "Engenharia de Produção");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [gender, setGender] = useState(user?.gender || "Feminino");

  // Emergency contact fields
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergencyContactPhone || "");

  // Vehicle fields
  const [vehicle, setVehicle] = useState(user?.vehicle || "");
  const [licensePlate, setLicensePlate] = useState(user?.licensePlate || "");
  const [driverPhotoUri, setDriverPhotoUri] = useState(user?.driverPhotoUri || null);
  const [carPhotoUri, setCarPhotoUri] = useState(user?.carPhotoUri || null);

  const [loading, setLoading] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handlePhotoSelect = (photoType) => {
    setSelectedPhotoType(photoType);
    setPhotoModalVisible(true);
  };

  const handlePhotoSelected = async (photoUri) => {
    setPhotoLoading(true);
    try {
      if (selectedPhotoType === "driver") {
        setDriverPhotoUri(photoUri);
      } else if (selectedPhotoType === "car") {
        setCarPhotoUri(photoUri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a foto");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome");
      return;
    }

    setLoading(true);

    const updates = {
      name: name.trim(),
      phone: phone.trim(),
      course: course.trim(),
      studentId: studentId.trim(),
      gender,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      driverPhotoUri,
      ...((user.userType === "driver" || user.userType === "both") && {
        vehicle: vehicle.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        carPhotoUri,
      }),
    };

    const result = await updateUserProfile(updates);

    setLoading(false);

    if (result.success) {
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil: " + result.error,
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.title}>Editar Perfil Acadêmico</Text>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Sua Foto de Perfil</Text>
          <PhotoDisplay photoUri={driverPhotoUri} title="Sua Foto de Perfil" />
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => handlePhotoSelect("driver")}
          >
            <Ionicons name="camera" size={18} color="white" />
            <Text style={styles.photoButtonText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação Geral</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone / WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gênero (Utilizado em caronas "Elas por Elas")</Text>
            <View style={styles.chipsRow}>
              {["Feminino", "Masculino", "Outro"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                    {g === "Feminino" ? "🌸 Feminino" : g === "Masculino" ? "Masculino" : "Outro"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Academic Affiliation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vínculo Acadêmico ICEA UFOP</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Curso</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {COURSES_LIST.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, course === c && styles.chipActive]}
                  onPress={() => setCourse(c)}
                >
                  <Text style={[styles.chipText, course === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              value={course}
              onChangeText={setCourse}
              placeholder="Ou digite o nome do seu curso"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Número de Matrícula</Text>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="Ex: 21.1.8492"
            />
          </View>
        </View>

        {/* SOS Emergency Contact */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.error} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitleWithoutMargin}>Contato de Emergência (SOS)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Configurado para disparo rápido de rota e dados do veículo pelo botão SOS do app.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Contato (Mãe, Pai, Cônjuge...)</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Ex: Maria (Mãe)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>WhatsApp de Emergência</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              placeholder="(31) 98888-7777"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Vehicle Section for Drivers */}
        {(user.userType === "driver" || user.userType === "both") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículo Cadastrado</Text>
            <PhotoDisplay
              photoUri={carPhotoUri}
              title="Foto do Veículo"
              licensePlate={licensePlate}
              showLicensePlate={true}
            />
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handlePhotoSelect("car")}
            >
              <Ionicons name="camera" size={18} color="white" />
              <Text style={styles.photoButtonText}>
                Alterar Foto do Veículo
              </Text>
            </TouchableOpacity>

            <View style={[styles.formGroup, { marginTop: 12 }]}>
              <Text style={styles.label}>Modelo / Veículo</Text>
              <TextInput
                style={styles.input}
                value={vehicle}
                onChangeText={setVehicle}
                placeholder="Ex: Fiat Uno Vermelho"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Placa do Veículo</Text>
              <TextInput
                style={styles.input}
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="Ex: ABC1D23"
                autoCapitalize="characters"
              />
            </View>
          </View>
        )}

        <View style={{ marginTop: 10 }}>
          <CustomButton
            title="Salvar Todas as Alterações"
            onPress={handleSave}
            loading={loading}
            icon="save-outline"
            color={COLORS.primary}
          />
        </View>
      </ScrollView>

      <PhotoUploadModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onPhotoSelected={handlePhotoSelected}
        title={
          selectedPhotoType === "driver"
            ? "Selecionar Foto de Perfil"
            : "Selecionar Foto do Veículo"
        }
        loading={photoLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    marginBottom: SPACING.md,
    color: COLORS.primary,
    textAlign: "center",
  },
  photoSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  section: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  sectionTitleWithoutMargin: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  photoButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  photoButtonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontSize: 12,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});

export default EditProfileScreen;
