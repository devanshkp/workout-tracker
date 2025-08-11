const FontWeights = {
  ultralight: "100",
  thin: "200",
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
  },

  h2: {
    fontSize: 18,
    fontWeight: FontWeights.semibold,
  },

  body: {
    fontSize: 17,
    fontWeight: FontWeights.regular,
  },

  bodySecondary: {
    fontSize: 15,
    fontWeight: FontWeights.regular,
  },

  bodyTertiary: {
    fontSize: 13.5,
    fontWeight: FontWeights.regular,
  },

  bodyMini: {
    fontSize: 10,
    fontWeight: FontWeights.regular,
  },

  button: {
    fontSize: 16,
    fontWeight: FontWeights.medium,
  },
};
