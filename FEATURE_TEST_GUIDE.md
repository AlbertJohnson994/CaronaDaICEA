# Feature Testing Guide - Photo Upload & Map

## 🚀 How to Test the New Features

### **1. PHOTO UPLOAD FEATURE**

**Location:** Edit Profile Screen

**Steps:**

1. Open the app in Expo Go
2. Login with your account
3. Tap on your **Profile** (bottom navigation)
4. Tap the **Edit Profile** button/icon (pencil icon or "Editar Perfil")
5. You should see these sections:
   - **"Sua Foto"** (Your Photo) - with "Alterar Foto" button
   - **"Foto do Seu Veículo"** (Vehicle Photo) - with "Alterar Foto do Veículo" button (only visible for drivers)

6. Tap either button to:
   - Take a photo with the camera
   - Select from your gallery

### **2. MAP DISPLAY FEATURE**

**Location:** Ride Details Screen

**Steps:**

1. Open the app and login
2. Navigate to **"Home"** tab
3. Browse available rides or create a test ride
4. Tap on a ride to open **Ride Details**
5. At the top of the screen, you should see the **Map** showing:
   - Route from origin to destination
   - Green marker at starting point
   - Red marker at destination
   - Blue polyline showing the route

### **3. CAR PHOTO DISPLAY**

**Location:** Ride Details Screen (bottom of page)

**Steps:**

1. Same as Map feature - open a ride detail
2. Scroll down to **"Motorista"** (Driver) section
3. If driver has uploaded a car photo, it appears here
4. The license plate is highlighted with a gold background and black border

## ✅ Expected Behavior

- **Photo Upload:** Modal appears with Camera/Gallery options
- **Photo Display:** Photos appear as thumbnails in ProfileScreen
- **License Plate:** Shows with highlighted styling on ride cards
- **Map:** Shows simplified route with markers for João Monlevade demo locations

## 🔍 Troubleshooting

If features not visible:

- Make sure you're on the correct screen
- Reload app with 'r' in terminal
- Clear app cache and reload
- Check emulator/device has enough permissions enabled
