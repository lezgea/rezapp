import React from "react";
import { View } from "react-native";


export const Spacer = (props) => {
    return (
        <View style={{paddingVertical:props.height/2}} />
    );
};

