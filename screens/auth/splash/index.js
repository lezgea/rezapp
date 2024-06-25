import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, Image, View } from 'react-native';
import { rezAuthenticate, rezGetUserDetails } from '../api_client';
import { Button, Input, Spacer } from '../components';
import { Colors, Images, Strings } from '../constants';


import { Easing, Animated } from 'react-native';



export default function SplashScreen(props) {
    const [state, setState] = useState({
        visible: true,
        scale: new Animated.Value(0),
        bgOpacity: new Animated.Value(1)
    }
    );

    const duration = 1200;

    async function checkAndNavigate() {
        // let token = await Cache.getItem('token')
        // setTimeout(() => {
        //     if (!!token) {
        //         props.navigation.replace('NavigationRoutes')
        //     } else {
        //         props.navigation.replace('AuthRoutes')
        //     }
        // }, 2000);
    }


    useEffect(() => {
        let visible = true;
        if (visible) {
            state.scale.setValue(0);
            state.bgOpacity.setValue(1);
            setState({ ...state, visible: visible });
            setTimeout(() => startScreen(), 20);
        } else {
            hideScreen();
        }
        // checkAndNavigate()
    }, []);


    async function startScreen() {
        Animated.parallel([
            Animated.timing(state.scale, {
                toValue: 1,
                duration: duration,
                easing: Easing.elastic(),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // props.onReady();
        });
    };

    async function hideScreen() {
        Animated.parallel([
            Animated.timing(state.bgOpacity, {
                toValue: 0,
                duration: duration / 2,
                easing: Easing.elastic(),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setState({ ...state, visible: false });
        });
    };


    return (
        <Animated.View style={[st.imageContainer, { opacity: state.bgOpacity }]}>
            <Animated.Image style={[
                st.image,
                {
                    transform: [
                        {
                            scale: state.scale
                        }
                    ]
                }]}
                source={require("../../../../assets/img/logo.png")}
            />
        </Animated.View>
    )
}




