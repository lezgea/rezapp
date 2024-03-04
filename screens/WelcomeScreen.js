import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, Image, View } from 'react-native';
import { rezAuthenticate, rezGetUserDetails } from '../api_client';
import { Button, Input, Spacer } from '../components';
import { Colors, Images, Strings } from '../constants';

export default function WelcomeScreen(props) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        async function fetchUserDetails() {
            setLoading(true);
            const user = await rezGetUserDetails();
            setLoading(false);
            if (user) {
                props.onLogin(user);
            }
        }

        fetchUserDetails();
    }, []);

    const onPressLogin = async () => {
        setLoading(true);
        const ret = await rezAuthenticate(email, password);
        setLoading(false);
        if (ret.error) {
            Alert.alert('Error', ret.error);
        } else {
            props.onLogin(ret.user);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={Images.logo} style={styles.logo} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderEmailAddress()} textContentType='username' autoCapitalize='none' value={email} onChangeText={setEmail} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPassword()} textContentType='password' autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />

            <Spacer height={20} />

            <Button text={Strings.buttonLogIn()} onPress={onPressLogin} />

            <Spacer height={100} />

            <Text style={styles.caption}>{Strings.captionDontHaveAnAccount()}</Text>

            <Button text={Strings.buttonRegister()} secondary disabled={loading} onPress={props.onPressSignup} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        paddingHorizontal: 60,
    },
    logo: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        borderRadius: 12,
    },
    caption: {
        textAlign: 'center',
        color: Colors.midGray,
        marginBottom: 5,
    },
});
