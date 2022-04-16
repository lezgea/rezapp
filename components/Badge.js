import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import {Colors} from "../constants";

const Badge = (props) => {
    const styleName = props.styleName || 'default';
    const buttonStyle = styles[styleName+'Button'];

    return (
        <TouchableOpacity style={[styles.defaultButton, buttonStyle]} {...props}>
            <Text style={[styles.text]}>
                {props.text}
            </Text>
        </TouchableOpacity>
    );
};

export default Badge;

const styles = StyleSheet.create({
    // button
    defaultButton: {
        borderRadius: 5,
        padding: 5,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: Colors.blue,
    },
    successButton: {
        backgroundColor: Colors.blue,
    },
    warningButton: {
        backgroundColor: Colors.orange,
    },
    dangerButton: {
        backgroundColor: Colors.red,
    },

    // text
    text: {
        textAlign: "center",
        fontSize: 15,
        //flex: 1,
        color: Colors.white,
    },
});
