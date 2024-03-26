import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { rezGetMemberships, rezSelectAccountContext } from '../api_client';
import { ListItem, Spacer, Button } from '../components';
import { Strings, Sizes, Colors } from '../constants';

export default function AccountSelectionScreen(props) {
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        async function fetchMemberships() {
            const memberships = await rezGetMemberships();
            setAccounts(memberships);
        }

        fetchMemberships();
    }, []);

    const selectAccount = async (acc) => {
        const success = await rezSelectAccountContext(acc.id);
        if (success) {
            props.onSelectAccount(acc);
        }
    };

    const renderAccount = ({item}) => {
        const acc = {
            id: item.account_id,
            name: item.account_name,
        };
        return (<ListItem styleName='secondary' forwardIcon text={acc.name} onPress={() => selectAccount(acc)} />);
    };

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.title}>
                    {Strings.titleGreeting().replace('%s', props.user.first_name)}
                </Text>

                <Ionicons
                    name={"settings"}
                    size={Sizes.iconSize}
                    color={Colors.blue}
                    onPress={props.onPressSettings}
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

            <Button color='red' secondary text={Strings.buttonLogOut()} onPress={props.onLogout} />

            <Spacer height={20} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
    },
});
