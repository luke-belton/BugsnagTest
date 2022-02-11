/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, {useContext, useReducer, useEffect} from 'react';
import {Button, Pressable, SafeAreaView, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Bugsnag from '@bugsnag/react-native';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPluginReactNavigation from '@bugsnag/plugin-react-navigation';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

Bugsnag.start({
  plugins: [new BugsnagPluginReact(), new BugsnagPluginReactNavigation()],
});

const {createNavigationContainer} = Bugsnag.getPlugin('reactNavigation');
const BugsnagNavigationContainer =
  createNavigationContainer(NavigationContainer);

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const ErrorView = ({clearError}) => {
  return (
    <View>
      <Text>
        Something unexpected happened. We're sorry about that, we've let our
        engineers know. You can click below to start over
      </Text>
      <Button title="Reset" onPress={clearError} />
    </View>
  );
};

const UserContext = React.createContext();

const actions = {SET_FOO: 'SET_FOO'};

const reducer = (state, action) => {
  return {...state, foo: action.foo};
};

const UserProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, {foo: [], loggedIn: true});

  const value = {
    loggedIn: state.loggedIn,
    foo: state.foo,
    setFoo: newFoo =>
      dispatch({
        type: actions.SET_FOO,
        foo: newFoo,
      }),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const ScreenA = () => {
  const {foo} = useContext(UserContext);

  return (
    <SafeAreaView>
      <Text>Screen A</Text>
      <Text>foo == {foo.toString()}</Text>
    </SafeAreaView>
  );
};

const ScreenC = () => {
  const {foo, setFoo} = useContext(UserContext);

  useEffect(() => {
    setTimeout(() => {
      console.log('screen c effect');
      setFoo([50, 80]);
    }, 1500);
  }, [setFoo]);

  return (
    <SafeAreaView>
      <Text>Screen C</Text>
      <Text>foo == {foo.toString()}</Text>
    </SafeAreaView>
  );
};

const ScreenB = ({navigation}) => {
  return (
    <SafeAreaView>
      <Text style={{marginVertical: 30}}>Screen B</Text>
      <Pressable onPress={() => navigation.navigate('Screen C')}>
        <Text style={{color: 'red'}}>Link to Screen C</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const TabIndex = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen name="Screen A" component={ScreenA} />
      <Tab.Screen name="Screen B" component={ScreenB} />
    </Tab.Navigator>
  );
};

const LoginScreen = () => {
  return (
    <View>
      <Text>Log in here</Text>
    </View>
  );
};

const AuthStateScreen = () => {
  const {loggedIn} = useContext(UserContext);

  const Stack = createNativeStackNavigator();

  if (loggedIn) {
    return (
      <BugsnagNavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="TabIndex" component={TabIndex} />
          <Stack.Screen name="Screen C" component={ScreenC} />
        </Stack.Navigator>
      </BugsnagNavigationContainer>
    );
  } else {
    return <LoginScreen />;
  }
};

const App = () => {
  return (
    <UserProvider>
      <AuthStateScreen />
    </UserProvider>
  );
};

export default () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorView}>
      <App />
    </ErrorBoundary>
  );
};
