import React, { useState, useEffect } from 'react';
import { Alert, Text, Image, View, StyleSheet } from 'react-native';
import { rezAuthenticate, rezGetUserDetails, rezSignup } from '../../../api_client';
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
            <View style={s.inputGroup}>
                <Input placeholder={Strings.placeholderFirstName()} autoCapitalize='characters' value={firstName} onChangeText={setFirstName} />
                <Input placeholder={Strings.placeholderLastName()} autoCapitalize='characters' value={lastName} onChangeText={setLastName} />
                <Input placeholder={Strings.placeholderPhoneNumber()} keyboardType='phone-pad' value={phone} onChangeText={setPhone} />
                <Input placeholder={Strings.placeholderEmailAddress()} autoCapitalize='none' value={email} onChangeText={setEmail} />
                <Input placeholder={Strings.placeholderPassword()} autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />
                <Button text={Strings.buttonRegister()} onPress={onPressRegister} />
            </View>
            <View style={s.footer}>
                <Text style={s.caption}>{Strings.captionHaveAnAccount()}</Text>
                <Button text={Strings.buttonLogIn()} secondary disabled={loading} onPress={onPressLogin} />
            </View>
        </View>
    );
}


const s = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingTop: 90,
        paddingBottom: 70,
        height: '100%',
        backgroundColor: '#fff',
    },
    logo: {
        width: 130,
        height: 130,
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