const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

module.exports = {
    basePath: BASE_PATH ? `/${BASE_PATH}` : "",
};
