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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import {
  signInAsGuest,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  hasCompletedOnboarding,
} from '../services/authService';
import { triggerLightHaptic } from '../services/mobileHaptics';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
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

  // Auth Mode: 'options' | 'email_signin' | 'email_signup'
  const [authMode, setAuthMode] = useState<'options' | 'email_signin' | 'email_signup'>('options');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const navigateNext = () => {
    triggerLightHaptic();
    if (hasCompletedOnboarding()) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding-flow');
    }
  };

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    setErrorMessage(null);
    try {
      await signInAsGuest('Friend');
      navigateNext();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start guest session.');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        navigateNext();
      } else if (res.error) {
        // Friendly notice if Google OAuth is not enabled in dashboard yet
        setErrorMessage(
          res.error.includes('provider')
            ? 'Google Sign-In is not enabled yet in your Supabase dashboard. You can continue as Guest or use Email.'
            : res.error
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (authMode === 'email_signin') {
        const res = await signInWithEmail(email, password);
        if (res.user) {
          navigateNext();
        } else {
          setErrorMessage(res.error || 'Sign in failed. Check your email or password.');
        }
      } else {
        // Sign Up
        const res = await signUpWithEmail(email, password, name);
        if (res.user) {
          if (res.confirmationRequired) {
            setInfoMessage('Account created! Please check your email inbox to verify your account, or continue right away.');
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
              Your sacred sanctuary for Scripture, daily prayers, and spiritual fellowship.
            </Text>
          </View>

          {/* Feedback Banners */}
          {errorMessage && (
            <View style={[styles.alertBanner, { backgroundColor: '#FEE2E2', borderColor: '#F87171' }]}>
              <AlertCircle size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={[styles.alertText, { color: '#991B1B' }]}>{errorMessage}</Text>
            </View>
          )}

          {infoMessage && (
            <View style={[styles.alertBanner, { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' }]}>
              <CheckCircle2 size={18} color="#059669" style={{ marginRight: 8 }} />
              <Text style={[styles.alertText, { color: '#065F46' }]}>{infoMessage}</Text>
            </View>
          )}

          {/* Options Mode */}
          {authMode === 'options' && (
            <View style={styles.buttonStack}>
              {/* Primary: Continue as Guest (Fast & Zero Friction) */}
              <TouchableOpacity
                onPress={handleGuestSignIn}
                disabled={guestLoading}
                activeOpacity={0.85}
                style={[
                  styles.guestButton,
                  { backgroundColor: palette.accentGreen },
                ]}
              >
                {guestLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.guestButtonContent}>
                      <Sparkles size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                      <Text style={styles.guestButtonText}>Continue as Guest</Text>
                    </View>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
              <Text style={[styles.guestSubtext, { color: palette.textMuted }]}>
                Instant 1-tap entry • No password needed • Save prayers & notes
              </Text>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: palette.border }]} />
                <Text style={[styles.dividerText, { color: palette.textMuted }]}>
                  OR SYNC ACROSS DEVICES
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: palette.border }]} />
              </View>

              {/* Google Sign-In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
                activeOpacity={0.8}
                style={[
                  styles.secondaryButton,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                {googleLoading ? (
                  <ActivityIndicator color={palette.textPrimary} />
                ) : (
                  <>
                    <View style={{ width: 22, alignItems: 'center', marginRight: 10 }}>
                      <Text style={{ fontSize: 18 }}>🌐</Text>
                    </View>
                    <Text style={[styles.secondaryButtonText, { color: palette.textPrimary }]}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Email Sign-In Toggle */}
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  setAuthMode('email_signin');
                }}
                activeOpacity={0.8}
                style={[
                  styles.secondaryButton,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <Mail size={18} color={palette.textPrimary} style={{ marginRight: 10 }} />
                <Text style={[styles.secondaryButtonText, { color: palette.textPrimary }]}>
                  Sign in with Email
                </Text>
              </TouchableOpacity>

              {/* Create Account Link */}
              <View style={styles.footerLinkRow}>
                <Text style={{ fontSize: 13, color: palette.textSecondary }}>
                  New to Sela?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    triggerLightHaptic();
                    setAuthMode('email_signup');
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen }}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Email Sign-In / Sign-Up Form */}
          {authMode !== 'options' && (
            <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              {/* Form Title & Switcher */}
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: palette.textPrimary }]}>
                  {authMode === 'email_signin' ? 'Sign In with Email' : 'Create Free Account'}
                </Text>
                <Text style={[styles.formSubtitle, { color: palette.textSecondary }]}>
                  {authMode === 'email_signin'
                    ? 'Enter your email and password to continue.'
                    : 'Create your account to sync your devotions everywhere.'}
                </Text>
              </View>

              {/* Full Name (Sign Up only) */}
              {authMode === 'email_signup' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Your Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: palette.background, borderColor: palette.border }]}>
                    <User size={18} color={palette.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: palette.textPrimary }]}
                      placeholder="e.g. Grace"
                      placeholderTextColor={palette.textMuted}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Email Address</Text>
                <View style={[styles.inputWrapper, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <Mail size={18} color={palette.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: palette.textPrimary }]}
                    placeholder="you@example.com"
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
                    {authMode === 'email_signin' ? (
                      <LogIn size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    ) : (
                      <UserPlus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.submitButtonText}>
                      {authMode === 'email_signin' ? 'Sign In' : 'Create Account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Switch Mode or Go Back */}
              <View style={styles.formFooter}>
                <TouchableOpacity
                  onPress={() => {
                    triggerLightHaptic();
                    setAuthMode(authMode === 'email_signin' ? 'email_signup' : 'email_signin');
                    setErrorMessage(null);
                  }}
                  style={{ marginBottom: 12 }}
                >
                  <Text style={[styles.switchModeText, { color: palette.accentGreen }]}>
                    {authMode === 'email_signin'
                      ? "Don't have an account? Create one"
                      : 'Already have an account? Sign In'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    triggerLightHaptic();
                    setAuthMode('options');
                    setErrorMessage(null);
                  }}
                >
                  <Text style={[styles.backToOptionsText, { color: palette.textMuted }]}>
                    ← Back to all sign-in options
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Privacy & Sacred Trust Badge */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={16} color={palette.accentGreen} style={{ marginRight: 6 }} />
            <Text style={[styles.trustText, { color: palette.textMuted }]}>
              Your prayers, highlights, and journals are private and secure.
            </Text>
          </View>
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
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 22,
    marginBottom: 16,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  buttonStack: {
    gap: 14,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  guestSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  formFooter: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  backToOptionsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    paddingHorizontal: 16,
  },
  trustText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
