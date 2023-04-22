import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { rezDeleteMyself, rezGetUserDetails } from '../api_client';
import { Badge, Button, Spacer } from '../components';
import { Colors, Strings } from '../constants';

export default function UserSettingsScreen(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUserDetails() {
            setLoading(true);
            const user = await rezGetUserDetails();
            setUser(user);
            setLoading(false);
        }

        fetchUserDetails();
    }, []);

    const onPressDelete = async () => {
        setLoading(true);
        const ret = await rezDeleteMyself();
        setLoading(false);
        if (ret.error) {
            alert(ret.error);
        } else {
            props.onPressDelete();
        }
    };

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text>{Strings.labelFirstName}</Text>
                <Text>{user?.first_name}</Text>
            </View>

            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text>{Strings.labelLastName}</Text>
                <Text>{user?.last_name}</Text>
            </View>

            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text>{Strings.labelEmailAddress}</Text>
                <Text>{user?.email_address}</Text>
            </View>

            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text>{Strings.labelEmailAddressVerified}</Text>
                <Badge styleName={user?.email_address_verified ? 'success' : 'warning'} text={user?.email_address_verified ? Strings.labelYes : Strings.labelNo} />
            </View>

            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text>{Strings.labelPhoneNumber}</Text>
                <Text>{user?.phone_number}</Text>
            </View>

            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text>{Strings.labelPhoneNumberVerified}</Text>
                <Badge styleName={user?.phone_number_verified ? 'success' : 'warning'} text={user?.phone_number_verified ? Strings.labelYes : Strings.labelNo} />
            </View>

            <Spacer height={100} />

            <Text style={styles.caption}>{Strings.captionEditingUserInfoNotSupportedYet}</Text>

            <Spacer height={100} />

            <Button color='red' text={Strings.buttonDeleteMyProfile} onPress={onPressDelete} />

            <Spacer height={20} />

            <Button color='red' secondary backIcon text={Strings.buttonBack} onPress={props.onGoBack} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    caption: {
        textAlign: 'center',
        color: Colors.midGray,
        marginBottom: 5,
        flex: 1,
    },
});
