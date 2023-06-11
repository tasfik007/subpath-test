module.exports = {
    ...(process.env.NEXT_PUBLIC_BASEPATH && {
        basePath: `/${process.env.NEXT_PUBLIC_BASEPATH}`,
    }),
};
