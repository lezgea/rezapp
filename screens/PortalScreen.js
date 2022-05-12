import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ListItem, Spacer, Button } from '../components';
import { Strings } from '../constants';

export default function PortalScreen(props) {
    const actions = [
        {
            text: Strings.actionViewAnnouncements,
            action: () => props.onSelectAction('announcements'),
        },
        {
            text: Strings.actionRequestHandyman,
            action: () => {},
        },
        {
            text: Strings.actionFileComplaint,
            action: () => {},
        },
        {
            text: Strings.actionMakePayment,
            action: () => {},
        },
        {
            text: Strings.actionViewDocuments,
            action: () => props.onSelectAction('documents'),
        },
        {
            text: Strings.actionViewMembers,
            action: () => props.onSelectAction('members'),
        },
        {
            text: Strings.actionViewBuildingsAndUnits,
            action: () => props.onSelectAction('units'),
        },
    ];

    const renderAction = ({item}) => {
        return (<ListItem styleName='secondary' forwardIcon text={item.text} onPress={item.action} />);
    }

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.title}>
                {props.account.name}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={actions}
                renderItem={renderAction}
                keyExtractor={item => `${item.text}`}
                style={styles.list}
            />

            <Button styleName='danger' backIcon text={Strings.back} onPress={props.onGoBack} />

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
