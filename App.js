import React, { useState } from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import { Colors, Sizes } from './src/constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    SignInScreen,
    SignUpScreen,
    AccountSelectionScreen,
    PortalScreen,
    AnnouncementsScreen,
    MembersScreen,
    UnitsScreen,
    DocumentsScreen,
    CTAScreen,
    UserSettingsScreen,
    InvoicesScreen,
} from './src/screens';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rezUnloadToken } from './api_client';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const AUTH_ROUTES = [
    { name: "Login", component: SignInScreen },
    { name: "Register", component: SignUpScreen },
]


const MAIN_ROUTES = [
    { name: "Accounts", component: AccountSelectionScreen },
    { name: "Portal", component: PortalScreen },
    { name: "Announcements", component: AnnouncementsScreen },
    { name: "Members", component: MembersScreen },
    { name: "Units", component: UnitsScreen },
    { name: "Documents", component: DocumentsScreen },
    { name: "CTA", component: CTAScreen },
    { name: "Settings", component: UserSettingsScreen },
    { name: "Invoices", component: InvoicesScreen },
]


const AuthRoutes = () => {
    return (
        <Stack.Navigator initialRouteName="AuthLogin">
            {
                AUTH_ROUTES.map((item, i) =>
                    <Stack.Screen
                        key={i}
                        name={item.name}
                        component={item.component}
                        options={{ headerShown: false }}
                    />
                )
            }
        </Stack.Navigator>
    );
};


const NavigationRoutes = () => {
    return (
        <Tab.Navigator
            initialRouteName="AccountSelection"
            screenOptions={{
                headerShown: false,
                tabBarStyle: { height: Sizes.tabBarHeight, paddingTop: 15 }
            }}
        >
            <Tab.Screen
                name="Home"
                options={{
                    tabBarLabel: "home-profile",
                    tabBarLabelStyle: { display: "none" },
                    tabBarIcon: ({ color }) => (
                        // <UlCustomIcon name="fog-home" color={color} size={35} />
                        <Text>H</Text>
                    )
                }}
            >
                {() => (
                    <Stack.Navigator initialRouteName="Accounts" >
                        {
                            MAIN_ROUTES.map((route, index) =>
                                <Stack.Screen key={index} name={route.name} component={route.component} />
                            )
                        }
                    </Stack.Navigator>
                )}
            </Tab.Screen>
            <Tab.Screen
                name="Port"
                options={{
                    tabBarLabel: "Portal",
                    tabBarLabelStyle: { display: "none" },
                    tabBarIcon: ({ color, size }) => (
                        // <UlCustomIcon name="fog-project" color={color || "red"} size={33} />
                        <Text>P</Text>
                    )
                }}
            >
                {() => (
                    <Stack.Navigator initialRouteName="Port" >
                        {
                            MAIN_ROUTES.map((route, index) =>
                                <Stack.Screen key={index} name={route.name} component={route.component} />
                            )
                        }
                    </Stack.Navigator>
                )}
            </Tab.Screen>
            <Tab.Screen
                name="UserSettings"
                options={{
                    tabBarLabel: "Settings",
                    tabBarLabelStyle: { display: "none" },
                    tabBarIcon: ({ color, size }) => (
                        // <UlCustomIcon name="fog-file" color={color || "red"} size={33} />
                        <Text>S</Text>
                    )
                }}
            >
                {() => (
                    <Stack.Navigator initialRouteName="Settings" >
                        {
                            MAIN_ROUTES.map((route, index) =>
                                <Stack.Screen key={index} name={route.name} component={route.component} />
                            )
                        }
                    </Stack.Navigator>
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};


export default function App() {
    const [screen, setScreen] = useState('welcome');
    const [user, setUser] = useState(null);
    const [account, setAccount] = useState(null);

    const onPressSignup = () => {
        setScreen('signup');
    };

    const onPressLogin = () => {
        setScreen('welcome');
    };

    const onLogin = (u) => {
        setUser(u);
        setScreen('accounts');
    };

    const onLogout = async () => {
        await rezUnloadToken()
        // remove device
        setUser(null);
        setScreen('welcome');
    };
    const onDelete = onLogout;

    const onSelectAccount = (acc) => {
        if (acc) {
            setAccount(acc);
            setScreen('portal');
        } else {
            setAccount(null);
            setScreen('accounts');
        }
    };


    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash">
                <Stack.Screen
                    name="AuthRoutes"
                    component={AuthRoutes}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="NavigationRoutes"
                    component={NavigationRoutes}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}



const st = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
