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

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderEmailAddress()} textContentType='emailAddress' autoCapitalize='none' value={email} onChangeText={setEmail} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPassword()} textContentType='password' autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />

            <Spacer height={20} />

            <Button text={Strings.buttonLogIn()} onPress={onPressLogin} />

            <Spacer height={100} />

            <Text style={s.caption}>{Strings.captionDontHaveAnAccount()}</Text>

            <Button text={Strings.buttonRegister()} secondary disabled={loading} onPress={onPressSignUp} />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 60,
        height: '100%',
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
