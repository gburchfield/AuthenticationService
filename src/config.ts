
const environment = process.env.NODE_ENV || 'dev'

let config: ConfigParent = {
    dev: {
        port: 4000,
        secret: "",
        cluster_uri: "",
        db_name: "",
        db_user: "",
        db_password: ""
    },
    prod: {
        port: 8080,
        secret: process.env.SECRET_KEY,
        cluster_uri: "",
        db_name: "",
        db_user: "",
        db_password: process.env.DB_PASSWORD
    }
}

interface ConfigParent {
    [key: string]: Config
}

interface Config {
    port: Number,
    secret: string,
    cluster_uri: string,
    db_name: string,
    db_user: string,
    db_password: string
}

let exportConfig = {...config[environment]}

export default exportConfig