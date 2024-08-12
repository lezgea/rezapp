import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ListItem, Spacer, Button } from '@/components'
import { Strings } from '@/constants';


export function PortalScreen(props) {
    const actions = [
        {
            text: Strings.actionViewAnnouncements(),
            action: () => props.navigation.navigate('Announcements', { title: Strings.titleAnnouncements() }),
        },
        {
            text: Strings.actionRequestHandyman(),
            action: () => props.navigation.navigate('CTA', { title: Strings.titleHandymanRequestForm() }),
        },
        {
            text: Strings.actionFileComplaint(),
            action: () => props.navigation.navigate('CTA', { title: Strings.titleComplaintSuggestionForm() }),
        },
        {
            text: Strings.actionViewOrPayInvoices(),
            action: () => props.navigation.navigate('Invoices', { title: Strings.titleInvoices() }),
        },
        {
            text: Strings.actionDiscussWithCommunity(),
            //action: () => {},
        },
        {
            text: Strings.actionViewDocuments(),
            action: () => props.navigation.navigate('Documents', { title: Strings.titleDocumentsAndForms() }),
        },
        {
            text: Strings.actionViewMembers(),
            action: () => props.navigation.navigate('Members', { title: Strings.titleMembers() }),
        },
        {
            text: Strings.actionViewBuildingsAndUnits(),
            action: () => props.navigation.navigate('Units', { title: Strings.titleBuildingsAndUnits() }),
        },
    ];

    const renderAction = ({ item }) => {
        const styleName = !!item.action ? 'secondary' : 'disabled';
        return (<ListItem styleName={styleName} forwardIcon text={item.text} onPress={item.action} />);
    }


    React.useLayoutEffect(() => {
        if (props.route.params?.title) {
            props.navigation.setOptions({ title: props.route.params.title });
        }
    }, [props.navigation, props.route.params?.title]);


    return (
        <View style={s.container}>
            <Spacer height={20} />

            <FlatList
                data={actions}
                renderItem={renderAction}
                keyExtractor={item => `${item.text}`}
                style={s.list}
            />

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
