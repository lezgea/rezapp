import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ListItem, Spacer, Button } from '../components';
import { Strings } from '../constants';

export default function PortalScreen(props) {
    const actions = [
        {
            text: 'View Announcements',
            action: () => props.onSelectAction('announcements'),
        },
        {
            text: 'Request Handyman',
        },
        {
            text: 'File a Complaint',
        },
        {
            text: 'Make a Payment',
        },
    ];

    const renderAction = ({item}) => {
        return (<ListItem styleName='secondary' forwardIcon text={item.text} onPress={item.action} />);
    }

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.greeting}>
                {props.account.name}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={actions}
                renderItem={renderAction}
                keyExtractor={item => `${item.text}`}
                style={styles.list}
            />

            <Button styleName='danger' backIcon text={Strings.selectAnotherAccountButtonText} onPress={props.onGoBack} />

            <Spacer height={20} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    greeting: {
        fontSize: 20,
    },
});
