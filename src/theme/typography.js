import { Platform } from 'react-native';

const sysLight = Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'System' });
const sysRegular = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const typography = {
  display: { fontFamily: sysLight, fontSize: 36, fontWeight: '300', lineHeight: 44 },
  h1: { fontFamily: sysLight, fontSize: 30, fontWeight: '300', lineHeight: 38 },
  h2: { fontFamily: sysLight, fontSize: 24, fontWeight: '300', lineHeight: 30 },
  h3: { fontFamily: sysRegular, fontSize: 18, fontWeight: '400', lineHeight: 24 },
  body: { fontFamily: sysRegular, fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontFamily: sysRegular, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontFamily: sysRegular, fontSize: 12, fontWeight: '400', lineHeight: 16 },
  labelCaps: {
    fontFamily: sysRegular,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelCapsSmall: {
    fontFamily: sysRegular,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};
