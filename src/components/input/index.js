import React, { useState } from "react";
import { View, TextInput, StyleSheet, FlatList } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Sizes } from "../../constants";


export const Input = (props) => {
    const [open, setOpen] = useState(!props.secureTextEntry);
    const [focused, setFocused] = useState(false);
    const [showSuggs, setShowSuggs] = useState(false);

    const setFocusState = (flag) => {
        setTimeout(function () {
            setFocused(flag);
            setShowSuggs(flag);
        }, 1000);
    };

    const hasSuggs = props.suggestions && props.suggestions.length > 0;
    return (
        <View style={[styles.wrapper, props.wrapperStyle]}>
            {/* <Regular>
                {props.title && <Regular style={styles.topText}>{props.title}</Regular>}
                {props.required && <Regular style={styles.topTextRequired}> *</Regular>}
            </Regular> */}
            <View
                style={[
                    styles.container,
                    focused && styles.focused,
                    props.inputStyle && props.inputStyle,
                ]}
            >
                <Ionicons
                    name={props.leftIconName}
                    size={Sizes.iconSize}
                    color={Colors.blue}
                />
                <View style={styles.input}>
                    <TextInput
                        style={props.value.length === 0 ? styles.placeholder : styles.text}
                        onFocus={() => setFocusState(true)}
                        onBlur={() => setFocusState(false)}
                        {...props}
                        secureTextEntry={!open} // This has to go AFTER the {...props} so that password hiding works correctly.
                    />
                </View>
                {props.secureTextEntry && (
                    <Ionicons
                        name={open ? "eye-off" : "eye"}
                        size={Sizes.iconSize}
                        color="#B8B8B8"
                        onPress={() => setOpen(!open)}
                    />
                )}
                {props.rightIconName && (
                    <Ionicons
                        name={props.rightIconName}
                        size={Sizes.iconSize}
                        color={props.rightIconColor ? Colors.black : Colors.blue}
                        onPress={props.onRightIconPress}
                    />
                )}
            </View>
            {showSuggs && hasSuggs && <FlatList
                keyboardShouldPersistTaps={'handled'}
                scrollEnabled
                data={props.suggestions}
                renderItem={props.renderSuggestion}
                style={styles.suggList}
            />}
            {/* <Regular>
                {props.subtitle && <Regular style={styles.topText}>{props.subtitle}</Regular>}
            </Regular> */}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        minHeight: 55,
        borderRadius: 12,
        borderWidth: 2,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        borderColor: Colors.midGray,
    },
    focused: {
        shadowColor: Colors.blue,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.09,
        shadowRadius: 20,

        elevation: 7,
        borderColor: Colors.blue
    },

    suggList: {
        maxHeight: 100,
        borderRadius: 5,
        borderWidth: 1,
    },

    input: {
        flex: 1,
        paddingLeft: 5,
    },
    placeholder: {
        fontSize: 14,
        fontStyle: "italic",
        lineHeight: 20,
        color: Colors.midGray,
    },
    text: {
        fontSize: 13,
        lineHeight: 15,
        color: Colors.textColor,
    },
    topText: {
        fontSize: 13,
        marginBottom: 3,
    },
    topTextRequired: {
        fontSize: 13,
        color: Colors.red
    },
});
