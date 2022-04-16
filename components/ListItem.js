import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors, Sizes} from "../constants";

const ListItem = (props) => {
    const styleName = props.styleName || 'primary';
    const stylePrefix = props.disabled ? 'disabled' : styleName;
    const buttonStyle = styles[stylePrefix+'Button'];
    const textStyle = styles[stylePrefix+'Text'] || {};

    return (
        <TouchableOpacity style={[styles.button, buttonStyle]} {...props}>
            <Ionicons
                name={"arrow-back"}
                size={Sizes.iconSize}
                color={props.backIcon ? textStyle.color : 'transparent'}
            />
            <Text style={[styles.text, textStyle]} numberOfLines={1}>
                {props.text}
            </Text>
            <Ionicons
                name={"arrow-forward"}
                size={Sizes.iconSize}
                color={props.forwardIcon ? textStyle.color : 'transparent'}
            />
        </TouchableOpacity>
    );
};

export default ListItem;

const styles = StyleSheet.create({
    // button
    button: {
        height: 55,
        minWidth: 250,
        paddingHorizontal: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: Colors.blue,
    },
    secondaryButton: {
        borderColor: Colors.blue,
        borderWidth: 1,
    },
    successButton: {
        borderColor: Colors.green,
        borderWidth: 1,
    },
    warningButton: {
        borderColor: Colors.orange,
        borderWidth: 1,
    },
    dangerButton: {
        borderColor: Colors.red,
        borderWidth: 1,
    },
    disabledButton: {
        backgroundColor: Colors.lightGray,
    },

    // text
    text: {
        fontSize: 15,
        flex: 1,
    },
    primaryText: {
        color: Colors.white,
    },
    secondaryText: {
        color: Colors.blue,
    },
    successText: {
        color: Colors.green,
    },
    warningText: {
        color: Colors.orange,
    },
    dangerText: {
        color: Colors.red,
    },
    disabledText: {
        color: Colors.midGray,
    },
});
