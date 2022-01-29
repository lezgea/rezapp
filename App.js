import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import {WelcomeScreen, AccountSelectionScreen, PortalScreen} from './screens';
import {Colors} from './constants';
import { rezUnloadToken } from './api_client';

export default function App() {
    const [screen, setScreen] = useState('welcome');
    const [user, setUser] = useState(null);
    const [account, setAccount] = useState(null);

    const onLogin = (u) => {
        setUser(u);
        setScreen('accounts');
    };

    const onLogout = () => {
        rezUnloadToken();
        // remove device
        setUser(null);
        setScreen('welcome');
    };

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
        <SafeAreaView style={styles.container}>
            {screen=='welcome' && <WelcomeScreen onLogin={onLogin} />}

            {screen=='accounts' && <AccountSelectionScreen user={user} onLogout={onLogout} onSelectAccount={onSelectAccount} />}

            {screen=='portal' && <PortalScreen account={account} onGoBack={() => onSelectAccount(null)} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
