const dv = (arg1, arg2) => {
    return arg1;
};

const gray = (arg) => {
    return `#${arg}${arg}${arg}`;
};

export default Colors = {
    white: gray('ff'),
    black: gray('00'),
    lightGray: gray('e0'),
    darkGray: gray('16'),
    midGray: gray('80'),

    blue: '#00A2ff',
    green: '#2bc221',
    red: '#ff5f5f',
    orange: '#ff8000',

    backgroundColor: dv(gray('ee'), gray('15')),
    textColor: dv(gray('00'), gray('ff')),
};
