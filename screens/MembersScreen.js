import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Modal } from 'react-native';
import { rezGetMembers, rezGetMemberUnitAssignments } from '../api_client';
import { ListItem, Spacer, Button } from '../components';
import { Strings } from '../constants';

export default function MembersScreen(props) {
    const [members, setMembers] = useState([]);
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);

    useEffect(() => {
        async function fetchMembers() {
            const members = await rezGetMembers();
            setMembers(members);
        }

        fetchMembers();
    }, []);

    useEffect(() => {
        async function fetchMemberUnitAssignments(id) {
            const unit_assignments = await rezGetMemberUnitAssignments(id);
            
            const newMembers = JSON.parse(JSON.stringify(members));
            newMembers[selectedMemberIndex].unit_assignments = unit_assignments;
            setMembers(newMembers);
        }

        const m = getSelectedMember();
        if (m && m.unit_assignments === undefined) {
            fetchMemberUnitAssignments(m.id);
        }
    }, [selectedMemberIndex]);

    const renderMember = ({item, index}) => {
        const mem = {
            id: item.id,
            name: `${item.last_name}, ${item.first_name}`,
        };
        return (<ListItem styleName='secondary' text={mem.name} onPress={() => setSelectedMemberIndex(index)} />);
    };

    const getSelectedMember = () => {
        if (selectedMemberIndex == null) return null;

        return members[selectedMemberIndex];
    };

    const selectedMember = getSelectedMember();

    return (
        <View>
            <Spacer height={20} />

            <Text style={styles.title}>
                {Strings.members}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={members}
                renderItem={renderMember}
                keyExtractor={item => `${item.id}`}
                style={styles.roundedList}
            />

            <Button styleName='danger' backIcon text={Strings.back} onPress={props.onGoBack} />

            <Spacer height={20} />

            <Modal animationType="fade" transparent={true} visible={!!selectedMember}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{selectedMember?.first_name} {selectedMember?.last_name}</Text>

                        <Text style={styles.modalBold}>{Strings.shareholderOf}</Text>
                        <Text style={styles.modalText}>{selectedMember?.unit_assignments?.filter(ua => !!ua.is_shareholder).map(ua => `- ${ua.url_slug}`).join('\n')}</Text>

                        <Text style={styles.modalBold}>{Strings.tenantOf}</Text>
                        <Text style={styles.modalText}>{selectedMember?.unit_assignments?.filter(ua => !!ua.is_tenant).map(ua => `- ${ua.url_slug}`).join('\n')}</Text>

                        <Button text="OK" onPress={() => setSelectedMemberIndex(null)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
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
