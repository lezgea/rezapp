import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { rezGetMemberships, rezGetUserDetails, rezSelectAccountContext, rezUnloadToken } from '../../../api_client';
import { ListItem, Spacer, Button } from '@/components';
import { Strings, Sizes, Colors } from '@/constants';


export function AccountSelectionScreen(props) {
    const [accounts, setAccounts] = useState([]);
    const [userName, setUserName] = React.useState('')


    const selectAccount = async (acc) => {
        const success = await rezSelectAccountContext(acc.id);
        if (success) {
            props.navigation.navigate('Portal', { title: acc.name })
        }
    }


    const renderAccount = ({ item }) => {
        const acc = {
            id: item.account_id,
            name: item.account_name,
        }
        return (<ListItem styleName='secondary' forwardIcon text={acc.name} onPress={() => selectAccount(acc)} />);
    }


    const onLogout = async () => {
        await rezUnloadToken()
        setTimeout(() => {
            props.navigation.replace('AuthRoutes')
        }, 1000)
    }


    React.useEffect(() => {
        async function fetchUserDetails() {
            const user = await rezGetUserDetails();
            setUserName(user.first_name)
        }
        async function fetchMemberships() {
            const memberships = await rezGetMemberships();
            setAccounts(memberships);
        }

        fetchUserDetails()
        fetchMemberships();
    }, []);


    return (
        <View style={s.container}>
            <Spacer height={20} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.title}>
                    {Strings.titleGreeting().replace('%s', userName)}
                </Text>

                <Ionicons
                    name={"settings"}
                    size={Sizes.iconSize}
                    color={Colors.blue}
                    onPress={() => props.navigation.navigate('Settings')}
                />
            </View>

            <Spacer height={20} />

            <Text>
                {Strings.captionHereAreAllYourMemberships()}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={item => `${item.id}`}
            />

            <Button color='red' secondary text={Strings.buttonLogOut()} onPress={onLogout} />

            <Spacer height={20} />
        </View>
    );
}


const s = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
    },
});
