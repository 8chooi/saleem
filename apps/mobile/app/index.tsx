import { useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'
import NetInfo from '@react-native-community/netinfo'
import { useEffect } from 'react'

// الموقع المنشور على Vercel — تأكد أن saleem.8ch.app يشير لـ Vercel
const SITE_URL = 'https://saleem.8ch.app'

export default function MainScreen() {
  const webViewRef = useRef<WebView>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [canGoBack])

  // Check network
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected)
    })
    return unsub
  }, [])

  if (offline) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.offlineIcon}>📡</Text>
        <Text style={styles.offlineTitle}>لا يوجد اتصال بالإنترنت</Text>
        <Text style={styles.offlineDesc}>تحقق من اتصالك وحاول مجدداً</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => setOffline(false)}
        >
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        // Google Play compliance
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Geolocation disabled (لا نحتاج موقع المستخدم)
        geolocationEnabled={false}
        // User agent واضح
        applicationNameForUserAgent="SaleemApp/1.0"
        // منع فتح روابط خارجية في متصفح
        setSupportMultipleWindows={false}
        // دعم RTL
        textZoom={100}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>سَلِيم</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2563EB' },
  webview: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  offlineIcon: { fontSize: 64, marginBottom: 16 },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  offlineDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
