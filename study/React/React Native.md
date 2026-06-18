# React Native

## Questions Covered

1. What is React Native and how does it differ from React for web?
2. How does React Native bridge to native platforms?
3. What are the core components in React Native (View, Text, ScrollView, etc.)?
4. How does styling work in React Native?
5. How do you handle navigation in React Native?
6. How do you access device APIs (camera, location, storage)?
7. What is Expo and when should you use it vs bare React Native?
8. How do you handle platform-specific code (iOS vs Android)?
9. What are common performance optimization techniques in React Native?
10. How does React Native compare to Flutter for mobile development?

## What is React Native and how does it differ from React for web?

**React Native** is Meta's framework for building **native iOS/Android apps** with JavaScript and React. It renders to **native UI widgets** (`UIView`, Android views), not the browser DOM. Same component model, JSX, hooks, and one-way data flow as React web — different render target and APIs.

| Aspect | React (web) | React Native |
|--------|-------------|--------------|
| **Render target** | Browser DOM (`div`, `span`) | Native widgets (`View`, `Text`) |
| **Styling** | CSS, Tailwind, etc. | JS objects via `StyleSheet` |
| **Layout** | Flexbox + Grid | Flexbox only (default `column`) |
| **Navigation** | React Router, Next.js | React Navigation, Expo Router |
| **Events** | `onClick`, `onChange` | `onPress`, `onChangeText` |
| **Platform APIs** | Web APIs | Native modules / Expo modules |
| **Bundling** | Vite/Webpack → browser | Metro → JS bundle in native shell |

React Native is **not** a WebView wrapper by default — it produces real native UI. Business logic and state management often share with web React.

```jsx
// React (web)
function WebGreeting({ name }) {
  return (
    <div className="card">
      <h1>Hello, {name}!</h1>
      <button onClick={() => alert('Hi')}>Say hi</button>
    </div>
  );
}
```

```jsx
// React Native
import { View, Text, Pressable, Alert } from 'react-native';

function NativeGreeting({ name }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Hello, {name}!</Text>
      <Pressable onPress={() => Alert.alert('Hi')}>
        <Text>Say hi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
```

## How does React Native bridge to native platforms?

Two runtimes cooperate: **JS thread** (Hermes/JSC runs React) and **native threads** (UIKit/Android UI). Communication via legacy **bridge** or **New Architecture**.

**Legacy bridge:** JS serializes JSON messages → async bridge → native creates/updates views → events serialized back. Bottleneck: JSON overhead and async-only traffic.

**New Architecture:**

| Piece | Role |
|-------|------|
| **JSI** | Direct C++ object refs — no JSON per call |
| **Fabric** | New renderer; sync layout on UI thread |
| **TurboModules** | Lazy, type-safe native modules via JSI |
| **Codegen** | Build-time bindings from TS/Flow specs |

```javascript
// Conceptual flow (simplified)
// JS thread: React reconciliation produces shadow tree
// Fabric: shadow tree diffed → native views updated on UI thread
// TurboModule: CameraModule.open() called directly via JSI, not JSON bridge

import { NativeModules } from 'react-native';
const { SettingsManager } = NativeModules;

// Legacy: async bridge call
SettingsManager.setTheme('dark');
```

```jsx
// Native modules are invoked from JS; events flow back via callbacks
import { NativeEventEmitter, NativeModules } from 'react-native';

const { BatteryModule } = NativeModules;
const batteryEmitter = new NativeEventEmitter(BatteryModule);

useEffect(() => {
  const sub = batteryEmitter.addListener('BatteryLevelChanged', (level) => {
    setBattery(level);
  });
  BatteryModule.startMonitoring();
  return () => {
    sub.remove();
    BatteryModule.stopMonitoring();
  };
}, []);
```

Most modern apps target Fabric/TurboModules; know both models for interviews.

## What are the core components in React Native (View, Text, ScrollView, etc.)?

Built-in components map to native primitives. **All text must be in `<Text>`** — raw strings cannot be `View` children.

| Component | Purpose | Web equivalent |
|-----------|---------|----------------|
| `View` | Layout container | `div` |
| `Text` | Display text | `span`, `p` |
| `Image` | Local/remote images | `img` |
| `ScrollView` | Scrollable (all children mounted) | scrollable div |
| `FlatList` | Virtualized list | virtualized list |
| `SectionList` | Grouped virtualized list | — |
| `TextInput` | Text entry | `input` |
| `Pressable` | Touchable with press states | `button` |
| `SafeAreaView` | Notch/status bar insets | — |
| `Modal` | Overlay | dialog |
| `ActivityIndicator` | Spinner | CSS spinner |

`ScrollView` for small fixed content; `FlatList`/`SectionList` for long lists.

```jsx
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
} from 'react-native';

function ProfileScreen({ user }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <TextInput
          placeholder="Bio"
          value={user.bio}
          onChangeText={setBio}
          multiline
        />
        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
```

```jsx
// FlatList for long lists — only visible items are rendered
function ItemList({ data }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.title}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text>No items</Text>}
    />
  );
}
```

## How does styling work in React Native?

**JS objects**, not CSS. No cascade — styles apply only to the target component. Layout via **Yoga** (Flexbox). Default `flexDirection: 'column'`.

**Rules:** `StyleSheet.create()` for perf; numbers = density-independent pixels; camelCase props; array merge `style={[a, b]}`; `Platform.select` for platform keys.

| CSS | React Native |
|-----|--------------|
| `flex-direction: row` | `flexDirection: 'row'` |
| `justify-content` | `justifyContent` |
| `box-shadow` | `shadow*` (iOS), `elevation` (Android) |
| Media queries | `useWindowDimensions` |

Libraries like NativeWind compile to StyleSheet objects under the hood.

```jsx
import { StyleSheet, View, Text, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
});

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
```

## How do you handle navigation in React Native?

**React Navigation** is standard — stack, tab, drawer, deep linking. **Expo Router** (file-based, on top of React Navigation) is popular in Expo projects.

| Navigator | Use case |
|-----------|----------|
| **Stack** | Push/pop screens |
| **Tab** | Main sections |
| **Drawer** | Side menu |
| **Native Stack** | Platform-native transitions (preferred) |

Auth guards: conditionally render `AuthStack` vs `AppStack`. Deep linking via `linking` on `NavigationContainer`.

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

```jsx
// Passing params and reading them on the destination screen
function FeedScreen({ navigation }) {
  return (
    <Pressable onPress={() => navigation.navigate('Details', { itemId: '42' })}>
      <Text>View item</Text>
    </Pressable>
  );
}

import { useRoute } from '@react-navigation/native';

function DetailsScreen() {
  const route = useRoute();
  const { itemId } = route.params;

  return <Text>Item: {itemId}</Text>;
}
```

## How do you access device APIs (camera, location, storage)?

Device features via **native modules** — RN built-ins, **Expo modules**, or custom native code. OS handles permissions.

| Feature | Library |
|---------|---------|
| **Storage** | `@react-native-async-storage/async-storage` |
| **Secure storage** | `expo-secure-store`, `react-native-keychain` |
| **Camera** | `expo-camera`, `react-native-vision-camera` |
| **Location** | `expo-location` |
| **Permissions** | `react-native-permissions`, Expo APIs |
| **Push** | `expo-notifications`, Firebase messaging |

Request permissions in context; handle denial; test both platforms.

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Storage
async function saveToken(token) {
  await AsyncStorage.setItem('authToken', token);
}

async function loadToken() {
  return AsyncStorage.getItem('authToken');
}

// Location
async function getCurrentPosition() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Permission denied');

  const location = await Location.getCurrentPositionAsync({});
  return location.coords;
}

// Camera
function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <Pressable onPress={requestPermission}>
        <Text>Grant camera permission</Text>
      </Pressable>
    );
  }

  return <CameraView style={{ flex: 1 }} facing="back" />;
}
```

## What is Expo and when should you use it vs bare React Native?

**Expo** is a toolchain on React Native: managed workflow, Expo modules, OTA updates, EAS cloud builds.

| Factor | Expo | Bare RN |
|--------|------|---------|
| **Setup** | `create-expo-app` — fast | CLI init — more config |
| **Native code** | Config plugins; dev client for custom native | Full Xcode/Gradle access |
| **OTA updates** | `expo-updates` built-in | Manual (CodePush, etc.) |
| **Build** | EAS Build or local prebuild | Local Xcode/Gradle |
| **Best for** | Most apps, MVPs, no native team | Heavy native customization |

**Choose Expo:** default for new projects; dev client + prebuild unlock native access when needed.

**Choose bare:** brownfield apps, unusual native SDKs, full native control from day one.

```bash
# Expo managed workflow
npx create-expo-app MyApp
cd MyApp
npx expo start

# Add a native capability via Expo module
npx expo install expo-camera expo-location
```

```bash
# Bare workflow — full native project access
npx @react-native-community/cli init MyBareApp
cd MyBareApp/ios && pod install
```

## How do you handle platform-specific code (iOS vs Android)?

Platforms differ in design language, APIs, and behavior. Common patterns:

| Approach | Use |
|----------|-----|
| `Platform.OS` / `Platform.select()` | Small style/value diffs |
| `.ios.js` / `.android.js` extensions | Whole files differ |
| Conditional native imports | Platform-only modules |

```jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    ...Platform.select({
      ios: { backgroundColor: '#f8f8f8' },
      android: { backgroundColor: '#6200ee', elevation: 4 },
    }),
  },
});

const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 56, default: 56 });
```

```jsx
// File: IconButton.ios.jsx
import { Pressable } from 'react-native';
export default function IconButton(props) {
  return <Pressable {...props} />; // iOS-style
}

// File: IconButton.android.jsx
import { Pressable } from 'react-native';
export default function IconButton(props) {
  return <Pressable android_ripple={{ color: '#ccc' }} {...props} />;
}

// Import resolves automatically:
// import IconButton from './IconButton';
```

```javascript
// Native module availability check
import { Platform, NativeModules } from 'react-native';

if (Platform.OS === 'ios' && NativeModules.ApplePay) {
  NativeModules.ApplePay.setup();
}
```

## What are common performance optimization techniques in React Native?

Bottlenecks: excessive re-renders, bridge traffic, large lists, heavy JS work.

| Technique | Solves |
|-----------|--------|
| `FlatList` tuning (`getItemLayout`, `windowSize`) | Off-screen mount cost |
| `memo` / `useMemo` / `useCallback` | Unnecessary re-renders |
| `InteractionManager` | Defer work past animations |
| Hermes | Startup + memory (default) |
| `useNativeDriver: true` | UI-thread animations |
| Image caching / WebP | Network + decode cost |
| New Architecture (Fabric) | Layout + native comms |
| Production builds | Dev mode is much slower |

Profile first — biggest wins: `FlatList` over `ScrollView`, native driver, less bridge chatter.

```jsx
import { FlatList, memo, useCallback } from 'react-native';

const ListRow = memo(function ListRow({ item, onPress }) {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Text>{item.title}</Text>
    </Pressable>
  );
});

function OptimizedList({ data }) {
  const handlePress = useCallback((id) => {
    navigation.navigate('Details', { id });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }) => <ListRow item={item} onPress={handlePress} />,
    [handlePress]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}
```

```javascript
import { InteractionManager } from 'react-native';

useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    loadHeavyData();
  });
  return () => task.cancel();
}, []);
```

## How does React Native compare to Flutter for mobile development?

Both cross-platform mobile from one codebase; different language, rendering, ecosystem.

| Aspect | React Native | Flutter |
|--------|--------------|---------|
| **Language** | JS/TS | Dart |
| **Rendering** | Native widgets (bridge/Fabric) | Skia/Impeller — draws every pixel |
| **Web reuse** | High (React/npm) | Low (new language) |
| **Look & feel** | Platform-native default | Consistent; Material/Cupertino |
| **Performance** | Very good with New Arch | Consistent 60/120 fps, no UI bridge |
| **Ecosystem** | npm + Expo | pub.dev (smaller) |
| **Web/desktop** | Secondary (RN Web) | First-class targets |
| **App size** | Moderate | Often larger (bundled engine) |

**React Native:** JS/TS teams, shared web logic, native UI, npm/Expo DX.

**Flutter:** Pixel-perfect custom UI, animation-heavy without bridge, unified widget model across platforms.

```jsx
// React Native — declarative JSX, native components
function Counter({ count, onIncrement }) {
  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Pressable onPress={onIncrement}>
        <Text>+</Text>
      </Pressable>
    </View>
  );
}
```

```dart
// Flutter equivalent — widget tree, everything is a Widget
class Counter extends StatelessWidget {
  final int count;
  final VoidCallback onIncrement;

  const Counter({ required this.count, required this.onIncrement });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count'),
        ElevatedButton(onPressed: onIncrement, child: Text('+')),
      ],
    );
  }
}
```

Choice depends on team skills, existing codebases, design needs, and native SDK requirements — neither is universally better.
