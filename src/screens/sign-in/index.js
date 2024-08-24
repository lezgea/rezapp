import React, { useState, useEffect } from 'react';
import { Alert, Text, Image, View, StyleSheet } from 'react-native';
import { rezAuthenticate, rezGetUserDetails } from '../../../api_client';
import { Button, Input, Spacer } from '../../components';
import { Images, Strings, Colors } from '../../constants';


export function SignInScreen(props) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const onPressLogin = async () => {
        setLoading(true);
        const ret = await rezAuthenticate(email, password);
        setLoading(false);
        if (ret.error) {
            Alert.alert('Error', ret.error);
        } else {
            props.navigation.replace('NavigationRoutes')
        }
    };

    const onPressSignUp = () => {
        props.navigation.navigate('Register')

    };


    return (
        <View style={s.container}>
            <Image source={Images.logo} style={s.logo} />
            <View style={s.inputGroup}>
                <Input placeholder={Strings.placeholderEmailAddress()} textContentType='emailAddress' autoCapitalize='none' value={email} onChangeText={setEmail} />
                <Input placeholder={Strings.placeholderPassword()} textContentType='password' autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />
                <Button text={Strings.buttonLogIn()} onPress={onPressLogin} />
            </View>
            <View style={s.footer}>
                <Text style={s.caption}>{Strings.captionDontHaveAnAccount()}</Text>
                <Button text={Strings.buttonRegister()} secondary disabled={loading} onPress={onPressSignUp} />
            </View>
        </View>
    );
}


const s = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingTop: 150,
        paddingBottom: 70,
        height: '100%',
        backgroundColor: '#fff',
    },
    logo: {
        width: 200,
        height: 200,
        objectFit: 'contain',
        alignSelf: 'center',
    },
    caption: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.darkGray,
    },
    inputGroup: {
        gap: 20,
    },
    footer: {
        gap: 20,
    }
});