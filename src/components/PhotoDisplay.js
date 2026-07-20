// src/components/PhotoDisplay.js
import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PhotoDisplay = ({
  photoUri,
  title,
  licensePlate,
  showLicensePlate = false,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  if (!photoUri) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="image-outline" size={48} color="#ccc" />
        <Text style={styles.placeholderText}>{title}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setFullscreenVisible(true)}
        style={styles.container}
      >
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {showLicensePlate && licensePlate && (
          <View style={styles.licensePlateContainer}>
            <Text style={styles.licensePlateText}>{licensePlate}</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Ionicons name="expand" size={24} color="white" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullscreenVisible(false)}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>

          <Image
            source={{ uri: photoUri }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />

          {showLicensePlate && licensePlate && (
            <View style={styles.fullscreenLicensePlate}>
              <Text style={styles.licensePlateText}>{licensePlate}</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginVertical: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 20,
  },
  licensePlateContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
  },
  licensePlateText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    letterSpacing: 1,
  },
  placeholderContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
  },
  placeholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenLicensePlate: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: "#000",
  },
});

export default PhotoDisplay;
