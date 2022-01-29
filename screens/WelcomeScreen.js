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
        <View>
            <Image source={Images.logo} style={styles.logo} />

            <Spacer height={20} />

            <Input placeholder={Strings.emailAddressPlaceholder} autoCapitalize='none' value={email} onChangeText={setEmail} />

            <Spacer height={20} />

            <Input placeholder={Strings.passwordPlaceholder} autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />

            <Spacer height={20} />

            <Button text={Strings.loginButtonText} onPress={onPressLogin} />

            <Spacer height={100} />

            <Text style={styles.caption}>{Strings.dontHaveAnAccount}</Text>

            <Button text={Strings.registerButtonText} styleName='secondary' disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
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
