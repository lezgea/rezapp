import React, { useState, useEffect } from 'react';
import { Easing, Animated, StyleSheet } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import VX from "@/plugins/vx";


export function SplashScreen(props) {
    const [state, setState] = useState({
        visible: true,
        scale: new Animated.Value(0),
        bgOpacity: new Animated.Value(1)
    }
    );



    const duration = 1200;

    async function checkAndNavigate() {
        let token = AsyncStorage.getItem('accessToken')
        setTimeout(() => {
            if (!!token) {
                props.navigation.replace('NavigationRoutes')
            } else {
                props.navigation.replace('AuthRoutes')
            }
        }, 2000);
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
        checkAndNavigate()
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
        <Animated.View style={[s.imageContainer, { opacity: state.bgOpacity }]}>
            <Animated.Image style={[
                s.image,
                {
                    transform: [
                        {
                            scale: state.scale
                        }
                    ]
                }]}
                source={require("@/assets/logo.png")}
            />
        </Animated.View>
    )
}


const s = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: "#ffffff",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    image: {
        alignSelf: 'center',
        width: VX.w(250),
        height: VX.w(250),
    }
});