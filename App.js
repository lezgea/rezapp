import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import {WelcomeScreen, AccountSelectionScreen, PortalScreen, AnnouncementsScreen, MembersScreen, UnitsScreen, DocumentsScreen, CTAScreen, SignupScreen, UserSettingsScreen, InvoicesScreen} from './screens';
import {Colors} from './constants';
import { rezUnloadToken } from './api_client';



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

    const onLogout = () => {
        rezUnloadToken();
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
        <SafeAreaView style={styles.container}>
            {screen=='welcome' && <WelcomeScreen onLogin={onLogin} onPressSignup={onPressSignup} />}

            {screen=='signup' && <SignupScreen onSignup={onLogin} onPressLogin={onPressLogin} />}

            {screen=='accounts' && <AccountSelectionScreen user={user} onLogout={onLogout} onSelectAccount={onSelectAccount} onPressSettings={() => setScreen('settings')} />}

            {screen=='settings' && <UserSettingsScreen onGoBack={() => setScreen('accounts')} onPressDelete={onDelete} />}

            {screen=='portal' && <PortalScreen account={account} onSelectAction={setScreen} onGoBack={() => onSelectAccount(null)} />}

            {screen=='cta-handyman' && <CTAScreen type='work_request' onGoBack={() => setScreen('portal')} />}

            {screen=='cta-complaint' && <CTAScreen type='complaint' onGoBack={() => setScreen('portal')} />}
            
            {screen=='announcements' && <AnnouncementsScreen onGoBack={() => setScreen('portal')} />}

            {screen=='documents' && <DocumentsScreen onGoBack={() => setScreen('portal')} />}

            {screen=='invoices' && <InvoicesScreen onGoBack={() => setScreen('portal')} />}

            {screen=='members' && <MembersScreen onGoBack={() => setScreen('portal')} />}

            {screen=='units' && <UnitsScreen onGoBack={() => setScreen('portal')} />}
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
