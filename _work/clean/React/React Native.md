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

**React Native** is Meta's framework for building **native iOS/Android apps** with JavaScript and React. It renders to **native UI widgets** (`UIView`, Android views) using familiar React patterns — not the browser DOM.

Both share the same **component model**, **JSX**, **hooks**, and **one-way data flow** — business logic often reuses across web and mobile. The **rendering target** and **API surface** differ fundamentally.

| Aspect | React (web) | React Native |
|--------|-------------|--------------|
| **Render target** | Browser DOM (`div`, `span`, `input`) | Native widgets (`View`, `Text`, `TextInput`) |
| **Styling** | CSS, CSS modules, Tailwind, etc. | JavaScript objects via `StyleSheet` (subset of CSS) |
| **Layout** | Flexbox + Grid + positioning | Flexbox only (default `flexDirection: 'column'`) |
| **Navigation** | React Router, Next.js routing | React Navigation, Expo Router |
| **Events** | DOM events (`onClick`, `onChange`) | Synthetic touch events (`onPress`, `onChangeText`) |
| **Platform APIs** | Web APIs (`fetch`, `localStorage`, Geolocation) | Native modules (`AsyncStorage`, `expo-location`, etc.) |
| **Bundling** | Webpack, Vite, esbuild → browser bundle | Metro bundler → JS bundle loaded by native shell |

On the web, React updates DOM elements. In React Native, it builds a **virtual tree of native components** mapped to platform views — no HTML, no CSS cascade, no `document`.

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

React Native is **not** a WebView wrapper by default — it renders **real native UI** for platform-appropriate look and performance.

## How does React Native bridge to native platforms?

React Native apps run a **JS thread** (Hermes/JSC) and **native threads** (UIKit/Android UI). They communicate via legacy **bridge** or **New Architecture** (Fabric + TurboModules + JSI).

**Legacy bridge:** JS serializes JSON commands → async bridge → native creates/updates views → events serialized back. JSON overhead and async-only traffic cause jank on animations and scroll.

**New Architecture (0.68+, default today):**

| Piece | Role |
|-------|------|
| **JSI (JavaScript Interface)** | Lets JS hold direct references to C++ objects — no JSON serialization for every call |
| **Fabric** | New rendering system; synchronous layout and priority-based updates on the UI thread |
| **TurboModules** | Lazy-loaded native modules with type-safe, direct JS-to-native calls |
| **Codegen** | Generates native bindings from TypeScript/Flow specs at build time |

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

The New Architecture removes the old bridge bottleneck. Know both models for interviews.

## What are the core components in React Native (View, Text, ScrollView, etc.)?

React Native provides a set of **built-in components** that map to native UI primitives. Unlike web HTML, **all text must be wrapped in `<Text>`** — raw strings cannot be children of `View`.

| Component | Purpose | Web equivalent |
|-----------|---------|----------------|
| `View` | Layout container | `div` |
| `Text` | Display text (required) | `span`, `p` |
| `Image` | Local/remote images | `img` |
| `ScrollView` | Scrollable (all children mounted) | scrollable div |
| `FlatList` | Virtualized list | virtualized list |
| `TextInput` | Text entry | `input` |
| `Pressable` | Touchable with press states | `button` |
| `SafeAreaView` | Notch/status bar insets | — |
| `Modal` | Overlay | dialog |

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

**Rule of thumb:** `ScrollView` for small content; `FlatList` for long lists.

## How does styling work in React Native?

React Native uses **JavaScript objects** for styles, not CSS files or class names. There is no cascade — styles apply only to the component they are passed to (inline or via `style` prop). The layout engine is **Yoga** (Flexbox implementation).

Styles are plain objects; use `StyleSheet.create()` for performance. **Flexbox** is primary layout; default `flexDirection` is `'column'`. Numbers are density-independent pixels. Merge with arrays: `style={[styles.base, isActive && styles.active]}`. Platform keys via `Platform.select`.

| CSS | React Native |
|-----|--------------|
| `flex-direction: row` | `flexDirection: 'row'` |
| `justify-content` / `align-items` | `justifyContent` / `alignItems` |
| `box-shadow` | `shadow*` (iOS), `elevation` (Android) |
| Media queries | `useWindowDimensions` |

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

Libraries like NativeWind compile to StyleSheet objects under the hood.

## How do you handle navigation in React Native?

**React Navigation** is the de facto standard for in-app navigation. It supports stack, tab, and drawer navigators, deep linking, and typed routes. **Expo Router** (file-based, built on React Navigation) is popular in Expo projects.

| Navigator | Use case |
|-----------|----------|
| **Stack** | Push/pop screens, auth flows |
| **Tab** | Main sections |
| **Drawer** | Side menu |
| **Native Stack** | Platform-native transitions (preferred) |

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

Deep linking via `linking` on `NavigationContainer`. Auth guards: conditionally render `AuthStack` vs `AppStack`.

## How do you access device APIs (camera, location, storage)?

Device features via **native modules** — RN built-ins, Expo modules, or custom native code.

| Feature | Library |
|---------|---------|
| **Storage** | `@react-native-async-storage/async-storage` |
| **Secure storage** | `expo-secure-store` |
| **Camera** | `expo-camera`, `react-native-vision-camera` |
| **Location** | `expo-location` |
| **Push** | `expo-notifications`, Firebase messaging |

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

Request permissions in context; handle denial; test both platforms.

## What is Expo and when should you use it vs bare React Native?

**Expo** simplifies RN development with managed workflow, Expo modules, OTA updates, and EAS cloud builds.

| Factor | Expo | Bare RN |
|--------|------|---------|
| **Setup** | `create-expo-app` — fast | CLI init — more config |
| **Native code** | Config plugins; dev client for custom native | Full Xcode/Gradle access |
| **OTA updates** | `expo-updates` built-in | Manual (CodePush, etc.) |
| **Build** | EAS Build or prebuild | Local Xcode/Gradle |
| **Best for** | Most apps, MVPs | Heavy native customization |

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

**Choose Expo** for new projects — dev client and prebuild unlock native access when needed. **Go bare** for brownfield apps or unusual native SDKs without Expo support.

## How do you handle platform-specific code (iOS vs Android)?

Platforms differ in design language, APIs, and behavior. Use `Platform.select` for small diffs, `.ios.js`/`.android.js` extensions for whole files, or conditional native imports.

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

Test on real devices — simulators miss hardware-specific behavior.

## What are common performance optimization techniques in React Native?

Bottlenecks: excessive re-renders, bridge traffic, large lists, heavy JS work.

| Technique | Solves |
|-----------|--------|
| `FlatList` tuning (`getItemLayout`, `windowSize`) | Off-screen mount cost |
| `memo` / `useMemo` / `useCallback` | Unnecessary re-renders |
| `InteractionManager` | Defer work past animations |
| Hermes + `useNativeDriver: true` | Startup, UI-thread animations |
| New Architecture (Fabric) | Layout + native comms |
| Production builds + profiler | Dev mode slowness; find real bottlenecks |

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

Profile first — biggest wins: `FlatList` over `ScrollView`, native driver, less bridge chatter.

## How does React Native compare to Flutter for mobile development?

Both build cross-platform mobile from one codebase; they differ in language, rendering, and ecosystem.

| Aspect | React Native | Flutter |
|--------|--------------|---------|
| **Language** | JS/TS | Dart |
| **Rendering** | Native widgets (bridge/Fabric) | Skia/Impeller — draws every pixel |
| **Web reuse** | High (React/npm) | Low |
| **Look & feel** | Platform-native default | Consistent Material/Cupertino |
| **Performance** | Very good with New Arch | 60/120 fps, no UI bridge |
| **Ecosystem** | npm + Expo | pub.dev (smaller) |
| **Web/desktop** | Secondary (RN Web) | First-class targets |

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

**React Native:** JS/TS teams, shared web logic, native UI, npm/Expo DX. **Flutter:** pixel-perfect custom UI, animation-heavy apps, unified widget model across platforms. Choice depends on team skills, codebase, and native SDK needs.
