import React from "react";
import { View } from "react-native";

const Spacer = (props) => {
    return (
        <View style={{paddingVertical:props.height/2}} />
    );
};

export default Spacer;
