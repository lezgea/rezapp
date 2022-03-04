import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { rezGetMemberships, rezSelectAccountContext } from '../api_client';
import { ListItem, Spacer, Button } from '../components';
import { Strings } from '../constants';

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
        <View>
            <Spacer height={20} />

            <Text style={styles.title}>
                {Strings.greeting.replace('%s', props.user.first_name)}
            </Text>

            <Spacer height={20} />

            <Text>
                {Strings.hereAreAllYourMemberships}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={item => `${item.id}`}
                style={styles.roundedList}
            />

            <Button styleName='danger' text={Strings.logoutButtonText} onPress={props.onLogout} />

            <Spacer height={20} />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
    },
});
