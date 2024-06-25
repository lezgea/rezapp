import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors, Sizes} from "../../constants";

const Button = (props) => {
    const color = props.disabled ? 'disabled' : (props.color || 'blue');
    const prisec = props.secondary ? 'Secondary' : 'Primary';
    const buttonStyle = styles[color+prisec+'Button'];

    return (
        <TouchableOpacity style={[styles.button, buttonStyle]} {...props}>
            <Ionicons
                name={"arrow-back"}
                size={Sizes.iconSize}
                color={props.backIcon ? buttonStyle.color : 'transparent'}
            />
            <Text style={[styles.text, {color:buttonStyle.color}]}>
                {props.text}
            </Text>
            <Ionicons
                name={"arrow-forward"}
                size={Sizes.iconSize}
                color={props.forwardIcon ? buttonStyle.color : 'transparent'}
            />
        </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
    // button
    button: {
        height: 55,
        minWidth: 200,
        borderRadius: 12,
        paddingHorizontal: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    bluePrimaryButton: {
        backgroundColor: Colors.blue,
        color: Colors.white,
    },
    greenPrimaryButton: {
        backgroundColor: Colors.green,
        color: Colors.white,
    },
    orangePrimaryButton: {
        backgroundColor: Colors.orange,
        color: Colors.white,
    },
    redPrimaryButton: {
        backgroundColor: Colors.red,
        color: Colors.white,
    },
    disabledPrimaryButton: {
        backgroundColor: Colors.lightGray,
        color: Colors.white,
    },

    blueSecondaryButton: {
        borderColor: Colors.blue,
        borderWidth: 1,
        color: Colors.blue,
    },
    greenSecondaryButton: {
        borderColor: Colors.green,
        borderWidth: 1,
        color: Colors.green,
    },
    orangeSecondaryButton: {
        borderColor: Colors.orange,
        borderWidth: 1,
        color: Colors.orange,
    },
    redSecondaryButton: {
        borderColor: Colors.red,
        borderWidth: 1,
        color: Colors.red,
    },
    disabledSecondaryButton: {
        borderColor: Colors.lightGray,
        borderWidth: 1,
        color: Colors.lightGray,
    },

    // text
    text: {
        textAlign: "center",
        fontSize: 15,
        flex: 1,
    },
});
