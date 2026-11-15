// src/screens/AuthScreen.js
// Official UFOP Landing Page, 3-Campus 3D/2D Showcase & Institutional Auth Portal (Mobile & Desktop)
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPhone, formatLicensePlate } from '../utils/formatters';
import ToastNotification from '../components/ToastNotification';
import UfopLogo, { openUfopUrl } from '../components/UfopLogo';
import UfopCampusMap3D2D from '../components/UfopCampusMap3D2D';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, UFOP_LINKS } from '../constants/theme';

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
  const { lang, toggleLang, deviceMode, toggleDeviceMode } = useLanguage();
  const isPt = lang !== 'en';
  const isDesktop = deviceMode === 'desktop';

  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
    setLoading(true);
    const result = await login(demoEmail, '123456');
    setLoading(false);
    if (!result.success) {
      showToast('error', result.error);
    }
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@ufop.edu.br')) {
      showToast(
        'error',
        isPt
          ? 'Por favor, use seu e-mail institucional válido (@ufop.edu.br)'
          : 'Please use your valid UFOP institutional email (@ufop.edu.br)'
      );
      return;
    }

    if (isLogin) {
      if (!password) {
        showToast('warning', isPt ? 'Informe sua senha.' : 'Please enter your password.');
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
        showToast('warning', isPt ? 'Por favor, informe seu nome completo.' : 'Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        showToast(
          'warning',
          isPt ? 'A senha deve ter pelo menos 6 caracteres.' : 'Password must be at least 6 characters.'
        );
        return;
      }
      if (password !== confirmPassword) {
        showToast('warning', isPt ? 'As senhas informadas não coincidem.' : 'Passwords do not match.');
        return;
      }
      if ((userType === 'driver' || userType === 'both') && !licensePlate.trim()) {
        showToast('warning', isPt ? 'Por favor, informe a placa do veículo.' : 'Please enter the license plate.');
        return;
      }

      const userData = {
        name: name.trim(),
        phone: phone.trim(),
        userType,
        ...((userType === 'driver' || userType === 'both') && {
          vehicle: vehicle.trim(),
          licensePlate: formatLicensePlate(licensePlate),
        }),
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

      {/* Top UFOP Institutional Portal Bar */}
      <View style={styles.ufopTopBar}>
        <View style={styles.ufopTopBarLeft}>
          <UfopLogo size="sm" light showSubtitle={false} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ufopTopBarLinks}
        >
          <TouchableOpacity
            style={styles.portalPill}
            onPress={() => openUfopUrl(UFOP_LINKS.portal)}
          >
            <Ionicons name="globe-outline" size={13} color="#F3E5AB" />
            <Text style={styles.portalPillText}>ufop.br</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalPill}
            onPress={() => openUfopUrl(UFOP_LINKS.minhaUfop)}
          >
            <Ionicons name="school-outline" size={13} color="#F3E5AB" />
            <Text style={styles.portalPillText}>Minha UFOP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalPill}
            onPress={() => openUfopUrl(UFOP_LINKS.icea)}
          >
            <Ionicons name="hardware-chip-outline" size={13} color="#F3E5AB" />
            <Text style={styles.portalPillText}>ICEA JM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalPill}
            onPress={() => openUfopUrl(UFOP_LINKS.ichs)}
          >
            <Ionicons name="book-outline" size={13} color="#F3E5AB" />
            <Text style={styles.portalPillText}>ICHS Mariana</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeTogglePill} onPress={toggleDeviceMode}>
            <Ionicons
              name={isDesktop ? 'desktop-outline' : 'phone-portrait-outline'}
              size={13}
              color={COLORS.primaryDark}
            />
            <Text style={styles.modeTogglePillText}>
              {isDesktop
                ? isPt
                  ? '🖥️ Modo Desktop'
                  : '🖥️ Desktop App'
                : isPt
                ? '📱 Modo Mobile'
                : '📱 Mobile App'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.langTogglePill} onPress={toggleLang}>
            <Text style={styles.langTogglePillText}>
              {lang === 'pt' ? '🇧🇷 PT ⇄ EN' : '🇬🇧 EN ⇄ PT'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          !isDesktop && styles.mobileShellContainer,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.landingGrid, isDesktop && styles.landingGridDesktop]}>
          {/* Left / Hero Column: Official UFOP Branding + 3D Sketchfab & 3-Campus Map */}
          <View style={[styles.heroShowcaseCol, isDesktop && styles.heroShowcaseColDesktop]}>
            <View style={styles.ufopHeroBanner}>
              <UfopLogo size="lg" light showSubtitle showPortalBadge />

              <Text style={styles.heroHeadline}>
                {isPt
                  ? 'Ecossistema Integrado de Mobilidade, Mapas 3D/2D & Comunidade dos 3 Campi da UFOP'
                  : 'Integrated Mobility, 3D/2D Campus Maps & Community Super-App for All 3 UFOP Campuses'}
              </Text>
              <Text style={styles.heroSubtext}>
                {isPt
                  ? 'Conectando Ouro Preto (Morro do Cruzeiro), Mariana (ICHS & ICSA) e João Monlevade (Campus ICEA) com Caronas Seguras (PIN 4 Dígitos & Pix 75%), Eventos, Grupos e Portal Oficial ufop.br.'
                  : 'Connecting Ouro Preto (Morro do Cruzeiro), Mariana (ICHS & ICSA), and João Monlevade (ICEA Campus) with Verified Carpools (4-Digit PIN & 75% Pix), Events, Groups, and the Official ufop.br Portal.'}
              </Text>

              {/* Direct Portal Connection Buttons */}
              <View style={styles.portalActionsRow}>
                <TouchableOpacity
                  style={styles.primaryGoldBtn}
                  onPress={() => openUfopUrl(UFOP_LINKS.portal)}
                >
                  <Ionicons name="open-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.primaryGoldBtnText}>
                    {isPt ? 'Conectar ao Portal ufop.br' : 'Connect to ufop.br Portal'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryOutlineBtn}
                  onPress={() => openUfopUrl(UFOP_LINKS.sketchfab3dPage)}
                >
                  <Ionicons name="cube-outline" size={16} color="#F3E5AB" />
                  <Text style={styles.secondaryOutlineBtnText}>
                    {isPt ? 'Modelo 3D UFOP (Sketchfab)' : 'UFOP 3D Model (Sketchfab)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Interactive 3D Sketchfab + 3D Blocks + 2D OpenStreetMap for all 3 UFOP Campuses */}
            <UfopCampusMap3D2D
              lang={lang}
              initialCampusId="ouro-preto"
              initialMode="sketchfab3d"
              height={isDesktop ? 360 : 280}
            />
          </View>

          {/* Right / Auth Card Column */}
          <View style={[styles.authCardCol, isDesktop && styles.authCardColDesktop]}>
            <View style={styles.authCard}>
              <View style={styles.authHeaderCenter}>
                <UfopLogo size="md" showSubtitle={false} />
                <Text style={styles.authCardSub}>
                  {isPt
                    ? 'Acesso Institucional Unificado (@ufop.edu.br)'
                    : 'Unified Institutional Sign-In (@ufop.edu.br)'}
                </Text>
              </View>

              {/* Quick 1-Tap Demo Accounts */}
              <View style={styles.quickDemoBox}>
                <Text style={styles.quickDemoLabel}>
                  ⚡ {isPt ? 'Acesso Rápido de Demonstração (1 Clique):' : '1-Click Instant Demo Access:'}
                </Text>
                <View style={styles.quickDemoRow}>
                  <TouchableOpacity
                    style={styles.demoChip}
                    onPress={() => handleQuickDemoLogin('driver@ufop.edu.br')}
                  >
                    <Ionicons name="car-sport" size={13} color="#FFFFFF" />
                    <Text style={styles.demoChipText}>
                      {isPt ? 'Motorista' : 'Driver'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoChip, { backgroundColor: '#7A1530' }]}
                    onPress={() => handleQuickDemoLogin('passenger@ufop.edu.br')}
                  >
                    <Ionicons name="person" size={13} color="#FFFFFF" />
                    <Text style={styles.demoChipText}>
                      {isPt ? 'Passageiro' : 'Passenger'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoChip, { backgroundColor: COLORS.ufopSlate }]}
                    onPress={() => handleQuickDemoLogin('admin@ufop.edu.br')}
                  >
                    <Ionicons name="shield-checkmark" size={13} color="#F3E5AB" />
                    <Text style={[styles.demoChipText, { color: '#F3E5AB' }]}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Auth Mode Toggle Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLogin && styles.tabActive]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                    {isPt ? 'Entrar' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.tabActive]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                    {isPt ? 'Cadastrar' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={isPt ? 'Nome completo' : 'Full name'}
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={isPt ? 'Telefone / WhatsApp (ex: 31988888888)' : 'Phone / WhatsApp'}
                      value={phone}
                      onChangeText={(t) => setPhone(formatPhone(t))}
                      keyboardType="phone-pad"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.userTypeContainer}>
                    <Text style={styles.label}>
                      {isPt ? 'Como deseja utilizar o app?' : 'How will you use the app?'}
                    </Text>
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
                          {isPt ? 'Passageiro' : 'Passenger'}
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
                          {isPt ? 'Motorista' : 'Driver'}
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
                          {isPt ? 'Ambos' : 'Both'}
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
                          placeholder={isPt ? 'Veículo (ex: Fiat Uno Vinho)' : 'Vehicle (model & color)'}
                          value={vehicle}
                          onChangeText={setVehicle}
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder={isPt ? 'Placa do veículo (ex: ABC1D23)' : 'License plate (e.g. ABC1D23)'}
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
                  placeholder={isPt ? 'E-mail institucional (@ufop.edu.br)' : 'Institutional email (@ufop.edu.br)'}
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
                  placeholder={isPt ? 'Senha' : 'Password'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Field */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isPt ? 'Confirmar senha' : 'Confirm password'}
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
                  {loading
                    ? isPt
                      ? 'Aguarde...'
                      : 'Please wait...'
                    : isLogin
                    ? isPt
                      ? 'Acessar Conta UFOP'
                      : 'Sign In to UFOP Account'
                    : isPt
                    ? 'Criar Minha Conta UFOP'
                    : 'Create My UFOP Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ufopFooterLink}
                onPress={() => openUfopUrl(UFOP_LINKS.portal)}
              >
                <Text style={styles.ufopFooterLinkText}>
                  🏛️ {isPt ? 'Portal Oficial: https://ufop.br/' : 'Official Portal: https://ufop.br/'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ufopTopBar: {
    backgroundColor: COLORS.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  ufopTopBarLeft: {
    marginRight: 8,
  },
  ufopTopBarLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  portalPillText: {
    color: '#F3E5AB',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  modeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  modeTogglePillText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
  },
  langTogglePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  langTogglePillText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  mobileShellContainer: {
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  landingGrid: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  landingGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  heroShowcaseCol: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  heroShowcaseColDesktop: {
    flex: 1.35,
    marginBottom: 0,
  },
  authCardCol: {
    width: '100%',
  },
  authCardColDesktop: {
    flex: 0.85,
    maxWidth: 460,
  },
  ufopHeroBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 14,
    lineHeight: 26,
  },
  heroSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
    lineHeight: 19,
  },
  portalActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  primaryGoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  primaryGoldBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '900',
    fontSize: 12,
    marginLeft: 6,
  },
  secondaryOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(89, 13, 34, 0.7)',
    borderWidth: 1.5,
    borderColor: '#F3E5AB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  secondaryOutlineBtnText: {
    color: '#F3E5AB',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  authHeaderCenter: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  authCardSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  quickDemoBox: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: SPACING.md,
  },
  quickDemoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  quickDemoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  demoChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  tabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  userTypeContainer: {
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: '700',
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
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginHorizontal: 3,
    backgroundColor: COLORS.surface,
  },
  optionSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.primary,
  },
  optionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    marginLeft: 4,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.medium,
  },
  buttonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
  },
  ufopFooterLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  ufopFooterLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});

export default AuthScreen;
