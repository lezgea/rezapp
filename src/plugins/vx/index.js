import {Dimensions} from "react-native";


export default class VX {
    static scale = 0
    static fontScale = 0
    static defaultWidth = 414

    static init() {
        if (VX.scale === 0) {
            let scale = VX.screenWidth() / VX.defaultWidth
            let diff = (1 - scale) / 1.8
            VX.scale = scale + diff
            if (VX.scale > 1)
                VX.scale = 1
            diff = (1 - scale) / 2
            VX.fontScale = scale + diff
            if (VX.fontScale > 1)
                VX.fontScale = 1
        }
    }

    static w(v) {
        VX.init();
        return Math.floor(v * VX.scale)
    }

    static f(v) {
        VX.init();
        return Math.round(v * VX.fontScale)
    }

    static screenHeight() {
        const dim = Dimensions.get('window')
        return dim.height
    }

    static screenWidth() {
        const dim = Dimensions.get('window')
        return dim.width
    }
}
