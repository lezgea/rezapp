import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, Image, View } from 'react-native';
import { rezAuthenticate, rezGetUserDetails, rezSignup } from '../api_client';
import { Button, Input, Spacer } from '../components';
import { Colors, Images, Strings } from '../constants';

export default function SignupScreen(props) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
    };

    return (
        <View style={styles.container}>
            <Image source={Images.logo} style={styles.logo} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderFirstName} autoCapitalize='characters' value={firstName} onChangeText={setFirstName} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderLastName} autoCapitalize='characters' value={lastName} onChangeText={setLastName} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPhoneNumber} keyboardType='phone-pad' value={phone} onChangeText={setPhone} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderEmailAddress} autoCapitalize='none' value={email} onChangeText={setEmail} />

            <Spacer height={20} />

            <Input placeholder={Strings.placeholderPassword} autoCapitalize='none' secureTextEntry value={password} onChangeText={setPassword} />

            <Spacer height={20} />

            <Button text={Strings.buttonRegister} onPress={onPressRegister} />

            <Spacer height={100} />

            <Text style={styles.caption}>{Strings.captionHaveAnAccount}</Text>

            <Button text={Strings.buttonLogIn} secondary disabled={loading} onPress={props.onPressLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        paddingHorizontal: 60,
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
