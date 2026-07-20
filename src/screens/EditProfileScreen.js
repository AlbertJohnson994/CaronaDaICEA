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

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicle, setVehicle] = useState(user?.vehicle || "");
  const [licensePlate, setLicensePlate] = useState(user?.licensePlate || "");
  const [driverPhotoUri, setDriverPhotoUri] = useState(
    user?.driverPhotoUri || null,
  );
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
      driverPhotoUri,
      ...((user.userType === "driver" || user.userType === "both") && {
        vehicle: vehicle.trim(),
        licensePlate: licensePlate.trim(),
        carPhotoUri,
      }),
    };

    const result = await updateUserProfile(updates);

    setLoading(false);

    if (result.success) {
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } else {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil: " + result.error,
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>

        {/* Driver Photo Section */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Sua Foto</Text>
          <PhotoDisplay photoUri={driverPhotoUri} title="Sua Foto de Perfil" />
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => handlePhotoSelect("driver")}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.photoButtonText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />
        </View>

        {(user.userType === "driver" || user.userType === "both") && (
          <>
            {/* Car Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Foto do Seu Veículo</Text>
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
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.photoButtonText}>
                  Alterar Foto do Veículo
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Veículo</Text>
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
          </>
        )}

        <CustomButton
          title="Salvar Alterações"
          onPress={handleSave}
          loading={loading}
          icon="save-outline"
        />
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
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  photoSection: {
    marginBottom: 25,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  photoButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  photoButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default EditProfileScreen;
