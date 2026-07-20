// src/screens/AuthScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { formatPhone, formatLicensePlate } from '../utils/formatters';
import ToastNotification from '../components/ToastNotification';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

import Logo from '../../assets/car.png';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register } = useContext(AuthContext);

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail.endsWith('@ufop.edu.br')) {
      showToast('error', 'Por favor, use seu e-mail institucional válido (@ufop.edu.br)');
      return;
    }

    if (isLogin) {
      if (!password) {
        showToast('warning', 'Informe sua senha.');
        return;
      }
      setLoading(true);
      const result = await login(cleanEmail, password);
      setLoading(false);
      if (!result.success) {
        showToast('error', result.error);
      }
    } else {
      if (!name.trim()) {
        showToast('warning', 'Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        showToast('warning', 'A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        showToast('warning', 'As senhas informadas não coincidem.');
        return;
      }
      if ((userType === 'driver' || userType === 'both') && !licensePlate.trim()) {
        showToast('warning', 'Por favor, informe a placa do veículo.');
        return;
      }

      const userData = {
        name: name.trim(),
        phone: phone.trim(),
        userType,
        ...(userType === 'driver' || userType === 'both') && {
          vehicle: vehicle.trim(),
          licensePlate: formatLicensePlate(licensePlate)
        }
      };

      setLoading(true);
      const result = await register(cleanEmail, password, userData);
      setLoading(false);
      if (!result.success) {
        showToast('error', result.error);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* App Logo & Header */}
        <View style={styles.headerSection}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Caronas ICEA</Text>
          <Text style={styles.subtitle}>Mobilidade acadêmica segura, sustentável e pontual</Text>
        </View>

        {/* Auth Mode Toggle Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.tabActive]} 
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.tabActive]} 
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Registration Fields */}
        {!isLogin && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone / WhatsApp (ex: 31988888888)"
                value={phone}
                onChangeText={(t) => setPhone(formatPhone(t))}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>Como deseja utilizar o app?</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={[styles.option, userType === 'passenger' && styles.optionSelected]}
                  onPress={() => setUserType('passenger')}
                >
                  <Ionicons 
                    name="walk-outline" 
                    size={18} 
                    color={userType === 'passenger' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[styles.optionText, userType === 'passenger' && styles.optionTextSelected]}>
                    Passageiro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.option, userType === 'driver' && styles.optionSelected]}
                  onPress={() => setUserType('driver')}
                >
                  <Ionicons 
                    name="car-outline" 
                    size={18} 
                    color={userType === 'driver' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[styles.optionText, userType === 'driver' && styles.optionTextSelected]}>
                    Motorista
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.option, userType === 'both' && styles.optionSelected]}
                  onPress={() => setUserType('both')}
                >
                  <Ionicons 
                    name="swap-horizontal-outline" 
                    size={18} 
                    color={userType === 'both' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[styles.optionText, userType === 'both' && styles.optionTextSelected]}>
                    Ambos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {(userType === 'driver' || userType === 'both') && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="car-sport-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Veículo (modelo e cor, ex: Fiat Uno Vermelho)"
                    value={vehicle}
                    onChangeText={setVehicle}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Placa do veículo (ex: ABC1D23)"
                    value={licensePlate}
                    onChangeText={(t) => setLicensePlate(formatLicensePlate(t))}
                    autoCapitalize="characters"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </>
            )}
          </>
        )}
        
        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail institucional (@ufop.edu.br)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        
        {/* Confirm Password Field */}
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        )}
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? "Aguarde..." : isLogin ? 'Acessar Conta' : 'Criar Minha Conta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: SPACING.md,
    resizeMode: 'contain',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 28,
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
    maxWidth: 280,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  tabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  userTypeContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginHorizontal: 3,
    backgroundColor: COLORS.surface,
  },
  optionSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  optionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    marginLeft: 4,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  buttonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    fontSize: 16,
  },
});

export default AuthScreen;
