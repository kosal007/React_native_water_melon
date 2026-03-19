import { registerRootComponent } from 'expo';
import DashboardScreen from './src/Screen/DashboardScreen';

/**
 * App entry point.
 *
 * registerRootComponent ensures AppRegistry.registerComponent('main', ...)
 * is called correctly whether running in Expo Go, Expo Dev Client, or a
 * bare React Native build.
 */
function App() {
  return <DashboardScreen />;
}

export default App;
registerRootComponent(App);
