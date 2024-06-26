import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Linking, Modal } from 'react-native';
import { rezGetMyInvoices } from '../../../api_client';
import { ListItem, Spacer, Button } from '../../components';
import { Colors, Strings } from '../../constants';
import { prettyMoney } from '../../utils';


export function InvoicesScreen(props) {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState(null);

    useEffect(() => {
        async function fetchInvoices() {
            const invs = await rezGetMyInvoices();
            setInvoices(invs);
        }

        fetchInvoices();
    }, []);

    const openInv = async (url) => {
        await Linking.openURL(url);
    }

    const renderInv = ({item, index}) => {
        const inv = item;
        const badgeText = inv.remaining_amount_cents>0 ? Strings.captionInvoiceDue() : Strings.captionInvoicePaidInFull();
        const badgeStyle = inv.remaining_amount_cents>0 ? 'danger' : 'success';
        return (<ListItem styleName='secondary' text={inv.description} badgeText={badgeText} badgeStyle={badgeStyle} onPress={() => setSelectedInvoiceIndex(index)} />);
    };

    const selectedInvoice = selectedInvoiceIndex===null ? null : invoices[selectedInvoiceIndex];

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.title}>
                {Strings.titleInvoices()}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={invoices}
                renderItem={renderInv}
                keyExtractor={item => `${item.id}`}
            />

            <Button color='red' secondary backIcon text={Strings.buttonBack()} onPress={props.onGoBack} />

            <Spacer height={20} />

            <Modal animationType="fade" transparent={true} visible={selectedInvoice!==null}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{selectedInvoice?.description}</Text>

                        <Text style={styles.modalBold}>{Strings.captionInvoiceSummary()}</Text>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{flex:1}}>{Strings.captionInvoiceAmountCharged()}</Text>
                            <Text style={styles.modalText}>{prettyMoney(selectedInvoice?.charged_amount_cents)}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{flex:1}}>{Strings.captionInvoiceAmountPaid()}</Text>
                            <Text style={styles.modalText}>{prettyMoney(selectedInvoice?.paid_amount_cents)}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{flex:1}}>{Strings.captionInvoiceAmountDue()}</Text>
                            <Text style={styles.modalText}>{prettyMoney(selectedInvoice?.remaining_amount_cents)}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{flex:1}}>{Strings.captionInvoiceURL()}</Text>
                            <Text style={styles.modalTextUrl} onPress={() => openInv(selectedInvoice?.url)}>{selectedInvoice?.url}</Text>
                        </View>

                        <Text style={styles.modalBold}>{Strings.captionInvoiceLineItems()}</Text>
                        {selectedInvoice?.line_items.map((li,idx) => (
                            <View style={{flexDirection:'row'}} key={`${idx}`}>
                                <Text style={{flex:1}}>{li.description}</Text>
                                <Text style={styles.modalText}>{prettyMoney(li.amount_cents)}</Text>
                            </View>
                        ))}

                        <Button text={Strings.buttonOK()} onPress={() => setSelectedInvoiceIndex(null)} />
                    </View>
                </View>
            </Modal>
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
    modalTextUrl: {
        marginBottom: 15,
        color: Colors.blue,
    },
});
