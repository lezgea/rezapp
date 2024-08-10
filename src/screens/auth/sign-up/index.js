import React, { useState, useEffect } from 'react';
import { Alert, Text, Image, View, StyleSheet } from 'react-native';
import { rezAuthenticate, rezGetUserDetails, rezSignup } from '../../../../api_client';
import { Button, Input, Spacer } from '@/components';
import { Images, Strings, Colors } from '@/constants';


export function SignUpScreen(props) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const onPressRegister = async () => {
        setLoading(true);
        const userData = {
            firstName,
            lastName,
            phone,
            email,
            password,
        };
        const ret = await rezSignup(userData);
        setLoading(false);
        if (ret.error) {
            Alert.alert('Error', ret.error);
        } else {
            props.onSignup(ret.user);
        }
    }


    const onPressLogin = () => {
        props.navigation.navigate('Login')
    }


    return (
        <View style={s.container}>
            <Image source={Images.logo} style={s.logo} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderFirstName()} autoCapitalize='characters' value={firstName} onChangeText={setFirstName} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderLastName()} autoCapitalize='characters' value={lastName} onChangeText={setLastName} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPhoneNumber()} keyboardType='phone-pad' value={phone} onChangeText={setPhone} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderEmailAddress()} autoCapitalize='none' value={email} onChangeText={setEmail} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPassword()} autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />

            <Spacer height={20} />

            <Button text={Strings.buttonRegister()} onPress={onPressRegister} />

            <Spacer height={100} />

            <Text style={s.caption}>{Strings.captionHaveAnAccount()}</Text>

            <Button text={Strings.buttonLogIn()} secondary disabled={loading} onPress={onPressLogin} />
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
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 12,
    },
    caption: {
        textAlign: 'center',
        color: Colors.midGray,
        marginBottom: 5,
    },
});
