import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Linking } from 'react-native';
import { rezGetDocuments } from '../api_client';
import { ListItem, Spacer, Button } from '../components';
import { Strings } from '../constants';

export default function DocumentsScreen(props) {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        async function fetchDocs() {
            const docs = await rezGetDocuments();
            setDocuments(docs);
        }

        fetchDocs();
    }, []);

    const openDoc = async (url) => {
        await Linking.openURL(url);
    }

    const renderDoc = ({item, index}) => {
        const doc = item;
        return (<ListItem styleName='secondary' text={doc.name} onPress={() => openDoc(doc.url)} />);
    };

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.title}>
                {Strings.titleDocumentsAndForms}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={documents}
                renderItem={renderDoc}
                keyExtractor={item => `${item.id}`}
            />

            <Button styleName='danger' backIcon text={Strings.buttonBack} onPress={props.onGoBack} />
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        marginBottom: 15,
        fontSize: 24,
    },
    modalBold: {
        marginBottom: 0,
        fontWeight: 'bold',
    },
    modalText: {
        marginBottom: 15,
    },
});
