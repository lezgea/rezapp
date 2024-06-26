import React, { useState } from 'react';
import { StyleSheet, FlatList, Text, ImageBackground, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Spacer, Button, Input } from '../../components';
import { Strings } from '../../constants';
import { rezSaveCTA, rezUploadImageViaForm } from '../../../api_client';


export function CTAScreen(props) {
    const ctaType = props.type;
    const title = ctaType=='work_request'
            ? Strings.titleHandymanRequestForm()
            : Strings.titleComplaintSuggestionForm();
    const placeholder = ctaType=='work_request'
            ? Strings.placeholderDescribeProblem()
            : Strings.placeholderDescribeConcern();

    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);

    const onLaunchCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert(Strings.errorNeedCameraPermission());
            return;
        }

        const result = await ImagePicker.launchCameraAsync({});
        console.log(result);
        if (result.canceled) return;

        const image = result.assets[0];
        setImages([...images, image]);
    };

    const onOpenPhotos = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert(Strings.errorNeedGalleryPermission());
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({});
        console.log(result);
        if (result.canceled) return;

        const image = result.assets[0];
        setImages([...images, image]);
    };

    const renderImage = ({item, index}) => {
        return (<View>
            <ImageBackground source={{uri:item.uri}} style={styles.image}>
                <Text style={styles.deleteButton} onPress={() => removeImage(index)}>{'X'}</Text>
            </ImageBackground>
        </View>);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const onSubmit = async () => {
        if (description.trim().length===0 && images.length===0) {
            alert(Strings.errorNeedCTAInput());
            return;
        }

        const files = await Promise.all(images.map(img => rezUploadImageViaForm(img.uri)));

        const cta = {
            id: 0,
            type: props.type,
            description: description,
            status: 'OPEN',
            file_keys: files.map(f => f.key),
        };
        const result = await rezSaveCTA(cta);
        if (result) {
            Toast.show({
                type: 'info',
                text1: Strings.messageFormSubmissionSuccessful(),
                visibilityTime: 1500,
                onHide: props.onGoBack, 
            });
        }
    };

    return (
        <View style={styles.container}>
            <Spacer height={20} />

            <Text style={styles.title}>
                {title}
            </Text>

            <Spacer height={20} />

            <View style={styles.flexed}>
                <Input
                    placeholder={placeholder}
                    value={description} onChangeText={setDescription}
                />

                <Spacer height={20} />

                <Button secondary text={Strings.buttonAddImageUsingCamera()} onPress={onLaunchCamera} />

                <Spacer height={20} />

                <Button secondary text={Strings.buttonAddImageFromGallery()} onPress={onOpenPhotos} />

                {images.length>0 && <Spacer height={20} />}

                <View>
                    <FlatList
                        data={images}
                        renderItem={renderImage}
                        keyExtractor={(item, index) => `${index}`}
                        horizontal
                    />
                </View>

                <Spacer height={20} />

                <Button styleName='primary' text={Strings.buttonSubmit()} onPress={onSubmit} />
            </View>

            <Button color='red' secondary backIcon text={Strings.buttonBack()} onPress={props.onGoBack} />

            <Spacer height={20} />

            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    flexed: {
        flex: 1,
    },
    image: {
        width: 100,
        height: 100,
        borderColor: 'black',
        borderWidth: 1,
        marginRight: 10,
    },
    deleteButton: {
        padding: 5,
        color: 'red',
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 14,
        width: 28,
        height: 28,
        textAlign: 'center',
        alignSelf: 'flex-end',
    },
    title: {
        fontSize: 20,
    },
});
