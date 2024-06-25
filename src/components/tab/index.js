import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import {Colors} from "../../constants";


export const Tab = (props) => {
    const styleName = props.styleName || 'primary';
    const stylePrefix = props.disabled ? 'disabled' : styleName;
    const buttonStyle = styles[stylePrefix+'Button'];
    const textStyle = styles[stylePrefix+'Text'] || {};

    return (
        <TouchableOpacity style={[styles.button, buttonStyle]} {...props}>
            <Text style={[styles.text, textStyle]} numberOfLines={1}>
                {props.text}
            </Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    // button
    button: {
        height: 55,
        paddingHorizontal: 10,
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
        textAlign: "center",
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
