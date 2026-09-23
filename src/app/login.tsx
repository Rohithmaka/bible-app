import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import {
  signInWithEmail,
  signUpWithEmail,
  signInAsGuest,
  resendVerificationEmail,
  hasCompletedOnboarding,
} from '../services/authService';
import { triggerLightHaptic } from '../services/mobileHaptics';
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  const navigateNext = () => {
    triggerLightHaptic();
    if (hasCompletedOnboarding()) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding-flow');
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to resend confirmation.');
      return;
    }
    setResendingEmail(true);
    triggerLightHaptic();
    const res = await resendVerificationEmail(email);
    setResendingEmail(false);
    if (res.success) {
      setInfoMessage('✓ Confirmation email resent! Please check your inbox and spam folder.');
      setErrorMessage(null);
    } else {
      setErrorMessage(res.error || 'Failed to resend confirmation email.');
    }
  };

  const handleContinueAsGuest = async () => {
    triggerLightHaptic();
    setLoading(true);
    try {
      await signInAsGuest(name.trim() || email.split('@')[0] || 'Believer');
      navigateNext();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your name to personalize your account.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (authMode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.user) {
          navigateNext();
        } else {
          setErrorMessage(res.error || 'Sign in failed. Please check your email or password.');
        }
      } else {
        // Sign Up
        const res = await signUpWithEmail(email, password, name);
        if (res.user) {
          if (res.confirmationRequired) {
            setInfoMessage('Account created! Please check your email inbox to verify, or continue into the app.');
            setTimeout(() => {
              navigateNext();
            }, 1800);
          } else {
            navigateNext();
          }
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/images/sela_logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
            <Text style={[styles.kickerText, { color: palette.accentGreen }]}>
              PAUSE • PRAY • GROW • BELONG
            </Text>
            <Text style={[styles.titleText, { color: palette.textPrimary }]}>
              Sela Holy Bible
            </Text>
            <Text style={[styles.subtitleText, { color: palette.textSecondary }]}>
              Your sacred sanctuary for Scripture, daily devotions, and prayer fellowship.
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              style={[
                styles.tabButton,
                authMode === 'signin' && { backgroundColor: palette.accentGreen },
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: authMode === 'signin' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerLightHaptic();
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              style={[
                styles.tabButton,
                authMode === 'signup' && { backgroundColor: palette.accentGreen },
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: authMode === 'signup' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Banners */}
          {errorMessage && (
            <View style={[styles.alertBanner, { backgroundColor: '#FEE2E2', borderColor: '#F87171' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#DC2626" style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertText, { color: '#991B1B', fontWeight: '700' }]}>{errorMessage}</Text>
                  {errorMessage.toLowerCase().includes('email not confirmed') && (
                    <Text style={{ fontSize: 12, color: '#7F1D1D', marginTop: 4, lineHeight: 17 }}>
                      A verification link was sent to your email. Check your inbox & spam folder, or tap below to resend.
                    </Text>
                  )}
                </View>
              </View>

              {errorMessage.toLowerCase().includes('email not confirmed') && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(239, 68, 68, 0.25)' }}>
                  <TouchableOpacity
                    onPress={handleResendEmail}
                    disabled={resendingEmail}
                    style={{
                      flex: 1,
                      backgroundColor: '#DC2626',
                      paddingVertical: 7,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                      {resendingEmail ? 'Sending...' : 'Resend Link'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleContinueAsGuest}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      paddingVertical: 7,
                      borderRadius: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#DC2626',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                      Enter as Guest →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {infoMessage && (
            <View style={[styles.alertBanner, { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' }]}>
              <CheckCircle2 size={18} color="#059669" style={{ marginRight: 8 }} />
              <Text style={[styles.alertText, { color: '#065F46' }]}>{infoMessage}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            {/* Full Name (Sign Up only) */}
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Full Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <User size={18} color={palette.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: palette.textPrimary }]}
                    placeholder="e.g. Grace Robinson"
                    placeholderTextColor={palette.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: palette.background, borderColor: palette.border }]}>
                <Mail size={18} color={palette.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: palette.textPrimary }]}
                  placeholder="name@example.com"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: palette.background, borderColor: palette.border }]}>
                <Lock size={18} color={palette.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: palette.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={palette.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleEmailAuth}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.submitButton, { backgroundColor: palette.accentGreen }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  {authMode === 'signin' ? (
                    <LogIn size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  ) : (
                    <UserPlus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {authMode === 'signin' ? 'Sign In' : 'Create Free Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Switch Mode Helper */}
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setErrorMessage(null);
              }}
              style={styles.switchModeTouchable}
            >
              <Text style={[styles.switchModeText, { color: palette.accentGreen }]}>
                {authMode === 'signin'
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Instant Guest Access */}
            <View style={{ alignItems: 'center', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.border }}>
              <TouchableOpacity
                onPress={handleContinueAsGuest}
                activeOpacity={0.7}
                style={{ paddingVertical: 4, paddingHorizontal: 12 }}
              >
                <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '500' }}>
                  Or explore first • <Text style={{ color: palette.accentGreen, fontWeight: '700' }}>Continue as Guest →</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy & Sacred Trust Badge */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={16} color={palette.accentGreen} style={{ marginRight: 6 }} />
            <Text style={[styles.trustText, { color: palette.textMuted }]}>
              Your prayers, highlights, and notes are private and encrypted.
            </Text>
          </View>

          {/* Support Email Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL('mailto:selabibleapp@gmail.com?subject=Sela%20Bible%20App%20Support')}
            style={styles.supportLink}
          >
            <Text style={{ fontSize: 12, color: palette.textMuted }}>
              Need help? Email support:{' '}
              <Text style={{ color: palette.accentGreen, fontWeight: '700' }}>selabibleapp@gmail.com</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  kickerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  formCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchModeTouchable: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
  },
  trustText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  supportLink: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
});
