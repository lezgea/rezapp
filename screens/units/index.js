import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Modal } from 'react-native';
import { rezGetBuildings, rezGetBuildingDirectory } from '../api_client';
import { ListItem, Tab, Spacer, Button } from '../components';
import { Strings } from '../constants';


export default function UnitsScreen(props) {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(null);
    const [selectedUnitIndex, setSelectedUnitIndex] = useState(null);

    useEffect(() => {
        async function fetchBuildings() {
            const buildings = await rezGetBuildings();
            setBuildings(buildings);
            setSelectedBuildingIndex(0);
        }

        fetchBuildings();
    }, []);

    useEffect(() => {
        async function fetchBuildingDirectory(slug) {
            const directory = await rezGetBuildingDirectory(slug);

            const newBuildings = JSON.parse(JSON.stringify(buildings));
            newBuildings[selectedBuildingIndex].directory = directory;
            setBuildings(newBuildings);
        }

        const b = getSelectedBuilding();
        if (b && b.directory===undefined) {
            fetchBuildingDirectory(b.url_slug);
        }
    }, [selectedBuildingIndex]);

    const renderBuildingTab = ({item, index}) => {
        const bldg = {
            id: item.id,
            name: item.url_slug,
        };
        const styleName = (index==selectedBuildingIndex) ? 'primary' : 'secondary';
        return (<Tab styleName={styleName} text={bldg.name} onPress={() => setSelectedBuildingIndex(index)} />);
    };

    const renderUnit = ({item, index}) => {
        const unit = {
            id: item.id,
            name: item.name,
        };

        const isVacant = (item.shareholders.length + item.tenants.length) === 0;
        const badgeText = isVacant ? Strings.captionVacant() : '';
        const badgeStyle = isVacant ? 'warning' : '';

        return (<ListItem styleName='secondary' text={unit.name} badgeText={badgeText} badgeStyle={badgeStyle} onPress={() => setSelectedUnitIndex(index)} />);
    };

    const getSelectedBuilding = () => {
        if (selectedBuildingIndex === null) return null;

        return buildings[selectedBuildingIndex];
    };

    const getSelectedUnit = () => {
        const b = getSelectedBuilding();
        if (!b) return null;

        if (!b.directory) return null;

        if (selectedUnitIndex === null) return null;

        return selectedBuilding.directory[selectedUnitIndex];
    };

    const selectedBuilding = getSelectedBuilding();
    const selectedUnit = getSelectedUnit();

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.title}>
                {Strings.titleBuildingsAndUnits()}
            </Text>

            <Spacer height={20} />

            <FlatList
                data={buildings}
                renderItem={renderBuildingTab}
                keyExtractor={item => `${item.id}`}
                horizontal
            />

            {/* <Spacer height={20} /> */}

            {!!selectedBuilding && <FlatList
                data={selectedBuilding.directory || []}
                renderItem={renderUnit}
                keyExtractor={item => `${item.id}`}
            />}

            <Button color='red' secondary backIcon text={Strings.buttonBack()} onPress={props.onGoBack} />

            <Spacer height={20} />

            <Modal animationType="fade" transparent={true} visible={!!selectedUnit}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{selectedUnit?.url_slug}</Text>

                        <Text style={styles.modalBold}>{Strings.captionShareholders()}</Text>
                        <Text style={styles.modalText}>{selectedUnit?.shareholders.map(s => `• ${s.full_name}`).join('\n')}</Text>

                        <Text style={styles.modalBold}>{Strings.captionTenants()}</Text>
                        <Text style={styles.modalText}>{selectedUnit?.tenants.map(s => `• ${s.full_name}`).join('\n')}</Text>

                        <Button text={Strings.buttonOK()} onPress={() => setSelectedUnitIndex(null)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
